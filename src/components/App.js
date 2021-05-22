import React, {Component} from 'react';
import Web3 from 'web3';
import DaiToken from '../abis/DaiToken.json';
import DappToken from '../abis/DappToken.json';
import TokenFarm from '../abis/TokenFarm.json';
import BVideo from '../abis/BVideo.json';
import './App.css';



/* <script src="https://unpkg.com/ipfs-http-client/dist/index.min.js"></script>
const ipfs = window.IpfsHttpClient({ host: 'localhost', port: 5001 }) */

// const ipfsClient = require('ipfs-http-client')
// const ipfsClient = await ipfsClient.create()
// const ipfs = ipfsClient({ host: 'ipfs.infura.io', port:5001, protocol: 'https' });



var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI({ host: 'ipfs.infura.io', port:5001, protocol: 'https' });


class App extends Component {

  async componentWillMount(){
    await this.loadWeb3();
    await this.LoadBlockchainData();
  }

  async LoadBlockchainData(){
    
    //const web3 = new Web3("HTTP://127.0.0.1:7545"); //|| Web3.givenProvider
    const web3 = window.web3;
    const network = await web3.eth.net.getNetworkType();
    const accounts = await web3.eth.getAccounts();
    this.setState({acc: accounts[0]});

    console.log("network: ", network);
    console.log(" accounts:", this.state.acc);

    const networkId = await web3.eth.net.getId();
    console.log("networkId: ", networkId);
    const daiTokenData = await DaiToken.networks[networkId];
    const dappTokenData = await DappToken.networks[networkId];
    const tokenFarmData = await TokenFarm.networks[networkId];
    const bVideoData = await BVideo.networks[networkId];
    

    if(bVideoData){
      const bVideo = new web3.eth.Contract(BVideo.abi, bVideoData.address);
      this.setState({ bVideo });

      let vCount = await bVideo.methods.vCount().call();
      this.setState({ vCount });

      for(var i=vCount; i>=1; i--){
        let video = await bVideo.methods.videos(i).call();
        this.setState({ videos: [...this.state.videos, video]})
      }

      const latest = await bVideo.methods.videos(vCount).call();
      this.setState({
        latestHash: latest.videoHash,
        latestTitle: latest.title
      })
    }

    if(tokenFarmData){
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address);      
      const s = await tokenFarm.methods.stackers[0];
      console.log(s);
      this.setState({ tokenFarm: tokenFarm}); 
      let tokenFarmBal = await tokenFarm.methods.stackAmount(this.state.acc).call();
      console.log("Acc TokenFarm Stack Balance: ", tokenFarmBal.toString());
      this.setState({ tokenFarmBal: tokenFarmBal.toString()});
      
      let tokenBal = await tokenFarm.methods.stackAmount(tokenFarm._address).call();
      console.log("Token Stack Balance: ", tokenBal.toString());
    }
    else {
      window.alert('TokenFarm contract not deployed to detect network')
    }
    if(daiTokenData){
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address);
      const tokenFarm = new web3.eth.Contract(DaiToken.abi, tokenFarmData.address);
      
      console.log("balanceOf: ", this.state.acc);

      this.setState({ daiToken: daiToken});

      let daiTokenBal = await daiToken.methods.balanceOf(this.state.acc).call();
      this.setState({daiTokenBal: daiTokenBal.toString()});
      console.log("Acc Dai Balance: ", daiTokenBal.toString());

      let tokA = await tokenFarm._address;
      console.log("token Add: ", tokA);
      let tokenBal = await daiToken.methods.balanceOf(tokA).call();
      console.log("token DAI balance: ", tokenBal);
    }
    else {
      window.alert('DaiToken contract not deployed to detect network')
    }
    if(dappTokenData){
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address);
      const tokenFarm = new web3.eth.Contract(DaiToken.abi, tokenFarmData.address);

      this.setState({ dappToken: dappToken});
      let dappTokenBal = await dappToken.methods.balanceOf(this.state.acc).call();
      this.setState({ dappTokenBal: dappTokenBal.toString() });
      console.log("Dapp Balance: ", dappTokenBal.toString());

      

      let tokA = await tokenFarm._address;
      console.log("token Add: ", tokA);
      let tokenBal = await dappToken.methods.balanceOf(tokA).call();
      console.log("token DAPP balance: ", tokenBal);
    }
    else {
      window.alert('DappToken contract not deployed to detect network')
    }
    this.setState({ loading : false });
  }

  async loadWeb3(){
   
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else{
      window.alert('Non-Ethereum browser detected. You should trying MetaMask!')
    }
  }

  constructor(props){
    super(props)
    this.state = { 
      loading: true,
      acc: '',
      buffer: null,
      bVideo: {},
      vCount: 0,
      videos: [],

      value: '0',
      daiToken: {},
      daiTokenBal: '0',
      dappToken: {},
      dappTokenBal: '0',
      tokenFarm: {}, 
      tokenFarmBal: '0'
    }
  }

  stackAmount = async (amount) => {
     this.setState({loading: true});
     this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({from: this.state.acc}).on('transactionHash', (hash) => {
       this.state.tokenFarm.methods.StackingToken(amount).send({from: this.state.acc}).on('transactionHash', (hash) => {
        this.setState({ loading: false });
      })
    })
    let tokenFarmBal = await this.state.tokenFarm.methods.stackAmount(this.state.acc).call();
    
    console.log("TokenFarm Balance After Stacking: ", tokenFarmBal.toString());
  }

  unstackAmount = () => {
    this.setState({loading: true});
    this.state.tokenFarm.methods.UnStackingToken().send({from: this.state.acc}).on('transactionHash', (hash) => {
      this.setState({loading: false});
    })
  }

  captureFile = event => {
    event.preventDefault();

    console.log("window: ",  window)
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer: ', this.state.buffer)
    }
  }


  submitToIPFS = title => {

  }

  render() {
    
    return (
      <div className="container">


      <h1>IPFS File Submission...</h1>

        <form onSubmit={(event)=>{
          //this.submitToIPFS(this.input);
        }}>
          <input 
            type="file"
            accept=".mp4, .mkv .ogg .wmv"
            onChange={this.captureFile}
            style={{width: '250px'}}
            />
          
          <input 
            id="videoTitle"
            type="text" 
            className="form-control-sm"
            placeholder="Title"
            required
            />
          <button type="submit" className="btn btn-success">Submit To IPFS</button>
        </form>






        <h1>Liquidity Pool!!!</h1>
        <p>{this.state.acc}</p>

        <form onSubmit={(event) => {
          event.preventDefault()
          let amount = this.input.value.toString()
          amount = window.web3.utils.toWei(amount, 'Ether')
          this.stackAmount(amount)
        }}>
           <p>Dai:       {window.web3.utils.fromWei(this.state.daiTokenBal, 'Ether')}</p>
           <p>Dapp:      {window.web3.utils.fromWei(this.state.dappTokenBal, 'Ether')}</p>
           <p>TokenFarm: {window.web3.utils.fromWei(this.state.tokenFarmBal, 'Ether')}</p>
          
           <input
	     						type="text"
	     						ref={(input) => { this.input = input }}
	     						className="form-control form-control-lg"
	     						placeholder="0"
	     						required />
          
          <button type="submit">Stake!</button>
        </form>
        <button
	     				type="submit"
	     				className="btn btn-link btn-block btn-sm"
	     				onClick={(event) => {
	     					event.preventDefault()
	     					this.unstackAmount()
	     				}}>
	     					UN-STAKE...
	     			</button>
      </div>
    );
  }
}

export default App;
