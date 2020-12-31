const Token = artifacts.require("Token");
const ethSwap = artifacts.require("ethSwap");

require('chai').use(require('chai-as-promised')).should()

function tokens(n){
    return web3.utils.toWei(n, 'ether')
}

contract('Token', (accounts) => {
    let token, ethswap
    beforeEach( async () => {
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
})
