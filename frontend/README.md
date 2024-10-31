# 前端
- 修改`/frontend/src/utils/contract-addresses.json`中的对应值，替换为上述部署的地址
- 将 `./frontend/src/utils/abis` 的两个json文件替换为 `./contracts/artifacts/contracts` 下的 `BuyMyRoom.json` 和 `myERC.json`
- 确保你的浏览器安装了`metamask`插件
  - 并且导入ganache模拟的网络（使用`/contracts/hardhat.config.ts`中的`url`）
  - 导入你想要授权的账户（ganache提供的） 
- 安装前端依赖，运行
```
cd ../frontend
npm install
npm start
```