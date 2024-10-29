import { useEffect, useState } from "react";
import { web3 } from "../../utils/contracts";
import { Button, Select, Typography, Row, Col, Layout, notification } from "antd";
import { useNavigate } from 'react-router-dom';
import zju from '../../zju.png';
const { Title } = Typography;
const { Header, Content } = Layout;

const GanacheTestChainId = '0x539';
const GanacheTestChainName = 'Ganache Test Chain';
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545';

const Login = () => {
    const [account, setAccount] = useState('');
    const [accounts, setAccounts] = useState<string[]>([]);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const navigate = useNavigate();

    const initCheckAccounts = async () => {
        // @ts-ignore
        const { ethereum } = window;
        if (Boolean(ethereum && ethereum.isMetaMask)) {
            const accounts = await web3.eth.getAccounts();
            if (accounts && accounts.length) {
                setAccounts(accounts);
                setAccount(accounts[0]);
                setIsWalletConnected(true);
                //notification.success({ message: '钱包已连接', description: `当前账户: ${accounts[0]}` });
            }
        }
    };

    useEffect(() => {
        initCheckAccounts();
    }, []);

    const onClickConnectWallet = async () => {
        // @ts-ignore
        const { ethereum } = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return;
        }

        try {
            // 如果当前MetaMask不在本地链上，切换到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId,
                    chainName: GanacheTestChainName,
                    rpcUrls: [GanacheTestChainRpcUrl],
                };

                try {
                    await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.chainId }] });
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        await ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [chain],
                        });
                    }
                }
            }

            // 请求用户授权并获取账户列表
            await ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            setAccounts(accounts);
            setAccount(accounts[0] || '');
            setIsWalletConnected(true);
            notification.success({ message: '钱包已连接', description: `当前账户: ${accounts[0]}` });
        } catch (error: any) {
            alert(error.message);
        }
    };

    const onClickDisconnectWallet = () => {
        setAccount(''); // 清空当前账户
        setAccounts([]); // 清空可用账户列表
        setIsWalletConnected(false);
        notification.info({ message: '钱包已断开连接' });
    };

    const handleAccountChange = (value: string) => {
        setAccount(value);
    };

    const onNavigate = () => {
        navigate(`/houseTrade?account=${account}`);
    };

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            {/* 顶部 Header 部分 */}
            <Header style={{ background: '#001529', padding: '0 10px' }}>
                <Row justify="space-between" align="middle">
                    {/* Logo */}
                    <Col>
                        <img
                            src={zju}
                            alt="Logo"
                            style={{ height: '60px' }}
                        />
                    </Col>
                    {/* 页面标志信息 */}
                    <Col>
                        <Title level={3} style={{ color: 'white', margin: 0 }}>
                            去中心化房屋交易平台
                        </Title>
                    </Col>
                </Row>
            </Header>

            {/* 页面内容部分 */}
            <Content style={{ padding: '5px 0', backgroundColor: '#f0f2f5' }}>
                <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 64px)' }}>
                    <Col span={13} style={{ textAlign: 'center' }}>
                        <Title level={1}>欢迎来到浙江大学区块链课程</Title>
                        <Title level={1}>去中心化房屋交易实验平台</Title>
                        {!isWalletConnected ? (
                            <>
                                <Title level={1}>连接到你的钱包</Title>
                                <Button type="primary" onClick={onClickConnectWallet}>连接钱包</Button>
                            </>
                        ) : (
                            <>
                                <Title level={3}>钱包已连接</Title> {/* 显示当前连接的账户 */}
                                <Button type="default" style={{ marginTop: '20px' }} onClick={onClickDisconnectWallet}>
                                    断开连接
                                </Button>
                            </>
                        )}

                        {accounts.length > 0 && isWalletConnected && (
                            <div>
                                <Title level={2} style={{ marginTop: '20px' }}>选择账户进行登录</Title>
                                <Select
                                    showSearch
                                    placeholder="选择账户"
                                    style={{ width: 400 }}
                                    onChange={handleAccountChange}
                                    value={account}
                                    dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                                >
                                    {accounts.map(acc => (
                                        <Select.Option key={acc} value={acc}>
                                            {acc}
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Button type="default" style={{ marginTop: '20px' }} onClick={onNavigate}>
                                    登录
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default Login;
