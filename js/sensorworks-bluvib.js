/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


// Constant definitions
const REQUEST_OPTIONS = {
    filters: [ { namePrefix: "BluVib" } ],
    optionalServices: [ '1c930001-d459-11e7-9296-b8e856369374',
                        '1c930002-d459-11e7-9296-b8e856369374',
                        '1c930003-d459-11e7-9296-b8e856369374',
                        '1c930004-d459-11e7-9296-b8e856369374' ]
};
const UI_CHARACTERISTICS = new Map([
  [ "1c930010-d459-11e7-9296-b8e856369374", { // Serial number
    element: document.querySelector('#serialnumber'),
    valueType: "Uint32LE",
    readButton: document.querySelector('#serialnumberread')
  }],
  [ "1c930022-d459-11e7-9296-b8e856369374", { // Gain
    element: document.querySelector('#gainselection'),
    valueType: "Uint8",
    readButton: document.querySelector('#gainread'),
    writeButton: document.querySelector('#gainwrite')
  }],
  [ "1c930023-d459-11e7-9296-b8e856369374", { // Sample rate
    element: document.querySelector('#samplerateselection'),
    valueType: "Uint8",
    readButton: document.querySelector('#samplerateread'),
    writeButton: document.querySelector('#sampleratewrite')
  }],
  [ "1c930024-d459-11e7-9296-b8e856369374", { // Trace length
    element: document.querySelector('#tracelengthselection'),
    valueType: "Uint8",
    readButton: document.querySelector('#tracelengthread'),
    writeButton: document.querySelector('#tracelengthwrite')
  }],
  [ "1c930031-d459-11e7-9296-b8e856369374", { // Release
    writeButton: document.querySelector('#releasewrite')
  }],
  [ "1c930031-d459-11e7-9296-b8e856369374", { // Mode
    element: document.querySelector('#modeselection'),
    valueType: "Uint8",
    readButton: document.querySelector('#moderead'),
    writeButton: document.querySelector('#modewrite')
  }],
  [ "1c930032-d459-11e7-9296-b8e856369374", { // Temperature
    element: document.querySelector('#temperature'),
    valueType: "Int16LE",
    readButton: document.querySelector('#temperatureread')
  }],
  [ "1c930036-d459-11e7-9296-b8e856369374", { // Wakeup interval
    element: document.querySelector('#wakeupinterval'),
    valueType: "Uint16LE",
    readButton: document.querySelector('#wakeupintervalread'),
    writeButton: document.querySelector('#wakeupintervalwrite')
  }],
  [ "1c930038-d459-11e7-9296-b8e856369374", { // Battery
    element: document.querySelector('#battery'),
    valueType: "Uint16LE",
    readButton: document.querySelector('#batteryread')
  }],
  [ "1c93003a-d459-11e7-9296-b8e856369374", { // Holdoff interval
    element: document.querySelector('#holdoffinterval'),
    valueType: "Uint16LE",
    readButton: document.querySelector('#holdoffintervalread'),
    writeButton: document.querySelector('#holdoffintervalwrite')
  }]
]);


// Variable definitions
let bluvib;


// Display the Web BLE card if the browser supports the experimental feature
webble.isAvailable((isAvailable) => {
  webblecard.removeAttribute('hidden');
});

// Handle button clicks
webbleconnect.addEventListener('click', handleConnectButton);
webbledisconnect.addEventListener('click', handleDisconnectButton);
UI_CHARACTERISTICS.forEach((characteristic, uuid) => {
  if(characteristic.readButton) {
    characteristic.readButton.addEventListener('click', () => {
      readDeviceCharacteristic(uuid);
    });
  }
});

// Handle webble events
webble.on('connect', (device) => {
  bluvib = device;
  webbleconnect.disabled = true;
  webbledisconnect.disabled = false;
  enableCharacteristicButtons(true);
});
webble.on('disconnect', () => {
  bluvib = null;
  webbleconnect.disabled = false;
  webbledisconnect.disabled = true;
  enableCharacteristicButtons(false);
});


// Handle a connect button click
function handleConnectButton() {
  clearWebbleError();

  webble.requestDeviceAndConnect(REQUEST_OPTIONS, (error) => {
    if(error) { return handleWebbleError(error); }

    webble.discoverServicesAndCharacteristics((error) => {
      if(error) { return handleWebbleError(error); }

      readAndDisplayDeviceCharacteristics();
    });
  });
}

// Handle a disconnect button click
function handleDisconnectButton() {
  webble.disconnect();
}

// Read and display all device characteristics presented in the web interface
function readAndDisplayDeviceCharacteristics() {
  bluvib.characteristics.forEach((characteristic, uuid) => {
    readDeviceCharacteristic(uuid);
  });
}

// Read the given characteristic
function readDeviceCharacteristic(uuid) {
  if(UI_CHARACTERISTICS.has(uuid)) {
    webble.readCharacteristic(uuid, (error, value) => {
      if(error) { handleWebbleError(error); }
      else if(value) {
        let ui = UI_CHARACTERISTICS.get(uuid);
        ui.element.value = interpretValue(value, ui.valueType);
      }
    });
  }
}

// Interpet the given value as the given type
function interpretValue(value, valueType) {
  if(!ArrayBuffer.isView(value) || !valueType) { return null; }

  switch(valueType) {
    case 'Uint8': return value.getUint8();
    case 'Int16LE': return value.getInt16(0, true);
    case 'Uint16LE': return value.getUint16(0, true);
    case 'Uint32LE': return value.getUint32(0, true);
    default: return null;
  }
}

// Change the state of the characteristic buttons
function enableCharacteristicButtons(isEnabled) {
  UI_CHARACTERISTICS.forEach((characteristic, uuid) => {
    if(characteristic.readButton) {
      characteristic.readButton.disabled = !isEnabled;
    }
    if(characteristic.writeButton) {
      characteristic.writeButton.disabled = !isEnabled;
    }
  });
}

// Clear a webble error
function clearWebbleError() {
  webblealert.textContent = '';
  webblealert.hidden = true;
}

// Handle a webble error
function handleWebbleError(error) {
  webblealert.textContent = error;
  webblealert.hidden = false;
}