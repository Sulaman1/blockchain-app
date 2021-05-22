//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm{
    string public name = "TokenFarm";

    DaiToken public daiToken;
    DappToken public dappToken;
    
    address[] public stackers;
    mapping(address => uint) public stackAmount;
    mapping(address =>bool) public hasStacked;
    mapping(address => bool) public isStacking;

    event StackEvent(address sender, address stacker, uint value);

    constructor(DaiToken _daiToken, DappToken _dappToken){
        daiToken = _daiToken;
        dappToken = _dappToken;
    }

    // Stacking
    function StackingToken(uint _value) public{
        require(_value > 0, 'Your amount cant be 0 or less');

		daiToken.transferFrom(msg.sender, address(this), _value);
		stackAmount[msg.sender] = stackAmount[msg.sender] + _value;

		if(!hasStacked[msg.sender]){
			stackers.push(msg.sender);
		}
		isStacking[msg.sender] = true;
		hasStacked[msg.sender] = true;
        //dappToken.transfer(msg.sender, 30);
        emit StackEvent(msg.sender, address(this), _value);
        // require(!hasStacked[msg.sender], 'You have already stacked amount');
        
        
        // stackAmount[msg.sender] += _value;   
        // if(!hasStacked[msg.sender]){
        //     stackers.push(msg.sender);
        // }
   
        // //Investor send DAI amount to LiquidityPool
        // daiToken.transferFrom(msg.sender, address(this), _value);
        // hasStacked[msg.sender] = true;
    }

    // Unstaking
    function UnStackingToken() public{
        require(hasStacked[msg.sender], '');
       
        //msg.sender.transfer(stackAmount[msg.sender]);
        daiToken.transfer(msg.sender, stackAmount[msg.sender]);
        stackAmount[msg.sender] = 0;
        hasStacked[msg.sender] = false;

    }
    
    // EarnReward
    	function issueToken() public{
		uint balance;
		for(uint256 i = 0; i < stackers.length; i++){

			address add;
			add = stackers[i];

			balance = stackAmount[add];
			
			if(balance > 0){
				dappToken.transfer(add, balance);
			}
		}
	}
}
