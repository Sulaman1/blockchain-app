const NoLossToken = artifacts.require('NoLossToken');

module.exports = async function(deployer){
    await deployer.deploy(NoLossToken);
    const NoLoss = await NoLossToken.deployed();
}