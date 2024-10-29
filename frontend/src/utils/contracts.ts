import Addresses from './contract-addresses.json'
import buyMyRoom from './abis/BuyMyRoom.json'
import hTKToken from './abis/HTKToken.json'
import Web3 from 'web3';

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
// let web3 = new Web3(window.web3.providers.currentProvider);
//
// // 修改地址为部署的合约地址
// const buyMyRoomAddress = Addresses.buyMyRoom
// const buyMyRoomABI = buyMyRoom.abi
//
// // 获取合约实例
// const buyMyRoomContract = new web3.eth.Contract(buyMyRoomABI, buyMyRoomAddress);
//
// // 导出web3实例和其它部署的合约
// export {web3, buyMyRoomContract}

// 创建 web3 实例
let web3= new Web3(window.ethereum);
    // 请求用户授权
    window.ethereum.request({ method: 'eth_requestAccounts' });


// 修改地址为部署的合约地址
const buyMyRoomAddress = Addresses.buyMyRoom;
const buyMyRoomABI = buyMyRoom.abi;
const hTKTokenAddress =Addresses.hTKToken;
const hTKTokenABI = hTKToken.abi;
// 获取合约实例
const buyMyRoomContract = new web3.eth.Contract(buyMyRoomABI, buyMyRoomAddress);
const hTKTokenConstract =new web3.eth.Contract(hTKTokenABI, hTKTokenAddress);
// 导出 web3 实例和其它部署的合约
export { web3, buyMyRoomContract, hTKTokenConstract};