//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract DaiToken is ERC20{
    constructor() ERC20('DaiToken','DAI'){ }

    function mint(address _to, uint _value) public{
        _mint(_to, _value);
    }
}