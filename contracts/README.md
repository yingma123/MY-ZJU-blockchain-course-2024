# 去中心化房屋购买系统合约


- 下载并且运行ganache
    1. 记录ganache中的`RPC server`以及选择一个账户作为平台部署者，记录他的私钥
    2. 修改`/contracts/hardhat.config.ts`中的`url`为`RPC server`的值
    3. 修改`/contracts/hardhat.config.ts`中`accounts`为你记录的私钥值
- 安装合约依赖、编译、部署合约
```
cd contracts

npm install hardhat
npx hardhat compile
npx hardhat run scripts/deploy.ts --network ganache

\\ 记录该处输出的'BuyMyRoom'、'HTKToken'部署地址

```