import React, {Component} from 'react';
import Web3 from 'web3';
import './App.css';
import NoLossTokens from '../abis/NoLossToken.json';


class App extends Component {

  async componentDidMount() {
    await this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) { 
  //debugger;
  //Sensitive Information
  const privateKey =  '5ead92c47efffdddf34c000761b68c3866f7d85131ed9208ba96331362634efa';
  const deployer_address = '0xC0D8a7d9520D3fdD85e9676D631730e7F762698E';

  const ropsten_Provider = 'https://ropsten.infura.io/v3/59d7420ec6b34a128f884d1b36a5a064';
  const web3 = new Web3(ropsten_Provider);
  const contract_Address = web3.utils.toChecksumAddress('0x7e6248F85C7F6F01DcaA7E8bcaB142745Da535b2');
  const networkId = await web3.eth.net.getId();
  const contract = new web3.eth.Contract(
    NoLossTokens.abi, 
    contract_Address
  );  
  const to = '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2';
  const value = Web3.utils.toWei('1', 'ether');
  
  console.log("Deployer Balance: ", await contract.methods.balanceOf(deployer_address).call());
  console.log("Contract Price: ", await contract.methods.balanceOf(contract_Address).call());
  console.log("To: ", await contract.methods.balanceOf(to).call());
  
  const tx = await contract.methods.mint(to, value);

  //await contract.methods.mint(to, value);
  
  console.log("Deployer Balance: ", await contract.methods.balanceOf(deployer_address).call());
  console.log("Contract Price: ", await contract.methods.balanceOf(contract_Address).call());
  console.log("To: ", await contract.methods.balanceOf(to).call());


  const accounts = await web3.eth.getAccounts();
  console.log("Accounts: ", accounts);

  const minter = contract.methods.minter().call();
  console.log("Minter: ", minter);

  const gas = await tx.estimateGas({from: deployer_address});
  console.log("Gas: ", gas);
  const gasPrice = await web3.eth.getGasPrice();
  console.log("Gas Price: ", gasPrice);
  const data = tx.encodeABI();
  console.log("Abi Data: ", data);
  const nonce = await web3.eth.getTransactionCount(deployer_address);

  const tx2 = {
    // this is the minter/deployer address
    from: deployer_address, 
    // target address, this could be a smart contract address
    to: contract_Address, 
    // optional if you want to specify the gas limit 
    gas: gas, 
    // optional if you are invoking say a payable function 
    value: value,
    // this encodes the ABI of the method and the arguements
    data: data
  };

  const signPromise = web3.eth.accounts.signTransaction(tx2, privateKey);
  //const signPromise = web3.eth.signTransaction(tx2, tx2.from);

  signPromise.then((signedTx) => {
    // raw transaction string may be available in .raw or 
    // .rawTransaction depending on which signTransaction
    // function was called
    const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
    sentTx.on("receipt", receipt => {
      // do something when receipt comes back
      console.log("RECEIPT: ", receipt);
    });
    sentTx.on("error", err => {
      // do something on transaction error
      console.log("TRANSACTION ERROR: ", err);
    });
  }).catch((err) => {
    // do something when promise fails
    console.log("ERROR: ", err);
  });


  // const signedTx = await web3.eth.accounts.signTransaction({
  //     to,
  //     data, 
  //     gas,
  //     gasPrice,
  //     nonce,
  //     chainId: networkId
  //   },
  //   privateKey
  // );



//  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
//console.log("Contract: ", contract);
 // console.log(receipt.transactionHash);
  console.log("Deployer Balance: ", await contract.methods.balanceOf(deployer_address).call());
  console.log("Contract Price: ", await contract.methods.balanceOf(contract_Address).call());
  console.log("To: ", await contract.methods.balanceOf(to).call());

  let my_ethBalance = await web3.eth.getBalance(deployer_address);
  my_ethBalance = my_ethBalance.toString();
  my_ethBalance = web3.utils.fromWei(my_ethBalance, 'ether');

  //console.log(contract.methods.mint().call());
  console.log(contract);


    this.setState({
      tokenName: 'name', 
      deployerBalance: my_ethBalance, 
      tokenSymbol: 'tokenSymbol',
    });
    
}

constructor(props) {
  super(props)
  this.state = {
    tokenName: '',
    tokenSymbol: '',
    web3: 'undefined',
    account: '',
    token: null,
    dbank: null,
    balance: 0,
    deployerBalance: 0,
    dBankAddress: null
  }
}

render() {
    return (
      <> 
        <div className="App">
        <h1>{this.state.tokenName}</h1>
        <h1>THIS IS THE {this.state.tokenSymbol} TEST</h1>
        <h1>YOU HAVE {this.state.deployerBalance} {this.state.tokenSymbol}</h1>
        </div>
      </>
    );
}










  // componentWillMount(){
  //   this.LoadBlockchainData();
  // }

  // async LoadBlockchainData(){
  //   const web3 = new Web3("HTTP://127.0.0.1:7545"); //Web3.givenProvider || 
  //   const network = await web3.eth.net.getNetworkType();
  //   const accounts = await web3.eth.getAccounts();
  //   this.setState({acc: accounts[0]});
  //   console.log("network: ", network);
  //   console.log(" accounts:", accounts);
  // }

  // constructor(props){
  //   super(props)
  //   this.state = { 
  //     acc: '' 
  //   }
  // }

  // render() {
    
  //   return (
  //     <div className="container">
  //       <h1>Hello, World!</h1>
  //       <p>{this.state.acc}</p>
  //     </div>
  //   );
  // }
}

export default App;
