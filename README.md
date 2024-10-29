 
# MY-ZJU-blockchain-course-2024
## 项目介绍
### 概述
本项目是一个基于以太坊区块链的去中心化房屋交易平台，用户可以通过该平台进行房屋的挂牌出售、购买、领取所有权等操作。平台通过智能合约自动执行交易流程，确保房屋所有权的转移安全可靠。此外，所有交易和数据都保存在区块链上，保证了数据的透明性和不可篡改性。
### 功能介绍
*我的系统中测试以太币命名为ETH，ERC20代币命名为HTK（HouseToken）*
#### 每个普通用户：
- 用户查看自己拥有的房产列表。并可以挂单出售自己的房屋（挂单包含价格等信息）。
- 用户查看所有出售中的房产，并可以看到一栋房产的主人，及各种挂单信息。
- 用户选择支付房屋价格对应的ETH/HTK，购买某个其他用户出售的房产。购买后房产拥有权发生变化。
- 平台收取手续费：在一个房产出售完成时，用户支付的部分ETH或者HTK（=某栋房产在平台上的挂单天数* 5%% * 房产价格）会被作为手续费转给平台部署者
#### 平台部署者:
- 普通用户的所有权限
- 可以为任何人铸造房屋
#### bonus
- 本实验中发行了一个（ERC20）合约，允许用户将ETH兑换成HTK（ERC20积分），并使用HTK完成购买房屋的流程。
- 提供了ETH兑换HTK的接口
- 提供了HTK兑换ETH的接口
### 实现分析
```solidity
struct House {
        address owner;
        uint256 price;
        uint256 listedTimestamp;
        bool isForSale;
    }

uint256 public houseCount = 0;
mapping(uint256 => House) public houses;
mapping(address => uint256[]) public ownerHouses; // 用于存储每个账户的房产tokenId
```
其核心架构和流程如下：

架构简介：
- 房屋管理：使用 ERC721 代币表示每个房屋，每个房屋对应一个唯一的 tokenId。
- 支付方式：支持通过 ETH 或 ERC20 代币（HTK）进行房屋交易，平台会收取一定比例的手续费。
- 核心数据结构：
  - House：记录房屋的所有者、价格、上架时间等信息。
  - HouseWithTokenId：扩展了 House 结构，包含 tokenId，便于查询和操作。
  - houses：存储所有房屋信息的映射。
  - ownerHouses：记录每个用户所拥有的房屋 tokenId 列表。
- 运行流程：
  - 房屋铸造：平台所有者调用 mintHouse 函数铸造新房屋，分配给指定用户。
  - 挂牌出售：房主调用 listHouseForSale 函数设置房屋价格并挂牌。
  - 购买房屋：买家通过 ETH 或 HTK 购买挂牌的房屋，交易成功后，房屋所有权转移，同时支付一定手续费给平台。
  - 取消挂牌：房主可通过 delistHouse 函数取消房屋的出售状态。
## 运行方式
1. 克隆本仓库
2. 下载并且运行ganache
   1. 记录ganache中的`RPC server`以及选择一个账户作为平台部署者，记录他的私钥
   2. 修改`/contracts/hardhat.config.ts`中的`url`为`RPC server`的值
   3. 修改`/contracts/hardhat.config.ts`中`accounts`为你记录的私钥值
3. 安装合约依赖、编译、部署合约
```
cd contracts

npm install hardhat
npx hardhat compile
npx hardhat run scripts/deploy.ts --network ganache

\\ 记录该处输出的'BuyMyRoom'、'HTKToken'部署地址

```
- 然后修改`/frontend/src/utils/contract-addresses.json`中的对应值，替换为上述部署的地址
4. 确保你的浏览器安装了`metamask`插件
 - 并且导入ganache模拟的网络（即2.2中的url）
 - 导入你想要授权的账户（ganache提供的）
5. 安装前端依赖，运行
```
cd ../frontend
npm install
npm start
```