const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BuyMyRoom Contract", function () {
  let buyMyRoom;
  let deployer, secondAccount, thirdAccount;

  before(async function () {
    // 获取测试账户
    [deployer, secondAccount, thirdAccount] = await ethers.getSigners();
  //console.log(deployer);
    // 部署合约
    const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
    buyMyRoom = await BuyMyRoom.deploy();
    await buyMyRoom.deployed(); // 等待合约部署完成
  });

  // it("Should mint a new house and assign it to deployer", async function () {
  //   // Deployer铸造一个房屋
  //   await buyMyRoom.mintHouse(deployer.address);
  //   expect(await buyMyRoom.ownerOf(1)).to.equal(deployer.address); // 检查所有权
  // });
  //
  // it("Should allow house listing", async function () {
  //   // Deployer将房屋挂牌出售，价格为 1 ETH
  //   await buyMyRoom.listHouseForSale(1, ethers.utils.parseEther("1"));
  //
  //   // 检查房屋是否已挂牌
  //   const house = await buyMyRoom.houses(1);
  //   expect(house.isForSale).to.be.true; // 确认房屋已挂牌
  //   expect(house.price).to.equal(ethers.utils.parseEther("1")); // 检查挂牌价格
  // });
  //
  // it("Should allow house delisting", async function () {
  //   // Deployer取消房屋挂牌
  //   await buyMyRoom.delistHouse(1);
  //
  //   // 检查房屋是否已取消挂牌
  //   const house = await buyMyRoom.houses(1);
  //   expect(house.isForSale).to.be.false; // 确认房屋不再挂牌
  // });
  //
  // it("Should allow relisting and buying", async function () {
  //   // 重新挂牌房屋，价格为 1 ETH
  //   await buyMyRoom.listHouseForSale(1, ethers.utils.parseEther("1"));
  //
  //   // 第二个账户购买房屋
  //   await buyMyRoom.connect(secondAccount).buyHouse(1, { value: ethers.utils.parseEther("1") });
  //
  //   // 检查房屋是否已转移到第二个账户
  //   expect(await buyMyRoom.ownerOf(1)).to.equal(secondAccount.address);
  // });

  // it("Should calculate the correct fee", async function () {
  //   // Deployer铸造第二个房屋
  //   await buyMyRoom.mintHouse(secondAccount.address);
  //
  //   // 将房屋挂牌出售，价格为 1 ETH
  //   await buyMyRoom.connect(secondAccount).listHouseForSale(2, ethers.utils.parseEther("1"));
  //
  //   // 等待一段时间，模拟挂牌时间过长
  //   await ethers.provider.send("evm_increaseTime", [60*60*24*1000]); // 增加1天的时间
  //   await ethers.provider.send("evm_mine"); // 让时间前进
  //
  //   // 第三个账户购买房屋
  //   await buyMyRoom.connect(thirdAccount).buyHouse(2, { value: ethers.utils.parseEther("1") });
  //
  //   // 检查平台是否收取了正确的手续费
  //   const platformBalance = await ethers.provider.getBalance(buyMyRoom.platformOwner());
  //   const expectedFee = await buyMyRoom.calculateFee(2);
  //   expect(platformBalance).to.equal(expectedFee); // 检查平台账户的余额是否正确
  // });

  it("Should list all houses for sale", async function () {
    // Deployer再铸造一个房屋并挂牌出售
    await buyMyRoom.mintHouse(deployer.address);
    await buyMyRoom.mintHouse(deployer.address);
    await buyMyRoom.mintHouse(deployer.address);
    await buyMyRoom.mintHouse(secondAccount.address);
    // await buyMyRoom.listHouseForSale(3, ethers.utils.parseEther("2"));
    const res1=await  buyMyRoom.getPlatformOwner();
    // 获取所有挂牌出售的房屋
    const housesForSale = await buyMyRoom.getHousesForSale();
    //console.log(housesForSale);
    const res=await buyMyRoom.connect(secondAccount).getMyHouses();
    console.log(res1);
    expect(housesForSale.length).to.be.equal(1); // 确认只有一个房屋在售
    expect(housesForSale[0]).to.equal(3); // 检查房屋的 tokenId
  });
});
