# SmartKey Device External Adapter

This external adapter allows interaction with with [SmartKey devices](http://smartkeyplatform.com/) for testing purposes

See [SmartKey API](https://app.swaggerhub.com/apis/herman-sadik/v1.Chainlink/1.0.0#/devices/openDevice) for a description of the API requirements


## Prerequisites and installation

Here are the required environment variables for this external adapter:

## Environment variables

| Variable      | Required            | Description | Example |
|---------------|:-------------:|------------- |:---------:|
| `DEVICE_KEY`     | **Required**  | The key required for the SmartKey device to authenticate the request | `0x928aaf0596f35db7f10ba5726c72736db33f51b036fed54166d4a7dbc84cfcf5c9cdf628ea3011cd47769cbcb00fe8ebf40486dae06b03bbaf3f5deea70b4090` |

```
export DEVICE_KEY=0x928aaf0596f35db7f10ba5726c72736db33f51b036fed54166d4a7dbc84cfcf5c9cdf628ea3011cd47769cbcb00fe8ebf40486dae06b03bbaf3f5deea70b4090
```

See [Install Locally](#install-locally) for a quickstart

## Input Params

The structure for the JSON input is as follows. In this example jobSpec is 534ea675a9524e8e834585b00368b178. Status may be 0 (Open) or 1 (Closed)

```json
{ 
    "id": "534ea675a9524e8e834585b00368b178",
    "data": { 
    	"address": "3ECygw6y1oLswVMMMxixPsVzcdnDSykpLnX",
    	"status": 0
    }
}
```

## Live Demo	
https://australia-southeast1-elegant-cipher-309807.cloudfunctions.net/smartkey-external-adapter


## Install Locally

Install dependencies:

```bash
npm install
```


### Run

```bash
npm start
```

## Call the external adapter/API server locally

```bash
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 534ea675a9524e8e834585b00368b178, "data": { "address": "3ECygw6y1oLswVMMMxixPsVzcdnDSykpLnX", "status": 0} }'
```

## Serverless hosts

After [installing locally](#install-locally):

### Create the zip

```bash
zip -r smartkey-external-adapter.zip .
```

### Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 12.x for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `smartkey-external-adapter.zip` file
- Handler:
    - index.handler for REST API Gateways
    - index.handlerv2 for HTTP API Gateways
- Add all environment variables mentioned further above
- Save

#### To Set Up an API Gateway (HTTP API)

If using a HTTP API Gateway, Lambda's built-in Test will fail, but you will be able to externally call the function successfully.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose HTTP API
- Select the security for the API
- Click Add

#### To Set Up an API Gateway (REST API)

If using a REST API Gateway, you will need to disable the Lambda proxy integration for Lambda-based adapter to function.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose REST API
- Select the security for the API
- Click Add
- Click the API Gateway trigger
- Click the name of the trigger (this is a link, a new window opens)
- Click Integration Request
- Uncheck Use Lamba Proxy integration
- Click OK on the two dialogs
- Return to your function
- Remove the API Gateway and Save
- Click Add Trigger and use the same API Gateway
- Select the deployment stage and security
- Click Add

### Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `smartkey-external-adapter.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
- Click More, Add variable. Add all environment variables mentioned further above

  
  ## Support

Got questions or feedback? [harry@smartcontract.com](mailto:harry@smartcontract.com)

## License

MIT
