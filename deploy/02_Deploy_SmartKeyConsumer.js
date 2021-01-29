module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts()
    
    //Here are all the values required to create the contract. 
    //LINK Token address set to Kovan address. Can get other values at https://docs.chain.link/docs/link-token-contracts
    const LINK_TOKEN_ADDR="0xa36085F69e2889c224210F603D836748e7dC0088";
    const DEVICE_ADDRESS="3MrA71hEHJTS51vJFZGTSevQR1XC9eV6Xup";
    const DEVICE_LOCATION="Adelaide";
    const DEVICE_THRESHOLD=0;


    console.log("----------------------------------------------------")
    console.log('Deploying SmartKeyConsumer');
      const smartKeyConsumer = await deploy('SmartKeyConsumer', {
      from: deployer,
      gasLimit: 4000000,
      args: [LINK_TOKEN_ADDR,DEVICE_LOCATION,DEVICE_ADDRESS,DEVICE_THRESHOLD]
    });

    console.log("SmartKeyConsumer deployed to: ", smartKeyConsumer.address)
    console.log("Run the following command to fund contract with LINK:")
    console.log("npx hardhat fund-link --contract ",smartKeyConsumer.address);
    console.log("Then run SmartKeyConsumer contract with following command:")
    console.log("npx hardhat check-weather --contract ",smartKeyConsumer.address)

  };