'use strict';

const constants = require( "../cmd5Constants" );


// The sObject.defineProperty is to resolve a lint issue.
// See utils/Cmd5indexOfEnumLintTest.js for further information.
let Cmd5indexOfEnum = require( "../utils/Cmd5indexOfEnum" );
Object.defineProperty( exports, "Cmd5indexOfEnum", { enumerable: true, get: function ( ){ return Cmd5indexOfEnum.Cmd5indexOfEnum; } });



var CMD5_DEVICE_TYPE_ENUM =
{
   AccessControl:                       0,
   AccessoryRuntimeInformation:         1,
   AccessoryInformation:                2,
   AirPurifier:                         3,
   AirQualitySensor:                    4,
   BatteryService:                      5,
   BridgeConfiguration:                 6,
   BridgingState:                       7,
   CamaeraEventRecordingManagement:     8,
   CameraControl:                       9,
   CameraRTPStreamManagement:           10,
   CameraOperatingMode:                 11,
   CarbonDioxideSensor:                 12,
   CarbonMonoxideSensor:                13,
   ContactSensor:                       14,
   Diagnostics:                         15,
   Door:                                16,
   DoorBell:                            17,
   Fan:                                 18,
   Fanv1:                               19,
   Fanv2:                               20,
   Faucet:                              21,
   FilterMaintenance:                   22,
   GarageDoorOpener:                    23,
   HeaterCooler:                        24,
   HumidifierDehumidifier:              25,
   HumiditySensor:                      26,
   InputSource:                         27,
   IrrigationSystem:                    28,
   LeakSensor:                          29,
   LightSensor:                         30,
   Lightbulb:                           31,
   LockManagement:                      32,
   LockMechanism:                       33,
   Microphone:                          34,
   MotionSensor:                        35,
   OccupancySensor:                     36,
   Outlet:                              37,
   Pairing:                             38,
   PowerManagement:                     39,
   ProtocolInformation:                 40,
   Relay:                               41,
   SecuritySystem:                      42,
   ServiceLabel:                        43,
   Siri:                                44,
   Slats:                               45,
   SmartSpeaker:                        46,
   SmokeSensor:                         47,
   Speaker:                             48,
   StatefulProgrammableSwitch:          49,
   StatelessProgrammableSwitch:         50,
   Switch:                              51,
   TargetControl:                       52,
   TargetControlManagement:             53,
   Television:                          54,
   TelevisionSpeaker:                   55,
   TemperatureSensor:                   56,
   Thermostat:                          57,
   TimeInformation:                     58,
   TransferTransportManagement:         59,
   Tunnel:                              60,
   Valve:                               61,
   WiFiRouter:                          62,
   WiFiSatellite:                       63,
   Window:                              64,
   WindowCovering:                      65,
   AccessoryMetrics:                    66,
   AssetUpdate:                         67,
   Assistant:                           68,
   AudioStreamManagement:               69,
   Battery:                             70,
   CameraRecordingManagement:           71,
   CloudRelay:                          72,
   DataStreamTransportManagement:       73,
   NFCAccess:                           74,
   SiriEndpoint:                        75,
   ThreadTransport:                     76,

   // New Mar 2024
   AccessCode:                          77,
   FirmwareUpdate:                      78,
   TapManagement:                       79,
   WiFiTransport:                       80,

   EOL:                                 81,

   properties:{},

   devEnumIndexToC: function( index )
   {
      return CMD5_DEVICE_TYPE_ENUM.properties[ index ].deviceName;
   },

   Cmd5indexOfEnum: function( deviceName )
   {
      return CMD5_DEVICE_TYPE_ENUM.properties.Cmd5indexOfEnum( i => i.deviceName === deviceName );
   },


};

// Export both the init function and the uninitialized data for unit testing
module.exports =
{
   init: function ( CMD5_ACC_TYPE_ENUM, Service, Characteristic, Categories )
   {
      // Fill in the properties of each device (Must be done at runtime)
      CMD5_DEVICE_TYPE_ENUM.properties =
      {
         0:  { deviceName:'AccessControl',
               deprecated: false,
               UUID: "000000DA-0000-1000-8000-0026BB765291",
               service: Service.AccessControl,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.AccessControlLevel,
                     defaultValue:   0,        // min 0, max 2
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.PasswordSetting
                  ],
               defaultPollingCharacteristics:
                  []
             },
         1:  { deviceName:'AccessoryRuntimeInformation',
               deprecated: false,
               UUID: "00000239-0000-1000-8000-0026BB765291",
               service: Service.AccessoryRuntimeInformation,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Ping,
                     defaultValue:   0,        // Type is DATA, therefore Who Knows
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.ActivityInterval,
                    CMD5_ACC_TYPE_ENUM.HeartBeat,
                    CMD5_ACC_TYPE_ENUM.SleepInterval
                  ],
               defaultPollingCharacteristics:
                  []
             },
         2:  { deviceName:'AccessoryInformation',
               deprecated: false,
               UUID: "0000003E-0000-1000-8000-0026BB765291",
               service: Service.AccessoryInformation,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Identify,
                     defaultValue:   1,                             // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Manufacturer,
                     defaultValue:   'Cmd5',                       // Format: String
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Model,
                     defaultValue:   'Model',                      // Format: String
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Name,
                     defaultValue:   'My_AccessoryInformation',
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SerialNumber,
                     defaultValue:   'ABC001',                   // Format: String
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.FirmwareRevision,
                     defaultValue:   '100.1.1',                 // Format: String
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.HardwareRevision,
                    CMD5_ACC_TYPE_ENUM.AccessoryFlags
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Identify
                  ]
             },
         3:  { deviceName:'AirPurifier',
               deprecated: false,
               UUID: "000000BB-0000-1000-8000-0026BB765291",
               service: Service.AirPurifier,
               defaultCategory: Categories.AIR_PURIFIER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.SLOW_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.CurrentAirPurifierState,
                     defaultValue:   Characteristic.CurrentAirPurifierState.PURIFYING_AIR,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetAirPurifierState ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetAirPurifierState,
                     defaultValue:   Characteristic.TargetAirPurifierState.AUTO,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentAirPurifierState ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.LockPhysicalControls,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.SwingMode,
                    CMD5_ACC_TYPE_ENUM.RotationSpeed
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active
                  ]
             },
         4:  { deviceName:'AirQualitySensor',
               deprecated: false,
               UUID: "0000008D-0000-1000-8000-0026BB765291",
               service: Service.AirQualitySensor,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.FAST_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.AirQuality,
                     defaultValue:   Characteristic.AirQuality.GOOD,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusTampered,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.OzoneDensity,
                    CMD5_ACC_TYPE_ENUM.NitrogenDioxideDensity,
                    CMD5_ACC_TYPE_ENUM.SulphurDioxideDensity,
                    CMD5_ACC_TYPE_ENUM.PM2_5Density,
                    CMD5_ACC_TYPE_ENUM.PM10Density,
                    CMD5_ACC_TYPE_ENUM.VOCDensity,
                    CMD5_ACC_TYPE_ENUM.CarbonMonoxideLevel,
                    CMD5_ACC_TYPE_ENUM.CarbonDioxideLevel
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.AirQuality
                  ]
             },
         5:  { deviceName:'BatteryService',  // Use Battery instead
               deprecated: true,
               UUID: "00000096-0000-1000-8000-0026BB765291",
               //service: Service.Battery,
               service: null,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ //{type:           CMD5_ACC_TYPE_ENUM.BatteryLevel,
                    // defaultValue:   50,                             // Range 0-100
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.ChargingState,
                    // defaultValue:   Characteristic.ChargingState.NOT_CHARGING,
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    // defaultValue:   Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //}
                  ],
               optionalCharacteristics:
                  [ //CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ //CMD5_ACC_TYPE_ENUM.StatusLowBattery
                  ]
             },
         // @deprecated Removed and not used anymore as of homebridge v2
         6:  { deviceName:'BridgeConfiguration',
               deprecated: true,
               UUID: "000000A1-0000-1000-8000-0026BB765291",
               // service: Service.BridgeConfiguration,
               service: null,
               // defaultCategory: Categories.BRIDGE,
               defaultCategory: null,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [
                    //{type:           CMD5_ACC_TYPE_ENUM.ConfigureBridgedAccessoryStatus,
                    // defaultValue:   0,                              // Format: TLV8
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //}
                  ],
               optionalCharacteristics:
                  [
                    //CMD5_ACC_TYPE_ENUM.ConfigureBridgedAccessoryStatus,
                    //CMD5_ACC_TYPE_ENUM.DiscoverBridgedAccessories,
                    //CMD5_ACC_TYPE_ENUM.DiscoveredBridgedAccessories,
                    //CMD5_ACC_TYPE_ENUM.ConfigureBridgedAccessory
                  ],
               defaultPollingCharacteristics:
                  [
                    //CMD5_ACC_TYPE_ENUM.ConfigureBridgedAccessoryStatus
                  ]
             },
         // @deprecated Removed and not used anymore as of homebridge v2
         7:  { deviceName:'BridgingState',
               deprecated: true,
               UUID: "00000062-0000-1000-8000-0026BB765291",
               // @deprecated Removed and not used anymore as of homebridge v2
               // service: Service.BridgingState,
               service: null,
               // defaultCategory: Categories.BRIDGE,
               defaultCategory: null,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [
                    //{type:           CMD5_ACC_TYPE_ENUM.Reachable,
                    // defaultValue:   1,                           // Format: Bool
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.LinkQuality,
                    // defaultValue:   1,                              // Format: Uint8
                                                                     // Range: 1-4, Step: 1
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.AccessoryIdentifier,
                    // defaultValue:   "id999",                        // Format: String
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.Category,
                    // defaultValue:   16,                             // Format: Uint16
                                                                     // Range: 1-16, Step 1
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //}
                  ],
               optionalCharacteristics:
                  [
                    //CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [
                    //CMD5_ACC_TYPE_ENUM.Reachable
                  ]
             },
         8:  { deviceName:'CameraEventRecordingManagement', // Use CameraRecordingManagement
               deprecated: true,
               UUID: "00000204-0000-1000-8000-0026BB765291",
               //service: Service.CameraRecordingManagement,
               service: null,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ //{type:           CMD5_ACC_TYPE_ENUM.Active,
                    // defaultValue:   Characteristic.Active.ACTIVE,
                    // relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                    // relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.SupportedCameraRecordingConfiguration,
                    // defaultValue:   0,                              // Format: TLV8
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.SupportedVideoRecordingConfiguration,
                    // defaultValue:   0,                              // Format: TLV8
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.SupportedAudioRecordingConfiguration,
                    // defaultValue:   0,                              // Format: TLV8
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.SelectedCameraRecordingConfiguration,
                    // defaultValue:   0,                              // Format: TLV8
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                  ],
               optionalCharacteristics:
                  [ //CMD5_ACC_TYPE_ENUM.RecordingAudioActive
                  ],
               defaultPollingCharacteristics:
                  [ //CMD5_ACC_TYPE_ENUM.Active
                  ]
             },
         // @deprecated Removed and not used anymore as of homebridge v2
         9:  { deviceName:'CameraControl',
               deprecated: true,
               UUID: "00000111-0000-1000-8000-0026BB765291",
               // service: Service.CameraControl,
               service: null,
               //defaultCategory: Categories.OTHER,
               defaultCategory: null,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [
                    //{type:           CMD5_ACC_TYPE_ENUM.On,
                    // defaultValue:   1,                           // Format: Bool
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //}
                  ],
               optionalCharacteristics:
                  [
                    //CMD5_ACC_TYPE_ENUM.CurrentHorizontalTiltAngle,
                    //CMD5_ACC_TYPE_ENUM.CurrentVerticalTiltAngle,
                    //CMD5_ACC_TYPE_ENUM.TargetHorizontalTiltAngle,
                    //CMD5_ACC_TYPE_ENUM.TargetVerticalTiltAngle,
                    //CMD5_ACC_TYPE_ENUM.NightVision,
                    //CMD5_ACC_TYPE_ENUM.OpticalZoom,
                    //CMD5_ACC_TYPE_ENUM.DigitalZoom,
                    //CMD5_ACC_TYPE_ENUM.ImageRotation,
                    //CMD5_ACC_TYPE_ENUM.ImageMirroring,
                    //CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [
                    //CMD5_ACC_TYPE_ENUM.On
                  ]
             },
         10: { deviceName:'CameraRTPStreamManagement',
               deprecated: false,
               UUID: "00000110-0000-1000-8000-0026BB765291",
               service: Service.CameraRTPStreamManagement,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.SupportedVideoStreamConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SupportedAudioStreamConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SupportedRTPConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SelectedRTPStreamConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.StreamingStatus,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SetupEndpoints,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [
                  ]
             },
         11: { deviceName:'CameraOperatingMode',
               deprecated: false,
               UUID: "0000021A-0000-1000-8000-0026BB765291",
               service: Service.CameraOperatingMode,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.EventSnapshotsActive,
                     defaultValue:   Characteristic.EventSnapshotsActive.DISABLE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.HomeKitCameraActive,
                     defaultValue:   Characteristic.HomeKitCameraActive.OFF,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CameraOperatingModeIndicator,
                    CMD5_ACC_TYPE_ENUM.ManuallyDisabled,
                    CMD5_ACC_TYPE_ENUM.NightVision,
                    CMD5_ACC_TYPE_ENUM.PeriodicSnapshotsActive,
                    CMD5_ACC_TYPE_ENUM.ThirdPartyCameraActive,
                    CMD5_ACC_TYPE_ENUM.DiagonalFieldOfView
                  ],
               defaultPollingCharacteristics:
                  []
             },
         12: { deviceName:'CarbonDioxideSensor',
               deprecated: false,
               UUID: "00000097-0000-1000-8000-0026BB765291",
               service: Service.CarbonDioxideSensor,
               defaultCategory: Categories.SENSOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CarbonDioxideDetected,
                     defaultValue:   Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.StatusTampered,
                    CMD5_ACC_TYPE_ENUM.CarbonDioxideLevel,
                    CMD5_ACC_TYPE_ENUM.CarbonDioxidePeakLevel,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CarbonDioxideDetected
                  ]
             },
         13: { deviceName:'CarbonMonoxideSensor',
               deprecated: false,
               UUID: "0000007F-0000-1000-8000-0026BB765291",
               service: Service.CarbonMonoxideSensor,
               defaultCategory: Categories.SENSOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CarbonMonoxideDetected,
                     defaultValue:   Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.StatusTampered,
                    CMD5_ACC_TYPE_ENUM.CarbonMonoxideLevel,
                    CMD5_ACC_TYPE_ENUM.CarbonMonoxidePeakLevel,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CarbonMonoxideDetected
                  ]
             },
         14: { deviceName:'ContactSensor',
               deprecated: false,
               UUID: "00000080-0000-1000-8000-0026BB765291",
               service: Service.ContactSensor,
               defaultCategory: Categories.SENSOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.ContactSensorState,
                     defaultValue:   Characteristic.ContactSensorState.CONTACT_NOT_DETECTED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusTampered,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.ContactSensorState
                  ]
             },
         15: { deviceName:'Diagnostics',
               deprecated: false,
               UUID: "00000237-0000-1000-8000-0026BB765291",
               service: Service.Diagnostics,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.SupportedDiagnosticsSnapshot,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  []
             },
         16: { deviceName:'Door',
               deprecated: false,
               UUID: "00000081-0000-1000-8000-0026BB765291",
               service: Service.Door,
               defaultCategory: Categories.DOOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentPosition,
                     defaultValue:   0,                            // Range 0 - 100
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetPosition ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.PositionState,
                     defaultValue:   Characteristic.PositionState.STOPPED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetPosition,
                     defaultValue:   0,                              // Range 0 - 100
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentPosition ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.HoldPosition,
                    CMD5_ACC_TYPE_ENUM.ObstructionDetected,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentPosition,
                    CMD5_ACC_TYPE_ENUM.TargetPosition
                  ]
             },
         17: { deviceName:'DoorBell',
               deprecated: false,
               UUID: "00000121-0000-1000-8000-0026BB765291",
               service: Service.Doorbell,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.ProgrammableSwitchEvent,
                     defaultValue:   Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Brightness,
                    CMD5_ACC_TYPE_ENUM.Mute,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.Volume,
                    CMD5_ACC_TYPE_ENUM.OperatingStateResponse
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.ProgrammableSwitchEvent
                  ]
             },
         18: { deviceName:'Fan',
               deprecated: false,
               UUID: "00000040-0000-1000-8000-0026BB765291",
               service: Service.Fan,
               defaultCategory: Categories.FAN,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.On,
                     defaultValue:   0,                          // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.RotationDirection,
                    CMD5_ACC_TYPE_ENUM.RotationSpeed,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.On
                  ]
             },
         19: { deviceName:'Fanv1',
               deprecated: false,
               UUID: "00000040-0000-1000-8000-0026BB765291",
               service: Service.Fan,
               defaultCategory: Categories.FAN,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.On,
                     defaultValue:   0,                          // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.RotationDirection,
                    CMD5_ACC_TYPE_ENUM.RotationSpeed,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.On
                  ]
             },
         20: { deviceName:'Fanv2',
               deprecated: false,
               UUID: "000000B7-0000-1000-8000-0026BB765291",
               service: Service.Fanv2,
               defaultCategory: Categories.FAN,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentFanState,
                    CMD5_ACC_TYPE_ENUM.TargetFanState,
                    CMD5_ACC_TYPE_ENUM.LockPhysicalControls,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.RotationDirection,
                    CMD5_ACC_TYPE_ENUM.RotationSpeed,
                    CMD5_ACC_TYPE_ENUM.SwingMode
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active
                  ]
             },
         21: { deviceName:'Faucet',
               deprecated: false,
               UUID: "000000D7-0000-1000-8000-0026BB765291",
               service: Service.Faucet,
               defaultCategory: Categories.FAUCET,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.StatusFault
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active
                  ]
             },
         22: { deviceName:'FilterMaintenance',
               deprecated: false,
               UUID: "000000BA-0000-1000-8000-0026BB765291",
               service: Service.FilterMaintenance,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.FilterChangeIndication,
                     defaultValue:   Characteristic.FilterChangeIndication.FILTER_OK,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.FilterLifeLevel,
                    CMD5_ACC_TYPE_ENUM.ResetFilterIndication,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.FilterChangeIndication
                  ]
             },
         23: { deviceName:'GarageDoorOpener',
               deprecated: false,
               UUID: "00000041-0000-1000-8000-0026BB765291",
               service: Service.GarageDoorOpener,
               defaultCategory: Categories.GARAGE_DOOR_OPENER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.SLOW_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentDoorState,
                     defaultValue:   Characteristic.CurrentDoorState.OPEN,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetDoorState ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetDoorState,
                     defaultValue:   Characteristic.TargetDoorState.OPEN,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentDoorState ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ObstructionDetected,
                     defaultValue:   1,                           // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.LockCurrentState,
                    CMD5_ACC_TYPE_ENUM.LockTargetState,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentDoorState,
                    CMD5_ACC_TYPE_ENUM.TargetDoorState
                  ]
             },
         24: { deviceName:'HeaterCooler',
               deprecated: false,
               UUID: "000000BC-0000-1000-8000-0026BB765291",
               service: Service.HeaterCooler,
               defaultCategory: Categories.AIR_HEATER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.CurrentHeaterCoolerState,
                     defaultValue:   Characteristic.CurrentHeaterCoolerState.INACTIVE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetHeaterCoolerState ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetHeaterCoolerState,
                     defaultValue:   Characteristic.TargetHeaterCoolerState.HEAT,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentHeaterCoolerState ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.CurrentTemperature,
                     defaultValue:   25.0,                           // Range:  0 - 100, Step: 0.1
                                                                     // Format: float
                                                                     // Units:  CELSIUS
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.LockPhysicalControls,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.RotationSpeed,
                    CMD5_ACC_TYPE_ENUM.SwingMode,
                    CMD5_ACC_TYPE_ENUM.CoolingThresholdTemperature,
                    CMD5_ACC_TYPE_ENUM.HeatingThresholdTemperature,
                    CMD5_ACC_TYPE_ENUM.TemperatureDisplayUnits
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active
                  ]
             },
         25: { deviceName:'HumidifierDehumidifier',
               deprecated: false,
               UUID: "000000BD-0000-1000-8000-0026BB765291",
               service: Service.HumidifierDehumidifier,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentRelativeHumidity,
                     defaultValue:   60,                             // Range:  0 - 100, Step: 1
                                                                     // Format: float
                                                                     // Units:  CELSIUS
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.CurrentHumidifierDehumidifierState,
                     defaultValue:   Characteristic.CurrentHumidifierDehumidifierState.IDLE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetHumidifierDehumidifierState ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetHumidifierDehumidifierState,
                     defaultValue:   Characteristic.TargetHumidifierDehumidifierState.DEHUMIDIFIER,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentHumidifierDehumidifierState ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.LockPhysicalControls,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.RelativeHumidityDehumidifierThreshold,
                    CMD5_ACC_TYPE_ENUM.RelativeHumidityHumidifierThreshold,
                    CMD5_ACC_TYPE_ENUM.RotationSpeed,
                    CMD5_ACC_TYPE_ENUM.SwingMode,
                    CMD5_ACC_TYPE_ENUM.WaterLevel
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active
                  ]
             },
         26: { deviceName:'HumiditySensor',
               deprecated: false,
               UUID: "00000082-0000-1000-8000-0026BB765291",
               service: Service.HumiditySensor,
               defaultCategory: Categories.SENSOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentRelativeHumidity,
                     defaultValue:   60,                             // Range:  0 - 100, Step: 1
                                                                     // Format: float
                                                                     // Units:  CELSIUS
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusTampered,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentRelativeHumidity
                  ]
             },
         27: { deviceName:'InputSource',
               deprecated: false,
               UUID: "000000D9-0000-1000-8000-0026BB765291",
               service: Service.InputSource,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.ConfiguredName,
                     defaultValue:   "My_InputSource",               // Format: String
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.InputSourceType,
                     defaultValue:   Characteristic.InputSourceType.HOME_SCREEN,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.IsConfigured,
                     defaultValue:   Characteristic.IsConfigured.CONFIGURED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.CurrentVisibilityState,
                     defaultValue:   Characteristic.CurrentVisibilityState.SHOWN,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Identifier,
                    CMD5_ACC_TYPE_ENUM.InputDeviceType,
                    CMD5_ACC_TYPE_ENUM.TargetVisibilityState,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentVisibilityState
                  ]
             },
         28: { deviceName:'IrrigationSystem',
               deprecated: false,
               UUID: "000000CF-0000-1000-8000-0026BB765291",
               service: Service.IrrigationSystem,
               defaultCategory: Categories.SPRINKLER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ProgramMode,
                      defaultValue:  Characteristic.ProgramMode.NO_PROGRAM_SCHEDULED ,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.InUse,
                     defaultValue:   Characteristic.InUse.IN_USE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.RemainingDuration,
                    CMD5_ACC_TYPE_ENUM.StatusFault
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active
                  ]
             },
         29: { deviceName:'LeakSensor',
               deprecated: false,
               UUID: "00000083-0000-1000-8000-0026BB765291",
               service: Service.LeakSensor,
               defaultCategory: Categories.SENSOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.LeakDetected,
                     defaultValue:   Characteristic.LeakDetected.LEAK_NOT_DETECTED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusTampered,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.LeakDetected
                  ]
             },
         30: { deviceName:'LightSensor',
               deprecated: false,
               UUID: "00000084-0000-1000-8000-0026BB765291",
               service: Service.LightSensor,
               defaultCategory: Categories.SENSOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentAmbientLightLevel,
                     defaultValue:   1,                              // Range:  0.0001 - 100000
                                                                     // Format: float
                                                                     // Units:  lux
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusTampered,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentAmbientLightLevel
                  ]
             },
         31: { deviceName:'Lightbulb',
               deprecated: false,
               UUID: "00000043-0000-1000-8000-0026BB765291",
               service: Service.Lightbulb,
               defaultCategory: Categories.LIGHTBULB,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.On,
                     defaultValue:   0,                          // Format: float
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Brightness,
                    CMD5_ACC_TYPE_ENUM.Hue,
                    CMD5_ACC_TYPE_ENUM.Saturation,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.ColorTemperature
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.On
                  ]
             },
         32: { deviceName:'LockManagement',
               deprecated: false,
               UUID: "00000044-0000-1000-8000-0026BB765291",
               service: Service.LockManagement,
               defaultCategory: Categories.ALARM_SYSTEM,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.LockControlPoint,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Version,
                     defaultValue:   '0.0.0',                        // Format: String
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [
                    CMD5_ACC_TYPE_ENUM.AdministratorOnlyAccess,
                    CMD5_ACC_TYPE_ENUM.AudioFeedback,
                    CMD5_ACC_TYPE_ENUM.CurrentDoorState,
                    CMD5_ACC_TYPE_ENUM.LockManagementAutoSecurityTimeout,
                    CMD5_ACC_TYPE_ENUM.LockLastKnownAction,
                    CMD5_ACC_TYPE_ENUM.Logs,
                    CMD5_ACC_TYPE_ENUM.MotionDetected,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [
                  ]
             },
         33: { deviceName:'LockMechanism',
               deprecated: false,
               UUID: "00000045-0000-1000-8000-0026BB765291",
               service: Service.LockMechanism,
               defaultCategory: Categories.DOOR_LOCK,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.LockCurrentState,
                     defaultValue:   Characteristic.LockCurrentState.UNSECURED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.LockTargetState ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.LockTargetState,
                     defaultValue:   Characteristic.LockTargetState.UNSECURED,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.LockCurrentState ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.LockCurrentState,
                    CMD5_ACC_TYPE_ENUM.LockTargetState
                  ]
             },
         34: { deviceName:'Microphone',
               deprecated: false,
               UUID: "00000112-0000-1000-8000-0026BB765291",
               service: Service.Microphone,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Mute,
                     defaultValue:   0,                          // Format: Bool,
                                                                 // 0 - Mute is off
                                                                 // 1 - Mute is on
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Volume,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Mute
                  ]
             },
         35: { deviceName:'MotionSensor',
               deprecated: false,
               UUID: "00000085-0000-1000-8000-0026BB765291",
               service: Service.MotionSensor,
               defaultCategory: Categories.SENSOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.MotionDetected,
                     defaultValue:   1,                           // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.StatusTampered
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.MotionDetected
                  ]
             },
         36: { deviceName:'OccupancySensor',
               deprecated: false,
               UUID: "00000086-0000-1000-8000-0026BB765291",
               service: Service.OccupancySensor,
               defaultCategory: Categories.SENSOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.OccupancyDetected,
                     defaultValue:   Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusTampered,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.OccupancyDetected
                  ]
             },
         37: { deviceName:'Outlet',
               deprecated: false,
               UUID: "00000047-0000-1000-8000-0026BB765291",
               service: Service.Outlet,
               defaultCategory: Categories.OUTLET,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.On,
                     defaultValue:   0,                          // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.OutletInUse,
                     defaultValue:   0,                          // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.On
                  ]
             },
         38: { deviceName:'Pairing',
               deprecated: false,
               UUID: "00000055-0000-1000-8000-0026BB765291",
               service: Service.Pairing,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.ListPairings,
                     defaultValue:   1,                              // Format: Uint8. Values ???
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.PairSetup,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.PairVerify,
                     defaultValue:   0,                              // Format: Uint8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.PairingFeatures,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.PairingFeatures
                  ]
             },
         39: { deviceName:'PowerManagement',
               deprecated: false,
               UUID: "00000221-0000-1000-8000-0026BB765291",
               service: Service.PowerManagement,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.WakeConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  []
             },
         40: { deviceName:'ProtocolInformation',
               deprecated: false,
               UUID: "000000A2-0000-1000-8000-0026BB765291",
               service: Service.ProtocolInformation,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Version,
                     defaultValue:   '1.2.3',                      // Format: String
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Version
                  ]
             },
         41: { deviceName:'Relay', // Use CloudRelay
               deprecated: true,
               UUID: "0000005A-0000-1000-8000-0026BB765291",
               //service: Service.CloudRelay,
               service: null ,
               defaultCategory: Categories.SWITCH,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ //{type:           CMD5_ACC_TYPE_ENUM.RelayEnabled,
                    // defaultValue:   1,                           // Format: Bool
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.RelayState,
                    // defaultValue:   1,                              // Format: uint8, Values ???
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.RelayControlPoint,
                    // defaultValue:   0,                              // Format: TLV8
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //}
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  [ //CMD5_ACC_TYPE_ENUM.RelayEnabled,
                    //CMD5_ACC_TYPE_ENUM.RelayState,
                  ]
             },
         42: { deviceName:'SecuritySystem',
               deprecated: false,
               UUID: "0000007E-0000-1000-8000-0026BB765291",
               service: Service.SecuritySystem,
               defaultCategory: Categories.SECURITY_SYSTEM,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.SecuritySystemCurrentState,
                     defaultValue:   Characteristic.SecuritySystemCurrentState.DISARMED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.SecuritySystemTargetState ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SecuritySystemTargetState,
                     defaultValue:   Characteristic.SecuritySystemTargetState.DISARM,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.SecuritySystemCurrentState ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.SecuritySystemAlarmType,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusTampered
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.SecuritySystemCurrentState,
                    CMD5_ACC_TYPE_ENUM.SecuritySystemTargetState
                  ]
             },
         43: { deviceName:'ServiceLabel',
               deprecated: false,
               UUID: "000000CC-0000-1000-8000-0026BB765291",
               service: Service.ServiceLabel,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.ServiceLabelNamespace,
                     defaultValue:   Characteristic.ServiceLabelNamespace.DOTS,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.ServiceLabelNamespace
                  ]
             },
         44: { deviceName:'Siri',
               deprecated: false,
               UUID: "00000133-0000-1000-8000-0026BB765291",
               service: Service.Siri,
               defaultCategory: Categories.HOMEPOD,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.SiriInputType,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.MultifunctionButton,
                    CMD5_ACC_TYPE_ENUM.SiriEnable,
                    CMD5_ACC_TYPE_ENUM.SiriEngineVersion,
                    CMD5_ACC_TYPE_ENUM.SiriLightOnUse,
                    CMD5_ACC_TYPE_ENUM.SiriListening,
                    CMD5_ACC_TYPE_ENUM.SiriTouchToUse
                  ],
               defaultPollingCharacteristics:
                  []
             },
         45: { deviceName:'Slats',
               deprecated: false,
               UUID: "000000B9-0000-1000-8000-0026BB765291",
               service: Service.Slats,
               defaultCategory: Categories.WINDOW_COVERING,
               publishExternally: false,
               devicesStateChangeDefaultTimeb: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [
                    {type:           CMD5_ACC_TYPE_ENUM.CurrentSlatState,
                     defaultValue:   Characteristic.CurrentSlatState.FIXED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SlatType,
                     defaultValue:   Characteristic.SlatType.HORIZONTAL,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.SwingMode,
                    CMD5_ACC_TYPE_ENUM.CurrentTiltAngle,
                    CMD5_ACC_TYPE_ENUM.TargetTiltAngle
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentSlatState
                  ]
             },
         46: { deviceName:'SmartSpeaker',
               deprecated: false,
               UUID: "00000228-0000-1000-8000-0026BB765291",
               service: Service.SmartSpeaker,
               defaultCategory: Categories.HOMEPOD,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentMediaState,
                     defaultValue:   Characteristic.CurrentMediaState.STOP,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetMediaState ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetMediaState,
                     defaultValue:   Characteristic.CurrentMediaState.STOP,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentMediaState ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.AirPlayEnable,
                    CMD5_ACC_TYPE_ENUM.ConfiguredName,
                    CMD5_ACC_TYPE_ENUM.Mute,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.Volume
                  ],
               defaultPollingCharacteristics:
                  []
             },
         47: { deviceName:'SmokeSensor',
               deprecated: false,
               UUID: "00000087-0000-1000-8000-0026BB765291",
               service: Service.SmokeSensor,
               defaultCategory: Categories.SENSOR,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.SmokeDetected,
                     defaultValue:   Characteristic.SmokeDetected.SMOKE_NOT_DETECTED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.StatusTampered
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.SmokeDetected
                  ]
             },
         48: { deviceName:'Speaker',
               deprecated: false,
               UUID: "00000113-0000-1000-8000-0026BB765291",
               service: Service.Speaker,
               defaultCategory: Categories.SPEAKER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Mute,
                     defaultValue:   0,                           // Format: Bool
                                                                  // 0 - Mute is off
                                                                  // 1 - Mute is on
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active,
                    CMD5_ACC_TYPE_ENUM.Volume,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Mute
                  ]
             },
         49: { deviceName:'StatefulProgrammableSwitch',
               deprecated: false,
               UUID: "00000088-0000-1000-8000-0026BB765291",
               service: Service.StatefulProgrammableSwitch,
               defaultCategory: Categories.SWITCH,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.ProgrammableSwitchEvent,
                     defaultValue:   Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ProgrammableSwitchOutputState,
                     defaultValue:   0,                              // Range: 0 - 1. Step: 1
                                                                     // Format: Uint8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.ProgrammableSwitchEvent
                  ]
             },
         50: { deviceName:'StatelessProgrammableSwitch',
               deprecated: false,
               UUID: "00000089-0000-1000-8000-0026BB765291",
               service: Service.StatelessProgrammableSwitch,
               defaultCategory: Categories.SWITCH,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.ProgrammableSwitchEvent,
                     defaultValue:   Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.ServiceLabelIndex
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.ProgrammableSwitchEvent
                  ]
             },
         51: { deviceName:'Switch',
               deprecated: false,
               UUID: "00000049-0000-1000-8000-0026BB765291",
               service: Service.Switch,
               defaultCategory: Categories.SWITCH,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.FAST_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.On,
                     defaultValue:   0,                          // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.On
                  ]
             },
         52: { deviceName:'TargetControl',
               deprecated: false,
               UUID: "00000125-0000-1000-8000-0026BB765291",
               service: Service.TargetControl,
               defaultCategory: Categories.TARGET_CONTROLLER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [
                    {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ActiveIdentifier,
                     defaultValue:   7,                              // Format: UINT32
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ButtonEvent,
                     defaultValue:   0,     // TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  []
             },
         53: { deviceName:'TargetControlManagement',
               deprecated: false,
               UUID: "00000122-0000-1000-8000-0026BB765291",
               service: Service.TargetControlManagement,
               defaultCategory: Categories.TARGET_CONTROLLER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.TargetControlSupportedConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetControlList,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ] 
                    }
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  []
             },
         54: { deviceName:'Television',
               deprecated: false,
               UUID: "000000D8-0000-1000-8000-0026BB765291",
               service: Service.Television,
               defaultCategory: Categories.TELEVISION,
               publishExternally: true,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ActiveIdentifier,
                     defaultValue:   123,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },                                              // Format: Uint32
                    {type:           CMD5_ACC_TYPE_ENUM.ConfiguredName,
                     defaultValue:   'My_Tv',
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },                                              // Format: String
                    {type:           CMD5_ACC_TYPE_ENUM.RemoteKey,
                     defaultValue:   Characteristic.RemoteKey.SELECT,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },                                             // Format: uint8
                    {type:           CMD5_ACC_TYPE_ENUM.SleepDiscoveryMode,
                     defaultValue:   Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Brightness,
                    CMD5_ACC_TYPE_ENUM.ClosedCaptions,
                    CMD5_ACC_TYPE_ENUM.DisplayOrder,
                    CMD5_ACC_TYPE_ENUM.CurrentMediaState,
                    CMD5_ACC_TYPE_ENUM.TargetMediaState,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.PictureMode,
                    CMD5_ACC_TYPE_ENUM.PowerModeSelection
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active
                  ]
             },
         55: { deviceName:'TelevisionSpeaker',
               deprecated: false,
               UUID: "00000113-0000-1000-8000-0026BB765291",
               service: Service.TelevisionSpeaker,
               defaultCategory: Categories.AUDIO_RECEIVER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Mute,
                     defaultValue:   0,                          // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active,
                    CMD5_ACC_TYPE_ENUM.Volume,
                    CMD5_ACC_TYPE_ENUM.VolumeControlType,
                    CMD5_ACC_TYPE_ENUM.VolumeSelector,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Mute
                  ]
             },
         56: { deviceName:'TemperatureSensor',
               deprecated: false,
               UUID: "0000008A-0000-1000-8000-0026BB765291",
               service: Service.TemperatureSensor,
               defaultCategory: Categories.SWITCH,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentTemperature,
                     defaultValue:   25.0,                        // Range:  0 - 100
                                                                  // Step: 0.1
                                                                  // Format: float
                                                                  // Units:  CELSIUS
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.StatusActive,
                    CMD5_ACC_TYPE_ENUM.StatusFault,
                    CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                    CMD5_ACC_TYPE_ENUM.StatusTampered
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentTemperature
                  ]
             },
         57: { deviceName:'Thermostat',
               deprecated: false,
               UUID: "0000004A-0000-1000-8000-0026BB765291",
               service: Service.Thermostat,
               defaultCategory: Categories.THERMOSTAT,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentHeatingCoolingState,
                     defaultValue:   Characteristic.CurrentHeatingCoolingState.OFF,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetHeatingCoolingState ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetHeatingCoolingState,
                     defaultValue:   Characteristic.TargetHeatingCoolingState.OFF,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentHeatingCoolingState ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.CurrentTemperature,
                     defaultValue:   25.0,                       // Range:  0 - 100, Step: 0.1
                                                                 // Format: float
                                                                 // Units:  CELSIUS
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetTemperature ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetTemperature,
                     defaultValue:   25.0,                        // Range:  0 - 100
                                                                  // Step: 0.1
                                                                  // Format: float
                                                                  // Units:  CELSIUS
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentTemperature ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TemperatureDisplayUnits,
                     defaultValue:   Characteristic.TemperatureDisplayUnits.CELSIUS,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.CurrentRelativeHumidity,
                    CMD5_ACC_TYPE_ENUM.TargetRelativeHumidity,
                    CMD5_ACC_TYPE_ENUM.CoolingThresholdTemperature,
                    CMD5_ACC_TYPE_ENUM.HeatingThresholdTemperature
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentTemperature,
                    CMD5_ACC_TYPE_ENUM.TargetTemperature
                  ]
             },
         // @deprecated Removed and not used anymore as of homebridge v2
         58: { deviceName:'TimeInformation',
               deprecated: true,
               UUID: "00000099-0000-1000-8000-0026BB765291",
               //service: Service.TimeInformation,
               service: null,
               //defaultCategory: Categories.OTHER,
               defaultCategory: null,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [
                    //{type:           CMD5_ACC_TYPE_ENUM.CurrentTime,
                    // defaultValue:   '11:15',                      // Format: String
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.DayoftheWeek,
                    // defaultValue:   1,                           // Range:  1 - 7
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //},
                    //{type:           CMD5_ACC_TYPE_ENUM.TimeUpdate,
                    // defaultValue:   0,                          // Format: Bool
                    // relatedCurrentAccTypeEnumArray: [ ],
                    // relatedTargetAccTypeEnumArray: [ ]
                    //}
                  ],
               optionalCharacteristics:
                  [
                    //CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  [
                    //CMD5_ACC_TYPE_ENUM.CurrentTime
                  ]
             },
         59: { deviceName:'TransferTransportManagement',
               deprecated: false,
               UUID: "00000203-0000-1000-8000-0026BB765291",
               service: Service.TransferTransportManagement,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.SupportedTransferTransportConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SetupTransferTransport,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  []
             },
         60: { deviceName:'Tunnel',
               deprecated: false,
               UUID: "00000056-0000-1000-8000-0026BB765291",
               service: Service.Tunnel,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Name,
                     defaultValue:  'My_TunnelB',                  // Format: String
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.AccessoryIdentifier,
                     defaultValue:  'TLB',                        // Format: String
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TunneledAccessoryStateNumber,
                     defaultValue:   0.0,                        // Format: float
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ] },
                    {type:           CMD5_ACC_TYPE_ENUM.TunneledAccessoryConnected,
                     defaultValue:   0,                         // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ] },
                    {type:           CMD5_ACC_TYPE_ENUM.TunneledAccessoryAdvertising,
                     defaultValue:   0,                         // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TunnelConnectionTimeout,
                     defaultValue:   5000,                     // Format: Uint32
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.TunneledAccessoryConnected
                  ]
             },
         61: { deviceName:'Valve',
               deprecated: false,
               UUID: "000000D0-0000-1000-8000-0026BB765291",
               service: Service.Valve,
               defaultCategory: Categories.FAUCET,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.InUse,
                     defaultValue:   Characteristic.InUse.IN_USE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ValveType,
                     defaultValue:   Characteristic.ValveType.GENERIC_VALVE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.IsConfigured,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.RemainingDuration,
                    CMD5_ACC_TYPE_ENUM.ServiceLabelIndex,
                    CMD5_ACC_TYPE_ENUM.SetDuration,
                    CMD5_ACC_TYPE_ENUM.StatusFault
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active
                  ]
             },
         62: { deviceName:'WiFiRouter',
               deprecated: false,
               UUID: "0000020A-0000-1000-8000-0026BB765291",
               service: Service.WiFiRouter,
               defaultCategory: Categories.AIRPORT,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.ConfiguredName,
                     defaultValue:   "My_WiFiRouter",
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ManagedNetworkEnable,
                     defaultValue:   0,                              // DISABLE
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.NetworkAccessViolationControl,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.NetworkClientProfileControl,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.NetworkClientStatusControl,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.RouterStatus,
                     defaultValue:   0,                              // READY
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SupportedRouterConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.WANConfigurationList,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.WANStatusList,
                     defaultValue:   0,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  []
             },
         63: { deviceName:'WiFiSatellite',
               deprecated: false,
               UUID: "0000020F-0000-1000-8000-0026BB765291",
               service: Service.WiFiSatellite,
               defaultCategory: Categories.TV_SET_TOP_BOX,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:            CMD5_ACC_TYPE_ENUM.WiFiSatelliteStatus,
                     defaultValue:    2,                    // NOT_CONNECTED
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ // None
                  ],
               defaultPollingCharacteristics:
                  []
             },
         64: { deviceName:'Window',
               deprecated: false,
               UUID: "0000008B-0000-1000-8000-0026BB765291",
               service: Service.Window,
               defaultCategory: Categories.WINDOW,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentPosition,
                     defaultValue:   0,                          // Range: 0 - 100
                                                                 // Step: 1
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetPosition ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.PositionState,
                     defaultValue:  Characteristic.PositionState.STOPPED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetPosition,
                     defaultValue:   0,                           // Range: 0 - 100
                                                                  // Step: 1
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentPosition ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.ObstructionDetected,
                    CMD5_ACC_TYPE_ENUM.HoldPosition
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentPosition,
                    CMD5_ACC_TYPE_ENUM.TargetPosition
                  ]
             },
         65: { deviceName:'WindowCovering',
               deprecated: false,
               UUID: "0000008C-0000-1000-8000-0026BB765291",
               service: Service.WindowCovering,
               defaultCategory: Categories.WINDOW_COVERING,
               publishExternally: false,
               devicesStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentPosition,
                     defaultValue:   0,                           // Range: 0 - 100
                                                                  // Step: 1
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.TargetPosition ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.PositionState,
                     defaultValue:  Characteristic.PositionState.STOPPED,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TargetPosition,
                     defaultValue:   0,                           // Range: 0 - 100
                                                                  // Step: 1
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.CurrentPosition ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentHorizontalTiltAngle,
                    CMD5_ACC_TYPE_ENUM.TargetHorizontalTiltAngle,
                    CMD5_ACC_TYPE_ENUM.Name,
                    CMD5_ACC_TYPE_ENUM.ObstructionDetected,
                    CMD5_ACC_TYPE_ENUM.HoldPosition,
                    CMD5_ACC_TYPE_ENUM.CurrentVerticalTiltAngle,
                    CMD5_ACC_TYPE_ENUM.TargetVerticalTiltAngle
                  ],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CurrentPosition,
                    CMD5_ACC_TYPE_ENUM.TargetPosition
                  ]
             },
         66: { deviceName:'AccessoryMetrics',
               deprecated: false,
               UUID: "00000270-0000-1000-8000-0026BB765291",
               service: Service.AccessoryMetrics,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.MetricsBufferFullState,
                     defaultValue:   1,                             // Format: Bool
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SupportedMetrics,
                     defaultValue:   "",                           // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [],
               defaultPollingCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.Active ]
             },
         67: { deviceName:'AssetUpdate',
               deprecated: false,
               UUID: "00000267-0000-1000-8000-0026BB765291",
               service: Service.AssetUpdate,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.AssetUpdateReadiness,
                     defaultValue:   0,        // Int
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SupportedAssetTypes,
                     defaultValue:   0,        // UINT32
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [],
               defaultPollingCharacteristics:
                  []
             },
         68: { deviceName:'Assistant',
               deprecated: false,
               UUID: "0000026A-0000-1000-8000-0026BB765291",
               service: Service.Assistant,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Identifier,
                     defaultValue:   "Some Identifier",               // Format: STRING
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Name,
                     defaultValue:   "Unnamed Assistant",
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [],
               defaultPollingCharacteristics:
                  []
             },
         69: { deviceName:'AudioStreamManagement',
               deprecated: false,
               UUID: "00000127-0000-1000-8000-0026BB765291",
               service: Service.AudioStreamManagement,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.SupportedAudioStreamConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SelectedAudioStreamConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [],
               defaultPollingCharacteristics:
                  []
             },
         70: { deviceName:'Battery',
               deprecated: false,
               UUID: "00000096-0000-1000-8000-0026BB765291",
               service: Service.Battery,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.StatusLowBattery,
                     defaultValue:   Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.BatteryLevel,
                    CMD5_ACC_TYPE_ENUM.ChargingState,
                    CMD5_ACC_TYPE_ENUM.Name
                  ],
               defaultPollingCharacteristics:
                  []
             },
         71: { deviceName:'CameraRecordingManagement',
               deprecated: false,
               UUID: "00000204-0000-1000-8000-0026BB765291",
               service: Service.CameraRecordingManagement,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SupportedCameraRecordingConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SupportedVideoRecordingConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SupportedAudioRecordingConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SelectedCameraRecordingConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.RecordingAudioActive
                  ],
               defaultPollingCharacteristics:
                  []
             },
         72: { deviceName:'CloudRelay',
               deprecated: false,
               UUID: "0000005A-0000-1000-8000-0026BB765291",
               service: Service.CloudRelay,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.RelayControlPoint,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.RelayState,
                     defaultValue:   1,                              // Format: uint8, Values ???
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.RelayEnabled,
                     defaultValue:   false,
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [],
               defaultPollingCharacteristics:
                  []
             },
         73: { deviceName:'DataStreamTransportManagement',
               deprecated: false,
               UUID: "00000129-0000-1000-8000-0026BB765291",
               service: Service.DataStreamTransportManagement,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.SetupDataStreamTransport,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.SupportedDataStreamTransportConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Version,
                     defaultValue:   "Unknown version",
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [],
               defaultPollingCharacteristics:
                  []
             },
         74: { deviceName:'NFCAccess',
               deprecated: false,
               UUID: "00000266-0000-1000-8000-0026BB765291",
               service: Service.NFCAccess,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.ConfigurationState,
                     defaultValue:   0,                              // Format: UINT16 values?
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.NFCAccessControlPoint,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.NFCAccessSupportedConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [],
               defaultPollingCharacteristics:
                  []
             },
         75: { deviceName:'SiriEndpoint',
               deprecated: false,
               UUID: "00000253-0000-1000-8000-0026BB765291",
               service: Service.SiriEndpoint,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.SiriEndpointSessionStatus,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Version,
                     defaultValue:   "Unknown version",
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.ActiveIdentifier,
                    CMD5_ACC_TYPE_ENUM.ManuallyDisabled
                  ],
               defaultPollingCharacteristics:
                  []
             },
         76: { deviceName:'ThreadTransport',
               deprecated: false,
               UUID: "00000701-0000-1000-8000-0026BB765291",
               service: Service.ThreadTransport,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentTransport,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ThreadControlPoint,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ThreadNodeCapabilities,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ThreadStatus,
                     defaultValue:   0,        // min 0, max 6 values?
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [ CMD5_ACC_TYPE_ENUM.CCAEnergyDetectThreshold,
                    CMD5_ACC_TYPE_ENUM.CCASignalDetectThreshold,
                    CMD5_ACC_TYPE_ENUM.EventRetransmissionMaximum,
                    CMD5_ACC_TYPE_ENUM.EventTransmissionCounters,
                    CMD5_ACC_TYPE_ENUM.MACRetransmissionMaximum,
                    CMD5_ACC_TYPE_ENUM.MACTransmissionCounters,
                    CMD5_ACC_TYPE_ENUM.ReceiverSensitivity,
                    CMD5_ACC_TYPE_ENUM.ReceivedSignalStrengthIndication,
                    CMD5_ACC_TYPE_ENUM.SignalToNoiseRatio,
                    CMD5_ACC_TYPE_ENUM.ThreadOpenThreadVersion,
                    CMD5_ACC_TYPE_ENUM.TransmitPower,
                    CMD5_ACC_TYPE_ENUM.MaximumTransmitPower
                  ],
               defaultPollingCharacteristics:
                  []
             },

             // New Mar 2024
         77: { deviceName:'AccessCode',
               deprecated: false,
               UUID: "00000260-0000-1000-8000-0026BB765291",
               service: Service.AccessCode,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.AccessCodeControlPoint,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.AccessCodeSupportedConfiguration,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.ConfigurationState,
                     defaultValue:   0,                              // Format: Uint16
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [],
               defaultPollingCharacteristics:
                  []
             },
         78: { deviceName:'FirmwareUpdate',
               deprecated: false,
               UUID: "00000236-0000-1000-8000-0026BB765291",
               service: Service.FirmwareUpdate,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.FirmwareUpdateReadiness,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.FirmwareUpdateStatus,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [CMD5_ACC_TYPE_ENUM.StagedFirmwareVersion,
                   CMD5_ACC_TYPE_ENUM.SupportedFirmwareUpdateConfiguration
                  ],
               defaultPollingCharacteristics:
                  []
             },
         79: { deviceName:'TapManagement',
               deprecated: false,
               UUID: "0000022E-0000-1000-8000-0026BB765291",
               service: Service.TapManagement,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.Active,
                     defaultValue:   Characteristic.Active.ACTIVE,
                     relatedCurrentAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ],
                     relatedTargetAccTypeEnumArray: [ CMD5_ACC_TYPE_ENUM.Active ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.CryptoHash,
                     defaultValue:   0,                 // Format TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.TapType,
                     defaultValue:   0,                 // Format UINT16
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.Token,
                     defaultValue:   "",                // Format DATA
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [],
               defaultPollingCharacteristics:
                  []
             },
         80: { deviceName:'WiFiTransport',
               deprecated: false,
               UUID: "0000022A-0000-1000-8000-0026BB765291",
               service: Service.WiFiTransport,
               defaultCategory: Categories.OTHER,
               publishExternally: false,
               deviceStateChangeDefaultTime: constants.MEDIUM_STATE_CHANGE_RESPONSE_TIME,
               requiredCharacteristics:
                  [ {type:           CMD5_ACC_TYPE_ENUM.CurrentTransport,
                     defaultValue:   0,                              // Format: TLV8
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    },
                    {type:           CMD5_ACC_TYPE_ENUM.WiFiCapabilities,
                     defaultValue:   0,                              // Format: UINT32
                     relatedCurrentAccTypeEnumArray: [ ],
                     relatedTargetAccTypeEnumArray: [ ]
                    }
                  ],
               optionalCharacteristics:
                  [CMD5_ACC_TYPE_ENUM.WiFiConfigurationControl],
               defaultPollingCharacteristics:
                  []
             }
      };

      return CMD5_DEVICE_TYPE_ENUM;
   }, CMD5_DEVICE_TYPE_ENUM
}
