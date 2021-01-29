//const { network } = require('hardhat');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle")
require ("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-web3");
require("hardhat-deploy");
//import 'hardhat-deploy';


task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async taskArgs => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);

    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
  });

module.exports = {};

task("fund-link", "Funds a contract with LINK")
  .addParam("contract", "The address of the contract that requires LINK")
  .setAction(async taskArgs => {
    const contractAddr = taskArgs.contract;
    const networkId = network.name
    console.log("Funding contract ",contractAddr," on network ", networkId);
    const LINK_TOKEN_ABI=[{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
    
    //set the LINK token contract address according to the environment
    switch(networkId) {
      case 'mainnet':
        linkContractAddr='0x514910771af9ca656af840dff83e8264ecf986ca'
        break;
      case 'kovan':
        linkContractAddr='0xa36085F69e2889c224210F603D836748e7dC0088'
        break;
      case 'rinkeby':
        linkContractAddr='0x01BE23585060835E02B77ef475b0Cc51aA1e0709'
        break;
      case 'goerli':
        linkContractAddr='0x326c977e6efc84e512bb9c30f76e30c160ed06fb'
          break;
      default: //default to kovan
        linkContractAddr='0xa36085F69e2889c224210F603D836748e7dC0088'
    }
    //Fund with 1 LINK token
    const amount = web3.utils.toHex(1e18)

    //Get signer information
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    //Create connection to LINK token contract and initiate the transfer
    const linkTokenContract =  new ethers.Contract(linkContractAddr, LINK_TOKEN_ABI, signer);
    var result = await linkTokenContract.transfer(contractAddr, amount).then(function(transaction) {
      console.log('Contract ', contractAddr, ' funded with 1 LINK. Transaction Hash: ', transaction.hash);
    });
  });

  task("check-weather", "Calls the checkWeather function to check the current windspeed at the location")
  .addParam("contract", "The address of the SmartKeyConsumer contract that you want to call")
  .setAction(async taskArgs => {

    const contractAddr = taskArgs.contract;
    const networkId = network.name
    console.log("Calling SmartKeyConsumer contract ",contractAddr," on network ", networkId);
    const SMART_KEY_CONSUMER_ABI=[{"inputs":[{"internalType":"address","name":"_link","type":"address"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"string","name":"_deviceAddress","type":"string"},{"internalType":"uint256","name":"_windThreshold","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_payment","type":"uint256"},{"internalType":"bytes4","name":"_callbackFunctionId","type":"bytes4"},{"internalType":"uint256","name":"_expiration","type":"uint256"}],"name":"cancelRequest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"checkWeather","outputs":[{"internalType":"bytes32","name":"requestId","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currentWindspeedKmph","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_data","type":"uint256"}],"name":"fulfillModifyDevice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_data","type":"uint256"}],"name":"fulfillWeather","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getChainlinkToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getDeviceStatus","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawLink","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    //Get signer information
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    //Create connection to API Consumer Contract and call the createRequestTo function
    const smartKeyConsumerContract =  new ethers.Contract(contractAddr, SMART_KEY_CONSUMER_ABI, signer);
    var result = await smartKeyConsumerContract.checkWeather().then(function(transaction) {
      console.log('Contract ', contractAddr, ' checkWeather successfully called. Transaction Hash: ', transaction.hash);
      console.log("Run the following to read the returned result:")
      console.log("npx hardhat read-weather --contract ",contractAddr);
  
    });
  });

  task("read-weather", "Calls a SmartKeyConsumer Contract to read weather data obtained")
  .addParam("contract", "The address of the SmartKeyConsumer contract that you want to call")
  .setAction(async taskArgs => {

    const contractAddr = taskArgs.contract;
    const networkId = network.name
    console.log("Reading weather data from SmartKeyConsumer contract ",contractAddr," on network ", networkId);
    const SMART_KEY_CONSUMER_ABI=[{"inputs":[{"internalType":"address","name":"_link","type":"address"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"string","name":"_deviceAddress","type":"string"},{"internalType":"uint256","name":"_windThreshold","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"addressToString","outputs":[{"internalType":"string","name":"_uintAsString","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_payment","type":"uint256"},{"internalType":"bytes4","name":"_callbackFunctionId","type":"bytes4"},{"internalType":"uint256","name":"_expiration","type":"uint256"}],"name":"cancelRequest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"checkWeather","outputs":[{"internalType":"bytes32","name":"requestId","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currentWindspeedKmph","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_data","type":"uint256"}],"name":"fulfillModifyDevice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_data","type":"uint256"}],"name":"fulfillWeather","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getChainlinkToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawLink","outputs":[],"stateMutability":"nonpayable","type":"function"}]

    //Get signer information
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    //Create connection to API Consumer Contract and call the createRequestTo function
    const smartKeyConsumerContract =  new ethers.Contract(contractAddr, SMART_KEY_CONSUMER_ABI, signer);
    var result = await smartKeyConsumerContract.currentWindspeedKmph().then(function(data) {
      console.log('Current Windspeed is: ',web3.utils.hexToNumber(data._hex))
    });
  });


  task("check-device", "Calls a SmartKeyConsumer Contract to check the state of a connected device")
  .addParam("contract", "The address of the SmartKeyConsumer contract that you want to call")
  .setAction(async taskArgs => {

    const contractAddr = taskArgs.contract;
    const networkId = network.name
    console.log("Checking Device State on SmartKeyConsumer contract ",contractAddr," on network ", networkId);
    const SMART_KEY_CONSUMER_ABI=[{"inputs":[{"internalType":"address","name":"_link","type":"address"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"string","name":"_deviceAddress","type":"string"},{"internalType":"uint256","name":"_windThreshold","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_payment","type":"uint256"},{"internalType":"bytes4","name":"_callbackFunctionId","type":"bytes4"},{"internalType":"uint256","name":"_expiration","type":"uint256"}],"name":"cancelRequest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"checkWeather","outputs":[{"internalType":"bytes32","name":"requestId","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currentWindspeedKmph","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_data","type":"uint256"}],"name":"fulfillModifyDevice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_data","type":"uint256"}],"name":"fulfillWeather","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getChainlinkToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getDeviceStatus","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawLink","outputs":[],"stateMutability":"nonpayable","type":"function"}]

    //Get signer information
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    //Create connection to API Consumer Contract and call the createRequestTo function
    const smartKeyConsumerContract =  new ethers.Contract(contractAddr, SMART_KEY_CONSUMER_ABI, signer);
    var result = await smartKeyConsumerContract.getDeviceStatus().then(function(data) {
      console.log('Current device status is: ',data)
    });
  });


module.exports = {
  defaultNetwork: "kovan",
  networks: {
    hardhat: {
      forking: {
        //this env var isn't mandatory for users who want to deploy on public networks
        url: process.env.ALCHEMY_MAINNET_RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
      }
    },
    kovan: {
      url: process.env.KOVAN_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true
    }
  },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0 // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        feeCollector:{
            default: 1
        }
    },
  solidity: "0.6.7",
};
