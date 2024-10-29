import { Button, Input, Typography, List, notification, Layout, Menu, Row, Col, Modal, Popover } from 'antd';
import { useEffect, useState } from 'react';
import { web3, buyMyRoomContract,hTKTokenConstract} from '../../utils/contracts';
import { useLocation } from "react-router-dom";
import './buMyRoom.css';
import { Content, Header } from "antd/es/layout/layout";
import Sider from 'antd/es/layout/Sider';
import zju from "../../zju.png";
import { UserOutlined, DollarOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {buildTimeValue} from "@testing-library/user-event/dist/utils";
const { Title } = Typography;

interface House {
    tokenId: string;
    price: string;
    owner: string;
    listedTimestamp: string;
    isForSale: boolean;
}

const HouseTradePage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const account: string = searchParams.get('account') || ''; // 从URL获取account
    const [htkBalance, setHtkBalance] = useState<string>(''); // HTK 余额
    const [accountBalance, setAccountBalance] = useState<string>('0');
    const [houseList, setHouseList] = useState<House[]>([]);
    const [ownedHouses, setOwnedHouses] = useState<House[]>([]);
    const [isOnlistModalVisible, setIsOnlistModalVisible] = useState<boolean>(false);
    const [isETHtoHTKModalVisible,setIsETHtoHTKModalVisible] = useState<boolean>(false);
    const [isHTKtoETHModalVisible,setIsHTKtoETHModalVisible] = useState<boolean>(false);
    const [mintModalVisible, setMintModalVisible] = useState<boolean>(false);
    const [houseId, setHouseId] = useState<string>('');
    const [housePrice, setHousePrice] = useState<string>('0');
    const [mintOwnerAddress, setMintOwnerAddress] = useState<string>('');
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [ethToHtkAmount, setEthToHtkAmount] = useState<string>('0'); // ETH 兑换 HTK 数量
    const [htkToEthAmount, setHtkToEthAmount] = useState<string>('0'); // HTK 兑换 ETH 数量
    const navigate = useNavigate();
    const onNavigate = () => {
        navigate(`/`);
    };
    const updateHouses=async ()=>{
        const updatedOwnedHouses: House[] = await buyMyRoomContract.methods.getMyHouses().call({ from: account });
        setOwnedHouses(updatedOwnedHouses.map((house: House) => ({
            tokenId: house.tokenId.toString(),
            price: web3.utils.fromWei(house.price, 'ether'),
            owner: house.owner,
            listedTimestamp: house.listedTimestamp,
            isForSale: house.isForSale,
        })));
        const updatedHouseList: House[] = await buyMyRoomContract.methods.getHousesForSale().call();
        setHouseList(updatedHouseList.map((house: House) => ({
            tokenId: house.tokenId.toString(),
            price: web3.utils.fromWei(house.price, 'ether'),
            owner: house.owner,
            listedTimestamp: house.listedTimestamp,
            isForSale: house.isForSale,
        })));
    }
    const updateBalance=async ()=>{
        const ethBalance = await web3.eth.getBalance(account);
        setAccountBalance(web3.utils.fromWei(ethBalance, 'ether'));
        const htkBalance1 = await hTKTokenConstract.methods.balanceOf(account).call({ from: account });
        // console.log(htkBalance1);
        // @ts-ignore
        setHtkBalance(htkBalance1.toString());
    }
    // @ts-ignore
    useEffect(() => {
        const fetchData = async () => {
            try {
                const ethBalance = await web3.eth.getBalance(account);
                setAccountBalance(web3.utils.fromWei(ethBalance, 'ether'));
                const htkBalance1 = await hTKTokenConstract.methods.balanceOf(account).call({ from: account });
                //console.log(htkBalance1);
                // @ts-ignore
                setHtkBalance(htkBalance1.toString());
                const platformOwner = await buyMyRoomContract.methods.getPlatformOwner().call();
                // @ts-ignore
                setIsOwner(account.toString() === platformOwner.toString());

                await updateHouses();
            } catch (error: any) {
                alert('数据加载失败: ' + error.message);
            }
        };

        fetchData();
    }, [account]);

    const onMintHouse = async () => {
        if (!isOwner) {
            notification.error({ message: '错误', description: '只有平台管理员可以铸造房屋' });
            return;
        }

        if (!web3.utils.isAddress(mintOwnerAddress)) {
            notification.error({ message: '错误', description: '请输入有效的房主地址' });
            return;
        }

        try {
            await buyMyRoomContract.methods.mintHouse(mintOwnerAddress).send({ from: account });
            notification.success({ message: '成功', description: '房屋铸造成功' });
            await updateHouses();
            await updateBalance();
            setMintModalVisible(false); // 关闭铸造弹窗
        } catch (error: any) {
            notification.error({ message: '错误', description: '房屋铸造失败: ' + error.message });
        }
    };

    const onListHouse = async () => {
        if (!account) {
            notification.error({ message: '错误', description: '请连接钱包' });
            return;
        }

        try {
            await buyMyRoomContract.methods.listHouseForSale(houseId, web3.utils.toWei(housePrice, 'ether')).send({ from: account });
            notification.success({ message: '成功', description: '房屋挂牌成功' });
            await updateHouses();
            await updateBalance();
        } catch (error: any) {
            notification.error({ message: '错误', description: '挂牌失败: ' + error.message });
        }
    };

    const onBuyHouseWithETH = async (houseId: string, price: string) => {
        if (!account) {
            notification.error({ message: '错误', description: '请连接钱包' });
            return;
        }

        try {
            await buyMyRoomContract.methods.buyHouseWithETH(houseId).send({
                from: account,
                value: web3.utils.toWei(price, 'ether'),
            });
            notification.success({ message: '成功', description: '购买成功' });
            await updateHouses()
            await updateBalance();
        } catch (error: any) {
            notification.error({ message: '错误', description: '购买失败: ' + error.message });
        }
    };

    const onBuyHouseWithHTK = async (houseId: string, price: string) => {
        if (!account) {
            notification.error({ message: '错误', description: '请连接钱包' });
            return;
        }
        try {
            await hTKTokenConstract.methods.approve(buyMyRoomContract.options.address, web3.utils.toWei(price+'000', 'ether')).send({ from: account });
            await buyMyRoomContract.methods.buyHouseWithHTK(houseId).send({
                from: account,
                // value: web3.utils.toWei(price, 'ether'),
            });
            notification.success({ message: '成功', description: '购买成功' });
            await updateHouses()
            await updateBalance();
        } catch (error: any) {
            notification.error({ message: '错误', description: '购买失败: ' + error.message });
        }
    };

    const onDelistHouse = async (tokenId: string) => {
        if (!account) {
            notification.error({ message: '错误', description: '请连接钱包' });
            return;
        }

        try {
            await buyMyRoomContract.methods.delistHouse(tokenId).send({ from: account });
            notification.success({ message: '成功', description: '房屋下架成功' });
            await updateHouses();
            await updateBalance();
        } catch (error: any) {
            notification.error({ message: '错误', description: '下架失败: ' + error.message });
        }
    };

    const showModal = (houseId: string) => {
        setHouseId(houseId);
        setIsOnlistModalVisible(true);
    };

    const handleOnlistOk = async () => {
        if (!housePrice || isNaN(Number(housePrice)) || Number(housePrice) <= 0) {
            notification.error({ message: '错误', description: '请输入有效的价格' });
            return;
        }

        await onListHouse();
        setIsOnlistModalVisible(false);
        setHousePrice(''); 
    };

    const onBuyHTK = async () => {
        if (!ethToHtkAmount || isNaN(Number(ethToHtkAmount)) || Number(ethToHtkAmount) <= 0) {
            notification.error({ message: '错误', description: '请输入有效的ETH数量' });
            return;
        }

        try {
            await hTKTokenConstract.methods.buyTokens().send({
                from: account,
                value: web3.utils.toWei(ethToHtkAmount,"ether"), // 使用 ETH 购买 HTK
            });
            notification.success({ message: '成功', description: '成功购买 HTK' });
            await updateHouses();
            await updateBalance();
            setIsETHtoHTKModalVisible(false);
        } catch (error: any) {
            notification.error({ message: '错误', description: '购买失败: ' + error.message });
        }
        setIsHTKtoETHModalVisible(false);
    };

    // HTK 兑换 ETH
    const onSellHTK = async () => {
        if (!htkToEthAmount || isNaN(Number(htkToEthAmount)) || Number(htkToEthAmount) <= 0) {
            notification.error({ message: '错误', description: '请输入有效的HTK数量' });
            return;
        }

        try {
            //await hTKTokenConstract.methods.approve(buyMyRoomContract.options.address, htkToEthAmount).send({ from: account });
            await hTKTokenConstract.methods.sellTokens(htkToEthAmount).send({ from: account });
            notification.success({ message: '成功', description: '成功兑换 ETH' });
            await updateHouses();
            await updateBalance();
            setIsETHtoHTKModalVisible(false);
        } catch (error: any) {
            notification.error({ message: '错误', description: '兑换失败: ' + error.message });
        }
        setIsHTKtoETHModalVisible(false);
    };

    // @ts-ignore
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#001529', padding: '0 20px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <img
                            src={zju}
                            alt="Logo"
                            style={{ height: '60px' }}
                        />
                    </Col>
                    <Col>
                        <Title level={3} style={{ color: 'white', margin: 0 }}>
                            去中心化房屋交易平台
                        </Title>
                    </Col>
                </Row>
            </Header>
            <Layout>
                <Sider width={480} style={{ background: '#fff' }}>
                    <Menu mode="inline" defaultSelectedKeys={['1']}>
                        <Menu.SubMenu key="user" icon={<UserOutlined />} title={`你好！ ${account}`}>
                            <Menu.Item key="logout" onClick={onNavigate}>退出</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.Item key="balance" icon={<DollarOutlined />} title={``}>
                            账户余额: ${accountBalance} ETH
                        </Menu.Item>
                        <Menu.Item key="htkBalance" icon={<DollarOutlined />} title={``}>
                            HTK 余额: ${web3.utils.fromWei(htkBalance,"ether")} HTK
                        </Menu.Item>
                        <Menu.SubMenu key="ownedHouses" icon={<HomeOutlined />} title={`名下房产: ${ownedHouses.length} 处`}>
                            <List
                                bordered
                                dataSource={ownedHouses}
                                renderItem={(house) => (
                                    <List.Item>
                                        <div>
                                            <Typography.Paragraph>房屋ID: {house.tokenId}</Typography.Paragraph>
                                            <Typography.Paragraph>所有者: {house.owner}</Typography.Paragraph>
                                            <Typography.Paragraph>
                                                上架状态: {house.isForSale ? '已上架' : '未上架'}
                                                <Button
                                                    style={{ marginLeft: '30%' }}
                                                    type="primary"
                                                    onClick={() => house.isForSale ? onDelistHouse(house.tokenId) : showModal(house.tokenId)}
                                                >
                                                    {house.isForSale ? '下架房屋' : '上架房屋'}
                                                </Button>
                                            </Typography.Paragraph>

                                            {house.isForSale && (
                                                <>
                                                    <Typography.Paragraph>上架价格: {house.price} ETH</Typography.Paragraph>
                                                    <Typography.Paragraph>上架时间: {new Date(Number(BigInt(house.listedTimestamp) * BigInt(1000))).toLocaleString()}</Typography.Paragraph>
                                                </>
                                            )}
                                        </div>
                                    </List.Item>
                                )}
                                style={{ maxHeight: '400px', overflowY: 'auto' }}
                            />
                        </Menu.SubMenu>
                        {/* 添加铸造房屋按钮 */}
                        {isOwner && (
                            <Menu.Item key="mintHouse" onClick={() => setMintModalVisible(true)}>
                                铸造房屋
                            </Menu.Item>
                        )}
                        {/* 兑换 HTK 和 ETH */}
                        <Menu.Item key="buyHTK" onClick={() => setIsETHtoHTKModalVisible(true)}>
                            使用 ETH 购买 HTK
                        </Menu.Item>
                        <Menu.Item key="sellHTK" onClick={() => setIsHTKtoETHModalVisible(true)}>
                            使用 HTK 兑换 ETH
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout style={{ padding: '0 24px 24px' }}>
                    <Content style={{ margin: 0, minHeight: 280, textAlign: 'center' }}>
                        <Title level={2}>可购买房屋列表</Title>
                        <List
                            bordered
                            dataSource={houseList}
                            renderItem={(house) => (
                                <List.Item
                                    style={{
                                        border: '2px solid #1890ff',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                        marginBottom: '16px',
                                    }}
                                >
                                    <Typography.Paragraph>房屋ID: {house.tokenId}</Typography.Paragraph>
                                    <Typography.Paragraph>所有者: {house.owner}</Typography.Paragraph>
                                    <Typography.Paragraph>售卖价格: {house.price} ETH</Typography.Paragraph>
                                    <Typography.Paragraph>上架时间: {new Date(Number(BigInt(house.listedTimestamp) * BigInt(1000))).toLocaleString()}</Typography.Paragraph>

                                    {house.owner.toLowerCase() !== account.toLowerCase() ? (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Button
                                                type="primary"
                                                onClick={() => onBuyHouseWithETH(house.tokenId, house.price)}
                                                style={{ marginLeft: '10px' }}
                                            >
                                                使用 ETH 购买
                                            </Button>
                                            <Button
                                                type="default"
                                                onClick={() => onBuyHouseWithHTK(house.tokenId, house.price)}
                                                style={{ marginLeft: '10px' }}
                                            >
                                                使用 HTK 购买
                                            </Button>
                                        </div>
                                    ) : (
                                        <Typography.Paragraph style={{ marginLeft: '10px', color: 'gray' }}>
                                            这是您的房产
                                        </Typography.Paragraph>
                                    )}
                                </List.Item>
                            )}
                            style={{ maxHeight: '750px', overflowY: 'auto' }}
                        />
                    </Content>
                </Layout>
            </Layout>

            {/* 上架房屋的弹出框 */}
            <Modal
                title="上架房屋"
                open={isOnlistModalVisible}
                onOk={handleOnlistOk}
                onCancel={() => setIsOnlistModalVisible(false)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginLeft: '320px' }}>
                    <Popover content={"您的房屋上架后可以随时下架不收取手续费，但如果其他人购买成功，平台将以每天房屋出售价格的5/10000收取手续费，使用ETH/HTK购买均适用于该条款"} title="收费规则">
                        <Button type="primary">平台手续费收费规则</Button>
                    </Popover>
                </div>
                <Typography.Paragraph style={{ display: 'inline-block', marginRight: '10px' }}>房屋ID: {houseId}</Typography.Paragraph>
                <Row align="middle" gutter={8}>
                    <Col>
                        <Typography.Paragraph style={{ marginBottom: 0 }}>请输入上架价格:</Typography.Paragraph>
                    </Col>
                    <Col>
                        <Input
                            placeholder="请输入上架价格 (ETH)"
                            value={housePrice}
                            onChange={(e) => setHousePrice(e.target.value)}
                            style={{ marginBottom: '16px' }}
                        />
                    </Col>
                </Row>
            </Modal>

            {/* 铸造房屋的弹出框 */}
            <Modal
                title="铸造房屋"
                open={mintModalVisible}
                onOk={onMintHouse}
                onCancel={() => setMintModalVisible(false)}
            >
                <Input
                    placeholder="请输入房主地址"
                    value={mintOwnerAddress}
                    onChange={(e) => setMintOwnerAddress(e.target.value)}
                    style={{ marginBottom: '16px' }}
                />
            </Modal>

            {/* 购买 HTK 的弹出框 */}
            <Modal
                title="使用 ETH 购买 HTK"
                open={isETHtoHTKModalVisible}
                onOk={onBuyHTK}
                onCancel={() => setIsETHtoHTKModalVisible(false)}
            >
                <Title level={5}>ETH:HTK比率为1：1000</Title>
                <Title level={5}>请输入你想花费的ETH数量</Title>
                <Input
                    placeholder="请输入你想花费的ETH数量"
                    value={ethToHtkAmount}
                    onChange={(e) => setEthToHtkAmount(e.target.value)}
                    style={{ marginBottom: '16px' }}
                />
            </Modal>

            {/* 使用 HTK 兑换 ETH 的弹出框 */}
            <Modal
                title="使用 HTK 兑换 ETH"
                open={isHTKtoETHModalVisible}
                onOk={onSellHTK}
                onCancel={() => setIsHTKtoETHModalVisible(false)}
            >
                <Title level={5}>ETH:HTK比率为1：1000</Title>
                <Title level={5}>请输入你想花费的HTK数量</Title>
                <Input
                    placeholder="请输入要兑换的 HTK 数量"
                    value={htkToEthAmount}
                    onChange={(e) => setHtkToEthAmount(e.target.value)}
                    style={{ marginBottom: '16px' }}
                />
            </Modal>
        </Layout>
    );
};

export default HouseTradePage;