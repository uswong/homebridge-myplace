const sinon = require('sinon');
const assert = require( "chai" ).assert;


describe('Test homebridge-ui/server.js', () =>
{
   let config_g = {};
   var UiServer;
   var server;
   var retVal_g;
   // node_modules is platform dependant. We need to figure this out
   // in order for testing to work on all platforms
   let node_modules_g = "";
   let MYPLACE_SH = "MyPlace.sh";

   before(() =>
   {
      // This proc fakes UIServer to think it is in a child process
      // Otherwise it will not run.
      process.send = function( msg ) { let lintMsg=msg; msg=lintMsg };

      // The server uses the 'connected' variable to determine if it is to stay alive
      // after a while, otherwise it will terminate.
      process.connected = true;

      // Require a new server
      UiServer = require("../homebridge-ui/server");
      console.log( "Creating 1 server for speed up" );
      server = new UiServer();

      delete process['send' ];

      MYPLACE_SH = server.MYPLACE_SH;

      // Create a stub so that advError sets our global error message variable.
      //sinon.stub( server, "advError").callsFake( function( retVal ){ retVal_g = retVal });

      // Create a stub so  that updateConfiguration returns our config.json look alike
      //sinon.stub( server, "updateConfigFirstTime").callsFake( function( firstTime ){ server.config = config_g });

      // Create a function of the UiServer to exit when called.
      server.disconnect = function( ) {
         setTimeout( () =>
         {
            process.exit( 0 );
         }, 1500);
      }

      node_modules_g = server.getGlobalNodeModulesPathForFile( MYPLACE_SH );
      node_modules_g = node_modules_g.replace("/homebridge-myplace/MyPlace.sh", "");
      console.log(`Global node_modules path: ${node_modules_g}`)
      if ( node_modules_g == null )
      {
         console.log( "ERROR: cannot determine node_modules for testing" );
         process.exit( 1 );
      }

   }); // before

   beforeEach(() =>
   {
      // Reset the global config to a known value
      config_g =
      {  "bridge":
         {
            "name": "Homebridge 1938",
            "username": "0E:DA:6A:09:19:38",
            "port": 51431,
            "pin": "444-44-444"
         },
         "platforms": [{
            "platform": "MyPlace",
            "name": "MyPlace",
            "statusMsg": true,
            "timeout": 60000,
            "queueTypes": [
                { "queue": "7", "queueType": "WoRm2" }
            ],
            "constants": [
                { "key": "${IP}", "value": "192.168.2.65" },
                { "key": "${PORT}", "value": "8091" }
            ],
            "accessories": [
            {
              "type": "Fan",
               "displayName": "Theatre_Room",
               "active": true,
               "rotationSpeed": 80,
               "name": "Theatre_Room",
               "manufacturer": "Advantage Air Australia",
               "model": "e-zone",
               "serialNumber": "Fujitsu e-zone2",
               "queue": "7",
               "polling":
               [
                   { "characteristic": "active" },
                   { "characteristic": "rotationSpeed" }
               ],
               "state_cmd": `bash ${ node_modules_g }/homebridge-myplace/MyPlace.sh`,
               "state_cmd_suffix": "z02 ${IP}"
            }]
         }]
      };

      // Put it back in case it gets changed
      server.MYPLACE_SH = MYPLACE_SH;

      // Set the global return value to something
      retVal_g = { rc: true, message: "" };

      // Create a stub so that advError sets our global error message variable.
      sinon.stub( server, "advError").callsFake( function( retVal ){ retVal_g = retVal });

      // Create a stub so  that updateConfiguration returns our config.json look alike
      sinon.stub( server, "updateConfigFirstTime").callsFake( function( firstTime ){ server.config = config_g; let lintFirstTime=firstTime;firstTime=lintFirstTime });

      // Create a function of the UiServer to exit when called.
      server.disconnect = function( ) {
         setTimeout( () =>
         {
            process.exit( 0 );
         }, 1500);
      }

   }); // beforeEach

   afterEach(() => {
      // MaxListenersExceededWarning: Possible EventEmitter memory leak detected
      process.removeAllListeners();

      sinon.restore();
   });
   after(function () {
      // To stop the last server running in the background
      server.disconnect();
   });

   it('Test Check #5B. See if MyPlace is installed from node_modules', function ( done )
   {
      // Create a stub For the test to fail.
      sinon.stub( server, "getGlobalNodeModulesPathForFile").callsFake( function( fileToFind ){ if ( fileToFind == "/homebridge-myplace/index.js" ) return null; else return `${ node_modules_g }/${ fileToFind }`; });

      //server.debug = true;


      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, "MyPlace Plugin not installed", `MyPlace must be installed globally in node_modules` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #6. No MyPlace.sh FAILS', function ( done )
   {
      // Make the test fail in the way we would want.
      server.MYPLACE_SH = '/homebridge-myplace/XMyPlace.sh';

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, 'No MyPlace.sh script present. Looking for: <Your Global node_modules Path>/homebridge-myplace/XMyPlace.sh', `Must find MyPlace.sh installed globally in node_modules` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   // Works
   it('Test Check #6. MyPlace.sh Passes', function ( done )
   {
      // server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, "Passed", `All checks must pass` );
      assert.equal( retVal_g.rc, true, `Return code must be true` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #7 & 32. For No MyPlace Accessories will be detected', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].platform = "XMyPlace";
      config_g.platforms[0].name = "XMyPlace";

      //server.debug = true;

      server.MYPLACE_SH = '/homebridge-myplace/MyPlace.sh';

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, "No MyPlace Accessories found", `A MyPlace Platform must be defined` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #8A. Constants must be an Array.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].constants = "not an Array";

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Constants must be an array of { "key": "\${SomeKey}", "value": "some replacement string" }`, `Constants must be an Array` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #8B. Constants must have a key.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].constants = [ { "blast": "${IP}", "value": "172.16.100.2" } ];

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Constant definition at index: "0" has no "key":`, `Constants must have a "key":` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #8C. Constants must have a value.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].constants = [ { "key": "${IP}", "rep": "172.16.100.2" } ];

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Constant definition at index: "0" has no "value":`, `Constant must have a "value":` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #8D. Key must start with ${', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].constants = [ { "key": "{IP}", "value": "172.16.100.2" } ];

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Constant definition for: "{IP}" must start with "\${" for clarity.`, `Constant key must start with "\${":` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #8E. Key must end with }', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].constants = [ { "key": "${IP", "value": "172.16.100.2" } ];

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Constant definition for: "\${IP" must end with "}" for clarity.`, `Constant key must not end with "}":` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #9. Check for no Advantage Air Accessories', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].manufacturer = "NoName";
      config_g.platforms[0].accessories[0].state_cmd = "Not_MyPlace_state_cmd";

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `No Advantage Air Accessories found`, `MyPlace accessories must be defined` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #10. Check See if any Advantage Air accessory has a defined name', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].name = undefined;

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Accessory at index: 0 accessory.name is undefined`, `Accessories must have a .name` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #11. Check See if any Advantage Air accessory has a defined displayName', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].displayName = undefined;

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Accessory at index: 0 "Theatre_Room" has no displayName`, `Accessory must have a displayName` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #12. Duplicate Display Names', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[1] =
            {
              "type": "TemperatureSensor",
               "displayName": "Theatre_Room",
               "currentTemperature": 22.2,
               "statusFault": "NO_FAULT",
               "name": "Theatre_Room",
               "manufacturer": "Advantage Air Australia",
               "model": "e-zone",
               "serialNumber": "Fujitsu e-zone2",
               "queue": "7",
               "polling":
               [
                   { "characteristic": "currentTemperature" }
               ],
               "state_cmd": `bash ${ node_modules_g }/homebridge-myplace/MyPlace.sh`,
               "state_cmd_suffix": "z02 ${IP} TEST_ON"
            };

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Accessory: "Theatre_Room"'s displayName is defined twice`, `No duplicate displayName's allowed` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #13. The state_cmd must be defined for the Air accessory', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].state_cmd = undefined;

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `No state_cmd for: "Theatre_Room"`, `state_cmd defined must be defined` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #14. See if the state_cmd does not match the cmd4MyPlace.sh', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].state_cmd = "Not what its supposed to be";

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Invalid state_cmd for: "Theatre_Room". It should be:\n${ node_modules_g }/homebridge-myplace/MyPlace.sh`, `state_cmd defined must be defined properly` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #15. See if the state_cmd_suffix is defined for the Air accessory', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].state_cmd_suffix = undefined;

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `No state_cmd_suffix for: "Theatre_Room". It must at least contain an IP.`, `state_cmd_suffix defined must be defined` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #16. The state_cmd_suffix must have an IP for the Air accessory', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].state_cmd_suffix = "192.168.2.X";

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `state_cmd_suffix has no IP for: "Theatre_Room" state_cmd_suffix: 192.168.2.X`, `state_cmd_suffix has an IP` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #17A. A linkedTypes Fan accessory is required for a Switch or a Thermostat accessory for fan speed control', function ( done )   
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].type = "Thermostat";
      config_g.platforms[0].accessories[0].displayName = "Aircon";

      //server.debug = true;

      server.checkInstallationButtonPressed( );
      assert.include( retVal_g.message, `"Aircon" requires a linkedTypes 'Fan' accessory for fan speed control.`, `A linkedTypes Fan accessory is required for a Switch or a Thermostat accessory for fan speed control` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #17B. The state_cmd_suffix of a linkedTypes Fan accessory must have fanSpeed', function ( done )   
   {
      // Make the test pass  in the way we would want.
      config_g.platforms[0].accessories[0].type = "Thermostat";
      config_g.platforms[0].accessories[0].displayName = "Aircon";
      config_g.platforms[0].accessories[0].linkedTypes =
                                  [{ "type": "Fan",
                                     "displayName": "Aircon Fan",
                                     "name": "Aircon Fan",
                                     "state_cmd_suffix": "fanSpeed ${IP}"
                                  }];

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Passed`, `The state_cmd_suffix of a linkedTypes Fan accessory must have fanSpeed` );
      assert.equal( retVal_g.rc, true, `Return code must be true` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #17C. The state_cmd_suffix must have timer or Timer or ligID for a Lightbulb accessory', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].type = "Lightbulb";
      config_g.platforms[0].accessories[0].state_cmd_suffix = "${IP}";


      //server.debug = true;

      server.checkInstallationButtonPressed( );
      assert.include( retVal_g.message, `The state_cmd_suffix for "Theatre_Room" requires 'timer' or 'fanTimer' or 'coolTimer' or 'heatTimer' (without quotes) if being used as timers or requires ligID:<light ID> if being used as a MyPlace Light.`, `state_cmd_suffix for Lightbulb accessory must have timer or Timer or lighID`)
      assert.equal( retVal_g.rc, false, `Return code must be false` )

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #17D. The state_cmd_suffix must have thiID for an Garage or WindowCovering accessory', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].type = "GarageDoorOpener";
      config_g.platforms[0].accessories[0].displayName = "Ollie's Garage";
      config_g.platforms[0].accessories[0].state_cmd_suffix = "thiID:a77e105 ${IP}";


      //server.debug = true;

      server.checkInstallationButtonPressed( );
      assert.include( retVal_g.message, `Passed`, `state_cmd_suffix for Garage or WindowCovering must  have "thiIDx"` );
      assert.equal( retVal_g.rc, true, `Return code must be true` )

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #17E. The state_cmd_suffix must have a zone for zone accessories', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].displayName = "Theatre_Room Zone";
      config_g.platforms[0].accessories[0].name = "Theatre_Room Zone";
      config_g.platforms[0].accessories[0].state_cmd_suffix = "${IP}";


      //server.debug = true;

      server.checkInstallationButtonPressed( );
      assert.include( retVal_g.message, `The state_cmd_suffix has no zone for: "Theatre_Room Zone"`, `state_cmd_suffix For Zone accessories must have "z0x"` );
      assert.equal( retVal_g.rc, false, `Return code must be false` )

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #18. queueTypes array must pass.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].queueTypes = [
                { "queue": "7", "queueType": "WoRm2" },
                { "queue": "8", "queueType": "WoRm2" }
            ];


      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Passed`, `queueTypes is an Array must pass` );
      assert.equal( retVal_g.rc, true, `Return code must be true` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #19A. QueueTypes must be an array.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].queueTypes = 
                { "queue": "7", "queueType": "WoRm" };

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `queueTypes is not an Array` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #19B. Non WoRm2 QueueType should fail with correct message.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].queueTypes =
                [{ "queue": "7", "queueType": "WoRm" }];

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.equal( retVal_g.rc, false, `'For: "Theatre_Room" queue 7 queueType is not WoRm2. Please change to Worm2.` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #20. Duplicate queues must not exist.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].queueTypes = [
                { "queue": "7", "queueType": "WoRm2" },
                { "queue": "7", "queueType": "WoRm2" }
            ];


      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Duplicate queue found: 7`, `No duplicate queue types allowed` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #21. Duplicate queues must not exist.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].queue = undefined


      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `No queue defined for: "Theatre_Room"`, `Queue name must be defined` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #22. queue name must be an string.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].queue = 15


      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `queue for: "Theatre_Room" is not a string`, `Queue must be a string` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #23. queue must be defined in queueTypes.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].queue = "not 7";


      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `For: "Theatre_Room" No matching queue: "not 7" in queueTypes`, `Queue must be defined in queueTypes` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #24A. For MyPlace accessories polling must be defined.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].polling = undefined;


      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Polling for: "Theatre_Room" is not an Array or Boolean`, `Polling must not be undefined for MyPlace accessories` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #24B. For MyPlace accessories polling must be a Boolean with false (Fails).', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].polling = false;


      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Polling for: "Theatre_Room" is not an Array or Boolean`, `Polling with a boolean=false must fail for MyPlace accessories` );
      assert.equal( retVal_g.rc, false, `Return code must be false` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #24B. For MyPlace accessories polling must be a Boolean with true (Passes).', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].polling = true;


      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Passed`, `Polling must be a boolean=true for MyPlace accessories` );
      assert.equal( retVal_g.rc, true, `Return code must be true` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );

   it('Test Check #24B. For MyPlace accessories polling must be an Array.', function ( done )
   {
      // Make the test fail in the way we would want.
      config_g.platforms[0].accessories[0].polling = [ { characteristic: "On" } ];

      //server.debug = true;

      server.checkInstallationButtonPressed( );

      assert.include( retVal_g.message, `Passed`, `Polling must be an Array for MyPlace accessories` );
      assert.equal( retVal_g.rc, true, `Return code must be true` );

      // Finish our unit test
      done( );
   }).timeout( 10000 );
});
