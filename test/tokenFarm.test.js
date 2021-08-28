const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(n){
	return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
	let daiToken, dappToken, tokenFarm;

	before(async () => {
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(daiToken.address, dappToken.address)

        await dappToken.mint(tokenFarm.address, tokens('100'))
		//await dappToken.transfer(tokenFarm.address, tokens('100'))
        await daiToken.mint(investor, tokens('100'))
		//await daiToken.transfer(investor, tokens('100'), { from: owner })
	})

	describe('Mock DAI deployment', async () => {
		it('has a name', async () => {
			const name = await daiToken.name()
			assert.equal(name, 'DaiToken')
		})
	})

	describe('Dapp Token deployment', async () => {
		it('has a name', async () => {
			const name = await dappToken.name()
			assert.equal(name, 'DappToken')
		})
	})	

	describe('Token Farm deployment', async () => {
		it('has a name', async () => {
			const name = await tokenFarm.name()
			assert.equal(name, 'TokenFarm')
		})
	})

	describe('Has tokens', async () => {
		it('has a name', async () => {
			let balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('100'))
		})
	})

	describe('stacking test', async () => {
		it('has a stack', async () => {
			let result, invBalance, farmBalance, amo;

			// Checking Investor balance before Stacking
			result = await daiToken.balanceOf(investor);
			assert.equal(result.toString(), tokens('100'), 'investors balance is correct');
            console.log(result.toString());
            console.log(investor);
            
			// Stack Dai Tokens 
			await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor});
			await tokenFarm.StackingToken(tokens('100'), {from: investor});

			// Check stacking result
			result = await daiToken.balanceOf(investor);
			assert.equal(result.toString(), tokens('0'), 'investor dai wallet balance correct');

			result = await daiToken.balanceOf(tokenFarm.address);
			assert.equal(result.toString(), tokens('100'), 'farm dai wallet balance correct');

			result = await tokenFarm.stackAmount(investor);
			assert.equal(result.toString(), tokens('100'), 'investor stacking balance correct');

			result = await tokenFarm.isStacking(investor);
			assert.equal(result.toString(), 'true', 'investor stacking status correct after stacking');

		})
	})

})
