/** SmartKey-Chainlink POC **/
pragma solidity ^0.6.7;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//import "https://github.com/smartcontractkit/chainlink/blob/develop/evm-contracts/src/v0.6/ChainlinkClient.sol";
//import "https://github.com/smartcontractkit/chainlink/blob/develop/evm-contracts/src/v0.6/vendor/Ownable.sol";



/**
 * @title SmartKeyConsumer is a contract that obtains wind speed weather data, and updates
 * the state of smart devices based on the returned result
 * @dev This contract is designed to work on public networks such as Kovan or Mainnet
 */
contract SmartKeyConsumer is ChainlinkClient, Ownable {
  
  string constant WORLD_WEATHER_ONLINE_URL = "http://api.worldweatheronline.com/premium/v1/weather.ashx?";
  string constant WORLD_WEATHER_ONLINE_PATH = "data.current_condition.0.windspeedKmph";

  bytes32 constant CHECK_WEATHER_JOB_ID="4f84d171027f400bab24578ae6dfc5c4";
  address constant CHECK_WEATHER_ORACLE=0x24f1c861582F03DaceF9Edb616FA43868F00470D;
  uint    constant CHECK_WEATHER_PAYMENT= 0.1 * 10**18; // 0.1 LINK;

  bytes32 constant MODIFY_DEVICE_JOB_ID="aad98afcc3d342b78e7e60f550a90427";
  address constant MODIFY_DEVICE_ORACLE=0x24f1c861582F03DaceF9Edb616FA43868F00470D;
  uint    constant MODIFY_DEVICE_PAYMENT= 0.1 * 10**18; // 0.1 LINK;

  string location;
  uint constant WIND_THRESHOLD_KMPH = 0;
  uint windThreshold = 0;
  uint256 public currentWindspeedKmph;
  enum DeviceStatus {OPEN, CLOSED}
  string deviceAddress;
  DeviceStatus deviceCurrentStatus;

  /**
   * @notice Deploy the contract with a specified address for the LINK
   * and Oracle contract addresses
   * @dev Sets the storage for the specified addresses
   * @param _link The address of the LINK token contract
   */
  constructor(address _link, string memory _location, string memory _deviceAddress, uint _windThreshold) public {
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }
    location = _location;
    windThreshold = _windThreshold;
    deviceAddress = _deviceAddress;
    deviceCurrentStatus = DeviceStatus.OPEN;
  }

  /**
   * @notice Creates a request to check windspeed at the given location
   */
  function checkWeather(string memory _apiKey)
    public
    onlyOwner
    returns (bytes32 requestId)
  {
    string memory url = string(abi.encodePacked(WORLD_WEATHER_ONLINE_URL, "key=",_apiKey,"&q=",location,"&format=json&num_of_days=1"));
    Chainlink.Request memory req = buildChainlinkRequest(CHECK_WEATHER_JOB_ID, address(this), this.fulfillWeather.selector);
    req.add("url", url);
    req.add("path", WORLD_WEATHER_ONLINE_PATH);
    requestId = sendChainlinkRequestTo(CHECK_WEATHER_ORACLE, req, CHECK_WEATHER_PAYMENT);
  }

  /**
   * @notice The fulfill method from requests created by the checkWeather function
   * @dev The recordChainlinkFulfillment protects this function from being called
   * by anyone other than the oracle address that the request was sent to
   * @param _requestId The ID that was generated for the request
   * @param _data The answer provided by the oracle
   */
  function fulfillWeather(bytes32 _requestId, uint256 _data)
    public
    recordChainlinkFulfillment(_requestId)
  {
    currentWindspeedKmph = _data;

    //Now we need to check if we need to modify the device based on the windspeed
    if (currentWindspeedKmph > windThreshold && deviceCurrentStatus == DeviceStatus.OPEN) {
      //close the device
      modifyDevice(deviceAddress, DeviceStatus.CLOSED);
    } else if (currentWindspeedKmph < windThreshold && deviceCurrentStatus == DeviceStatus.CLOSED) {
      //open the device
      modifyDevice(deviceAddress, DeviceStatus.OPEN);
    }
  }

  /**
   * @notice Creates a request to modify the state of the device
   */
  function modifyDevice(string memory _deviceAddress, DeviceStatus _newStatus) 
    public returns (bytes32 modifyRequestId) {
    
    //build up a request to send to the required Chainlink node
    Chainlink.Request memory request = buildChainlinkRequest(MODIFY_DEVICE_JOB_ID, address(this), this.fulfillModifyDevice.selector);
    request.add("deviceAddress", _deviceAddress);
    request.addInt("status", int(_newStatus));
    modifyRequestId = sendChainlinkRequestTo(MODIFY_DEVICE_ORACLE, request, MODIFY_DEVICE_PAYMENT);
  }

  /**
   * @notice The fulfill method from requests created by the modifyDevice function
   * @dev The recordChainlinkFulfillment protects this function from being called
   * by anyone other than the oracle address that the request was sent to
   * @param _requestId The ID that was generated for the request
   * @param _data The answer provided by the oracle
   */
  function fulfillModifyDevice(bytes32 _requestId, uint256 _data)
    public
    recordChainlinkFulfillment(_requestId)
  {
    //validate data response
    if (_data == 0){ //response is device is now open
      deviceCurrentStatus = DeviceStatus.OPEN;
    } else {        //response is device is now closed
      deviceCurrentStatus = DeviceStatus.CLOSED;
    }
  }



  /**
   * @notice Returns the status of the Device
   * @dev Returns 'Open' or 'Closed' depending on device status
   */
  function getDeviceStatus() public view returns (string memory) {
    if (deviceCurrentStatus == DeviceStatus.OPEN) {
      return "Open";
    } else {
      return "Closed";
    }
  }

  /**
   * @notice Sets the wind threshold
   * @dev Returns 'Open' or 'Closed' depending on device status
   */
  function setWindThreshold(uint _newThreshold) external  {
    windThreshold = _newThreshold;
  }
  
  
  /**
   * @notice Returns the wind threshold
   * @dev Returns the wind threshold in kmph
   */
  function getWindThreshold() public view returns (uint) {
    return windThreshold;
  } 

 /**
   * @notice Returns the address of the LINK token
   * @dev This is the public implementation for chainlinkTokenAddress, which is
   * an internal method of the ChainlinkClient contract
   */
  function getChainlinkToken() public view returns (address) {
    return chainlinkTokenAddress();
  }


  /**
   * @notice Allows the owner to withdraw any LINK balance on the contract
   */
  function withdrawLink() public onlyOwner {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
  }

  /**
   * @notice Call this method if no response is received within 5 minutes
   * @param _requestId The ID that was generated for the request to cancel
   * @param _payment The payment specified for the request to cancel
   * @param _callbackFunctionId The bytes4 callback function ID specified for
   * the request to cancel
   * @param _expiration The expiration generated for the request to cancel
   */
  function cancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  )
    public
    onlyOwner
  {
    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }
}