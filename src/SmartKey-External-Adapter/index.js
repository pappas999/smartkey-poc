const { Requester, Validator } = require('@chainlink/external-adapter')
const axios = require('axios')


const createRequest = async (input, callback) => {

	// Get input values
	const jobRunID = input.id
	const deviceAddress = input.data.address
	const newStatus = input.data.status
	console.log("Got a request");
	console.log("deviceAddress:",deviceAddress);
	console.log("newStatus",newStatus);

	//Now set values to use for request
	const DEVICE_KEY=process.env.DEVICE_KEY;
	const BASE_URL = `https://virtserver.swaggerhub.com/herman-sadik/v1.Chainlink/1.0.0/v1/devices/`;
	const DEVICE_OPEN_URL = BASE_URL + `${deviceAddress}/open`
	const DEVICE_CLOSE_URL = BASE_URL + `${deviceAddress}/close`


	//Set the headers
	let	authString = `${DEVICE_KEY}`
	const headers = {
		'accept': 'application/json',
		'Authorization': authString
	}
	console.log("Auth String:",authString);

	//Now do the request
	switch (newStatus) {
		case '0': // Opening Device
		try {
			// Now that we have the data, we can unlock the vehicle
			console.log("doing request to:",DEVICE_OPEN_URL);
			await axios.put(DEVICE_OPEN_URL, null, { headers: headers })
				.then(function (response) {
					callback(response.status,
						{
							jobRunID,
							data: "0",
							result: null,
							statusCode: response.status
						});
				});
		} catch (error) {
			callback(500, Requester.errored(jobRunID, error))
		}
		break;

		case '1': //Closing Device
		try {
			// Now that we have the data, we can unlock the vehicle
			console.log("doing request to:",DEVICE_CLOSE_URL);
			await axios.put(DEVICE_CLOSE_URL, null, { headers: headers })
				.then(function (response) {
					callback(response.status,
						{
							jobRunID,
							data: "1",
							result: null,
							statusCode: response.status
						});
				});
		} catch (error) {
			callback(500, Requester.errored(jobRunID, error))
		}
		break;	
		default:
			console.log('invalid parameter');
	}
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
	createRequest(req.body, (statusCode, data) => {
		res.status(statusCode).send(data)
	})
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
	createRequest(event, (statusCode, data) => {
		callback(null, data)
	})
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
	createRequest(JSON.parse(event.body), (statusCode, data) => {
		callback(null, {
			statusCode: statusCode,
			body: JSON.stringify(data),
			isBase64Encoded: false
		})
	})
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
