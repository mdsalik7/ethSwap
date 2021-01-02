pragma solidity ^0.5.0;
import "./Token.sol";

contract ethSwap {
    string public name = "ethSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor (Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        //calculate the no. of DApp tokens to buy
        uint tokenAmount = msg.value * rate;

        //Require that EthSwap has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);

        //transfer token to the user
        token.transfer(msg.sender, tokenAmount);

        //Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        //user cant sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);


        //calculate the no. of ethers to redeem
        uint etherAmount = _amount / rate;

        //Require that EthSwap has enough tokens
        require(address(this).balance >= etherAmount);

        //perform sell - sending DApp tokens to this smart contract, ethSwap
        //A smart contract spending tokens for you needs .transferFrom(from, to, amt)
        //.transferFrom() needs first to call approve() in order to work, we ll do that from test
        token.transferFrom(msg.sender, address(this), _amount);

        //perform sell - sending ether to user, msg.sender calling .transfer() means sending ether to msg.sender
        msg.sender.transfer(etherAmount);

        //Emit an event
        emit TokensSold(msg.sender, address(token), _amount, rate);

    }    
}