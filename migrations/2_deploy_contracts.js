const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

//import Web3 from 'web3';

module.exports = async function(deployer, network, accounts){
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();
    daiToken.mint(accounts[2], '100000000000000000000');

    await deployer.deploy(DappToken);
    const dappToken = await DappToken.deployed();
    
    await deployer.deploy(TokenFarm, daiToken.address, dappToken.address);
    const tokenFarm = await TokenFarm.deployed();

    dappToken.mint(tokenFarm.address, '100000000000000000000');
    
}