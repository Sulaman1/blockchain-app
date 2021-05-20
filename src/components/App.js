import React, {Component} from 'react';
import Web3 from 'web3';
import './App.css';


class App extends Component {

  componentWillMount(){
    this.LoadBlockchainData();
  }

  async LoadBlockchainData(){
    const web3 = new Web3("HTTP://127.0.0.1:7545"); //Web3.givenProvider || 
    const network = await web3.eth.net.getNetworkType();
    const accounts = await web3.eth.getAccounts();
    this.setState({acc: accounts[0]});
    console.log("network: ", network);
    console.log(" accounts:", accounts);
  }

  constructor(props){
    super(props)
    this.state = { acc: '' }
  }

  render() {
    
    return (
      <div className="container">
        <h1>Hello, World!</h1>
        <p>{this.state.acc}</p>
      </div>
    );
  }
}

export default App;
