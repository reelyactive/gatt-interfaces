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
const UI_CHARACTERISTICS = {
    "1c930010-d459-11e7-9296-b8e856369374": {
      input: document.querySelector('#serialnumber'),
      valueType: "Uint32LE"
    },
    "1c930022-d459-11e7-9296-b8e856369374": {
      input: document.querySelector('#gainselection'),
      valueType: "Uint8"
    },
    "1c930023-d459-11e7-9296-b8e856369374": {
      input: document.querySelector('#samplerateselection'),
      valueType: "Uint8"
    },
    "1c930024-d459-11e7-9296-b8e856369374": {
      input: document.querySelector('#tracelengthselection'),
      valueType: "Uint8"
    },
    "1c930031-d459-11e7-9296-b8e856369374": {
      input: document.querySelector('#modeselection'),
      valueType: "Uint8"
    },
    "1c930032-d459-11e7-9296-b8e856369374": {
      input: document.querySelector('#temperature'),
      valueType: "Int16LE"
    },
    //"1c930033-d459-11e7-9296-b8e856369374": {
    //  input: document.querySelector('#time'),
    //  valueType: "Bytes"
    //},
    "1c930036-d459-11e7-9296-b8e856369374": {
      input: document.querySelector('#wakeupinterval'),
      valueType: "Uint16LE"
    },
    "1c930038-d459-11e7-9296-b8e856369374": {
      input: document.querySelector('#battery'),
      valueType: "Uint16LE"
    },
    "1c93003a-d459-11e7-9296-b8e856369374": {
      input: document.querySelector('#holdoffinterval'),
      valueType: "Uint16LE"
    }
};


// Variable definitions
let bluvib;


// Display the Web BLE card if the browser supports the experimental feature
webble.isAvailable((isAvailable) => {
  webblecard.removeAttribute('hidden');
});

// Handle button clicks
webbleconnect.addEventListener('click', handleConnectButton);
webbledisconnect.addEventListener('click', handleDisconnectButton);

// Handle webble events
webble.on('connect', (device) => {
  bluvib = device;
  webbleconnect.disabled = true;
  webbledisconnect.disabled = false;
});
webble.on('disconnect', () => {
  bluvib = null;
  webbleconnect.disabled = false;
  webbledisconnect.disabled = true;
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
    let uiCharacteristic = UI_CHARACTERISTICS[uuid];
    if(uiCharacteristic) {
      webble.readCharacteristic(uuid, (error, value) => {
        if(!error && value) {
          uiCharacteristic.input.value = interpretValue(value,
                                                    uiCharacteristic.valueType);
        }
      });
    }
  });
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