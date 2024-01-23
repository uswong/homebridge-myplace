'use strict';

// Description:
//    Routines to convert Cmd5 values to constants and back.
//
// @param CMD5_ACC_TYPE_ENUM - Just that
// @param accTypeEnumIndex - The Accessory Type Enumerated index.
// @param constantString - The string to change into a HAP value.
// @param constantValue - The value to change into a HAP String.
//
// @returns Value of transposition or nothing.
//

var extractKeyValue = function( obj, value )
{
   for ( let key in obj )
   {
      // In case value given is a string, compare that as well.
      if ( obj[ key ] == value || obj[ key ] + "" == value )
         return key;
   }
   return undefined;
}

// Used to convet ValidValus from a Constant to their corresponding value.
var transposeConstantToValidValue = function ( CMD5_ENUM_properties_obj, accTypeEnumIndex, constantString )
{
   if ( Object.keys( CMD5_ENUM_properties_obj[ accTypeEnumIndex ].validValues ).length <= 0 )
   {
      // Return the original as it should be used instead of nothing
      // This is not a failure
      //return { "value": constantString, "rc": true, "msg": `Non Convertible characteristic ${ constantString } for ${ CMD5_ENUM_properties_obj[ accTypeEnumIndex ].type }` };
      return constantString;
   }

   // In case constantString is not a string, ie false
   let lookupString = "" + constantString;
   let ucConstantString = lookupString.toUpperCase();

   if ( Object.prototype.hasOwnProperty.call( CMD5_ENUM_properties_obj[ accTypeEnumIndex ].validValues, ucConstantString ) )
   {
      // let value = CMD5_ENUM_properties_obj[ accTypeEnumIndex ].validValues[ ucConstantString ];
      return CMD5_ENUM_properties_obj[ accTypeEnumIndex ].validValues[ ucConstantString ];

      //return { "value": value, "rc": true, "msg": "Transpose success" };
   }

   // What if it is already transposed correctly?
   // let constant = extractKeyValue( CMD5_ENUM_properties_obj[ accTypeEnumIndex ].validValues, constantString );
   // if ( constant == undefined || constant == null )
   //     return { "value": constantString, "rc": false, "msg": `Cannot convert ${ constantString } to a value for ${ CMD5_ENUM_properties_obj[ accTypeEnumIndex ].type }` };
   //else
   //   return { "value": constantString, "rc": true, "msg": "Already transposed" };
   return constantString;
}

// Used to convet ValidValues Value to its corresponding Constant.
var transposeValueToValidConstant = function ( CMD5_ENUM_properties_obj, accTypeEnumIndex, valueString )
{
   if ( Object.keys( CMD5_ENUM_properties_obj[ accTypeEnumIndex ].validValues ).length <= 0)
   {
      // Return the original as it should be used instead of nothing
      // This is not a failure
      //return { "value": valueString, "rc": true, "msg": `Non Convertible characteristic ${ valueString } for ${ CMD5_ENUM_properties_obj[ accTypeEnumIndex ].type }` };
      return valueString;
   }

   let constant = extractKeyValue( CMD5_ENUM_properties_obj[ accTypeEnumIndex ].validValues, valueString );

   if ( constant == undefined || constant == null )
   {
      // What if it is already transposed correctly?
      //let value = CMD5_ENUM_properties_obj[ accTypeEnumIndex ].validValues[ valueString ];
      //if ( value == undefined || value == null )
      //   return { "value": valueString, "rc": false, "msg": `Cannot convert ${ valueString } to a constant for ${ CMD5_ENUM_properties_obj[ accTypeEnumIndex ].type }` };
      //else
      //   return { "value": valueString, "rc": true, "msg": "Already transposed" };

      return valueString;
   }

   // return { "value": constant, "rc": true, "msg": "Transpose success" };
   return constant;
}

// SendValue does not send true/false for historical reasons
var transposeBoolToValue  = function ( valueString )
{
   if ( valueString == true )
      return 1;
   if ( valueString == false )
      return 0;

   return valueString;
}

module.exports = {
   transposeConstantToValidValue,
   transposeValueToValidConstant,
   transposeBoolToValue,
   extractKeyValue
};
