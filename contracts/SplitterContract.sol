pragma solidity ^0.4.15;

import "zeppelin/math/SafeMath.sol";

contract SplitterContract {

    using SafeMath for uint256;

    address public addrDefault;
    address[] public addrHolders;
    mapping (address => uint256) public basePoints;

    event NewAddress(uint256 argIndex, address argAddress, uint256 argBasePoints);
    event Credited(address argAddress, uint256 argBasePoints, uint256 argAmount);

    function SplitterContract(address newAddrDefault, address[] newHolders, uint256[] newBasePoints)
    {
        require(newAddrDefault != address(0));
        require(newHolders.length == newBasePoints.length);

        uint256 i = 0;
        uint256 basePointsSum = 0;
        for (i = 0; i < newBasePoints.length; i++) {
            require(newBasePoints[i] > 0);
            require(newBasePoints[i] <= 10000);
            basePointsSum = basePointsSum.add(newBasePoints[i]);
        }
        require(basePointsSum <= 1500); // 15% max

        addrDefault = newAddrDefault;

        for (i = 0; i < newHolders.length; i++) {
            require(newHolders[i] != address(0));
            addrHolders.push(newHolders[i]);
            basePoints[addrHolders[i]] = newBasePoints[i];
            NewAddress(i, addrHolders[i], basePoints[addrHolders[i]]);
        }
    }

    function() public payable
    {
    }

    function triggerPayout()
    {
        uint256 currentBalance = this.balance;
        uint256 defaultAccountBasePoints = 10000;

        for (uint i = 0; i < addrHolders.length; i++) {
            uint256 amount = currentBalance.mul(basePoints[addrHolders[i]]).div(10000);
            defaultAccountBasePoints = defaultAccountBasePoints.sub(basePoints[addrHolders[i]]);
            addrHolders[i].transfer(amount);
            Credited(addrHolders[i], basePoints[addrHolders[i]], amount);
        }

        currentBalance = this.balance;
        addrDefault.transfer(currentBalance);
        Credited(addrDefault, defaultAccountBasePoints, currentBalance);
    }
}
