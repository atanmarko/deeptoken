pragma solidity ^0.4.15;

import "zeppelin/token/StandardToken.sol";

contract SelfDestructContract is StandardToken {

    event fundsReceived(string strmsg);

    function() payable
    {
        fundsReceived("Some funds received...");
    }

    function doSelfDestruct(address _to)
    {
        selfdestruct(_to);
    }
}
