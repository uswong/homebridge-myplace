'use strict';

// These would already be initialized by index.js
let CMD5_ACC_TYPE_ENUM = require( "../lib/CMD5_ACC_TYPE_ENUM" ).CMD5_ACC_TYPE_ENUM;

class Cmd5Storage
{
   constructor( log, cmd5Storage )
   {
      this.CLASS_VERSION = 1;
      this.DATA = [ ];

      if ( cmd5Storage == undefined )
      {
         log.debug("Init new cmd5Storage" );

         // init new
         this.DATA = new Array( CMD5_ACC_TYPE_ENUM.EOL ).fill( null );

      } else if ( cmd5Storage instanceof Cmd5Storage )
      {
         log.debug("Class is Cmd5Storage version: %s", cmd5Storage.version );
         if ( cmd5Storage.CLASS_VERSION == this.CLASS_VERSION )
         {
            // The same. I can just load its data
            this.loadLatestData( cmd5Storage.DATA );
         } else {
            throw new Error( `Do not know how to handle Cmd5_Storage Class version: ${ cmd5Storage.CLASS_VERSION }` );
         }
      } else if ( Array.isArray( cmd5Storage ) )
      {
         log.debug("Cmd5Storage is Array" );
         // Init original unversioned
         let data = this.upgradeDataArray( 0, cmd5Storage );
         this.loadLatestData( data );

      } else if ( cmd5Storage.constructor === Object )
      {
         log.debug("Cmd5Storage is Object version %s", cmd5Storage.CLASS_VERSION );
         if ( cmd5Storage.CLASS_VERSION == this.CLASS_VERSION )
         {
            // The same. I can just load its data
            this.loadLatestData( cmd5Storage.DATA );
         } else {
            throw new Error( `Do not know how to handle Cmd5_Storage Class version: ${ cmd5Storage.CLASS_VERSION }` );
         }
      } else
      {
         // Woops init new
         log.error( "cmd5Storage is %s", cmd5Storage );
         console.error( "cmd5Storage.constructor.name is %s", cmd5Storage.constructor.name );
         throw new Error( `Do not know how to handle typeof: ${ typeof cmd5Storage } Cmd5_Storage parm: ${ cmd5Storage }` );
      }
   }

   upgradeDataArray( fromVersion, fromData)
   {
      let data = [ ];

      if ( fromVersion != 0 )
         throw new Error( `Do not know how to handle Cmd5_Storage version: ${ fromVersion }` );

      // Version 0 ACC_DATA went from 0-122
      // This version goes from 1-123 and changes to
      // Assoc array so that index changes like this will no longer
      // impact the storage schema as much
      let i=0;
      for ( i=0; i < CMD5_ACC_TYPE_ENUM.ListPairings; i++ )
      {
         data[ i ] = fromData[ i ];
      }
      data[ CMD5_ACC_TYPE_ENUM.ListPairing ] = null;
      for ( i = CMD5_ACC_TYPE_ENUM.ListPairings +1; i < CMD5_ACC_TYPE_ENUM.EOL; i++ )
      {
         data[ i ] = fromData[ i - 1 ];
      }
      return data;
   }

   loadLatestData( data )
   {
      this.DATA = data;
   }

   getStoredValueForIndex( accTypeEnumIndex )
   {
      if ( accTypeEnumIndex < 0 || accTypeEnumIndex >= CMD5_ACC_TYPE_ENUM.EOL )
         throw new Error( `getStoredValue - Characteristic index: ${ accTypeEnumIndex } not between 0 and ${ CMD5_ACC_TYPE_ENUM.EOL }\nCheck your config.json file for unknown characteristic.` );


      return this.DATA[ accTypeEnumIndex ];
   }

   getStoredValueForCharacteristic( characteristicString )
   {
      let accTypeEnumIndex = CMD5_ACC_TYPE_ENUM.indexOfEnum( characteristicString );

      return this.getStoredValueForIndex( accTypeEnumIndex );
   }
   setStoredValueForIndex( accTypeEnumIndex, value )
   {
      if ( accTypeEnumIndex < 0 || accTypeEnumIndex >= CMD5_ACC_TYPE_ENUM.EOL )
         throw new Error( `setStoredValue - Characteristic index: ${ accTypeEnumIndex } not between 0 and ${ CMD5_ACC_TYPE_ENUM.EOL }\nCheck your config.json file for unknown characteristic.` );

      this.DATA[ accTypeEnumIndex  ] = value;
   }
   setStoredValueForCharacteristic( characteristicString, value )
   {
      let accTypeEnumIndex = CMD5_ACC_TYPE_ENUM.indexOfEnum( characteristicString );

      this.setStoredValueForIndex( accTypeEnumIndex, value );
   }

   // Unlike get/set, testStoredValueForIndex does not call process.exit,
   // but undefined for an illegal range, in the case that rogue runtime data
   // dies not take down CMD5.
   testStoredValueForIndex( accTypeEnumIndex )
   {
      if ( accTypeEnumIndex < 0 || accTypeEnumIndex > CMD5_ACC_TYPE_ENUM.EOL )
         return undefined;

      return this.DATA[ accTypeEnumIndex ];
   }
   testStoredValueForCharacteristic( characteristicString )
   {
      let accTypeEnumIndex = CMD5_ACC_TYPE_ENUM.indexOfEnum( characteristicString );

      return this.testStoredValueForIndex( accTypeEnumIndex );
   }
}

module.exports = Cmd5Storage;
