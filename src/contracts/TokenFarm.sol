//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm{
    DaiToken daiToken;
    DappToken dappToken;
    
    address[] public stackers;
    mapping(address => uint) stackAmount;
    mapping(address =>bool) hasStacked;

    constructor(DaiToken _daiToken, DappToken _dappToken){
        daiToken = _daiToken;
        dappToken = _dappToken;
    }

    // Stacking
    function StackingToken(uint _value) public{
        require(!hasStacked[msg.sender], 'You have already stacked amount');
        
        stackAmount[msg.sender] += _value;
        if(!hasStacked[msg.sender]){
            stackers.push(msg.sender);
        }
   
        //Investor send DAI amount to LiquidityPool
        daiToken.transferFrom(msg.sender, address(this), _value);
        hasStacked[msg.sender] = true;
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
    function IssueToken() public{
        for(uint i=0; i<stackers.length; i++){
            address inv = stackers[i];
            uint amount = stackAmount[msg.sender];
            if(amount > 0){
                dappToken.transfer(inv, amount);
            }
        }       
    }
}
