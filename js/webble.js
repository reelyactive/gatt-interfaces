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

  // Read all services and characteristics
  let readAllServicesAndCharacteristics = function(callback) {
    // TODO: first check device/isConnected?
    device.server.getPrimaryServices()
    .then((services) => {
      let queue = Promise.resolve();
      services.forEach((service) => {
        queue = queue.then(_ =>
                         service.getCharacteristics().then(characteristics => {
          device.services.set(service.uuid, service);
          characteristics.forEach((characteristic) => {
            device.characteristics.set(characteristic.uuid, characteristic);
            if(characteristic.properties.read === true) {
              characteristic.readValue()
              .then((value) => { characteristic.value = value; })
              .catch(error => {});
            }
          });
        }));
      });
      return callback(null);
    })
    .catch(error => { return callback(error); });
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
    isAvailable: isAvailable,
    on: setEventCallback,
    readAllServicesAndCharacteristics: readAllServicesAndCharacteristics,
    requestDeviceAndConnect: requestDeviceAndConnect
  }

}());