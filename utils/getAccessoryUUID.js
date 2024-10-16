'use strict';

// Description:
//    Get or create a Accessories UUID based on what it is configured as.
//
// @param config - The accessories config information.
// @param UUIDGen - api.hap.uuid
//
// @returns - UUID or exits as all Accessories must have a type and name or displayName.
//
// Note: This follows the getAccessoryName logic of getting the Accessories name.

var getAccessoryUUID = function ( config, UUIDGen )
{
   // UUID for homebridge-myplace
   let noOfChar = config.polling.length
   let typeName = config.type + config.name + noOfChar;
   if ( config.linkedTypes === undefined ) {
      return UUIDGen.generate( typeName );
   } else { 
      if ( config.linkedTypes.length === 1 ) {
         let lt0Type = config.linkedTypes[0].type;
         let lt0Name = config.linkedTypes[0].name;
         let typeName1 = typeName + lt0Type + lt0Name;
         return UUIDGen.generate( typeName1 );
      } else if ( config.linkedTypes.length === 2 ) {
         let lt0Type = config.linkedTypes[0].type;
         let lt0Name = config.linkedTypes[0].name;
         let lt1Type = config.linkedTypes[1].type;
         let lt1Name = config.linkedTypes[1].name;
         let typeName2 = typeName + lt0Type + lt0Name + lt1Type + lt1Name;
         return UUIDGen.generate( typeName2 );
      }
   }

   throw new Error( "You must either, 'displayName' and or 'name' per accessory." );
}

module.exports = getAccessoryUUID;
