// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NoLossToken is ERC20 {
    
  //add minter variable
  address payable public owner;
  address payable public minter;
  address payable public commissionAddress;
  uint public commissionAmount;
 

  //add minter changed event
  event MinterChanged(address indexed from, address to);

  //Mint fun is executed
  event MintCall(address freezer, address minter, uint256 amount);

  //add commission address changed event
  event commissionAddressChanged(address indexed from, address to);

  constructor() payable ERC20("NoLoss Token", "NLT") {
    //asign initial minter
    owner = payable(address(msg.sender));
    minter = payable(address(msg.sender));
  }
  
  modifier authorizedToMint(){
        require(msg.sender == minter || msg.sender == owner, "Not Authorized");
        _;
    }

  //Add NoLossContract to Minter role
  function passMinterRole(address NoLossContract) public payable authorizedToMint returns (bool){
   // require(msg.sender==minter, 'Error, only owner can change pass minter role');
    minter = payable(address(NoLossContract));

    emit MinterChanged(msg.sender, NoLossContract);
    return true;
  }
//authorizedToMint
   //Mint Token function
  function mint(address freezerAddress, uint256 amount) public payable authorizedToMint {
    //check if msg.sender have minter role
    //require(msg.sender == minter || msg.sender == owner, 'Error, only NoLoss Smart Contract can mint Token');
    emit MintCall(freezerAddress, owner, amount);
    commissionAddress = owner;
    commissionAmount = (amount*10)/100;
		_mint(freezerAddress, amount);
        _mint(commissionAddress, commissionAmount);
	}
}
