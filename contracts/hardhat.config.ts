import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:7545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x45233cee401e81b8f722dfcf43f72587c788bc7bbe57b935003bb0e266e5418f',
        '0x73ac0550c710817dec1c924d24823f18af6b25a9c5cc21ebbcdd43008383d70a',
        '0x5f6da4eb9216c6f4c10e6e1446e43716daab91abf2a5d87fe63033885e87d4ff',
        '0xaeb59ec3c11287f1a481a5014721ef67060c48a87d4fcec549018f237c45fb93',
        '0x27aea8b207ddff2b5dc1b98d5af797cabc0df7cccc044b9644f980ffec62cb8a',
        '0x76c9385bf9421086020b342be39e805298b238b771013000aafef659ff52bb5e',
        '0xfcc71bed2f70baee383f8930937c0fe8d313689cecee7bde5ebb6f7f57ca6b44',
        '0x8da91775e61f33441b6716acd0a3fae1dc0390ce25d724237affcb02d1a0b93f',
        '0x0ae44f7e7e1a3ff92dd246f59c5cc8e7fd32c03cc73b34d98703c50d25e09c93',
        '0x4924221a1aefa64072e482503c5c38e557594db6844e2b71c4e0403d28019a91'
      ]
    },
    hardhat:{
      gas:3000,
    }
  },
};

export default config;
