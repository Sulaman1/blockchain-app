pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract DappToken is ERC20{
    constructor() ERC20('DappToken','DT'){ }

    function mint(address _to, uint _value) public{
        _mint(_to, _value);
    }
}