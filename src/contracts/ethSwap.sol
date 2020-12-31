pragma solidity ^0.5.0;
import "./Token.sol";

contract ethSwap {
    string public name = "ethSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    constructor (Token _token) public {
        token = _token;
    }

    function buytokens() public payable {
        //calculate the no. of tokens to buy
        uint tokenAmount = msg.value * rate;
        //transfer token to the user
        token.transfer(msg.sender, tokenAmount);

    }

    
}