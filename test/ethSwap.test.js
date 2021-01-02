const Token = artifacts.require("Token");
const ethSwap = artifacts.require("ethSwap");

require('chai').use(require('chai-as-promised')).should()

function tokens(n){
    return web3.utils.toWei(n, 'ether')
}

contract('Token', ([deployer, investor]) => {
    let token, ethswap
    before( async () => {
        token = await Token.new()
        ethswap = await ethSwap.new(token.address)
        //Transfer all tokens from user/deployer to ethswap exchange
        await token.transfer(ethswap.address, tokens('1000000'))
    });
    describe('Token Deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'DApp Token');
        });
    });
    describe('ethSwap Deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethswap.name()
            assert.equal(name, 'ethSwap Instant Exchange');
        });
        it('contract has token', async () => {
            let balance = await token.balanceOf(ethswap.address)
            assert.equal(balance.toString(), tokens('1000000'));  
        }); 
    });
    describe('buy tokens', async () => {
        let result
        before( async () => {
            //purchase tokens before each test/example
            //1 ether = 100 DApp Tokens
            result = await ethswap.buyTokens({from : investor, value : web3.utils.toWei('1', 'ether')})
        });
        it('Allow users to instantly buy tokens from ethSwap for a fixed price', async() => {
            //check investor balance after purchase for DApp tokens
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100')); //Investor has 100 DApp tokens
            //check ethSwap balance after purchase for DApp tokens
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethswap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900')); //ethSwap has (1Million-100) DApp tokens
            //check ethSwap Ethereum Balance
            ethSwapBalance = await web3.eth.getBalance(ethswap.address) //getBalance is a function to check ethereum balance
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether')) //Since just one investor bought DApp tokens of worth 1 ether, ethSwap has 1 ether 
            //Events - console.log(result.logs.args), 
            //logs is array of events stored after each purchase so logs[0] means record for 1st purchase
            //Check logs to ensure event was emitted with correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor) //check if investor address is same
            assert.equal(event.token, token.address) //check for same tokens bought 
            assert.equal(event.amount.toString(), tokens('100').toString()) //check for same amount of tokens bought
            assert.equal(event.rate.toString(), '100') //check for rate
        });
    });
    describe('sellTokens', async () => {
        let result
        before( async () => {
            //Investor must approve tokens before calling the sellTokens() else we ll get revert error
            await token.approve(ethswap.address, tokens('100'), {from : investor})
            //Investor sells 100 DApp tokens
            result = await ethswap.sellTokens(tokens('100'), {from : investor})
        });
        it('Allow user to instantly sell tokens to ethSwap for a fixed price', async () => {
            //check investor balance after sale for DApp tokens
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0')) //Investor has 0 DApp tokens
            //check ethSwap balance after sale for DApp tokens
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethswap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000')) //ethSwap has (1Million) DApp tokens
            //check ethSwap Ethereum Balance
            ethSwapBalance = await web3.eth.getBalance(ethswap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'ether')) //Since just one investor sold DApp tokens of worth 1 ether, ethSwap has 0 ether

            //Check logs to ensure event was emitted with correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor) //check if investor address is same
            assert.equal(event.token, token.address) //check for same tokens bought 
            assert.equal(event.amount.toString(), tokens('100').toString()) //check for same amount of tokens bought
            assert.equal(event.rate.toString(), '100') //check for rate

            //Failure : investor can't sell more tokens than they have
            await ethswap.sellTokens(tokens('500'), {from : investor}).should.be.rejected;
        });
    });
})
