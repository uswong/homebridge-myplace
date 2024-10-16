### Homebridge-myplace - An independent plugin for Homebridge bringing Advantage Air MyPlace system, its smaller siblings (E-zone, MyAir, MyAir4, etc) and its cousins (e.g. Fujitsu AnywAir) to Homekit
##### v2.1.0 (2024-10-18)

###### (1) Added a Thermostat on each temperature controlled Zone
###### (2) Bug fixes
###### (3) Update to READ.md

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
