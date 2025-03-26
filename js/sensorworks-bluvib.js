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


// Variable definitions
let bluvib;


// Display the Web BLE card if the browser supports the experimental feature
webble.isAvailable((isAvailable) => {
  webbleCard.removeAttribute('hidden');
});

// Handle button clicks
webbleConnectButton.addEventListener('click', handleConnectButton);

// Handle webble events
webble.on('connect', (device) => { bluvib = device; });
webble.on('disconnect', () => { bluvib = null; });


// Handle a connect button click
function handleConnectButton() {
  clearWebbleError();

  webble.requestDeviceAndConnect(REQUEST_OPTIONS, (error) => {
    if(error) { return handleWebbleError(error); }

    webble.readAllServicesAndCharacteristics((error) => {
      if(error) { return handleWebbleError(error); }

      // TODO: populate characteristic values
    });
  });
}

// Clear a webble error
function clearWebbleError() {
  webbleAlert.textContent = '';
  webbleAlert.hidden = true;
}

// Handle a webble error
function handleWebbleError(error) {
  webbleAlert.textContent = error;
  webbleAlert.hidden = false;
}