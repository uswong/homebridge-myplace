"use strict";

//
//                           Homebridge
// Flow                     /          \
//                         /            \
//      api.registerPlatform             api.registerAccessory
//     forEach Accessories{ }        Any { } before/after Accessories{ }
//         Cmd5Platform                      Cmd5Accessory
//         Cmd5Accessory
//
//
//
//
//
//
//
//
//
//

// The Cmd5 Classes
const Cmd5Accessory = require( "./Cmd5Accessory" ).Cmd5Accessory;
const Cmd5Platform = require( "./Cmd5Platform" ).Cmd5Platform;

const settings = require( "./cmd5Settings" );

// Pretty colors
const chalk = require( "chalk" );

// The Library files that know all.
var CHAR_DATA = require( "./lib/CMD5_CHAR_TYPE_ENUMS" );
var ACC_DATA = require( "./lib/CMD5_ACC_TYPE_ENUM" );
var DEVICE_DATA = require( "./lib/CMD5_DEVICE_TYPE_ENUM" );

// Remove MyPlace shell script temporary working directories on Hombridge RESTART
const fs = require('fs');
const path = require('path');

var directoryPath = process.env.TMPDIR || "/tmp"

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory:', err);
  }

  // Filter files that matches with "AA-xxx" or "BB-xxx" where xxx is a 3 digit integer
  const filteredFiles = files.filter(file => file.match(/^[A-B][A-B]-[0-9][0-9][0-9]$/));

  // Log the filtered files
  filteredFiles.forEach(file => {
    // Sub directory path
    var sdir = `${directoryPath}/${file}`
    // Delete sub-directory recursively
    fs.rm(sdir, { recursive: true, force: true }, (err) => {
      if (err) {
        throw err;
      }
      console.log(`>>> [MyPlace] Temporary working directory ${sdir} removed`);
    });
  });
});

module.exports =
{
   default: function ( api )
   {
      // Init the libraries for all to use
      let CMD5_CHAR_TYPE_ENUMS = CHAR_DATA.init( api.hap.Formats, api.hap.Units, api.hap.Perms );
      let CMD5_ACC_TYPE_ENUM = ACC_DATA.init( api.hap.Characteristic, api.hap.Formats, api.hap.Units, api.hap.Perms );
      let CMD5_DEVICE_TYPE_ENUM = DEVICE_DATA.init(
         CMD5_ACC_TYPE_ENUM, api.hap.Service, api.hap.Characteristic, api.hap.Categories );

      api.registerAccessory( settings.PLATFORM_NAME, Cmd5Accessory );
      api.registerPlatform( settings.PLATFORM_NAME, Cmd5Platform );

      setTimeout( checkForUpdates, 1800 );

      // This is not required by homebridge and does not affect it.  I use it for
      // unit testing.
      return { CMD5_CHAR_TYPE_ENUMS,
               CMD5_ACC_TYPE_ENUM,
               CMD5_DEVICE_TYPE_ENUM,
               api
             };
   },
   // These would be the uninitialized values,
   // used for unit testing
   CHAR_DATA:   CHAR_DATA,  // properties would be { } empty.
   ACC_DATA:    ACC_DATA,   // properties would be { } empty.
   DEVICE_DATA: DEVICE_DATA // properties would be { } empty.
}

function checkForUpdates( )
{
   // Don't show the updates message in mocha test mode
   if ( process.argv.includes( "test/mocha-setup" ) )
      return;

   const { getLatestVersion, isVersionNewerThanPackagedVersion }  = require( "./utils/versionChecker" );
   const myPkg = require( "./package.json" );

   ( async( ) =>
   {
      // Fix for #127, constant crash loops when no internet connection
      // trying to get latest Cmd5 version.
      // thx nano9g
      try
      {
         let lv = await getLatestVersion( );

         if ( isVersionNewerThanPackagedVersion( lv ) )
         {
            console.log( chalk.green( `[UPDATE AVAILABLE] ` ) + `Version ${lv} of ${myPkg.name} is available. Any release notes can be found here: ` + chalk.underline( `${myPkg.changelog}` ) );
         }

      }
      catch( error )
      {
         console.log( chalk.yellow( `[UPDATE CHECK FAILED] ` ) + `Could not check for newer versions of ${myPkg.name} due to error ${error.name}: ${error.message}`)
      }
   })( );
}
