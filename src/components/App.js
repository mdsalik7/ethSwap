import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Navbar from './Navbar';
import Main from './Main';
import Token from '../abis/Token.json'
import ethSwap from '../abis/ethSwap.json'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    //console.log(accounts[0])
    this.setState({account : accounts[0]})
    //console.log(this.state.account)
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ethBalance}) //ES6 - {ethBalance : ethBalance}
    //console.log(this.state.ethBalance)

    /*
    const abi = Token.abi
    const networkId = await web3.eth.net.getId() //returns 5777 as we are connected to ganache
    //const address = Token.networks['5777'].address
    const address = Token.networks[networkId]
    const token = new web3.eth.Contract(abi, address)
    console.log(token)
    */

  //Load Token
   const networkId = await web3.eth.net.getId() //returns 5777 as we are connected to ganache
   const tokenData = Token.networks[networkId]
   if(tokenData){
    const token = new web3.eth.Contract(Token.abi, tokenData.address)
    //console.log(token)
    this.setState({token}) //{token : token}
    let tokenBalance = await token.methods.balanceOf(this.state.account).call()
    //console.log("Token Balance ", tokenBalance.toString())
    this.setState({tokenBalance : tokenBalance.toString()})
   } else {
    window.alert('Token Contract not deployed to detected network')
   }

    //Load ethSwap
    const ethSwapData = ethSwap.networks[networkId]
    if(ethSwapData){
     const ethswap = new web3.eth.Contract(ethSwap.abi, ethSwapData.address)
     //console.log(ethswap)
     this.setState({ethswap}) //{ethswap : ethswap}
    } else {
     window.alert('ethSwap Contract not deployed to detected network')
    }
    //after everything is finished above, setting the loading state to false so main component can render
    this.setState({loading : false})
 }


  async loadWeb3() {
    if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({loading : true})
    this.state.ethswap.methods.buyTokens()
    .send({from : this.state.account, value : etherAmount})
    .on('transactionHash', (hash) => {
      this.setState({loading : false})
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({loading : true})
    this.state.token.methods.approve(this.state.ethswap.address, tokenAmount)
    .send({from : this.state.account})
    .on('transactionHash', (hash) => {
      this.state.ethswap.methods.sellTokens(tokenAmount).send({from : this.state.account})
      .on('transactionHash', (hash) => {
      this.setState({loading : false})
      })
    })
  }



  constructor(props) {
    super(props)
    this.state = {
      account : '',
      token : {}, //empty object
      ethswap : {}, //empty object
      ethBalance : '0',
      tokenBalance : '0',
      loading : true
    }
  }


  render() {
    let content
    if(this.state.loading){
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
      ethBalance={this.state.ethBalance}
      tokenBalance={this.state.tokenBalance}
      buyTokens={this.buyTokens}
      sellTokens={this.sellTokens}/>
    }

    return (
      <div>
        <Navbar account = {this.state.account}/> 
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
