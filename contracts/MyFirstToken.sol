// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract MyFirstToken {
    address private owner;
    string public name = "MyFirstToken";
    string public symbol = "MFT";
    uint8 public decimals = 8;
    uint256 public TotalSupply;

    mapping (address => uint256) private balances;
    mapping (address => mapping (address => uint256)) private allowed;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Mint(address indexed _to, uint256 _value);
    event Burn(address indexed _from, uint256 _value);

    constructor() {
        owner = msg.sender;
    }

    function mint(address _to, uint256 _value) public {
        require(msg.sender == owner, "Only owner can mint tokens");
        require(_to != address(0), "Invalid receiver address");
        balances[_to] += _value;
        TotalSupply += _value;

        emit Mint(_to, _value);
    }

    function burn(address _from, uint256 _value) public {
        require(msg.sender == owner, "Only owner can burn tokens");
        require(_from != address(0), "Invalid receiver address");

        balances[_from] -= _value;
        TotalSupply -= _value;

        emit Burn(_from, _value);
    }

    function totalSupply() public view returns (uint256){
        return TotalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256 balance){
        return balances[_owner];
    }

    function transfer (address _to, uint256 _value) public returns (bool success){
        address _from = msg.sender;

        require(balances[_from] >= _value, "There are not enough funds on the balance sheet");
        require(_to != address(0), "Invalid address");
        
        balances[_from] -= _value;
        balances[_to] += _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    function transferFrom (address _from, address _to, uint256 _value) public returns (bool success){
        require(allowed[_from][_to] >= _value, "At first u have to get a permission for the transfer");
        require(balances[_from] >= _value, "There are not enough funds on the balance sheet");
        require(_from != address(0), "Invalid sender address");
        require(_to != address(0), "Invalid receiver address");
        balances[_from] -= _value;
        balances[_to] += _value;
        allowed[_from][_to] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success){
        require(_spender != address(0), "Invalid spender address");
        
        address _owner = msg.sender;
        allowed[_owner][_spender] = _value;

        emit Approval(_owner, _spender, _value);
        return true;
    }
}