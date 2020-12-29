const Token = artifacts.require("Token");
const ethSwap = artifacts.require("ethSwap");

module.exports = async function(deployer) {
  //Deploy Token
  await deployer.deploy(Token);
  const token = await Token.deployed()
  //Deploy ethSwap
  await deployer.deploy(ethSwap);
  const ethswap = await ethSwap.deployed()

  //transfer all tokens to ethSwap (1 Million)
  await token.transfer(ethswap.address, '1000000000000000000000000')
};
