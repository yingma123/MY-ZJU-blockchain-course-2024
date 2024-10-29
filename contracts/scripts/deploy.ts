import { ethers } from "hardhat";

async function main() {
  const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
  const buyMyRoom = await BuyMyRoom.deploy();
  await buyMyRoom.deployed();
  console.log(`BuyMyRoom deployed to ${buyMyRoom.address}`);
  const hTKToken =await buyMyRoom.htkToken();
  console.log(`HTKToken deployed to: ${hTKToken}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
