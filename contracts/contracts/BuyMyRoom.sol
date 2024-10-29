// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./HTKToken.sol";
import "hardhat/console.sol";
// Bonus: ERC20 token for buying houses


contract BuyMyRoom is ERC721 {
    struct House {
        address owner;
        uint256 price;
        uint256 listedTimestamp;
        bool isForSale;
    }

    struct HouseWithTokenId {
        uint256 tokenId;
        address owner;
        uint256 price;
        uint256 listedTimestamp;
        bool isForSale;
    }
    HTKToken public htkToken;
    uint256 public houseCount = 0;
    mapping(uint256 => House) public houses;
    mapping(address => uint256[]) public ownerHouses; // 用于存储每个账户的房产tokenId
    uint256 public feePercentage = 5;
    address public platformOwner;

    event HouseListed(uint256 indexed tokenId, uint256 price, address indexed owner);
    event HouseSold(uint256 indexed tokenId, address indexed newOwner, uint256 price);
    event HouseDelisted(uint256 indexed tokenId, address indexed owner);

    constructor() ERC721("BuyMyRoom", "BMR") {
        platformOwner = msg.sender;
        htkToken=new HTKToken();
    }
    function getPlatformOwner() external view returns (address){
        return platformOwner;
    }
    function mintHouse(address to) external {
        require(msg.sender == platformOwner, "Only the platform owner can mint");
        houseCount++;
        _mint(to, houseCount);
        houses[houseCount] = House({
            owner: to,
            price: 0,
            listedTimestamp: 0,
            isForSale: false
        });
        ownerHouses[to].push(houseCount); // 记录新房产到所有者的列表
    }

    function listHouseForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this house");
        require(price > 0, "Price must be greater than zero");

        houses[tokenId].price = price;
        houses[tokenId].listedTimestamp = block.timestamp;
        houses[tokenId].isForSale = true;

        emit HouseListed(tokenId, price, msg.sender);
    }

    function delistHouse(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this house");
        houses[tokenId].isForSale = false;
        houses[tokenId].listedTimestamp=0;
        emit HouseDelisted(tokenId, msg.sender);
    }
    function buyHouseWithETH(uint256 tokenId) external payable {
        require(houses[tokenId].isForSale, "House is not for sale");
        require(msg.value >= houses[tokenId].price, "Insufficient payment");

        address seller = ownerOf(tokenId);
        uint256 price = houses[tokenId].price;

        // 计算手续费，使用 calculateFee 函数
        uint256 fee = calculateFee(tokenId);
        uint256 sellerAmount = price - fee;

        // 转账给卖家和平台所有者
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(sellerAmount);
        payable(platformOwner).transfer(fee); // 将手续费转给平台所有者

        houses[tokenId].owner = msg.sender;
        houses[tokenId].isForSale = false;

        // 更新新所有者的房产列表
        ownerHouses[msg.sender].push(tokenId);
        removeHouseFromOwner(seller, tokenId);

        emit HouseSold(tokenId, msg.sender, price);
    }

    function buyHouseWithHTK(uint256 tokenId) external {
        require(houses[tokenId].isForSale, "House is not for sale");
        uint256 priceHTK = houses[tokenId].price*1000;

        // 计算手续费，使用 calculateFee 函数
        uint256 feeHTK = calculateFeeHTK(tokenId);
        uint256 sellerAmount = priceHTK - feeHTK;

        //require(htkToken.balanceOf(msg.sender) >= priceHTK, "Insufficient HTK balance");

        // 使用 HTK 支付，并扣除手续费
        htkToken.transferFrom(msg.sender, ownerOf(tokenId), sellerAmount); // 卖家收到扣除手续费后的金额
        htkToken.transferFrom(msg.sender, platformOwner, feeHTK); // 平台所有者收到手续费

        _transfer(ownerOf(tokenId), msg.sender, tokenId);

        houses[tokenId].owner = msg.sender;
        houses[tokenId].isForSale = false;

        // 更新新所有者的房产列表
        ownerHouses[msg.sender].push(tokenId);
        removeHouseFromOwner(ownerOf(tokenId), tokenId);

        emit HouseSold(tokenId, msg.sender, priceHTK);
    }
//    function buyHouse(uint256 tokenId) external payable {
//        require(houses[tokenId].isForSale, "House is not for sale");
////        require(msg.value >= houses[tokenId].price, "Insufficient payment");
////        uint256 overpayment = msg.value - houses[tokenId].price;
////
////        if (overpayment > 0) {
////            payable(msg.sender).transfer(overpayment);
////        }
//
//        address seller = ownerOf(tokenId);
//        uint256 price = houses[tokenId].price;
//        uint256 fee = calculateFee(tokenId);
//
//        _transfer(seller, msg.sender, tokenId);
//        payable(seller).transfer(price - fee);
//        payable(platformOwner).transfer(fee);
//
//        houses[tokenId].owner = msg.sender;
//        houses[tokenId].isForSale = false;
//
//        // 更新新所有者的房产列表
//        ownerHouses[msg.sender].push(tokenId);
//        // 从卖家的房产列表中移除该房产
//        removeHouseFromOwner(seller, tokenId);
//
//        emit HouseSold(tokenId, msg.sender, price);
//    }

    function calculateFee(uint256 tokenId) public view returns (uint256) {
        uint256 durationInDays = (block.timestamp - houses[tokenId].listedTimestamp) / 1 days;
        return houses[tokenId].price * feePercentage * durationInDays / 10000;
    }
    function calculateFeeHTK(uint256 tokenId) public view returns (uint256) {
        uint256 durationInDays = (block.timestamp - houses[tokenId].listedTimestamp) / 1 days;
        return houses[tokenId].price*1000*feePercentage * durationInDays / 10000;
    }

    // 修改此函数，返回 struct HouseWithTokenId 数组
    function getHousesForSale() external view returns (HouseWithTokenId[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= houseCount; i++) {
            if (houses[i].isForSale) {
                count++;
            }
        }

        HouseWithTokenId[] memory forSaleHouses = new HouseWithTokenId[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= houseCount; i++) {
            if (houses[i].isForSale) {
                forSaleHouses[index] = HouseWithTokenId({
                    tokenId: i,
                    owner: houses[i].owner,
                    price: houses[i].price,
                    listedTimestamp: houses[i].listedTimestamp,
                    isForSale: houses[i].isForSale
                });
                index++;
            }
        }
        return forSaleHouses;
    }

    function getAllHouses() external view returns (HouseWithTokenId[] memory) {

        HouseWithTokenId[] memory forSaleHouses = new HouseWithTokenId[](houseCount);
        for (uint256 i = 1; i <= houseCount; i++) {
            forSaleHouses[i-1] = HouseWithTokenId({
                tokenId: i,
                owner: houses[i].owner,
                price: houses[i].price,
                listedTimestamp: houses[i].listedTimestamp,
                isForSale: houses[i].isForSale
            });

        }
        return forSaleHouses;
    }


    // 修改此函数，返回 struct HouseWithTokenId 数组
    function getMyHouses() external view returns (HouseWithTokenId[] memory) {
        uint256[] memory myHouseIds = ownerHouses[msg.sender];
        HouseWithTokenId[] memory myHouses = new HouseWithTokenId[](myHouseIds.length);

        for (uint256 i = 0; i < myHouseIds.length; i++) {
            uint256 tokenId = myHouseIds[i];
            myHouses[i] = HouseWithTokenId({
                tokenId: tokenId,
                owner: houses[tokenId].owner,
                price: houses[tokenId].price,
                listedTimestamp: houses[tokenId].listedTimestamp,
                isForSale: houses[tokenId].isForSale
            });
        }
        return myHouses;
    }

    function removeHouseFromOwner(address owner, uint256 tokenId) internal {
        uint256[] storage ownedHouses = ownerHouses[owner];
        for (uint256 i = 0; i < ownedHouses.length; i++) {
            if (ownedHouses[i] == tokenId) {
                ownedHouses[i] = ownedHouses[ownedHouses.length - 1]; // 用最后一个元素替代
                ownedHouses.pop(); // 移除最后一个元素
                break;
            }
        }
    }
}

