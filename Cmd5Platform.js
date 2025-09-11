'use strict';

// Cmd5 includes seperated out for Unit testing
const { getAccessoryName,
        getAccessoryDisplayName } = require( "./utils/getAccessoryNameFunctions" );
const { parseAddQueueTypes } = require( "./Cmd5PriorityPollingQueue" );

let Logger = require( "./utils/Logger" );
let getAccessoryUUID = require( "./utils/getAccessoryUUID" );
let lcFirst = require( "./utils/lcFirst" );
let isNumeric = require( "./utils/isNumeric" );
let trueTypeOf = require( "./utils/trueTypeOf" );

// Hierarchy variables
let HV = require( "./utils/HV" );

// Essential variables
const { spawnSync } = require('child_process');
let createAccessorysInformationService = require( "./utils/createAccessorysInformationService" );

// Pretty Colors
var chalk = require( "chalk" );

// These would already be initialized by index.js
let CMD5_CHAR_TYPE_ENUMS = require( "./lib/CMD5_CHAR_TYPE_ENUMS" ).CMD5_CHAR_TYPE_ENUMS;
let CMD5_DEVICE_TYPE_ENUM = require( "./lib/CMD5_DEVICE_TYPE_ENUM" ).CMD5_DEVICE_TYPE_ENUM;
let CMD5_ACC_TYPE_ENUM = require( "./lib/CMD5_ACC_TYPE_ENUM" ).CMD5_ACC_TYPE_ENUM;

let CMD5_FORMAT_TYPE_ENUM = CMD5_CHAR_TYPE_ENUMS.CMD5_FORMAT_TYPE_ENUM;
let CMD5_UNITS_TYPE_ENUM = CMD5_CHAR_TYPE_ENUMS.CMD5_UNIT_TYPE_ENUM;
let CMD5_PERMS_TYPE_ENUM = CMD5_CHAR_TYPE_ENUMS.CMD5_PERMS_TYPE_ENUM;

// The Cmd5 Classes
const Cmd5Accessory = require( "./Cmd5Accessory" ).Cmd5Accessory;

// Settings, Globals and Constants
let settings = require( "./cmd5Settings" );
const constants = require( "./cmd5Constants" );
const path = require('path');
const fs = require('fs');

// Platform definition
class Cmd5Platform
{
   constructor( log, config, api )
   {
      // Unit testing passes their own logger with debug enabled/disabled
      // replace with ours
      if ( typeof log.setOutputEnabled === "function" )
      {
         this.log = log;

         // Carry the debug flag from the platform
         settings.cmd5Dbg = log.debugEnabled;
      }
      else
      {
         // By using our own Logger, we don't trigger others
         this.log = new Logger( );

         if ( config[ constants.DEBUG ]  == true ||
              config[ "Debug" ]  == true ||
              process.env.DEBUG == settings.PLATFORM_NAME )
         {
            settings.cmd5Dbg = true;
         }
      }

      this.log.setDebugEnabled( settings.cmd5Dbg );

      if ( settings.cmd5Dbg ) this.log.debug( chalk.blue( `Class Cmd5Platform` ) );

      if ( config === undefined )
         return;

      this.config = config;
      this.api = api;
      this.Service = this.api.hap.Service;

      // Pass along the trigger when creating the Cmd5Accessory.
      // Note: The LEVEL starts at -1 as the first one gets incremented to Zero.
      //
      //       LEVEL 0 Accessories are Platform or Standalone Accessories.
      //       LEVEL 1 Accessories are linked accessories.
      //       LEVEL 2 Accessories are added Platform accessories coerced to
      //               level 2 as a distinction. i.e. TelevisionSpeaker.

      this.CMD5 = constants.PLATFORM;
      this.LEVEL = -1;
      this.toBeRestoredPlatforms = [ ];
      this.createdCmd5Accessories = [ ];
      this.createdCmd5Platforms = [ ];
      this.globalConstants = null;

      this.services = [ ];

      // These would be queues of Characteristics to be polled or get/set via IOS.
      settings.listOfCreatedPriorityQueues = { };

      // Track the polling timers only so that unit testing can cancel them.
      this.pollingTimers = [ ];

      // Create the hierarhy variables
      this.hV = new HV();

      // didFinishLaunching is only called after the
      // registerPlatform completes.
      api.on( "didFinishLaunching", ( ) =>
      {
         this.log.info( chalk.green( "MyPlace Platform didFinishLaunching" ) );

         // Remove MyPlace shell script temporary working directories on Homebridge RESTART
         this.log.info( chalk.yellow( "Removing temporary working directories" ) );
         try {
            const directoryPath = process.env.TMPDIR || "/tmp";
            const files = fs.readdirSync(directoryPath);
            const filteredFiles = files.filter(file => file.match(/^(AA|BB)-\d{3}$/));

            filteredFiles.forEach(file => {
               const sdir = `${directoryPath}/${file}`;

               try {
                  fs.rmSync(sdir, { recursive: true, force: true });
                  this.log.info(`Temporary working directory ${sdir} removed`);
               } catch (err) {
                  this.log.error(` Unable to remove temporary working directory ${sdir}: [${err}]`);
               }
            });
         } catch (err) {
            this.log.error(`Unable to scan and remove temporary working directory: [${err}]`);
         }

         // Run ConfigCreator to update/refresh the MyPlace config
         this.log.info( chalk.yellow( "Running createMyPlacConfig..." ) );
         try {
            // Build args for up to 3 devices
            let args = [];
            for (let i = 0; i < 3; i++) {
               const device = this.config.devices[i];
               if (device) {
                  const ipPort = `${device.ipAddress || ''}:${device.port || ''}`;
                  const name = device.name || '';
                  const extraTimers = device.extraTimers ?? false;
                  const debug = device.debug ?? false;
                  args.push(ipPort, name, extraTimers, debug);
               } else {
                  // If device is missing, push empty args
                  args.push('', '', '', '');
               }
            }

            // Add __dirname and "homebridge" as last two arguments
            args.push(`${__dirname}/MyPlace.sh`);

            // Run the createMyPlaceconfig.js script
            const scriptPath = path.resolve(__dirname, 'utils', 'createMyPlaceConfig.js');
            this.log.debug('Running script:', scriptPath, args);

            const result = spawnSync('node', [scriptPath, ...args], { encoding: 'utf8' });

            const status = result.stderr.trim();
            const jsonText = result.stdout.trim();

            if (status.includes('DONE')) {
               this.config = JSON.parse(jsonText);
               this.log.info(status);
               this.log.debug('Updated config:\n' + JSON.stringify(this.config));
            } else {
               this.log.error(status);
               this.log.warn('Proceeding with original config — no accessories will be created.');
            }
         } catch (err) {
            this.log.warn('ERROR: createMyPlaceConfig failed:', err);
            this.log.warn('Proceeding with original config — no accessories will be created.');
         }

         // Now process these using the updated config
         this.parseConfigForCmd5Directives( this.config );
         this.hV.update( this );
         this.processNewCharacteristicDefinitions( );

         this.log.info( chalk.yellow( "Scanning the config and the cache for devices to be removed or restored from cache" ) );
         // scan the platform devices to identify which ones to be restored from cache
         this.scanToBeRestoredDevices( this.log );

         // Any accessory NOT to be restored should be removed, find them
         this.toBeRestoredPlatforms.forEach( ( accessory ) =>
         {
            if ( ! accessory.toBeRestored )
               this.removeAccessory( accessory );
         });

         // Loop through config.json and restore existing accessory from cache or register new accessory
         // if it is not already in cache
         this.discoverDevices( this.log );

         // Let the Polling Begin
         this.startPolling();

      });
   }

   // As Per HomeBridge:
   // This function is invoked when homebridge restores cached accessories
   // from disk at startup.  It should be used to setup event handlers
   // for characteristics and update respective values.
   //
   // We do not handle restoring cached accessories ( Yet? ). Remove them
   // as we regenerate everything.
   configureAccessory( platformAccessory )
   {
      if ( platformAccessory )
      {
         if ( settings.cmd5Dbg ) this.log.debug( `Found cached accessory: ${ platformAccessory.displayName }` );
         this.toBeRestoredPlatforms.push( platformAccessory );
      }
   }

   removeAccessory( platformAccessory )
   {
      if ( ! platformAccessory )
         return;

      this.log.info( `Removing existing accessory from cache: ${ platformAccessory.displayName }` );

      this.api.unregisterPlatformAccessories(  settings.PLUGIN_NAME, settings.PLATFORM_NAME, [ platformAccessory ] );

   }

   // Only parse those CMD5 directives we care about
   parseConfigForCmd5Directives( config )
   {
      for ( let key in config )
      {
         let lcKey = lcFirst( key );
         if ( key == "UUID" )
         {
            lcKey = "uuid";
         } else
         {
            // warn now
            if ( key.charAt( 0 ) === key.charAt( 0 ).toUpperCase( ) )
            {
               this.log.warn( `The config.json Platform key: ${ key } is Capitalized.  All keys in the near future will ALWAYS start with a lower case character for homebridge-ui integration.\nTo remove this Warning, Please fix your config.json.` );
            }
         }

         let value = config[ key ];

         switch ( lcKey )
         {
            case constants.TIMEOUT:
               // Timers are in milliseconds. A low value can result in
               // failure to get/set values
               this.timeout = parseInt( value, 10 );
               if ( this.timeout < 500 )
                  this.log.warn( `Default Timeout is in milliseconds. A value of "${ this.timeout }" seems pretty low.` );

               break;
            case constants.INTERVAL:
               // Intervals are in seconds
               this.interval = parseInt( value, 10 ) * 1000;

               break;
            case constants.STATECHANGERESPONSETIME:
               // respnse time is in seconds
               this.stateChangeResponseTime = value * 1000;

               break;
            case constants.STATE_CMD_PREFIX:
               // Not 100% sure why this would be needed, but
               // added anyway since we have a suffix
               this.state_cmd_prefix = value;

               break;
            case constants.STATE_CMD_SUFFIX:
               // This gets added after any Get/Set <value>
               this.state_cmd_suffix = value;

               break;
            case constants.STATE_CMD:
               // What this plugin is all about
               this.state_cmd = value;

               break;
            case constants.OUTPUTCONSTANTS:
               this.outputConstants = value;

               break;
            case constants.STATUSMSG:
              if ( value === false )
                 this.statusMsg = "FALSE";

               break;
            case constants.QUEUETYPES:
               parseAddQueueTypes( this.log, value );

               break;
            case constants.DEFINITIONS:
               this.definitions = value;

               break;
            case constants.CONSTANTS:
               // Save the constants defined globally so the accessory
               // can parse it.
               this.globalConstants = value;

               break
            case constants.PLATFORM:
               // Noop

               break;
            case constants.ACCESSORIES:
               // Noop

               break;
            default:
               // This cannot be because all the Cmd5Accessory directives
               // for Standalone would have to be added.
               //this.log.error( chalk.red( `Error: Unknown Cmd5 Platform config option: "${ key }"` ) );
               //process.exit( 448 ) ;
         }
      }
   }
   // The purpose here is not to duplicate what is in homebridge. Just to
   // do a little checking to make sure that what is defined won't cause
   // Cmd5 to balk.  It is okay if homebridge does though ;-)
   processNewCharacteristicDefinitions( )
   {
      if ( this.definitions == undefined )
         return;

      if ( trueTypeOf( this.definitions ) != Array )
         throw new Error( `${ constants.DEFINITIONS } is not a array.` );

      this.definitions.forEach( ( definition, definitionIndex ) =>
      {
         if ( settings.cmd5Dbg ) this.log.debug( `Processing definition index: ${ definitionIndex }` );

         if ( trueTypeOf( definition.type ) != String )
            throw new Error( `definition.type at index: ${ definitionIndex } is not a String.` );

         if ( trueTypeOf( definition.description ) != String )
            throw new Error( `definition.description at index: ${ definitionIndex } is not a String.` );

         if ( trueTypeOf( definition.props ) != Object )
            throw new Error( `definition.props at index: ${ definitionIndex } is not an Object.` );

         if ( trueTypeOf( definition.props.format ) != String )
            throw new Error( `definition.props.format at index: ${ definitionIndex } is not a String.` );

         // Need to check if format is correct
         let formatIndex = CMD5_FORMAT_TYPE_ENUM.properties.Cmd5indexOfEnum( i => i.type === definition.props.format );
         if ( formatIndex < 0 )
            throw new Error( `definition.props.format at index: ${ definitionIndex } is not a valid format.` );


         if ( definition.props.units )
         {
            if ( trueTypeOf( definition.props.units ) != String )
               throw new Error( `definition.props.units at index: ${ definitionIndex } is not a String.` );

            // Need to check if units is correct
            let unitsIndex = CMD5_UNITS_TYPE_ENUM.properties.Cmd5indexOfEnum( i => i.type === definition.props.units );
            if ( unitsIndex < 0 )
               throw new Error( `definition.props.units at index: ${ definitionIndex } is not a valid unit.` );

         }

         if ( definition.props.maxValue &&
              isNumeric( definition.props.maxValue ) != true )
            throw new Error( `definition.props.maxValue at index: ${ definitionIndex } is not numeric.` );

         if ( definition.props.minValue &&
              ! Number.isFinite( definition.props.minValue ) )
            throw new Error( `definition.props.minValue at index: ${ definitionIndex } is not finite.` );

         if ( definition.props.minStep &&
              isNumeric( definition.props.minStep ) != true )
            throw new Error( `definition.props.minStep at index: ${ definitionIndex } is not numeric.` );

         if ( trueTypeOf( definition.props.perms ) != Array )
            throw new Error( `definition.props.perms at index: ${ definitionIndex } is not an Array.` );

         if ( definition.props.perms.length == 0 )
            throw new Error( `definition.props.perms at index: ${ definitionIndex } cannot be an empty Array.` );

         definition.props.perms.forEach( ( perm ) =>
         {
            let permIndex = CMD5_PERMS_TYPE_ENUM.properties.Cmd5indexOfEnum( i => i.type === perm );
            if ( permIndex < 0 )
               throw new Error( `definition.props.perms at index: ${ definitionIndex } ${ perm } is not a valid perm.` );

         });

         if ( definition.validValues )
         {
            if ( trueTypeOf( definition.validValues ) != Object )
               throw new Error( `definition.validValues at index: ${ definitionIndex } is not an Object.` );
         } else
         {
            definition.validValues = { };
         }

         CMD5_ACC_TYPE_ENUM.add( this.api, definition.type, definition.description, definition.props, definition.validValues );
         if ( settings.cmd5Dbg ) this.log.debug( `Created definition type: "${ definition.type }".` );

      });
   }

   // Scan the platform accessories and identify devices to be restored from cache
   scanToBeRestoredDevices( )
   {
      // Homebridge can only handle a max of 150 accessories per bridge, as such, it is prudent to identify and remove those accessories 
      // which are not to be restored before creating new ones
      // Loop over the config.json devices and identify those need to be restored from cache
      this.config.accessories && this.config.accessories.forEach( ( device ) =>
      {
         this.Service=this.api.hap.Service;

         device.name = getAccessoryName( device );

         if ( settings.cmd5Dbg ) this.log.debug( `Scanning config.json Platform accessories: ${ device.name }` );

         // generate a unique id for the accessory
         let uuid = getAccessoryUUID( device, this.api.hap.uuid );

         // See if an accessory with the same UUID has already been registered
         const existingAccessory = this.toBeRestoredPlatforms.find(accessory => accessory.UUID === uuid);

         if (existingAccessory)
         {
            if ( settings.cmd5Dbg ) this.log.debug( chalk.magenta( `This existing accessory will be restored from cache: ` ), existingAccessory.displayName );

            // Define the key 'toBeRestored' and set it to 'true' explicitly to flag that this accessory will be restored from cache
            existingAccessory.toBeRestored = true;

         } 
      });
   }

   // These would be platform accessories with/without linked accessories
   discoverDevices( )
   {
      let platform;
      let accessory;

      // loop over the config.json devices and register each one if it has not
      // already been registered.
      this.config.accessories && this.config.accessories.forEach( ( device ) =>
      {
         if ( settings.cmd5Dbg ) this.log.debug( `Fetching config.json Platform accessories.` );
         this.Service=this.api.hap.Service;

         device.name = getAccessoryName( device );
         let displayName = device.displayName = getAccessoryDisplayName( device );

         // generate a unique id for the accessory this should be generated from
         // something globally unique, but constant, for example, the device serial
         // number or MAC address.
         let uuid = getAccessoryUUID( device, this.api.hap.uuid );

         // See if an accessory with the same UUID has already been registered and
         // restored from the cached devices we stored in the `configureAccessory`
         // method above

         // NOTE: HOMEBRIDGE EXAMPLES HAVE THIS AS UPPERCASE UUID.
         //       lower case uuid will not be found.
         const existingAccessory = this.toBeRestoredPlatforms.find(accessory => accessory.UUID === uuid);

         if (existingAccessory)
         {
            // NOTE: HOMEBRIDGE EXAMPLES HAVE THIS AS UPPERCASE UUID.
            //       lower case uuid will not be found.
            let duplicatePlatformAccessory = this.createdCmd5Platforms.find(accessory => accessory.UUID === existingAccessory.UUID);
            if ( duplicatePlatformAccessory )
            {
               this.log( chalk.red( `Error duplicate platform accessory: ${ duplicatePlatformAccessory.name } uuid:${ duplicatePlatformAccessory.UUID }` ) );
               // Next in for.Each object iteration
               return;
            }

            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            // if you need to update the accessory.context then you should run
            // `api.updatePlatformAccessories`. eg.:
            //    existingAccessory.context.device = device;
            //    this.api.updatePlatformAccessories( [ existingAccessory ] );
            //existingAccessory.context.device = device;
            //this.api.updatePlatformAccessories( [ existingAccessory ] );

            // create the accessory handler for the restored accessory
            // this is imported from `platformAccessory.ts`
            // new ExamplePlatformAccessory( this, existingAccessory );

            platform = existingAccessory;
            platform.Service = this.Service;

            // This is how we keep the device status information over restart.
            // Version 0
            // Within STORED_DATA_ARRAY is a list of UUID identified objects
            // of storedValuesPerCharacteristic. 
            // Version 1
            // Within STORED_DATA_ARRAY is a list of UUID identified objects
            // of Cmd5Storage.

            // If the accessory has linked accessories or standalone accessories,
            // there infomation gets put in this as well.  I'm pretty sure
            // that previosly these states were lost.

            // Init the STORED_DATA_ARRAY to empty [ ].  If there was never any
            // type to use, this is okay to.
            let STORED_DATA_ARRAY = [ ];

            // If the saved context has our STORED_DATA_ARRAY, then use it.
            if ( existingAccessory.context.STORED_DATA_ARRAY )
            {
               if ( settings.cmd5Dbg ) this.log.debug(`Cmd5Platform: Using context.STORED_DATA_ARRAY` );
               STORED_DATA_ARRAY = existingAccessory.context.STORED_DATA_ARRAY;

            }

            let that = this;
            accessory = new Cmd5Accessory( that.log, device, this.api, STORED_DATA_ARRAY, this );
            accessory.platform = platform;

            // Put the accessory into its correct collection array.
            this.createdCmd5Accessories.push( accessory );

            // Store a copy of the device object in the `accessory.context`
            // the `context` property can be used to store any data about the
            // accessory you may need
            accessory.platform.context.STORED_DATA_ARRAY = accessory.STORED_DATA_ARRAY;

            // Get the properties for this accessories device type
            let devProperties = CMD5_DEVICE_TYPE_ENUM.properties[ accessory.typeIndex ];

            if ( settings.cmd5Dbg ) this.log.debug( `Step 2. ${ accessory.displayName }.service = platform.getService( Service.${ devProperties.deviceName }, ${ accessory.subType })` );
            accessory.service = platform.getService( devProperties.service, accessory.name, accessory.subType );

            // Determine which characteristics, if any, will be polled. This
            // information is also used to define which service.getValue is
            // used, either immediate, cached or polled.
            // Already done by new Cmd5Acc
            // accessory.determineCharacteristicsToPollOfAccessoryAndItsChildren( accessory );

            // set up all services for those characteristics in the
            // config.json file
            accessory.addAllServiceCharacteristicsForAccessory( accessory );

            // Create all the services for the accessory, including fakegato
            // true = from existing.
            this.createServicesForAccessoriesChildren( accessory, true )

         } else
         {
            //
            // the accessory does not yet exist, so we need to create it
            //
            this.log.info('Adding new platformAccessory:', displayName);

            // Create the new PlatformAccessory
            if ( device.category == undefined )
            {
               if ( settings.cmd5Dbg ) this.log.debug( `Step 1. platformAccessory = new platformAccessory( ${ displayName }, ${ uuid } )` );
               platform = new this.api.platformAccessory( displayName, uuid );

            } else
            {
               // Uppercase the category to be nice. Why do I know
               // this will come back to bite me.
               let category = this.api.hap.Categories[ String( device.category ).toUpperCase( ) ];

               if ( ! category )
                  throw new Error( `Category specified: ${ device.category } is not a valid homebridge category.` );

               if ( settings.cmd5Dbg ) this.log.debug( `Step 1. platformAccessory = new platformAccessory( ${ displayName }, ${ uuid }, ${ category } )` );

               platform = new this.api.platformAccessory( displayName, uuid, category );
            }

            platform.Service = this.Service;

            this.log.info( chalk.magenta( `Configuring platformAccessory: ` ) + `${ device.displayName }` );
            let that = this;
            accessory = new Cmd5Accessory( that.log, device, this.api, [ ], this );
            accessory.platform = platform

            // Put the accessory into its correct collection array.
            this.createdCmd5Accessories.push( accessory );

            if ( settings.cmd5Dbg ) this.log.debug( `Created platformAccessory: ${ accessory.displayName }` );

            // Store a copy of the device object in the `accessory.context`
            // the `context` property can be used to store any data about the
            // accessory you may need
            accessory.platform.context.STORED_DATA_ARRAY = accessory.STORED_DATA_ARRAY;

            // Get the properties for this accessories device type
            let devProperties = CMD5_DEVICE_TYPE_ENUM.properties[ accessory.typeIndex ];

            // MOVE OUSTSIDE
            // Platform Step 2. const tvService = this.tvAccessory.addService( this.Service.Television );
            if ( settings.cmd5Dbg ) this.log.debug( `Step 2. ${ accessory.displayName }.service = platform.addService( this.Service.${ devProperties.deviceName }, ${ accessory.name }, ${ accessory.subType })` );
            accessory.service = platform.addService( new devProperties.service( accessory.name, accessory.subType )  );

            // Create all the services for the accessory, including fakegato
            // false = not from existing.
            this.createServicesForAccessoriesChildren( accessory, false )

            // Step 6. this.api.publishExternalAccessories( PLUGIN_NAME, [ this.tvAccessory ] );
            if ( accessory.publishExternally )
            {
               if ( settings.cmd5Dbg ) this.log.debug( `Step 6. publishExternalAccessories( ${ settings.PLUGIN_NAME }, [ ${accessory.displayName } ] )` );

               this.api.publishExternalAccessories( settings.PLUGIN_NAME, [ platform ] );

            } else {
               if ( settings.cmd5Dbg ) this.log.debug( `Step 6. registerPlatformAccessories( ${ settings.PLUGIN_NAME }, ${ settings.PLATFORM_NAME }, [ ${  accessory.displayName } ] ) `);

               this.api.registerPlatformAccessories( settings.PLUGIN_NAME, settings.PLATFORM_NAME, [ platform ] );
            }
         }


         // Just a flag to say we have processed this existing platform accessory.
         // @deprecated homebridge v2
         //platform.updateReachability( true );


         // For Unit testing only
         this.createdCmd5Platforms.push( platform );

      });
   }

   createServicesForAccessoriesChildren( cmd5PlatformAccessory, fromExisting )
   {
      // Create the information Service for the platform itself
      // Unlike Standalone Accessories; The Platform information service is created
      // for us and the getService hangs off the platform, not the accessory.
      if ( cmd5PlatformAccessory.model )
      {
         if ( settings.cmd5Dbg ) cmd5PlatformAccessory.log.debug( `Adding model( ${ cmd5PlatformAccessory.model } ) to information service of ${ cmd5PlatformAccessory.displayName }` );
         cmd5PlatformAccessory.platform.getService( cmd5PlatformAccessory.platform.Service.AccessoryInformation )
            .setCharacteristic( this.api.hap.Characteristic.Model, cmd5PlatformAccessory.model );
      }

      if ( cmd5PlatformAccessory.manufacturer )
      {
         if ( settings.cmd5Dbg ) cmd5PlatformAccessory.log.debug( `Adding manufacturer( ${ cmd5PlatformAccessory.manufacturer } ) to information service of ${ cmd5PlatformAccessory.displayName }` );
         cmd5PlatformAccessory.platform.getService( cmd5PlatformAccessory.platform.Service.AccessoryInformation )
            .setCharacteristic( this.api.hap.Characteristic.Manufacturer, cmd5PlatformAccessory.manufacturer );
      }

      if ( cmd5PlatformAccessory.serialNumber )
      {
         if ( settings.cmd5Dbg ) cmd5PlatformAccessory.log.debug( `Adding serial Number( ${ cmd5PlatformAccessory.serialNumber } ) to information service of ${ cmd5PlatformAccessory.displayName }` );
         cmd5PlatformAccessory.platform.getService( cmd5PlatformAccessory.platform.Service.AccessoryInformation )
            .setCharacteristic( this.api.hap.Characteristic.SerialNumber, cmd5PlatformAccessory.serialNumber );
      }

      if ( cmd5PlatformAccessory.firmwareRevision )
      {
         if ( settings.cmd5Dbg ) cmd5PlatformAccessory.log.debug( `Adding Firmware Revision( ${ cmd5PlatformAccessory.firmwareRevision } ) to information service of ${ cmd5PlatformAccessory.displayName }` );
         cmd5PlatformAccessory.platform.getService( cmd5PlatformAccessory.platform.Service.AccessoryInformation )
            .setCharacteristic( this.api.hap.Characteristic.FirmwareRevision, cmd5PlatformAccessory.firmwareRevision );
      }

      // Create the service for all the accessories. i.e. Speaker Service
      // Step 3.
      //    const speakerService = this.tvAccessory.addService( this.Service.TelevisionSpeaker );
      cmd5PlatformAccessory.accessories && cmd5PlatformAccessory.accessories.forEach( ( addedAccessory ) =>
      {
         // Set the platform of the added accessories so that the accessories can call methods
         // like this one.
         addedAccessory.platform = cmd5PlatformAccessory.platform;

         // Get the properties for this accessory's device type
         let devProperties = CMD5_DEVICE_TYPE_ENUM.properties[ addedAccessory.typeIndex ];

         // Existing Accessories would have existing services
         if ( fromExisting == true )
         {
            if ( settings.cmd5Dbg ) this.log.debug( `Platform (AddedAccessory-existing) Step 3, ${ addedAccessory.displayName }.service = accessory.platform.getService( Service.${ devProperties.deviceName }, ${ addedAccessory.name }, ${ addedAccessory.subType }` );
            // If you have added more than one service of the same type to an accessory, you will need to get the service using the name you defined when adding it.
            //addedAccessory.service = addedAccessory.platform.getService( devProperties.service, addedAccessory.name, addedAccessory.subType );
            addedAccessory.service = addedAccessory.platform.getService( addedAccessory.name, addedAccessory.subType );
         } else
         {

            if ( settings.cmd5Dbg ) this.log.debug( `Platform (AddedAccessory-new) Step 3, ${ addedAccessory.displayName }.service = PlatformAccessory: ${ cmd5PlatformAccessory.displayName } addService( Service:${ devProperties.deviceName }, ${ addedAccessory.name }, ${ addedAccessory.subType } )` );

            addedAccessory.service = cmd5PlatformAccessory.platform.addService( new devProperties.service( addedAccessory.name, addedAccessory.subType ) );
         }

         addedAccessory.addAllServiceCharacteristicsForAccessory( addedAccessory );
         // Create Information Service for the addedAccessory
         if ( settings.cmd5Dbg ) addedAccessory.log.debug( `Creating information service for AddedAccessory: ${ addedAccessory.displayName }` );
         createAccessorysInformationService( addedAccessory );

          // Setup the fakegato service if defined in the config.json file
         addedAccessory.setupAccessoryFakeGatoService( addedAccessory.fakegatoConfig );
         // Move the information service to the top of the list
         addedAccessory.services.unshift( addedAccessory.informationService );

      });

      // Create the service for all the linked accessories. i.e. HDMI Service
      cmd5PlatformAccessory.linkedAccessories && cmd5PlatformAccessory.linkedAccessories.forEach( ( linkedAccessory ) =>
      {
         // Set the platform of the linked accessories so that the accessories can call methods
         // like this one.
         linkedAccessory.platform = cmd5PlatformAccessory.platform;

         // Get the properties for this linked Accessory device type
         let devProperties = CMD5_DEVICE_TYPE_ENUM.properties[ linkedAccessory.typeIndex ];

         // Child accessories can have linked accessories. i.e. HDMI accessory
         // Step 4.
         //    const hdmi1InputService = this.tvAccessory.addService( this.Service.InputSource, `hdmi1', 'HDMI 1' );

         // Existing Accessories would have existing services
         if ( fromExisting == true )
         {
            if ( settings.cmd5Dbg ) this.log.debug( `Platform (LinkedAccessory-existing) Step 4. ${ linkedAccessory.displayName }.service = ${ cmd5PlatformAccessory.displayName }.getService:( ${ devProperties.deviceName }.service, ${linkedAccessory.name }, ${linkedAccessory.subType } )` );
            // If you have added more than one service of the same type to an accessory, you will need to get the service using the name you defined when adding it.

            //linkedAccessory.service = linkedAccessory.platform.getService( devProperties.service, linkedAccessory.name, linkedAccessory.subType );
            linkedAccessory.service = linkedAccessory.platform.getService( linkedAccessory.name, linkedAccessory.subType );
         } else
         {
            if ( settings.cmd5Dbg ) this.log.debug( `Platform (LinkedAccessory-new) Step 4. ${ linkedAccessory.displayName }.service = ${ cmd5PlatformAccessory.displayName }.addService:( ${ devProperties.deviceName }.service, ${linkedAccessory.name }, ${linkedAccessory.subType } )` );

            linkedAccessory.service = cmd5PlatformAccessory.platform.addService( new devProperties.service( linkedAccessory.name, linkedAccessory.subType ) );
         }

         linkedAccessory.addAllServiceCharacteristicsForAccessory( linkedAccessory );

         if ( fromExisting == false )
         {
            if ( settings.cmd5Dbg ) this.log.debug( `Platform Step 5. ${ cmd5PlatformAccessory.displayName }.service.addLinkedService( ${ linkedAccessory.displayName }.service )` );
            cmd5PlatformAccessory.service.addLinkedService( linkedAccessory.service );
         }

         // Create Information Service for the linkedAccessory
         if ( settings.cmd5Dbg ) linkedAccessory.log.debug( `Creating information service for Linked Platform Accessory: ${ linkedAccessory.displayName }` );
         createAccessorysInformationService( linkedAccessory );

          // Setup the fakegato service if defined in the config.json file
         linkedAccessory.setupAccessoryFakeGatoService( linkedAccessory.fakegatoConfig );
         // Move the information service to the top of the list
         linkedAccessory.services.unshift( linkedAccessory.informationService );

      });

      // Setup all the characteristics for the platform accessory itself
      cmd5PlatformAccessory.addAllServiceCharacteristicsForAccessory( cmd5PlatformAccessory );

      // Setup the fakegato service for the platform accessory istelf.
      cmd5PlatformAccessory.setupAccessoryFakeGatoService( cmd5PlatformAccessory.fakegatoConfig );
   }

   // The delay definitions are not meant to be changed, except for unit testing
   // ==========================================================================
   // staggeredStartDelay - These would be for just polling and to be nice to the system.
   // queuedStartDelay - As this is both IOS and polling, the delay only happens to 
   // the low priority polling.
   startPolling( queuedStartDelay = 40000 )
   {
      // Check for any queued characteristics
      if ( Object.keys( settings.listOfCreatedPriorityQueues ).length == 0 )
      {
         if ( settings.cmd5Dbg ) this.log.debug( `No queued polling characteristics` );
         return;
      }

      // Start polling of each queue of characteristics
      let lastIndex = Object.keys( settings.listOfCreatedPriorityQueues ).length;
      Object.keys( settings.listOfCreatedPriorityQueues ).forEach( ( queueName, index ) =>
      {
         let queue = settings.listOfCreatedPriorityQueues[ queueName ];
         let queuedPollingTimer = setTimeout( ( ) =>
         {
            if ( index == lastIndex -1 )
              this.log.info( chalk.magenta( `*** Starting Polling` ) );
            queue.startQueue( queue, ( ) =>
            {
               if ( index == 0 )
                  this.log.info( chalk.magenta( `*** All characteristics are now being polled` ) );
            });

         }, queuedStartDelay );

         this.pollingTimers.push( queuedPollingTimer );
      });
   }
}

exports.Cmd5Platform = Cmd5Platform;
