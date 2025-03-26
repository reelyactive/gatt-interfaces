/**
 * Copyright reelyActive 2017-2025
 * We believe in an open Internet of Things
 */

let webble = (function() {

  // Internal variables
  let device;
  let eventCallbacks = { connect: [], disconnect: [] };

  // Check if Web Bluetooth is available on this platform
  let isAvailable = function(callback) {
    navigator.bluetooth.getAvailability().then((isAvailable) => {
      return callback(isAvailable);
    });
  }

  // Request a device and connect
  let requestDeviceAndConnect = function(options, callback) {
    options = options || {};

    navigator.bluetooth.requestDevice(options)
    .then((requestedDevice) => {
      device = { services: new Map(), characteristics: new Map() };
      eventCallbacks['connect'].forEach(callback => callback(device));
      requestedDevice.addEventListener('gattserverdisconnected',
                                       handleDisconnect);
      return requestedDevice.gatt.connect();
    })
    .then((server) => {
      device.server = server;
      return callback(null);
    })
    .catch(error => { return callback(error); });
  }

  // Discover all services and characteristics
  let discoverServicesAndCharacteristics = function(callback) {
    if(!device?.server.connected) { return callback('Device not connected'); }

    device.server.getPrimaryServices()
    .then((services) => {
      let queue = Promise.resolve();
      services.forEach((service) => {
        queue = queue.then(_ =>
                         service.getCharacteristics().then(characteristics => {
          device.services.set(service.uuid, service);
          characteristics.forEach((characteristic) => {
            device.characteristics.set(characteristic.uuid, characteristic);
          });
        }));
      });
      return queue;
    })
    .then(() => { return callback(null); })
    .catch(error => { return callback(error); });
  }

  // Read the given characteristic
  let readCharacteristic = function(uuid, callback) {
    if(!device?.server.connected) { return callback('Device not connected'); }
    if(!device.characteristics.has(uuid)) {
      return callback('Cannot read unsupported characteristic', uuid);
    }

    let characteristic = device.characteristics.get(uuid);
    if(characteristic.properties.read !== true) { return callback(null, null); }

    characteristic.readValue()
    .then((value) => {
      characteristic.value = value;
      return callback(null, value);
    })
    .catch(error => { return callback(error); });    
  }

  // Write the given value to the given characteristic
  let writeCharacteristic = function(uuid, value, callback) {
    if(!device?.server.connected) { return callback('Device not connected'); }
    if(!device.characteristics.has(uuid)) {
      return callback('Cannot write unsupported characteristic', uuid);
    }

    let characteristic = device.characteristics.get(uuid);
    if(characteristic.properties.write !== true) {
      return callback('Characteristic does not support write', uuid);
    }

    characteristic.writeValueWithoutResponse(value)
    .then(() => { return callback(null); })
    .catch(error => { return callback(error); });
  }

  // Disconnect from the device
  let disconnect = function() {
    if(!device) { return; }
    if(device.server.connected) { device.server.disconnect(); }
  }

  // Handle device disconnection
  function handleDisconnect() {
    eventCallbacks['disconnect'].forEach(callback => callback());
  }

  // Register a callback for the given event
  let setEventCallback = function(event, callback) {
    let isValidEvent = event && eventCallbacks.hasOwnProperty(event);
    let isValidCallback = callback && (typeof callback === 'function');

    if(isValidEvent && isValidCallback) {
      eventCallbacks[event].push(callback);
    }
  }

  // Expose the following functions and variables
  return {
    disconnect: disconnect,
    discoverServicesAndCharacteristics: discoverServicesAndCharacteristics,
    isAvailable: isAvailable,
    on: setEventCallback,
    readCharacteristic: readCharacteristic,
    requestDeviceAndConnect: requestDeviceAndConnect,
    writeCharacteristic: writeCharacteristic
  }

}());