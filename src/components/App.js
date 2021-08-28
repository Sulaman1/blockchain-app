import React, {Component} from 'react';
import Web3 from 'web3';
import DaiToken from '../abis/DaiToken.json';
import DappToken from '../abis/DappToken.json';
import TokenFarm from '../abis/TokenFarm.json';
import BVideo from '../abis/BVideo.json';
import dai from '../dai.png'
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
    
debugger;
    if(bVideoData){
      const bVideo = new web3.eth.Contract(BVideo.abi, bVideoData.address);
      this.setState({ bVideo });

      let vCount = await bVideo.methods.vCount().call();
      this.setState({ vCount });

      for(var i=vCount; i>=1; i--){
        let video = await bVideo.methods.videos(i-1).call();
        this.setState({ videos: [...this.state.videos, video]})
      }

      console.log("vCOUNT: ", this.state.vCount);
      console.log("VIDEOS: ", this.state.videos);      


      let latest = await bVideo.methods.videos((vCount)).call();

      console.log("LATEST: ", latest);
      let latestHash = latest.videoHash;
      let latestTitle = latest.title;
      this.setState({
        latestHash,
        latestTitle
      })
      console.log("LATEST HASH: ", this.state.latestHash);
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
      
      console.log("User Account: ", this.state.acc);

      this.setState({ daiToken: daiToken});

      let daiTokenBal = await daiToken.methods.balanceOf(this.state.acc).call();
      this.setState({daiTokenBal: daiTokenBal.toString()});
      console.log("Acc Dai Balance: ", daiTokenBal.toString());

      let tokA = await tokenFarm._address;
      console.log("token Address: ", tokA);
      let tokenBal = await daiToken.methods.balanceOf(tokA).call();
      console.log("Token Contract DAI balance: ", tokenBal);
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
      window.alert('Non-Ethereum browser detected Or change to ganache Network. You should trying MetaMask!')
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
      latestHash: '',
      latestTitle: '',
      currentHash: '',
      currentTitle: '',

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

    console.log("WINDOW: ",  window)
    console.log("EVENT.TARGET: ", event.target);
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer: ', this.state.buffer)
    }
  }
//QmRXiiSNYfJbW7Pw3Uw53hnEsqQRJvwN47wmm7gyNsab4o
//"QmcRc3N1JqDKHWgBv1eLfQRcNAEM5HRLZLs92CbGKzP9sH"

  submitToIPFS = title => {
    console.log("Submitting to IPFS: ", title)
debugger;
    this.setState({ loading: true})
    ipfs.add(this.state.buffer, (error, result) => {
      console.log("Result: ", result);
      if(error){
        console.error(error);
        return;
      }
      this.state.bVideo.methods.videoUpload(result[0].hash, title).send({ from: this.state.acc }).on("transactionHash", (hash) => {
        this.setState({ loading: false }) 
      })
    })
  }

  changeVideo = (hash, title)=> {
    debugger;
    let currentHash = hash;
    let currentTitle = title;
    
    this.setState({ latestHash: hash })
    this.setState({ latestTitle: title })
    // this.setState({ currentHash });
    // this.setState({ currentTitle });
    // console.log(this.state.currentHash)
     console.log(this.state.currentTitle)
  }

  render() {
    
    return (
      <div className="container">

      <div className="container-fluid text-monospace">
      <br/><br/>
      &nbsp;
      <br/><br/>
        <div className="row">
          <div className="col-md-10">
            <div className="embed-responsive embed-responsive-16by9" style={{ maxHeight: '768px', minHeight: '768px' }}>
              <p>{this.state.latestHash}</p>
            
              <video
                src={'https://ipfs.infura.io/ipfs/'+this.state.latestHash}
                style={{width: '850px'}}
                
                controls

              >
              </video>
              <h3><b><i>{this.state.latestTitle}</i></b></h3>
            </div>
          
          </div>
          <div className="col-md-2">

          <h3><i>IPFS File Submission...</i></h3>
            <form onSubmit={(event)=>{
              event.preventDefault();
              const title = this.videoTitle.value;
              this.submitToIPFS(title);
            }}>
              <input 
                type="file"
                accept=".mp4, .mkv .ogg .wmv"
                onChange={this.captureFile}
                className="btn btn-success"
                style={{width: '250px', margin: '0px 0px 10px 0px', backgroundColor: '#753a88'}}
                />
              
              <input 
                id="videoTitle"
                type="text" 
                className="form-control-sm"
                ref={(input) => { this.videoTitle = input}}
                placeholder="Title"
                required
                />
              <button style={{margin: '10px 10px 10px 0px', backgroundColor: '#753a88'}} type="submit" className="btn btn-success">Submit To IPFS</button>
            </form> 
            <div style={{ overflow:'scroll', height:'600px', width: '200px'}}>
            {this.state.videos.map((video, key)=>{
              return(
                <div className="card mb-4 text-center bg-secondory mx-auto" style={{ width: '175px'}}>
                  <div className="card-title bg-dark">
                    <small className="text-white"><a>{video.title}</a></small>
                  </div>
                  <div>
                
                    <p onClick={()=> this.changeVideo(video.videoHash, video.title)}>
                      <video
                       src={'https://ipfs.infura.io/ipfs/'+video.videoHash}
                       
                       style={{width: '150px'}}
                      />
                    </p>
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        </div>

      </div>

<br/>
<hr/>
<br/>
<h1 ><i><b>Liquidity Pool</b></i></h1>
<br/>
<hr/>
<br/>

<div id="content" className="mt-3">
	     	<table style={{ color: 'white'}} className="table table-borderless text-center">
	     		<thead>
	     			<tr>
	     				<th scope="col">Stacking Balance</th>
	     				<th scope="col">Reward Balance</th>
	     			</tr>
	     		</thead>
	     		<tbody>
	     			<tr>
            	<td>{window.web3.utils.fromWei(this.state.daiTokenBal, 'Ether')} Dai</td>
	     				<td>{window.web3.utils.fromWei(this.state.dappTokenBal, 'Ether')} DAPP</td>
	     			</tr>
	     		</tbody>
	     	</table>

	     	<div className="card mb-4">
	     		<div className="card-body">
	     			<form className="mb-3" onSubmit={(event) => {
	     				event.preventDefault()
	     				let amount
	     				amount = this.input.value.toString()
	     				amount = window.web3.utils.toWei(amount, 'Ether')
	     				this.props.stakeTokens(amount)
	     			}}>


	     				<div>
	     					<label className="float-left"><b>Stake Tokens</b></label>
	     					<span className="float-right" >
	     						Balance: {window.web3.utils.fromWei(this.state.daiTokenBal, 'Ether')}
	     					</span>
	     				</div>
	     				<div className="input-group mb-4">
	     					<input
	     						type="text"
	     						ref={(input) => { this.input = input }}
	     						className="form-control form-control-lg"
	     						placeholder="0"
	     						required />
	     					<div className="input-group-append">
	     						<div className="input-group-text">
	     							<img src={dai} height='32' alt=""/>
	     							&nbsp;&nbsp;&nbsp; DAI
	     						</div>
	     					</div>
	     				</div>
	     				<button type="submit" className="btn btn-primary btn-block btn-lg">STAKE!</button>
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
	     	</div>
	     </div>
      </div>
    );
  }
}

export default App;
