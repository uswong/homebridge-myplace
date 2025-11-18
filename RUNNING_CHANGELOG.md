### Homebridge-myplace - An independent plugin for Homebridge bringing Advantage Air MyPlace system, its smaller siblings (E-zone, MyAir, MyAir4, etc) and its cousins (e.g. Fujitsu AnywAir) to Homekit
##### v2.3.3 (18-11-2025)
##### (1) Bug fix - to fix an error of an undefined variable.

##### v2.3.2 (15-11-2025)
##### (1) Enhancement: Added fallback to cached configuration when no devices is accessible on the local network.

##### v2.3.1 (2025-10-22)
###### (1) Allow up to 5 retries of inaccessible device before proceeding to auto-discovery.
###### (2) Minor bug fixes.

##### v2.3.0 (2025-10-02)
###### (1) Automatic device discovery: AdvantageAir devices can now be auto-discovered if no IP is specified, or if the configured IP is invalid or inaccessible.
###### (2) Smart fan detection: Any lighting switch with a name ending in " Fan" or " Ex", or starting with "Fan " or "Ex ", will now be treated as a fan accessory.
###### (3) Accessory limit option: Added an optional parameter to cap the number of accessories created by this plugin (Homebridge supports a maximum of 149 accessories per bridge).
###### (4) Stability improvements: Bug fixes and under-the-hood enhancements for improved reliability and robustness.

##### v2.2.3 (2025-09-11)
###### (1) Increased maxBuffer to 5MB to resolve JOSN truncation issue               
###### (2) Added debugging switch for the plugin

##### v2.2.2 (2025-06-29)
###### (1) Fixed an issue affecting some users who has temperature controlled zone                
###### (2) Fixed other minor bugs

##### v2.2.1 (2025-06-28)
###### (1) Fixed buffer overflow for large system

##### v2.2.0 (2025-06-27)
###### (1) Simplified the setup process

##### v2.1.4 (2025-03-10)
###### (1) A minor bug fix to resolve the `TypeError` while loading plugin if `homebridge-cmd4` is also installed

##### v2.1.3 (2024-12-30)
###### (1) Updated complatibility of the package json file to node 22   
###### (2) Minor under the hood code changes to improve the running of this plugin
###### (3) And some minor bug fixes

##### v2.1.2 (2024-10-22)
###### (1) Removed the range limit for Current Temperature on Thermostat                                      
###### (2) Bug fix to index.js

##### v2.1.1 (2024-10-21)
###### (1) Set Zone Thermostat to Auto when the state of the Aircon is Off
###### (2) Remove plugin temporary working files and directories on every Homebridge RESTART
###### (3) Updated the Zone Control section of the README.md

##### v2.1.0 (2024-10-18)
###### (1) Added a Thermostat on each temperature controlled Zone
###### (2) Enhanced UUID generation
###### (3) Bug fixes
###### (4) Update to README.md

##### v2.0.3 (2024-09-27)
###### (1) Bug fixes to ConfigCreator.sh and CheckConfig.sh
###### (2) Minor update to README.md

##### v2.0.2 (2024-09-18)
###### (1) Re-coded ConfigCreator to use jq to create all config and enabled updating of devices info in config.json even when it is run from terminal.

##### v2.0.1 (2024-08-25)
###### (1) To REMOVE prior to RESTORE/CREATE accessories
###### (2) Minor bug fix on ConfigCreator - name of an accessory should only contain alphanumeric, space and single apostrophe characters

##### v2.0.0 (2024-08-13)
###### (1) Fix for Homebridge v2
###### (2) Use both accessory's type and displayName instead of using displayName only to generate UUID

##### v1.1.6 (2024-05-20)
###### (1) If a light swtich has a name ending with " Fan", it will be regarded as a switch for turning ON or OFF a fan.  The homekit icon for this switch will then be a fan instead of a lightbulb.
###### (2) Update README to reflect the changes described in (1).

##### v1.1.5 (2024-04-01)
###### (1) Update README with more badges and refined some wordings

##### v1.1.4 (2024-03-30)
###### (1) corrected minor typo and added "Verified by Homebridge" badge to README

##### v1.1.3 (2024-02-12)
###### (1) minor update to README.mds

##### v1.1.2 (2024-02-07)
###### (1) Streamling the config.schema.json and configuration creation process.
###### (2) updated the README to include a section on "How it Looks and Works".
