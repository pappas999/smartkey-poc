# SmartKey/Chainlink Proof Of Concept

This is a Proof of Concept to demonstrate how [SmartKey](http://smartkeyplatform.com/) and [Chainlink](http://chain.link) can be used in conjunction with a smart contract. In this example, a smart contract uses Chainlink oracles to obtain external weather data, and based on the result of wind speed at a given location, it can then trigger a SmartKey device such as opening or closing parking lot gates, lock doors within real estate, bring down metal protection over windows or unlock vehicles.

## Requirements

- NPM
- A Chainlink node and somewhere to host the external adapter is optional. If you leave the code as it is, it will use one currently running on Google Cloud Platform.

## Installation

Set your `KOVAN_RPC_URL` [environment variable.](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html). You can get one for free at [Infura's site.](https://infura.io/). You'll also need to set the variable `PRIVATE_KEY` which is your private key from you wallet, ie metamask. 


```
export KOVAN_RPC_URL='www.infura.io/asdfadsfafdadf'
export PRIVATE_KEY='abcdef'
```

Then you can install all the dependencies. This project uses the [Hardhat](http://hardhat.org) development environment

```bash
npm install
```

Or

```bash
yarn install
```

## Deploy

Deployment script is located in the [deploy](https://github.com/pappas999/smartkey-poc/tree/main/deploy) directory. If required, edit the desired constructor parameters here, because they are sent to the smart contract when it's instantiated. 

| Parameter       | Description                               | Default Value                                                   |
| ----------------|:------------------------------------------| :---------------------------------------------------------------|
| DEVICE_ADDRESS  | The address of the Smart Device           | 3MrA71hEHJTS51vJFZGTSevQR1XC9eV6Xup                             |
| DEVICE_LOCATION | Where the Smart Device is located         | Adelaide                                                        |
| DEVICE_THRESHOLD| Wind Kmph threshold to trigger the device |                                                                 |


Once this is done, you can run the hardhat deployment plugin as follows. If no network is specified, it will default to the Kovan network.

```bash
npx hardhat deploy 
```

## Run

The deployment output will give you the contract address once it's deployed. You can then use thes contract addresses in conjunction with Hardhat tasks to perform operations on the contract

The SmartKeYConsumer contract has three tasks, one to request external weather data, one to see the result of checking the current wewather, and one to check to see what the status of the device is. The flow of events is:
- Check windspeed at the given location
- If the windspeed goes above the threshold, a call to modify the device state is made
- If the windspeed goes from above to below the threshold, another call is made to modify the state of the device

This contract needs to be funded with link first:

```bash
npx hardhat fund-link --contract insert-contract-address-here
```

Once it's funded, you can request external weather data as follows:

```bash
npx hardhat check-weather --contract insert-contract-address-here 
```

Once you have successfully made a request for weather data, you can see the result via the read-weather task
```bash
npx hardhat read-weather --contract insert-contract-address-here
```

Finally, to see the status of the smart device, you can use the check-device task. It will return either 'Open' or 'Closed'

```bash
npx hardhat check-device --contract insert-contract-address-here
```
