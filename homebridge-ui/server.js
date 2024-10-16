const { HomebridgePluginUiServer } = require('@homebridge/plugin-ui-utils');
const { RequestError } = require('@homebridge/plugin-ui-utils');
const fs = require('fs')
const chalk = require('chalk')

const which = require('which');
const path = require( "path" );
const commandExistsSync = require( "command-exists" ).sync;


class UiServer extends HomebridgePluginUiServer
{
   constructor ()
   {
      super();

      this.MYPLACE_SH = "/homebridge-myplace/MyPlace.sh";
      this.CONFIGCREATOR_SH = "/homebridge-myplace/ConfigCreator.sh";
      this.listOfConstants = { };

      // To enable debug, add the following to your config.json AT ANY TIME.
      // No restart required.
      // {
      //    "platform": "MyPlace",
      //    "debug": true
      // },
      //
      // Note: remove the above or you will get the message:
      // No plugin was found for the platform "MyPlace" in your config.json. Please make
      // sure the corresponding plugin is installed correctly.
      //
      // This error is not harmful, just annoying.
      this.debug = false;

      this.config = { };

      this.updateConfigFirstTime( true );

      // handle request
      this.onRequest('/configcreator', this.ConfigCreator.bind(this));
      this.onRequest('/checkInstallationButtonPressed', this.checkInstallationButtonPressed.bind(this));
      this.onRequest('/consoleLog', this.consoleLog.bind(this));

      // console.log("HomebridgePluginUIServer ready");
      this.ready();
   }

   async ConfigCreator(payload) {
      if (payload.ip1 !== "") {
         payload.ip1 += ':';
         payload.ip1 += payload.port1;
         console.log('Processing AA system:', payload.name1,payload.ip1,payload.debug1);
         console.log('extra Timers:', payload.extraTimers1);
      }
      if (payload.ip2 !== "") {
         payload.ip2 += ':';
         payload.ip2 += payload.port2;
         console.log('Processing AA system:', payload.name2,payload.ip2,payload.debug2);
         console.log('extra Timers:', payload.extraTimers2);
      }
      if (payload.ip3 !== "") {
         payload.ip3 += ':';
         payload.ip3 += payload.port3;
         console.log('Processing AA system:', payload.name3,payload.ip3,payload.debug3);
         console.log('Extra Timers:', payload.extraTimers3);
      }

      try {
         const MyPlace_shPath = this.getGlobalNodeModulesPathForFile( this.MYPLACE_SH );
         const ConfigCreator_shPath = this.getGlobalNodeModulesPathForFile( this.CONFIGCREATOR_SH );

         //This spawns a child process which runs a bash script
         const spawnSync = require('child_process').spawnSync;
         let FeedBack = spawnSync(ConfigCreator_shPath, [payload.ip1,payload.name1,payload.extraTimers1,payload.debug1,payload.ip2,payload.name2,payload.extraTimers2,payload.debug2,payload.ip3,payload.name3,payload.extraTimers3,payload.debug3,MyPlace_shPath], {encoding: 'utf8'});
         let feedback = `${ FeedBack.stdout.replace(/\n*$/, "")}`

         // return data to the ui
         return {
            feedback: feedback
         }
      }
      catch (e) {
         throw new RequestError('Failed to run ConfigCreator.sh', { message: e.message });
      }
   }

   async consoleLog( msg )
   {
      if ( this.debug )
         console.log( msg );
   }

   // Have the server send an error to the listening HTML page.
   // We could return the same structure, but this would be synchronously.
   // which is okay in most instances.  The other reason is that toast
   // error messages close within a few seconds. Not giving time for
   // complicated messages like the proper state_cmd to use.
   advError( data )
   {
      this.pushEvent('advErrorEvent', data );
   }

   checkQueueTypesForQueue( queueTypes, queue )
   {
      for ( let queueTypesIndex = 0; queueTypesIndex < queueTypes.length; queueTypesIndex++ )
      {
         let entry = queueTypes[ queueTypesIndex ];
         if ( entry.queue == queue )
         {
            if ( entry.queueType == "WoRm2" )
            {
               return(
               { rc: true,
                 message: `Passed`
               });
            }
            return(
            { rc: false,
              message: `queue ${ queue } queueType is not WoRm2. Please change to Worm2.`
            });
         }
      }

      return(
      { rc: false,
         message: `No matching queue: "${ queue }" in queueTypes`
      });
   }

   // Cmd5 has the ability to allow constants which could be used for the IP
   //
   processConstants( constantsArgArray )
   {
      //
      // Check #8A
      // Constants must be an Array
      //
      if ( ! Array.isArray ( constantsArgArray ) )
      {
         this.advError(
         { "rc": false,
           "message": `Constants must be an array of { "key": "\${SomeKey}", "value": "some replacement string" }`
         });
         return false;
      }
      // Iterate over the groups of key/value constants in the array.
      // Note: DO NOT USE: forEach as javascript continues after a return!
      for ( let argIndex = 0; argIndex < constantsArgArray.length; argIndex++ )
      {
         let argEntry = constantsArgArray[ argIndex ];

         if ( argEntry.key == undefined )
         {
            //
            // Check #8B
            // key must be defined
            //
            this.advError(
            { "rc": false,
              "message": `Constant definition at index: "${ argIndex }" has no "key":`
            });
            return false;
         }

         if ( argEntry.value == undefined )
         {
            //
            // Check #8c
            // value must be defined
            //
            this.advError(
            { "rc": false,
              "message": `Constant definition at index: "${ argIndex }" has no "value":`
            });
            return false;
         }

         let keyToAdd = argEntry.key;
         let valueToAdd = argEntry.value;
         if ( ! keyToAdd.startsWith( "${" ) )
         {
            if ( this.debug )
               console.log( `Constant definition for: "${ keyToAdd }" must start with "\${" for clarity.` );

            //
            // Check #8D
            // key must start with ${
            //
            this.advError(
            { "rc": false,
              "message": `Constant definition for: "${ keyToAdd }" must start with "\${" for clarity.`
            });
            return false;
         }

         if ( ! keyToAdd.endsWith( "}" ) )
         {
            //
            // Check #8E
            // key must end with }
            //
            if ( this.debug )
               console.log( `Constant definition for: "${ keyToAdd }" must end with "}" for clarity.` );

            this.advError(
            { "rc": false,
              "message": `Constant definition for: "${ keyToAdd }" must end with "}" for clarity.`
            });
            return false;
         }

         // remove any leading and trailing single quotes
         // so that using it for replacement will be easier.
         valueToAdd.replace(/^'/, "")
         valueToAdd.replace(/'$/, "")

         if ( this.debug )
            console.log( "Server.js keyToAa=%s valueToAdd:%s", keyToAdd, valueToAdd );

         this.listOfConstants[ keyToAdd ] = valueToAdd;
      }

      return true;
   }

   replaceConstantsInString( orig )
   {
      let finalAns = orig;

      for ( let key in this.listOfConstants )
      {
         let replacementConstant = this.listOfConstants[ key ];

         if ( this.debug )
            console.log(`replacing key: ${ key } with: ${ replacementConstant }` );

         finalAns = finalAns.replace( key, replacementConstant );
      }
      return finalAns;
   }

   updateConfigFirstTime( firstTime )
   {
      //
      // Check #1
      // See if the config.json file exists
      //
      let configFile = this.homebridgeConfigPath;

      if ( configFile == undefined )
      {
         if ( this.debug )
            console.log( `Server.js returning false configFile is undefined` );

         this.advError(
         { "rc": false,
           "message": `No config.json yet`
         });
         return false;
      }

      if ( ! fs.existsSync( configFile ) )
      {
         if ( ! firstTime )
         {
            if ( this.debug )
               console.log( `Server.js returning false configFile ${ configFile }` );

            this.advError(
            { "rc": false,
              "message": `No ${ configFile } yet`
            });
         }

         return false;
      }

      // Open the config.json file for reading
      let config_in = fs.readFileSync( configFile, 'utf8' );

      //
      // Check #2
      // Convert the config.json into a json type
      // This can throw an Error so catch it.
      try {
         this.config = JSON.parse( config_in );
      } catch ( e )
      {
         if ( ! firstTime )
         {
            if ( this.debug )
               console.log( `Server.js returning false parse failed ${ e }` );

            this.advError(
            { "rc": false,
              "message": `Parse config.json failed: ${ e }`
            });
         }
         return false;
      }

      let cmd5AdvantageAirConfig = this.config.platforms.find( platform => platform[ "MyPlace" ] !== null );

      if ( cmd5AdvantageAirConfig && cmd5AdvantageAirConfig.debug )
      {
         console.log( `Setting debug for MyPlace` );
         this.debug = cmd5AdvantageAirConfig.debug;
      }

      if ( this.debug )
         console.log( `main.js After JSONPARSE` );

      return true;
   }


   // There is nothing really to differentiate a regular Cmd5 Accessory for that of
   // an Advantage Air
   //
   isAccessoryAnMyPlace( accessory )
   {
      if ( accessory.manufacturer && accessory.manufacturer.match( /Advantage Air/ ) )
         return true;

      // Trigger off of the state_cmd, if it exists
      if ( accessory.state_cmd != undefined )
      {
         // The new MyPlace
         if ( accessory.state_cmd.match( /MyPlace.sh/ ) )
            return true;
      }

      return false;
   }

   // This method is called by the html page (main.js) to check the users config.json
   // for a valid configuration of the Advantage Air accessory.
   checkInstallationButtonPressed( )
   {
      // The read in config.json in JSON format
      let fileToFind = "";

      if ( this.debug )
         console.log( "Server.js in checkInstallationButtonPressed(" );

      // Update the config, this is not the first time
      // return if it fails. As this is not the First time, it will
      // error if need be.
      if ( this.updateConfigFirstTime( false ) == false )
         return;

      //
      // Check #3
      // Check that jq is installed.
      if ( ! commandExistsSync( "jq" ) )
      {
         if ( this.debug )
            console.log( `Server.js returning false jq not installed` );

         this.advError(
         { "rc": false,
           "message": `jq is required globally and not installed.`
         });
         return;
      }

      //
      // Check #4
      // Check that jq is installed.
      if ( ! commandExistsSync( "curl" ) )
      {
         if ( this.debug )
            console.log( `Server.js returning false curl not installed` );

         this.advError(
         { "rc": false,
           "message": `curl is required globally and not installed.`
         });
         return;
      }

      //
      // Check #5A
      // Find Node modules
      //
      let node_modules = this.getGlobalNodeModulesPathForFile( "/homebridge-myplace/MyPlace.sh" );
      node_modules = node_modules.replace("/homebridge-myplace/MyPlace.sh", "");
      if ( node_modules == null )
      {
         if ( this.debug )
            console.log( `Server.js Could not determine where node_modules is.` );

         this.advError(
         { "rc": false,
           "message": `Could not determine where node_modules is installed globally.`
         });
         return;
      }
      //
      // Check #5B
      // See if Cmd5 is installed from node_modules
      //
      fileToFind = "/homebridge-myplace/index.js";
      let cmd5Index = this.getGlobalNodeModulesPathForFile( fileToFind )
      if ( cmd5Index == null )
      {
         if ( this.debug )
            console.log( `Server.js returning false cmd5Index <Your Global node_modules Path>${ fileToFind }` );

         this.advError(
         { "rc": false,
           "message": `Homebridge-MyPlace Plugin not installed`
         });
         return;
      }

      //
      // Check #6
      // See if our MyPlace.sh script is present
      //
      // Create the path to the cmd5MyAir.sh from node_modules
      let ourScript = this.getGlobalNodeModulesPathForFile( this.MYPLACE_SH )
      if ( ourScript == null )
      {
         if ( this.debug )
            console.log( `Server.js returning false. No MyPlace.sh present. Looking for: <Your Global node_modules Path>${ this.MYPLACE_SH }` );

         this.advError(
         { "rc": false,
           "message": `No MyPlace.sh script present. Looking for: <Your Global node_modules Path>${ this.MYPLACE_SH }`
         });
         return;
      }

      let cmd5AccessoriesFound = false;
      let advantageAirAccessoriesFound = [];
      let cmd5QueueTypesFound = [];
      let retVal = { };
      // Iterate over the elements in the array.
      // Note: DO NOT USE: forEach as javascript continues after a return!
      for ( let entryIndex = 0; entryIndex < this.config.platforms.length; entryIndex++ )
      {
         let entry = this.config.platforms[ entryIndex];

         if ( this.debug )
            console.log( `Server.js Checking Platform entry ${ entry.platform }` );

         //
         // Check #7
         // See if any Cmd5 accessories are defined in config.json
         //
         if ( entry.platform != "MyPlace" )
            continue;

         cmd5AccessoriesFound = true;

         //
         // Check #18
         // See if there are any accessory queues defined
         //
         if ( entry.queueTypes != undefined )
         {
            //
            // Check #19
            // queueTypes must be an array
            //
            if ( ! Array.isArray( entry.queueTypes ) )
            {
               if ( this.debug )
                  console.log( `Server.js returning false queueTypes is not an Array` );
               this.advError(
               { "rc": false,
                 "message": `queueTypes is not an Array`
               });
               return;
            }

            // Iterate over the elements in the array.
            // Note: DO NOT USE: forEach as javascript continues after a return!
            for ( let queueTypesIndex = 0; queueTypesIndex < entry.queueTypes.length; queueTypesIndex++ )
            {
               let queueTypeEntry = entry.queueTypes[ queueTypesIndex ];

               // Need to append each one
               retVal =  this.checkQueueTypesForQueue( cmd5QueueTypesFound, queueTypeEntry.queue );
               if ( retVal.rc == true )
               // if ( cmd5QueueTypesFound.find( queueTypeEntry ) )
               {
                  //
                  // Check #20
                  // Duplicate queue
                  //
                  this.advError(
                  { "rc": false,
                    "message": `Duplicate queue found: ${ queueTypeEntry.queue }`
                  });
                  return;
               }
               cmd5QueueTypesFound.push( queueTypeEntry );
            }
         }

         //
         // Check #8
         // Process Constants
         //
         if ( entry.constants != undefined )
            if ( this.processConstants( entry.constants ) == false )
               return;

         // Iterate over the elements in the array.
         // Note: DO NOT USE: forEach as javascript continues after a return!
         for ( let accessoryIndex = 0; accessoryIndex < entry.accessories.length; accessoryIndex++ )
         {
            let accessory = entry.accessories[ accessoryIndex ];

            if ( this.debug )
               console.log( `Server.js Checking accessory ${ accessory.name }` );

            //
            // Check #9
            // See if any Advantage Air accessories are defined in config.json
            //
            if ( ! this.isAccessoryAnMyPlace( accessory ) )
               continue;

            //
            // Check #10
            // See if any Advantage Air accessory has a defined name
            //

            if ( this.debug )
               console.log( `Server.js Checking accessory ${ accessory.name }` );

            if ( accessory.name == undefined )
            {
               this.advError(
               { "rc": false,
                 "message": `Accessory at index: ${ entryIndex } accessory.name is undefined`
               });
               return;
            }

            //
            // Check #11
            // See if any Advantage Air accessory has a defined displayName
            //

            if ( this.debug )
               console.log( `Server.js Checking accessory ${ accessory.name } for displayName` );

            if ( accessory.displayName == undefined )
            {
               this.advError(
               { "rc": false,
                 "message": `Accessory at index: ${ entryIndex } "${ accessory.name }" has no displayName`
               });
               return;
            }

            //
            // Check #12
            // Polling is done by displayName, It cannot already exist.
            //

            if ( this.debug )
               console.log( `Server.js Checking accessory ${ accessory.displayName } for duplicate displayName` );

            if ( advantageAirAccessoriesFound.find( ( displayName ) => displayName == accessory.displayName ) )
            {
               this.advError(
               { "rc": false,
                 "message": `Accessory: "${ accessory.displayName }"'s displayName is defined twice`
               });
               return;
            }


            // Add it to the Array
            advantageAirAccessoriesFound.push( accessory.displayName );

            if ( this.debug )
               console.log( `Server.js Checking Advantage Air accessory ${ accessory.displayName }` );

            //
            // Check #13
            // The state_cmd must be defined for the Air accessory
            //
            if ( accessory.state_cmd == undefined )
            {
               this.advError(
               { "rc": false,
                "message": `No state_cmd for: "${ accessory.displayName }"`
               });
               return;
            }

            //
            // Check #14
            // See if the state_cmd does not match the MyPlace.sh
            //
            if ( ! accessory.state_cmd.match( ourScript ) )
            {
               if ( this.debug )
                  console.log( `Server.js returning false accessory.displayName ${ accessory.displayName } invalid state_cmd` );

               this.advError(
               { "rc": false,
                 "message": `Invalid state_cmd for: "${ accessory.displayName }". It should be:\n${ ourScript }`
               });
               return;
            }

            //
            // Check #15
            // See if the state_cmd_suffix is defined for the Air accessory
            // It must have at least an IP
            if ( accessory.state_cmd_suffix == undefined )
            {
               this.advError(
               { "rc": false,
                 "message": `No state_cmd_suffix for: "${ accessory.displayName }". It must at least contain an IP.`
               });
               return;
            }

            if ( this.debug )
               console.log(`Calling replaceConstantsInString`);

            let state_cmd_suffix = this.replaceConstantsInString(  accessory.state_cmd_suffix );

            if ( this.debug )
               console.log(`after replaceConstantsInString state_cmd_suffix=${ state_cmd_suffix }`);

            //
            // Check #16
            // The state_cmd_suffix must have an IP for the Air accessory
            //
            if ( ! state_cmd_suffix.match( /[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*/ ) )
            {
               this.advError(
               { "rc": false,
                 "message": `state_cmd_suffix has no IP for: "${ accessory.displayName }" state_cmd_suffix: ${ state_cmd_suffix }`
               });
               return;
            }

            //
            // Check #17
            // Checking for required linkedTypes accessory and required keywords in state_cmd_sufffix                      
            if (  accessory.type.match( /Switch/ ) ||
                  accessory.type.match( /Thermostat/ )
               )
            {
               // Check #17A
               // A Switch or a Thermostat must have a linkedTypes 'Fan' accessory for fanSpeed control                        
               if ( accessory.linkedTypes == undefined )
               {
                     this.advError(
                     { "rc": false,
                       "message": `"${ accessory.displayName }" requires a linkedTypes 'Fan' accessory for fan speed control.`
                     })
                     return;

               // Check #17B
               // The state_cmd_suffix must have 'fanSpeed' linkedTypes Fan accessory associated with a Switch or a Thermostat
               } else if ( ! accessory.linkedTypes[0].state_cmd_suffix.match( /fanSpeed/ ) )
               { 
                     this.advError(
                     { "rc": false,
                       "message": `The state_cmd_suffix for "${ accessory.linkedTypes[0].displayName }" requires the keyword 'fanSpeed' (without quotes).`
                     })
                     return;
               }
            // Check #17C
            // The state_cmd_suffix must have 'timer' or 'Timer' or 'ligID' for a Lightbulb accessory
            } else if ( accessory.type.match( /Lightbulb/ ) )
            {
                if ( ! ( state_cmd_suffix.match( /timer/ ) ||
                 state_cmd_suffix.match( /fanTimer/ ) ||
                 state_cmd_suffix.match( /coolTimer/ ) ||
                 state_cmd_suffix.match( /heatTimer/ ) ||
                 state_cmd_suffix.match( /ligID:/ )
                   )
                )
                {
                   this.advError(
                   { "rc": false,
                     "message": `The state_cmd_suffix for "${ accessory.displayName }" requires 'timer' or 'fanTimer' or 'coolTimer' or 'heatTimer' (without quotes) if being used as timers or requires ligID:<light ID> if being used as a MyPlace Light.` 
                   })
                   return;
                }
            // Check #17D
            // The state_cmd_suffix must have 'thiID' for an Garage or WindowCovering accessory
            }  else if ( accessory.type.match( /^Window/ ) ||
                         accessory.type.match( /^Garage/ )
                       )
            {
               if ( ! state_cmd_suffix.match( /thiID:/ ) )
               {
                  this.advError(
                  { "rc": false,
                    "message": `The state_cmd_suffix has no 'thiID' for: "${ accessory.displayName }"`
                  })
                  return;
               }
            // Check #17E
            // The state_cmd_suffix must have a zone for a Fan accessory with displayName ending with ' Zone' (without quotes)
            }  else if ( accessory.type.match( /^Fan/ ) && accessory.displayName.match( / Zone$/ ) )
            {
               if ( ! state_cmd_suffix.match( /z[0-9][0-9]/ ) )
               {
                  this.advError(
                  { "rc": false,
                    "message": `The state_cmd_suffix has no zone for: "${ accessory.displayName }"`
                  })
                  return;
               }
            }

            //
            // Check #21
            // See if there is a queue defined
            //
            if ( accessory.queue == undefined )
            {
               if ( this.debug )
                  console.log( `Server.js returning false accessory.displayName ${ accessory.displayName } queue is not a string` );

               this.advError(
               { "rc": false,
                 "message": `No queue defined for: "${ accessory.displayName }"`
               });
               return;
            }

            //
            // Check #22
            // queue name must be an string
            //
            if ( typeof accessory.queue != "string" )
            {
               if ( this.debug )
                  console.log( `Server.js returning false accessory.displayName ${ accessory.displayName } queue is not a string` );

               this.advError(
               { "rc": false,
                 "message": `queue for: "${ accessory.displayName }" is not a string`
               });
               return;
            }

            retVal = this.checkQueueTypesForQueue( cmd5QueueTypesFound, accessory.queue );
            // Check #23
            // queue must be defined in queueTypes
            if ( retVal.rc == false )
            {
               if ( this.debug )
                  console.log( `Server.js returning false accessory.displayName ${ accessory.displayName } no queue defined in queueTypes` );

               this.advError(
               { "rc": false,
                 "message": `For: "${ accessory.displayName }" ${ retVal.message }`
               });
               return;
            }

            // Check #24 Polling must be defined for MyPlace accessories
            if ( ! accessory.polling ||
                 ( typeof accessory.polling == "boolean" && accessory.polling != true &&
                 ! Array.isArray( accessory.polling) ) )
            {
               if ( this.debug )
                  console.log( `Server.js returning false accessory.displayName ${ accessory.displayName } polling not defined correctly` );

               this.advError(
               { "rc": false,
                 "message": `Polling for: "${ accessory.displayName }" is not an Array or Boolean`
               });
               return;
            }
         }
      }

      //
      // Check #32
      // See if any Cmd5 accessories are defined in config.json
      //
      if ( cmd5AccessoriesFound == false )
      {
         if ( this.debug )
            console.log( `Server.js returning false noCmd5Accessories` );

         this.advError(
         { "rc": false,
           "message": `No MyPlace Accessories found`
         });
         return;
      }

      //
      // Check #33
      // See if any Advantage Air accessories are defined in config.json
      //
      if ( advantageAirAccessoriesFound.length == 0 )
      {
         if ( this.debug )
            console.log( `Server.js returning false noAIRAccessories` );

         this.advError(
         { "rc": false,
           "message": `No Advantage Air Accessories found`
         });
         return;
      }

      //
      // Check #34
      // See if any queueTypes were defined
      // ( Most likely an earlier failure will succeed this one )
      //
      if ( cmd5QueueTypesFound == null )
      {
         if ( this.debug )
            console.log( `Server.js returning false no Cmd5 Queue types defined` );

         this.advError(
         { "rc": false,
           "message": `No Cmd5 Queue Types were defined for Advantage Air Accessories`
         });
         return;
      }

      if ( this.debug )
      {
         console.log( chalk.red( `Remember to remove the "MyPlace" debug entry from your config.json when done.` ) );
      }

      // PASS !
      this.advError(
      { "rc": true,
        "message": `Passed`
      });
   }

   getGlobalNodeModulesPathForFile( file )
   {
      let fullPath = null;

      for ( let tryIndex = 1; tryIndex <= 6; tryIndex ++ )
      {
         switch ( tryIndex )
         {
            case 1:
            {
              if ( commandExistsSync( "npm" ) )
              {
                  // Use spawnSync as execSync does not allow capture of
                  // stdio, even when using try/catch
                  const spawnSync = require('child_process').spawnSync;
                  let foundPath = spawnSync("npm", ["root", "-g"], {encoding: 'utf8'});
                  if ( foundPath.stderr )
                  {
                     console.log( "Error: %s", foundPath.stderr );
                     console.log( "This error is a Debian packaging issue.  See: https://github.com/nodejs/node-v0.x-archive/issues/3911#issuecomment-8956154" );
                     break;
                  }
                  if ( ! foundPath.stdout )
                    break;

                  // Remove any trailing carriage returns and combine
                  // with file.
                  let fullPath = `${ foundPath.stdout.replace(/\n*$/, "")}${ file }`;

                  if ( fs.existsSync( fullPath ) )
                     return fullPath;

              }
              break;
            }
            case 2:
            {
              if ( commandExistsSync( "homebridge" ) )
              {
                 const homebridgePath = which.sync( 'homebridge', { nothrow: true } )
                 if ( homebridgePath )
                 {
                    let dirname = path.dirname( homebridgePath );
                    dirname = dirname.replace(/\/[^/]+$/, '');
                    fullPath = `${dirname}${ file }`;

                    if ( fs.existsSync( fullPath ) )
                       return fullPath;
                 }
              }
              break;
            }
            case 3:
            {
               fullPath = `/usr/local/lib/node_modules${ file }`;

               if ( fs.existsSync( fullPath ) )
                  return fullPath;

               break;
            }
            case 4:
            {
               fullPath = `/usr/lib/node_modules${ file }`;

               if ( fs.existsSync( fullPath ) )
                  return fullPath;

               break;
            }
            case 5:
            {
               fullPath = `/var/lib/homebridge/node_modules${ file }`;

               if ( fs.existsSync( fullPath ) )
                  return fullPath;

               break;
            }
            case 6:
            {
               fullPath = `/opt/homebrew/lib/node_modules${ file }`;

               if ( fs.existsSync( fullPath ) )
                  return fullPath;

               break;
            }

         }
      }
      return null;
   }
}
module.exports = UiServer;

//(() => {
//  return new UiServer();
//})();

(function() {
   return new UiServer;
})();
