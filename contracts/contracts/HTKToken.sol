// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract HTKToken is ERC20 {
    address public platformOwner;

    constructor() ERC20("HTKToken", "HTK") {
        platformOwner = msg.sender;
        _mint(platformOwner, 1000000 * 10 ** decimals()); // 平台所有者铸造 100 万 HTK
    }

    function buyTokens() external payable {
        require(msg.value > 0, "ETH amount must be greater than zero");
        uint256 tokenAmount = msg.value * 1000; // 1 ETH = 1000 HTK
        _mint(msg.sender, tokenAmount); // 用户购买时铸造 HTK
    }

    function sellTokens(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient HTK balance");
        uint256 ethAmount = amount / 1000; // 1000 HTK = 1 ETH
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(ethAmount* 10 ** decimals()); // 返还ETH
    }
}