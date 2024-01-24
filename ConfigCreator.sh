#!/bin/bash
#
# This script is to generate a complete Cmd5 configuration file needed for the myplace plugin
# This script can handle up to 3 independent AdvantageAir (AA) systems
#
# This script can be invoked in two ways:
# 1. from homebridge customUI
#    a. click "SETTING" on myplace plugin and
#    b. at the bottom of the SETTING page, define your AdvantageAir Device(s), then clikc SAVE
#    c. click "SETTING" again and
#    d. check the checkbox if you want the fan to be setup as fanSwitch
#    e. click "CONFIG CREATOR" button
#
# 2. from a terminal
#    a. find out where the bash script "ConfigCreator.sh" is installed (please see plugin wiki for details)
#    b. run the bash script ConfigCreator.sh
#    c. Enter the name and IP address of your AdvantageAir system(s) - up to 3 systems can be processed
#    d. you can choose whether you want the fan to be setup as fanSwitch or not
#    e. you might need to enter the path to MyPlace.sh if it is not found by the script.
#    f. you might also need to enter the path to the Homebridge config.json file if it is not found by the script.
#
# Once the Cmd5 configuration file is generated and copied to Homebridge config.json and if you know
# what you are doing you can do some edits on the Cmd5 configuration file in Cmd5 Config Editor
# Click SAVE when you are done.
#
# NOTE:  If you need to 'flip' the GarageDoorOpener, you have to add that in yourself.
#
UIversion="customUI"

AAIP="${1}"
AAname="${2}"
timerSetup1="${3}"
AAdebug="${4}"
AAIP2="${5}"
AAname2="${6}"
timerSetup2="${7}"
AAdebug2="${8}"
AAIP3="${9}"
AAname3="${10}"
timerSetup3="${11}"
AAdebug3="${12}"
MYPLACE_SH_PATH="${13}"

# define the possible names for cmd5 platform
cmd5Platform=""
cmd5Platform1="\"platform\": \"MyPlace\""
cmd5Platform2="\"platform\": \"homebridge-myplace\""

# define some other variables
name=""
hasAircons=false
hasLights=false
hasThings=false

# define some file variables
homebridgeConfigJson=""           # homebridge config.json
configJson="config.json.copy"     # a working copy of homebridge config.json
cmd5ConfigJson="cmd5Config.json"  # Homebridge-Cmd5 config.json
cmd5ConfigJsonAA="cmd5Config_AA.json"
cmd5ConfigConstantsAA="cmd5Config.json.AAconstants"
cmd5ConfigQueueTypesAA="cmd5Config.json.AAqueueTypes"
cmd5ConfigAccessoriesAA="cmd5Config.json.AAaccessories"
cmd5ConfigJsonAAwithNonAA="${cmd5ConfigJsonAA}.withNonAA"
cmd5ConfigNonAA="cmd5Config.json.nonAA"
cmd5ConfigConstantsNonAA="cmd5Config.json.nonAAconstants"
cmd5ConfigQueueTypesNonAA="cmd5Config.json.nonAAqueueTypes"
cmd5ConfigAccessoriesNonAA="cmd5Config.json.nonAAaccessories"
cmd5ConfigMiscKeys="cmd5Config.json.miscKeys"
configJsonNew="${configJson}.new"     # new homebridge config.json

# fun color stuff
BOLD=$(tput bold)
TRED=$(tput setaf 1)
TGRN=$(tput setaf 2)
TYEL=$(tput setaf 3)
TPUR=$(tput setaf 5)
TLBL=$(tput setaf 6)
TNRM=$(tput sgr0)


function cmd5Header()
{
   local debugCmd5="false"

   if [ "${debug}" = "true" ]; then
      debugCmd5="true"
   fi

   { echo "{"
     echo "    \"platform\": \"MyPlace\","
     echo "    \"name\": \"MyPlace\","
     echo "    \"debug\": ${debugCmd5},"
     echo "    \"outputConstants\": false,"
     echo "    \"statusMsg\": true,"
     echo "    \"timeout\": 60000,"
     echo "    \"stateChangeResponseTime\": 0,"
   } > "$1"
}

function cmd5ConstantsHeader()
{
   { echo "    \"constants\": ["
   } > "$1"
}

function cmd5Constants()
{
   local debugA=""

   if [ "${debug}" = "true" ]; then
      debugA="-debug"
   fi

   { echo "        {"
     echo "            \"key\": \"${ip}\","
     echo "            \"value\": \"${IPA}${debugA}\""
     echo "        },"
   } >> "$1"
}

function cmd5QueueTypesHeader()
{
   { echo "    \"queueTypes\": ["
   } > "$1"
}

function cmd5QueueTypes()
{
   { echo "        {"
     echo "            \"queue\": \"${queue}\","
     echo "            \"queueType\": \"WoRm2\""
     echo "        },"
   } >> "$1"
}

function cmd5AccessoriesHeader()
{
   { echo "    \"accessories\": ["
   } > "$1"
}

function cmd5ConstantsQueueTypesAccessoriesMiscFooter()
{
   cp "$1" "$1.temp"
   sed '$ d' "$1.temp" > "$1"
   rm "$1.temp"

   { echo "        }"
     echo "    ],"
   } >> "$1"
}


function cmd5LightbulbNoDimmer()
{
   local name="$2"
   local id="$3"
   id=${id//\"/}
   { echo "        {"
     echo "            \"type\": \"Lightbulb\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"on\""
     echo "                }"
     echo "            ],"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
    #echo "            \"state_cmd_suffix\": \"'light:$name' ${ip}\""
     echo "            \"state_cmd_suffix\": \"ligID:$id ${ip}\""
     echo "        },"
   } >> "$1"
}

function cmd5LightbulbWithDimmer()
{
   local name="$2"
   local id="$3"
   id=${id//\"/}
   { echo "        {"
     echo "            \"type\": \"Lightbulb\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"brightness\": 80,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"on\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"brightness\""
     echo "                }"
     echo "            ],"
     echo "            \"props\": {"
     echo "                \"brightness\": {"
     echo "                    \"minStep\": 1"
     echo "                }"
     echo "            },"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
    #echo "            \"state_cmd_suffix\": \"'light:${name}' ${ip}\""
     echo "            \"state_cmd_suffix\": \"ligID:$id ${ip}\""
     echo "        },"
   } >> "$1"
}

function cmd5WindowCovering()
{
   local name="$2"
   local id="$3"
   id=${id//\"/}
   { echo "        {"
     echo "            \"type\": \"WindowCovering\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"obstructionDetected\": \"FALSE\","
     echo "            \"currentPosition\": 0,"
     echo "            \"positionState\": 2,"
     echo "            \"targetPosition\": 0,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"currentPosition\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"targetPosition\""
     echo "                }"
     echo "            ],"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"thiID:$id ${ip}\""
     echo "        },"
   } >> "$1"
}

function cmd5GarageDoorOpener()
{
   local name="$2"
   local id="$3"
   id=${id//\"/}
   { echo "        {"
     echo "            \"type\": \"GarageDoorOpener\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"obstructionDetected\": \"FALSE\","
     echo "            \"currentDoorState\": 1,"
     echo "            \"targetDoorState\": 1,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"currentDoorState\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"targetDoorState\""
     echo "                }"
     echo "            ],"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"thiID:$id ${ip}\""
     echo "        },"
   } >> "$1"
}

function cmd5ZoneLightbulb()
{
   local name="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Lightbulb\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"brightness\": 50,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"on\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"brightness\""
     echo "                }"
     echo "            ],"
     echo "            \"props\": {"
     echo "                \"brightness\": {"
     echo "                    \"minStep\": 5"
     echo "                }"
     echo "            },"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${zoneStr} ${ip}${ac_l}\""
     echo "        },"
   } >> "$1"
}

function cmd5ZoneLightbulb2()
{
   local name="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Lightbulb\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"brightness\": 50,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"on\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"brightness\""
     echo "                }"
     echo "            ],"
     echo "            \"props\": {"
     echo "                \"brightness\": {"
     echo "                    \"minStep\": 5"
     echo "                }"
     echo "            },"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${zoneStr} ${ip}${ac_l}\","
   } >> "$1"
}

function cmd5TimerLightbulb()
{
   local name="$2"
   local suffix="$3"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Lightbulb\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"brightness\": 0,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"on\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"brightness\""
     echo "                }"
     echo "            ],"
     echo "            \"props\": {"
     echo "                \"brightness\": {"
     echo "                    \"minStep\": 1"
     echo "                }"
     echo "            },"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${suffix} ${ip}${ac_l}\""
     echo "        },"
   } >> "$1"
}

function cmd5Thermostat()
{
   local airconName="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Thermostat\","
     echo "            \"displayName\": \"${airconName}\","
     echo "            \"currentHeatingCoolingState\": \"OFF\","
     echo "            \"targetHeatingCoolingState\": \"OFF\","
     echo "            \"currentTemperature\": 24,"
     echo "            \"targetTemperature\": 24,"
     echo "            \"temperatureDisplayUnits\": \"CELSIUS\","
     echo "            \"name\": \"${airconName}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"currentHeatingCoolingState\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"targetHeatingCoolingState\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"currentTemperature\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"targetTemperature\""
     echo "                }"
     echo "            ],"
     echo "            \"props\": {"
     echo "               \"currentTemperature\": {"
     echo "               \"maxValue\": 32,"
     echo "               \"minValue\": 16,"
     echo "               \"minStep\": 1"
     echo "               },"
     echo "               \"targetTemperature\": {"
     echo "               \"maxValue\": 32,"
     echo "               \"minValue\": 16,"
     echo "               \"minStep\": 1"
     echo "               }"
     echo "            },"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${ip}${ac_l}\","
   } >> "$1"
}

function cmd5ZoneFanv2()
{
   local name="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Fanv2\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"active\": 0,"
     echo "            \"rotationSpeed\": 100,"
     echo "            \"rotationDirection\": 1,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"active\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"rotationSpeed\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"rotationDirection\""
     echo "                }"
     echo "            ],"
     echo "            \"props\": {"
     echo "                \"rotationSpeed\": {"
     echo "                    \"minStep\": 5"
     echo "                }"
     echo "            },"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${zoneStr} ${ip}${ac_l}\","
   } >> "$1"
}

function cmd5ZoneFanv2noRotationDirection()
{
   local name="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Fanv2\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"active\": 0,"
     echo "            \"rotationSpeed\": 100,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"active\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"rotationSpeed\""
     echo "                }"
     echo "            ],"
     echo "            \"props\": {"
     echo "                \"rotationSpeed\": {"
     echo "                    \"minStep\": 5"
     echo "                }"
     echo "            },"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${zoneStr} ${ip}${ac_l}\","
   } >> "$1"
}

function cmd5ZoneFan()
{
   local name="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Fan\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"rotationSpeed\": 100,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"on\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"rotationSpeed\""
     echo "                }"
     echo "            ],"
     echo "            \"props\": {"
     echo "                \"rotationSpeed\": {"
     echo "                    \"minStep\": 5"
     echo "                }"
     echo "            },"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${zoneStr} ${ip}${ac_l}\""
     echo "        },"
   } >> "$1"
}

function cmd5Fan()
{
   local fanName="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Fan\","
     echo "            \"displayName\": \"${fanName}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"rotationSpeed\": 100,"
     echo "            \"name\": \"${fanName}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"on\""
     echo "                },"
     echo "                {"
     echo "                    \"characteristic\": \"rotationSpeed\""
     echo "                }"
     echo "            ],"
     echo "            \"props\": {"
     echo "                \"rotationSpeed\": {"
     echo "                    \"minStep\": 1"
     echo "                }"
     echo "            },"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${ip}${ac_l}\""
     echo "        },"
   } >> "$1"
}

function cmd5FanSwitch()
{
   local fanName="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Switch\","
     echo "            \"displayName\": \"${fanName}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"name\": \"${fanName}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"on\""
     echo "                }"
     echo "            ],"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${ip}${ac_l}\","
   } >> "$1"
}

function cmd5FanLinkTypes()
{
   local fanSpeedName="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "            \"linkedTypes\": ["
     echo "                {"
     echo "                    \"type\": \"Fan\","
     echo "                    \"displayName\": \"${fanSpeedName}\","
     echo "                    \"on\": \"TRUE\","
     echo "                    \"rotationSpeed\": 25,"
     echo "                    \"name\": \"${fanSpeedName}\","
     echo "                    \"manufacturer\": \"Advantage Air Australia\","
     echo "                    \"model\": \"${sysType}\","
     echo "                    \"serialNumber\": \"${tspModel}\","
     echo "                    \"queue\": \"$queue\","
     echo "                    \"polling\": ["
     echo "                        {"
     echo "                            \"characteristic\": \"on\""
     echo "                        },"
     echo "                        {"
     echo "                            \"characteristic\": \"rotationSpeed\""
     echo "                        }"
     echo "                    ],"
     echo "                    \"props\": {"
     echo "                        \"rotationSpeed\": {"
     echo "                            \"minStep\": 1"
     echo "                        }"
     echo "                    },"
     echo "                    \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "                    \"state_cmd_suffix\": \"fanSpeed ${ip}${ac_l}\""
     echo "                }"
     echo "            ]"
     echo "        },"
   } >> "$1"
}

function cmd5myZoneSwitch()
{
   local myZoneName="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Switch\","
     echo "            \"displayName\": \"${myZoneName}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"name\": \"${myZoneName}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"on\""
     echo "                }"
     echo "            ],"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"myZone=${zone} ${ip}${ac_l}\""
     echo "        },"
   } >> "$1"
}

function cmd5ZoneTempSensor()
{
   local name="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"TemperatureSensor\","
     echo "            \"subType\": \"TempSensor${b}\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"currentTemperature\": 25,"
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": ["
     echo "                {"
     echo "                    \"characteristic\": \"currentTemperature\""
     echo "                }"
     echo "            ],"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${zoneStr} ${ip}${ac_l}\""
     echo "        },"
   } >> "$1"
}

function cmd5ZoneLinkedTypesTempSensor()
{
   local name="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "            \"linkedTypes\": ["
     echo "                {"
     echo "                    \"type\": \"TemperatureSensor\","
     echo "                    \"displayName\": \"${name}\","
     echo "                    \"currentTemperature\": 25,"
     echo "                    \"name\": \"${name}\","
     echo "                    \"manufacturer\": \"Advantage Air Australia\","
     echo "                    \"model\": \"${sysType}\","
     echo "                    \"serialNumber\": \"${tspModel}\","
     echo "                    \"queue\": \"$queue\","
     echo "                    \"polling\": ["
     echo "                        {"
     echo "                            \"characteristic\": \"currentTemperature\""
     echo "                        }"
     echo "                    ],"
     echo "                    \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "                    \"state_cmd_suffix\": \"${zoneStr} ${ip}${ac_l}\""
     echo "                }"
     echo "            ]"
     echo "        },"
   } >> "$1"
}

function cmd5ZoneSwitch()
{
   local name="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Switch\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": true,"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${zoneStr} ${ip}${ac_l}\""
     echo "        },"
   } >> "$1"
}

function cmd5ZoneSwitch2()
{
   local name="$2"
   local ac_l=" ${ac}"

   if [ "${ac_l}" = " ac1" ]; then ac_l=""; fi

   { echo "        {"
     echo "            \"type\": \"Switch\","
     echo "            \"displayName\": \"${name}\","
     echo "            \"on\": \"FALSE\","
     echo "            \"name\": \"${name}\","
     echo "            \"manufacturer\": \"Advantage Air Australia\","
     echo "            \"model\": \"${sysType}\","
     echo "            \"serialNumber\": \"${tspModel}\","
     echo "            \"queue\": \"$queue\","
     echo "            \"polling\": true,"
     echo "            \"state_cmd\": \"'${MYPLACE_SH_PATH}'\","
     echo "            \"state_cmd_suffix\": \"${zoneStr} ${ip}${ac_l}\","
   } >> "$1"
}

function cmd5Footer()
{
   lastLine=$(tail -n 1 "$1")
   squareBracket=$(echo "${lastLine}"|grep "]")

   cp "$1" "$1.temp"
   sed '$ d' "$1.temp" > "$1"
   rm "$1.temp"
   #
   if [ -n "${squareBracket}" ]; then
      { echo "    ]"
        echo "}"
      } >> "$1"
   else
      { echo "    }"
        echo "}"
      } >> "$1"
   fi
}

function readHomebridgeConfigJson()
{
   case  $UIversion in
      customUI )
         DIR=$(pwd)
         homebridgeConfigJson="${DIR}/config.json"
         if [ -f "${homebridgeConfigJson}" ]; then
            # expand the json just in case it is in compact form
            jq --indent 4 '.' "${homebridgeConfigJson}" > "${configJson}"
            checkForPlatformCmd5InHomebridgeConfigJson
            if [ -z "${validFile}" ]; then
               echo "ERROR: no Cmd5 Config found in \"${homebridgeConfigJson}\"! Please ensure that Homebridge-Cmd5 plugin is installed"
               exit 1
            fi
         else
            echo "ERROR: no Homebridge config.json found in \"${DIR}\"! Please copy \"${cmd5ConfigJsonAA}\" to cmd5 JASON Config manually."
            cleanUp
            exit 1
         fi
      ;;
      nonUI )
         INPUT=""
         homebridgeConfigJson=""
         getHomebridgeConfigJsonPath
         if [ "${fullPath}" != "" ]; then homebridgeConfigJson="${fullPath}"; fi

         # if no config.json file found, ask user to input the full path
         if [ -z "${homebridgeConfigJson}" ]; then
            homebridgeConfigJson=""
            echo ""
            echo "${TPUR}WARNING: No Homebridge config.json file located by the script!${TNRM}"
            echo ""
            until [ -n "${INPUT}" ]; do
               echo "${TYEL}Please enter the full path of your Homebridge config.json file,"
               echo "otherwise just hit enter to abort copying \"${cmd5ConfigJsonAA}\" to Homebridge config.json."
               echo "The config.json path should be in the form of /*/*/*/config.json ${TNRM}"
               read -r -p "${BOLD}> ${TNRM}" INPUT
               if [ -z "${INPUT}" ]; then
                  echo "${TPUR}WARNING: No Homebridge config.json file specified"
                  echo "         Copying of ${cmd5ConfigJsonAA} to Homebridge config.json was aborted"
                  echo ""
                  echo "${TLBL}${BOLD}INFO: Please copy/paste the ${cmd5ConfigJsonAA} into Cmd5 JASON Config Editor manually${TNRM}"
                  cleanUp
                  exit 1
               elif expr "${INPUT}" : '[./a-zA-Z0-9]*/config.json$' >/dev/null; then
                  if [ -f "${INPUT}" ]; then
                     homebridgeConfigJson="${INPUT}"
                     break
                  else
                     echo ""
                     echo "${TPUR}WARNING: No such file exits!${TNRM}"
                     echo ""
                     INPUT=""
                  fi
               else
                  echo ""
                  echo "${TPUR}WARNING: Wrong format for file path for Homebridge config.json!${TNRM}"
                  echo ""
                  INPUT=""
               fi
           done
         fi
         if [ -f "${homebridgeConfigJson}" ]; then
            if [ -z "${INPUT}" ]; then
               echo ""
               echo "${TLBL}INFO: The Homebridge config.json found: ${homebridgeConfigJson}${TNRM}"
               echo ""
            else
               echo ""
               echo "${TLBL}INFO: The Homebridge config.json specified: ${homebridgeConfigJson}${TNRM}"
               echo ""
            fi
            # expand the json just in case it is in compact form
            jq --indent 4 '.' "${homebridgeConfigJson}" > "${configJson}"
            checkForPlatformCmd5InHomebridgeConfigJson
            if [ -z "${validFile}" ]; then
               echo ""
               echo "${TRED}ERROR: no Cmd5 Config found in \"${homebridgeConfigJson}\"! Please ensure that Homebridge-Cmd5 plugin is installed${TNRM}"
               echo "${TLBL}INFO: ${cmd5ConfigJsonAA} was created but not copied to Homebridge-Cmd5 JASON Config Editor!"
               echo "      Please copy/paste the ${cmd5ConfigJsonAA} into Cmd5 JASON Config Editor manually${TNRM}"
               cleanUp
               exit 1
            fi
         fi
      ;;
   esac
}

function extractCmd5ConfigFromConfigJson()
{
   noOfPlatforms=$(( $( jq ".platforms|keys" "${configJson}" | wc -w) - 2 ))
   cmd5PlatformName=$(echo "${cmd5Platform}"|cut -d'"' -f4)
   for ((i=0; i<noOfPlatforms; i++)); do
      plaftorm=$( jq ".platforms[${i}].platform" "${configJson}" )
      if [ "${plaftorm}" = "\"${cmd5PlatformName}\"" ]; then
         jq --indent 4 ".platforms[${i}]" "${configJson}" > "${cmd5ConfigJson}"
         jq --indent 4 "del(.platforms[${i}])" "${configJson}" > "${configJson}.Cmd5less"
         break
      fi
   done
}

function extractCmd5ConfigNonAAandAccessoriesNonAA()
{
   AAaccessories=""
   count=0
   presenceOfAccessories=$(jq ".accessories" "${cmd5ConfigJson}")
   if [ "${presenceOfAccessories}" != "null" ]; then
      noOfAccessories=$(( $( jq ".accessories|keys" "${cmd5ConfigJson}" | wc -w) - 2 ))
      for (( i=0; i<noOfAccessories; i++ )); do
         cmd5StateCmd=$( jq ".accessories[${i}].state_cmd" "${cmd5ConfigJson}" | grep -n "homebridge-myplace" )

         # save the ${i} n a string for use to delete the AA accessories from ${cmd5ConfigJson}
         if [ "${cmd5StateCmd}" != "" ]; then
            if [ "${AAaccessories}" = "" ]; then
               AAaccessories="${i}"
            else
               AAaccessories="${AAaccessories},${i}"
            fi
         else   # create the non-AA accessories
            count=$(( count + 1 ))
            if [ "${count}" -eq 1 ]; then
               jq --indent 4 ".accessories[${i}]" "${cmd5ConfigJson}" > "${cmd5ConfigAccessoriesNonAA}"
            else
               sed '$d' "${cmd5ConfigAccessoriesNonAA}" > "${cmd5ConfigAccessoriesNonAA}.tmp"
               mv "${cmd5ConfigAccessoriesNonAA}.tmp" "${cmd5ConfigAccessoriesNonAA}"
               echo "}," >> "${cmd5ConfigAccessoriesNonAA}"
               jq --indent 4 ".accessories[${i}]" "${cmd5ConfigJson}" >> "${cmd5ConfigAccessoriesNonAA}"
            fi
         fi
      done
   fi

   # delete the AA accessories to create ${cmd5ConfigNonAA} for use later
   if [ "${AAaccessories}" = "" ]; then
      cp "${cmd5ConfigJson}" "${cmd5ConfigNonAA}"
   else
      jq --indent 4 "del(.accessories[${AAaccessories}])" "${cmd5ConfigJson}" > "${cmd5ConfigNonAA}"
   fi

   # check that there are non-AA accessories, if not, remove the file
   if [ -f "${cmd5ConfigAccessoriesNonAA}" ]; then
      validFile=$(head -n 1 "${cmd5ConfigAccessoriesNonAA}")
      if [ "${validFile}" = "" ]; then rm "${cmd5ConfigAccessoriesNonAA}"; fi
   fi
}

function extractNonAAconstants()
{
   count=0
   noOfConstans=$(( $( jq ".constants|keys" "${cmd5ConfigNonAA}" | wc -w) - 2 ))
   for ((i=0; i<noOfConstans; i++)); do
      key=$( jq ".constants[${i}].key" "${cmd5ConfigNonAA}" )
      key=${key//\"/}
      keyUsed=$(grep -n "${key}" "${cmd5ConfigAccessoriesNonAA}"|grep -v 'key'|head -n 1|cut -d":" -f1)
      if [ -n "${keyUsed}" ]; then
         count=$(( count + 1 ))
         if [ "${count}" -eq 1 ]; then
            jq --indent 4 ".constants[${i}]" "${cmd5ConfigNonAA}" > "${cmd5ConfigConstantsNonAA}"
         else
            sed '$d' "${cmd5ConfigConstantsNonAA}" > "${cmd5ConfigConstantsNonAA}.tmp"
            mv "${cmd5ConfigConstantsNonAA}.tmp" "${cmd5ConfigConstantsNonAA}"
            echo "}," >> "${cmd5ConfigConstantsNonAA}"
            jq --indent 4 ".constants[${i}]" "${cmd5ConfigNonAA}" >> "${cmd5ConfigConstantsNonAA}"
         fi
      fi
   done
   if [ -f "${cmd5ConfigConstantsNonAA}" ]; then
      validFile=$(head -n 1 "${cmd5ConfigConstantsNonAA}")
      if [ "${validFile}" = "" ]; then rm "${cmd5ConfigConstantsNonAA}"; fi
   fi
}

function extractNonAAqueueTypes()
{
   count=0
   noOfQueues=$(( $( jq ".queueTypes|keys" "${cmd5ConfigNonAA}" | wc -w) - 2 ))
   for ((i=0; i<noOfQueues; i++)); do
      queue=$( jq ".queueTypes[${i}].queue" "${cmd5ConfigNonAA}" )
      queueUsed=$(grep -n "${queue}" "${cmd5ConfigAccessoriesNonAA}"|head -n 1)
      if [ -n "${queueUsed}" ]; then
         count=$(( count + 1 ))
         if [ "${count}" -eq 1 ]; then
            jq --indent 4 ".queueTypes[${i}]" "${cmd5ConfigNonAA}" > "${cmd5ConfigQueueTypesNonAA}"
         else
            sed '$d'  "${cmd5ConfigQueueTypesNonAA}" > "${cmd5ConfigQueueTypesNonAA}.tmp"
            mv "${cmd5ConfigQueueTypesNonAA}.tmp" "${cmd5ConfigQueueTypesNonAA}"
            echo "}," >> "${cmd5ConfigQueueTypesNonAA}"
            jq --indent 4 ".queueTypes[${i}]" "${cmd5ConfigNonAA}" >> "${cmd5ConfigQueueTypesNonAA}"
         fi
      fi
   done
   if [ -f "${cmd5ConfigQueueTypesNonAA}" ]; then
      validFile=$(head -n 1 "${cmd5ConfigQueueTypesNonAA}")
      if [ "${validFile}" = "" ]; then rm "${cmd5ConfigQueueTypesNonAA}"; fi
   fi
}

function extractCmd5MiscKeys()
{
   # Extract any misc Cmd5 Keys used for non-AA accessories
   count=0
   keys=$( jq ".|keys" "${cmd5ConfigNonAA}" )
   noOfKeys=$(( $(echo "${keys}" | wc -w) - 2 ))
   for ((i=0; i<noOfKeys; i++)); do
      key=$( echo "${keys}" | jq ".[${i}]" )
      key=${key//\"/}
      if [[ "${key}" != "platform" && "${key}" != "name" && "${key}" != "debug" && "${key}" != "outputConstants" && "${key}" != "statusMsg" && "${key}" != "timeout" && "${key}" != "stateChangeResponseTime" && "${key}" != "constants" && "${key}" != "queueTypes" && "${key}" != "accessories" ]]; then
         count=$(( count + 1 ))
         miscKey=$( echo "${keys}" | jq ".[${i}]" )
         if [ "${count}" -eq 1 ]; then echo "{" >> "${cmd5ConfigMiscKeys}"; fi
         if [ "${count}" -gt 1 ]; then echo "," >> "${cmd5ConfigMiscKeys}"; fi
         echo "${miscKey}:" >> "${cmd5ConfigMiscKeys}"
         jq --indent 4 ".${miscKey}" "${cmd5ConfigNonAA}" >> "${cmd5ConfigMiscKeys}"
      fi
   done
   if [ -f "${cmd5ConfigMiscKeys}" ]; then
      validFile=$(head -n 1 "${cmd5ConfigMiscKeys}")
      if [ -z "${validFile}" ]; then
         rm -f "${cmd5ConfigMiscKeys}"
      else
         # reformat it to proper json and then remove the "{" and "}" at the begining and the end of the file
         echo "}" >> "${cmd5ConfigMiscKeys}"
         jq --indent 4 '.' "${cmd5ConfigMiscKeys}" | sed '1d;$d' > "${cmd5ConfigMiscKeys}".tmp
         mv "${cmd5ConfigMiscKeys}".tmp "${cmd5ConfigMiscKeys}"
      fi
   fi
}

function extractNonAAaccessoriesrConstantsQueueTypesMisc()
{
   # extract non-AA config and non-AA accessories from ${cmd5ConfigJson}
   extractCmd5ConfigNonAAandAccessoriesNonAA

   # extract non-AA constants and non-AA queueTypes
   if [ -f "${cmd5ConfigAccessoriesNonAA}" ]; then
      extractNonAAconstants
      extractNonAAqueueTypes
   fi

   # extract some misc. keys existing in Cmd5
   extractCmd5MiscKeys
}

function assembleCmd5ConfigJson()
{
   cmd5Header "${cmd5ConfigJsonAA}"
   cat "${cmd5ConfigConstantsAA}" >> "${cmd5ConfigJsonAA}"
   cmd5ConstantsQueueTypesAccessoriesMiscFooter "${cmd5ConfigJsonAA}"
   cat "${cmd5ConfigQueueTypesAA}" >> "${cmd5ConfigJsonAA}"
   cmd5ConstantsQueueTypesAccessoriesMiscFooter "${cmd5ConfigJsonAA}"
   cat "${cmd5ConfigAccessoriesAA}" >> "${cmd5ConfigJsonAA}"
   cmd5ConstantsQueueTypesAccessoriesMiscFooter "${cmd5ConfigJsonAA}"
   cmd5Footer "${cmd5ConfigJsonAA}"
}

function assembleCmd5ConfigJsonAAwithNonAA()
{
   cmd5Header "${cmd5ConfigJsonAAwithNonAA}"
   cat "${cmd5ConfigConstantsAA}" >> "${cmd5ConfigJsonAAwithNonAA}"
   if [ -f "${cmd5ConfigConstantsNonAA}" ]; then cat "${cmd5ConfigConstantsNonAA}" >> "${cmd5ConfigJsonAAwithNonAA}"; fi
   cmd5ConstantsQueueTypesAccessoriesMiscFooter "${cmd5ConfigJsonAAwithNonAA}"
   cat "${cmd5ConfigQueueTypesAA}" >> "${cmd5ConfigJsonAAwithNonAA}"
   if [ -f "${cmd5ConfigQueueTypesNonAA}" ]; then cat "${cmd5ConfigQueueTypesNonAA}" >> "${cmd5ConfigJsonAAwithNonAA}"; fi
   cmd5ConstantsQueueTypesAccessoriesMiscFooter "${cmd5ConfigJsonAAwithNonAA}"
   cat "${cmd5ConfigAccessoriesAA}" >> "${cmd5ConfigJsonAAwithNonAA}"
   if [ -f "${cmd5ConfigAccessoriesNonAA}" ]; then cat "${cmd5ConfigAccessoriesNonAA}" >> "${cmd5ConfigJsonAAwithNonAA}"; fi
   cmd5ConstantsQueueTypesAccessoriesMiscFooter "${cmd5ConfigJsonAAwithNonAA}"
   if [ -f "${cmd5ConfigMiscKeys}" ]; then cat "${cmd5ConfigMiscKeys}" >> "${cmd5ConfigJsonAAwithNonAA}"; fi
   cmd5Footer "${cmd5ConfigJsonAAwithNonAA}"
}

function writeToHomebridgeConfigJson()
{
   # Writing the created "${cmd5ConfigJsonAAwithNonAA}" to "${configJson}.Cmd5less" to create "${configJsonNew}"
   # before copying to Homebridge config.json

   jq --argjson cmd5Config "$(<"${cmd5ConfigJsonAAwithNonAA}")" --indent 4 '.platforms += [$cmd5Config]' "${configJson}.Cmd5less" > "${configJsonNew}"
   rc=$?
   if [ "${rc}" != "0" ]; then
      echo "${TRED}${BOLD}ERROR: Writing of created Cmd5 config to config.json.new failed!${TNRM}"
      echo "${TLBL}${BOLD}INFO: Instead you can copy/paste the content of \"${cmd5ConfigJsonAA}\" into Cmd5 JASON Config editor.${TNRM}"
      cleanUp
      exit 1
   fi

   # Copy the "${configJsonNew}" to Homebridge config.json
   case $UIversion in
      customUI )
         cp "${configJsonNew}" "${homebridgeConfigJson}"
         rc=$?
         rm -f "${homebridgeConfigJson%/*}/copyEnhancedCmd5PriorityPollingQueueJs.sh"
      ;;
      nonUI )
         sudo cp "${configJsonNew}" "${homebridgeConfigJson}"
         rc=$?
         sudo rm -f "${homebridgeConfigJson%/*}/copyEnhancedCmd5PriorityPollingQueueJs.sh"
      ;;
   esac
   if [ "${rc}" = "0" ]; then
      # copy and use the enhanced version of Cmd5PriorityPollingQueue.js if available and Cmd5 version is v7.0.0-beta2 or v7.0.1 or v7.0.2
      copyEnhancedCmd5PriorityPollingQueueJs
   fi
}

function getGlobalNodeModulesPathForFile()
{
   file="$1"
   fullPath=""

   for ((tryIndex = 1; tryIndex <= 8; tryIndex ++)); do
      case $tryIndex in
         1)
            foundPath=$(find /var/lib/hoobs 2>&1|grep -v find|grep -v System|grep -v cache|grep node_modules|grep myplace|grep "/${file}$")
            fullPath=$(echo "${foundPath}"|head -n 1)
            if [ -f "${fullPath}" ]; then
               return
            else
               fullPath=""
            fi
         ;;
         2)
            foundPath=$(npm root -g)
            fullPath="${foundPath}/homebridge-myplace/${file}"
            if [ -f "${fullPath}" ]; then
               return
            else
               fullPath=""
            fi
         ;;
         3)
            fullPath="/var/lib/homebridge/node_modules/homebridge-myplace/${file}"
            if [ -f "${fullPath}" ]; then
               return
            else
               fullPath=""
            fi
         ;;
         4)
            fullPath="/var/lib/node_modules/homebridge-myplace/${file}"
            if [ -f "${fullPath}" ]; then
               return
            else
               fullPath=""
            fi
         ;;
         5)
            fullPath="/usr/local/lib/node_modules/homebridge-myplace/${file}"
            if [ -f "${fullPath}" ]; then
               return
            else
               fullPath=""
            fi
         ;;
         6)
            fullPath="/usr/lib/node_modules/homebridge-myplace/${file}"
            if [ -f "${fullPath}" ]; then
               return
            else
               fullPath=""
            fi
         ;;
         7)
            fullPath="/opt/homebrew/lib/node_modules/homebridge-myplace/${file}"
            if [ -f "${fullPath}" ]; then
               return
            else
               fullPath=""
            fi
         ;;
         8)
            fullPath="/opt/homebridge/lib/node_modules/homebridge-myplace/${file}"
            if [ -f "${fullPath}" ]; then
               return
            else
               fullPath=""
            fi
         ;;
      esac
   done
}

function getHomebridgeConfigJsonPath()
{
   fullPath=""
   # Typicall HOOBS installation has its config.json root path same as the root path of "MyPlace.sh"
   # The typical full path to the "MyPlace.sh" script is .../hoobs/<bridge>/node_modules/homebridge-myplace/MyPlace.sh
   # First, determine whether this is a HOOBS installation
   Hoobs=$( echo "$MYPLACE_SH_PATH" | grep "/hoobs/" )
   if [ -n "${Hoobs}" ]; then
      fullPath="${MYPLACE_SH_PATH%/*/*/*}/config.json"
      if [ -f "${fullPath}" ]; then
         checkForCmd5PlatformNameInFile
         if [ -z "${cmd5PlatformNameFound}" ]; then
            fullPath=""
         fi
         return
      fi
   fi

   for ((tryIndex = 1; tryIndex <= 6; tryIndex ++)); do
      case $tryIndex in
         1)
            # Typical RPi, Synology NAS installations have this path to config.json
            fullPath="/var/lib/homebridge/config.json"
            if [ -f "${fullPath}" ]; then
               checkForCmd5PlatformNameInFile
               if [ -n "${cmd5PlatformNameFound}" ]; then
                  return
               else
                  fullPath=""
               fi
            fi
         ;;
         2)
            # Typical Mac installation has this path to config.json
            fullPath="$HOME/.homebridge/config.json"
            if [ -f "${fullPath}" ]; then
               checkForCmd5PlatformNameInFile
               if [ -n "${cmd5PlatformNameFound}" ]; then
                  return
               else
                  fullPath=""
               fi
            fi
         ;;
         3)
            foundPath=$(find /usr/local/lib 2>&1|grep -v find|grep -v System|grep -v cache|grep -v hassio|grep -v node_modules|grep "/config.json$")
            noOfInstances=$(echo "${foundPath}"|wc -l)
            for ((i = 1; i <= noOfInstances; i ++)); do
               fullPath=$(echo "${foundPath}"|sed -n "${i}"p)
               if [ -f "${fullPath}" ]; then
                  checkForCmd5PlatformNameInFile
                  if [ -n "${cmd5PlatformNameFound}" ]; then
                     return
                  else
                     fullPath=""
                  fi
               fi
            done
         ;;
         4)
            foundPath=$(find /usr/lib 2>&1|grep -v find|grep -v System|grep -v cache|grep -v hassio|grep -v node_modules|grep "/config.json$")
            noOfInstances=$(echo "${foundPath}"|wc -l)
            for ((i = 1; i <= noOfInstances; i ++)); do
               fullPath=$(echo "${foundPath}"|sed -n "${i}"p)
               if [ -f "${fullPath}" ]; then
                  checkForCmd5PlatformNameInFile
                  if [ -n "${cmd5PlatformNameFound}" ]; then
                     return
                  else
                     fullPath=""
                  fi
               fi
            done
         ;;
         5)
            foundPath=$(find /var/lib 2>&1|grep -v find|grep -v hoobs|grep -v System|grep -v cache|grep -v hassio|grep -v node_modules|grep "/config.json$")
            noOfInstances=$(echo "${foundPath}"|wc -l)
            for ((i = 1; i <= noOfInstances; i ++)); do
               fullPath=$(echo "${foundPath}"|sed -n "${i}"p)
               if [ -f "${fullPath}" ]; then
                  checkForCmd5PlatformNameInFile
                  if [ -n "${cmd5PlatformNameFound}" ]; then
                     return
                  else
                     fullPath=""
                  fi
               fi
            done
         ;;
         6)
            foundPath=$(find /opt 2>&1|grep -v find|grep -v hoobs|grep -v System|grep -v cache|grep -v hassio|grep -v node_modules|grep "/config.json$")
            noOfInstances=$(echo "${foundPath}"|wc -l)
            for ((i = 1; i <= noOfInstances; i ++)); do
               fullPath=$(echo "${foundPath}"|sed -n "${i}"p)
               if [ -f "${fullPath}" ]; then
                  checkForCmd5PlatformNameInFile
                  if [ -n "${cmd5PlatformNameFound}" ]; then
                     return
                  else
                     fullPath=""
                  fi
               fi
            done
         ;;
      esac
   done
}

function checkForPlatformCmd5InHomebridgeConfigJson()
{
   validFile=""
   for ((tryIndex = 1; tryIndex <= 2; tryIndex ++)); do
      case $tryIndex in
         1)
            validFile=$(grep -n "${cmd5Platform1}" "${configJson}"|cut -d":" -f1)
            if [ -n "${validFile}" ]; then
               cmd5Platform="${cmd5Platform1}"
               return
            fi
         ;;
         2)
            validFile=$(grep -n "${cmd5Platform2}" "${configJson}"|cut -d":" -f1)
            if [ -n "${validFile}" ]; then
               cmd5Platform="${cmd5Platform2}"
               return
            fi
         ;;
      esac
   done
}

function checkForCmd5PlatformNameInFile()
{
   cmd5PlatformNameFound=""

   for ((Index = 1; Index <= 2; Index ++)); do
      case $Index in
         1)
            cmd5PlatformName=$(echo "${cmd5Platform1}"|cut -d'"' -f4)
            cmd5PlatformNameFound=$(grep -n "\"${cmd5PlatformName}\"" "${fullPath}"|cut -d":" -f1)
            if [ -n "${cmd5PlatformNameFound}" ]; then
               return
            fi
         ;;
         2)
            cmd5PlatformName=$(echo "${cmd5Platform2}"|cut -d'"' -f4)
            cmd5PlatformNameFound=$(grep -n "\"${cmd5PlatformName}\"" "${fullPath}"|cut -d":" -f1)
            if [ -n "${cmd5PlatformNameFound}" ]; then
               return
            fi
         ;;
      esac
   done
}

function copyEnhancedCmd5PriorityPollingQueueJs()
{
   # if the enhanced version of "Cmd5PriorityPollingQueue.txt" is present and Cmd5 version is v7.0.0 or v7.0.1 or v7.0.2,
   # then use this enhanced verison.
   getGlobalNodeModulesPathForFile "Cmd5PriorityPollingQueue.txt"
   if [ -f "${fullPath}" ]; then
      fullPath_txt="${fullPath}"
      fullPath_package="${fullPath%/*/*}/homebridge-cmd5/package.json"
      # check the Cmd5 version
      Cmd5_version="$(jq '.version' "${fullPath_package}")"
      if expr "${Cmd5_version}" : '"7.0.[0-2]"' >/dev/null; then
         fullPath_js="${fullPath%/*/*}/homebridge-cmd5/Cmd5PriorityPollingQueue.js"
         case $UIversion in
            customUI )
               cp "${fullPath_txt}" "${fullPath_js}"
               rc1=$?
               if [ "${rc1}" = "0" ]; then
                  echo "COPIED and "
               else
                  echo "NOT COPIED but "
               fi
            ;;
            nonUI )
               sudo cp "${fullPath_txt}" "${fullPath_js}"
               rc1=$?
               if [ "${rc1}" = "0" ]; then
                  echo "${TLBL}INFO: An enhanced version of ${BOLD}\"Cmd5PriorityPollingQueue.js\"${TNRM}${TLBL} was located and copied to Cmd5 plugin.${TNRM}"
                  echo ""
               else
                  echo "${TYEL}WARNING: An enhanced version of ${BOLD}\"Cmd5PriorityPollingQueue.js\"${TNRM}${TYEL} was NOT copied to Cmd5 plugin with an error code: ${rc1}."
                  echo "         Please copy it manually (details explained in item 12 of plugin README).${TNRM}"
                  echo ""
               fi
            ;;
         esac
         if [ "${rc1}" != "0" ]; then
            {  echo "#!/bin/bash"
               echo ""
               echo "# This script will copy the enhanced version of Cmd5PriorityPollingQueue.js module to Cmd5 plugin."
               echo "# This will improve the performance of \"Cmd5-AdvantageAir\" plugin."
               echo ""
               echo "# fun color stuff"
               echo "BOLD=\$(tput bold)"
               echo "TRED=\$(tput setaf 1)"
               echo "TLBL=\$(tput setaf 6)"
               echo "TNRM=\$(tput sgr0)"
               echo ""
               echo "if [ -f ${fullPath} ]; then"
               echo "   # check the Cmd5 version whether it is v7.0.0 or v7.0.1 or v7.0.2"
               echo "   Cmd5_version=\$(jq '.version' ${fullPath_package})"
               echo "   if expr \"\${Cmd5_version}\" : '\"7.0.[0-2]\"' >/dev/null; then"
               echo "      sudo cp ${fullPath_txt} ${fullPath_js}"
               echo "      rc1=\$?"
               echo "      if [ \"\${rc1}\" = \"0\" ]; then"
               echo "         echo \"\${TLBL}INFO: An enhanced version of \${BOLD}\\\"Cmd5PriorityPollingQueue.js\\\"\${TNRM}\${TLBL} was located and copied to Cmd5 plugin.\${TNRM}\""
               echo "      else"
               echo "         echo \"\${TYEL}WARNING: An enhanced version of \${BOLD}\\\"Cmd5PriorityPollingQueue.js\\\"\${TNRM}\${TYEL} was NOT copied to Cmd5 plugin with an error code: \${rc1}.\${TNRM}\""
               echo "         echo \"         Please copy it manually (details explained in item 12 of plugin README).\${TNRM}\""
               echo "      fi"
               echo "   else"
               echo "      echo \"\${TRED}ERROR: An enhanced version of \${BOLD}\\\"Cmd5PriorityPollingQueue.js\\\"\${TNRM}\${TRED} was NOT copied to Cmd5 plugin,\${TNRM}\""
               echo "      echo \"\${TRED}ERROR: because the Cmd5 version is \${Cmd5_version}. It has to be v7.0.0 or v7.0.1 or v7.0.2.\${TNRM}\""
               echo "   fi"
               echo "else"
               echo "   echo \"\${TRED}ERROR: An enhanced version of \${BOLD}\\\"Cmd5PriorityPollingQueue.js\\\"\${TNRM}\${TRED} was NOT located.\${TNRM}\""
               echo "fi"
               echo "exit 0"
            } > "copyEnhancedCmd5PriorityPollingQueueJs.sh"
            chmod +x "copyEnhancedCmd5PriorityPollingQueueJs.sh"
         fi
      fi
   fi
}

function cleanUp()
{
   # cleaning up
   rm -f "${configJson}"
   rm -f "${configJson}.Cmd5less"
   rm -f "${cmd5ConfigJson}"
   rm -f "${cmd5ConfigConstantsAA}"
   rm -f "${cmd5ConfigQueueTypesAA}"
   rm -f "${cmd5ConfigAccessoriesAA}"
   rm -f "${cmd5ConfigNonAA}"
   rm -f "${cmd5ConfigConstantsNonAA}"
   rm -f "${cmd5ConfigQueueTypesNonAA}"
   rm -f "${cmd5ConfigAccessoriesNonAA}"
   rm -f "${cmd5ConfigMiscKeys}"
   rm -f "${cmd5ConfigJsonAAwithNonAA}"
   rm -f "${configJsonNew}"
}

# main starts here

if [ -z "${MYPLACE_SH_PATH}" ]; then UIversion="nonUI"; fi

case $UIversion in
   customUI )
      if expr "${AAIP}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*$' >/dev/null; then
         AAIP="${AAIP}:2025"
      else
         if expr "${AAIP}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:[0-9]*$' >/dev/null; then
            echo ""
         else
            echo "ERROR: the specified IP address ${AAIP} is in wrong format"
            exit 1
         fi
      fi

      if [[ -n "${AAIP2}" && "${AAIP2}" != "undefined" ]]; then
         if expr "${AAIP2}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*$' >/dev/null; then
            AAIP2="${AAIP2}:2025"
         else
            if expr "${AAIP2}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:[0-9]*$' >/dev/null; then
               echo ""
            else
               echo "ERROR: the specified IP address ${AAIP2} is in wrong format"
               exit 1
            fi
         fi
      else
         AAIP2=""
         AAname2=""
      fi

      if [[ -n "${AAIP3}" && "${AAIP3}" != "undefined" ]]; then
         if expr "${AAIP3}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*$' >/dev/null; then
            AAIP3="${AAIP3}:2025"
         else
            if expr "${AAIP3}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:[0-9]*$' >/dev/null; then
               echo ""
            else
               echo "ERROR: the specified IP address ${AAIP3} is in wrong format"
               exit 1
            fi
         fi
      else
         AAIP3=""
         AAname3=""
      fi
   ;;
   nonUI )
      AAIP=""
      AAIP2=""
      AAIP3=""

      until [ -n "${AAIP}" ]; do
         echo "${TYEL}Please enter the name (default: Aircon) and IP address of your AdvantageAir system:"
         read -r -p "Name: ${TNRM}" AAname
         if [ -z "${AAname}" ]; then AAname="Aircon"; fi
         read -r -p "${TYEL}IP address (xxx.xxx.xxx.xxx or xxx.xxx.xxx.xxx:xxxx): ${TNRM}" INPUT
         if expr "${INPUT}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*$' >/dev/null; then
            AAIP="${INPUT}:2025"
         else
            if expr "${INPUT}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:[0-9]*$' >/dev/null; then
               PORT=$(echo "${INPUT}" | cut -d':' -f2)
               if [ -n "${PORT}" ]; then AAIP="${INPUT}"; else AAIP="${INPUT}2025"; fi
            else
               echo ""
               echo "${TPUR}WARNING: Wrong format for an IP address! Please enter again!${TNRM}"
               echo ""
            fi
         fi
      done

      read -r -p "${TYEL}Include extra fancy timers to turn-on the Aircon in specific mode: Cool, Heat or Vent? (y/n, default=n):${TNRM} " INPUT
      if [[ "${INPUT}" = "y" || "${INPUT}" = "Y" ]]; then
         timerSetup1="includeFancyTimers"
      else
         timerSetup1="noFancyTimers"
      fi

      AAdebug="false"
      read -r -p "${TYEL}Enable debug? (y/n, default=n): ${TNRM}" INPUT
      if [[ "${INPUT}" = "y" || "${INPUT}" = "Y" || "${INPUT}" = "true" ]]; then AAdebug="true"; fi

      until [ -n "${AAIP2}" ]; do
         echo ""
         echo "${TYEL}Please enter the name and IP address of your 2nd AdvantageAir System if any. Just hit 'enter' if none:"
         read -r -p "Name: ${TNRM}" AAname2
         if [ -z "${AAname2}" ]; then
            break
         fi
         read -r -p "${TYEL}IP address (xxx.xxx.xxx.xxx or xxx.xxx.xxx.xxx:xxxx): ${TNRM}" INPUT
         if expr "${INPUT}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*$' >/dev/null; then
            AAIP2="${INPUT}:2025"
         else
            if expr "${INPUT}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:[0-9]*$' >/dev/null; then
               PORT=$(echo "${INPUT}" | cut -d':' -f2)
               if [ -n "${PORT}" ]; then AAIP2="${INPUT}"; else AAIP2="${INPUT}2025"; fi
            else
               echo ""
               echo "${TPUR}WARNING: Wrong format for an IP address! Please enter again!${TNRM}"
               echo ""
            fi
         fi
      done
      if [ -n "${AAIP2}" ]; then
         read -r -p "${TYEL}Include extra fancy timers to turn-on the Aircon in specific mode: Cool, Heat or Vent? (y/n, default=n):${TNRM} " INPUT
         if [[ "${INPUT}" = "y" || "${INPUT}" = "Y" ]]; then
            timerSetup2="includeFancyTimers"
         else
            timerSetup2="noFancyTimers"
         fi

         AAdebug2="false"
         read -r -p "${TYEL}Enable debug? (y/n, default=n): ${TNRM}" INPUT
         if [[ "${INPUT}" = "y" || "${INPUT}" = "Y" || "${INPUT}" = "true" ]]; then AAdebug2="true"; fi
      fi

      if [ -n "${AAIP2}" ]; then
         until [ -n "${AAIP3}" ]; do
            echo ""
            echo "${TYEL}Please enter the name and IP address of your 3rd AdvantageAir System if any. Just hit 'enter' if none:"
            read -r -p "Name: ${TNRM}" AAname3
            if [ -z "${AAname3}" ]; then
               break
            fi
            read -r -p "${TYEL}IP address (xxx.xxx.xxx.xxx or xxx.xxx.xxx.xxx:xxxx): ${TNRM}" INPUT
            if expr "${INPUT}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*$' >/dev/null; then
               AAIP3="${INPUT}:2025"
            else
               if expr "${INPUT}" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:[0-9]*$' >/dev/null; then
                  PORT=$(echo "${INPUT}" | cut -d':' -f2)
                  if [ -n "${PORT}" ]; then AAIP3="${INPUT}"; else AAIP3="${INPUT}2025"; fi
               else
                  echo ""
                  echo "${TPUR}WARNING: Wrong format for an IP address! Please enter again!${TNRM}"
                  echo ""
               fi
            fi
         done
         if [ -n "${AAIP3}" ]; then
            read -r -p "${TYEL}Include extra fancy timers to turn-on the Aircon in specific mode: Cool, Heat or Vent? (y/n, default=n):${TNRM} " INPUT
            if [[ "${INPUT}" = "y" || "${INPUT}" = "Y" ]]; then
               timerSetup3="includeFancyTimers"
            else
               timerSetup3="noFancyTimers"
            fi

            AAdebug3="false"
            read -r -p "${TYEL}Enable debug? (y/n, default=n): ${TNRM}" INPUT
            if [[ "${INPUT}" = "y" || "${INPUT}" = "Y" || "${INPUT}" = "true" ]]; then AAdebug3="true"; fi
         fi
      fi

      # get the full path to MyPlace.sh
      MYPLACE_SH_PATH=""
      getGlobalNodeModulesPathForFile "MyPlace.sh"
      if [ -n "${fullPath}" ]; then
         MYPLACE_SH_PATH=${fullPath}
         echo ""
         echo "${TLBL}INFO: MyPlace.sh found: ${MYPLACE_SH_PATH}${TNRM}"
      fi

      if [ -z "${MYPLACE_SH_PATH}" ]; then
         MYPLACE_SH_PATH=""
         until [ -n "${MYPLACE_SH_PATH}" ]; do
            echo ""
            echo "${TYEL}Please enter the full path of where the MyPlace.sh is installed in your system"
            echo "The file path format should be : /*/*/*/node_modules/homebridge-myplace/MyPlace.sh${TNRM}"
            read -r -p "${BOLD}> ${TNRM}" INPUT
            if expr "${INPUT}" : '/[a-zA-Z0-9/_]*/node_modules/homebridge-myplace/MyPlace.sh$' >/dev/null; then
               if [ -f "${INPUT}" ]; then
                  MYPLACE_SH_PATH=${INPUT}
                  echo ""
                  echo "${TLBL}INFO: MyPlace.sh specified: ${MYPLACE_SH_PATH}${TNRM}"
                  break
               else
                  echo ""
                  echo "${TPUR}WARNING: file ${INPUT} not found${TNRM}"
               fi
            else
               echo ""
               echo "${TPUR}WARNING: file ${INPUT} is in wrong format${TNRM}"
            fi
         done
      fi
   ;;
esac

if [ -n "${AAIP}" ]; then noOfTablets=1; fi
if [ -n "${AAIP2}" ]; then noOfTablets=2; fi
if [ -n "${AAIP3}" ]; then noOfTablets=3; fi

for ((n=1; n<=noOfTablets; n++)); do

   if [ "${n}" = "1" ]; then
      ip="\${AAIP}"
      IPA="${AAIP}"
      nameA="${AAname}"
      timerSetup="${timerSetup1}"
      debug="${AAdebug}"
      queue="AAA"
   fi
   if [ "${n}" = "2" ]; then
      ip="\${AAIP2}"
      IPA="${AAIP2}"
      nameA="${AAname2}"
      timerSetup="${timerSetup2}"
      debug="${AAdebug2}"
      queue="AAB"
   fi
   if [ "${n}" = "3" ]; then
      ip="\${AAIP3}"
      IPA="${AAIP3}"
      nameA="${AAname3}"
      timerSetup="${timerSetup3}"
      debug="${AAdebug3}"
      queue="AAC"
   fi

   if [[ "${n}" = "1" && "${UIversion}" = "nonUI" ]]; then
      echo ""
      if [ "${noOfTablets}" = "1" ]; then echo "${TLBL}${BOLD}INFO: This process may take up to 1 minute!${TNRM}"; fi
      if [ "${noOfTablets}" = "2" ]; then echo "${TLBL}${BOLD}INFO: This process may take up to 2 minutes!${TNRM}"; fi
      if [ "${noOfTablets}" = "3" ]; then echo "${TLBL}${BOLD}INFO: This process may take up to 3 minutes!${TNRM}"; fi
   fi

   if [ "${UIversion}" = "nonUI" ]; then
      echo "${TLBL}INFO: Fetching and processing data from your AdvantageAir system (${nameA} ${IPA}).... ${TNRM}"
      echo ""
      echo "${TLBL}INFO: timerSetup=${timerSetup}${TNRM}"
      echo ""

   fi

   myAirData=$(curl -s -g --max-time 45 --fail --connect-timeout 45 "http://${IPA}/getSystemData")
   #
   if [ -z "$myAirData" ]; then
      echo "${TRED}ERROR: AdvantageAir system is inaccessible or your IP address ${IPA} is invalid!${TNRM}"
      exit 1
   fi


   if [ "${n}" = "1" ]; then
      #nameA=$(echo "$myAirData"|jq -e ".system.name" | sed 's/ /_/g' | sed s/[\'\"]//g)
      cmd5ConfigJsonAA="cmd5Config_AA_${nameA}.json"
      cmd5ConfigJsonAAwithNonAA="${cmd5ConfigJsonAA}.withNonAA"
   fi
   #
   sysType=$(echo "$myAirData" | jq -e ".system.sysType" | sed 's/ /_/g' | sed 's/\"//g')
   if [ -z "${sysType}" ]; then
      echo "${TRED}ERROR: jq failed! Please make sure that jq is installed!${TNRM}"
      exit 1
   fi
   tspModel=$(echo "$myAirData" | jq -e ".system.tspModel" | sed 's/ /_/g' | sed 's/\"//g')

   hasAircons=$(echo "$myAirData"|jq -e ".system.hasAircons")
   noOfAircons=$(echo "$myAirData"|jq -e ".system.noOfAircons")
   hasLights=$(echo "$myAirData"|jq -e ".system.hasLights")
   hasThings=$(echo "$myAirData"|jq -e ".system.hasThings")

   # Create the ${cmd5ConfigConstantsAA}, ${cmd5ConfigQueueTypesAA} and ${cmd5ConfigAccessoriesAA}
   if [ "${n}" = "1" ] && [[ "${hasAircons}" || "${hasLights}" || "${hasThings}" ]]; then
      cmd5ConstantsHeader "${cmd5ConfigConstantsAA}"
      cmd5QueueTypesHeader "${cmd5ConfigQueueTypesAA}"
      cmd5AccessoriesHeader "${cmd5ConfigAccessoriesAA}"
   fi

   # Append the body of AA constants and queueTypes
   cmd5Constants "${cmd5ConfigConstantsAA}"
   cmd5QueueTypes "${cmd5ConfigQueueTypesAA}"

   # Create the $cmd5ConfigAccessories
   # Aircon systems
   if [ "$hasAircons" = true ]; then
      for (( a=1;a<=noOfAircons;a++ )); do
         ac=$( printf "ac%1d" "$a" )
         aircon=$(echo "$myAirData" | jq -e ".aircons.${ac}.info")
         if [ "${aircon}" != "null" ]; then
            if [ "${a}" -ge "2" ]; then nameA="${nameA}_${ac}"; fi
            #name=$(echo "$myAirData" | jq -e ".aircons.${ac}.info.name" | sed 's/ /_/g' | sed 's/\"//g')
            cmd5Thermostat "${cmd5ConfigAccessoriesAA}" "${nameA}"
            cmd5FanLinkTypes "${cmd5ConfigAccessoriesAA}" "${nameA} FanSpeed"
            cmd5FanSwitch "${cmd5ConfigAccessoriesAA}" "${nameA} Fan"
            cmd5FanLinkTypes "${cmd5ConfigAccessoriesAA}" "${nameA} FanSpeed"
            cmd5TimerLightbulb "${cmd5ConfigAccessoriesAA}" "${nameA} Timer" "timer"
            if [ "${timerSetup}" = "includeFancyTimers" ]; then
               cmd5TimerLightbulb "${cmd5ConfigAccessoriesAA}" "${nameA} Fan Timer" "fanTimer"
               cmd5TimerLightbulb "${cmd5ConfigAccessoriesAA}" "${nameA} Cool Timer" "coolTimer"
               cmd5TimerLightbulb "${cmd5ConfigAccessoriesAA}" "${nameA} Heat Timer" "heatTimer"
            fi

            # Creating Zones config
            nZones=$(echo "$myAirData" | jq -e ".aircons.${ac}.info.noOfZones")
            myZoneValue=$(echo "$myAirData" | jq -e ".aircons.${ac}.info.myZone")
            for (( b=1;b<=nZones;b++ )); do
               zone="${b}"
               zoneStr=$( printf "z%02d" "${zone}" )
               name=$(echo "$myAirData" |jq -e ".aircons.${ac}.zones.${zoneStr}.name" | sed 's/\"//g')
               rssi=$(echo "$myAirData" | jq -e ".aircons.${ac}.zones.${zoneStr}.rssi")
               if [ "${rssi}" = "0" ]; then
                  cmd5ZoneFan "${cmd5ConfigAccessoriesAA}" "${name} Zone"
               elif [ "${myZoneValue}" != "0" ]; then
                  cmd5ZoneFanv2 "${cmd5ConfigAccessoriesAA}" "${name} Zone"
                  cmd5ZoneLinkedTypesTempSensor "${cmd5ConfigAccessoriesAA}" "${name} Temperature"
               else
                  cmd5ZoneFanv2noRotationDirection "${cmd5ConfigAccessoriesAA}" "${name} Zone"
                  cmd5ZoneLinkedTypesTempSensor "${cmd5ConfigAccessoriesAA}" "${name} Temperature"
               fi
            done
         fi
      done
   fi

   # Lightings
   if [ "$hasLights" = true ]; then
      echo "$myAirData" | jq -e ".myLights.lights" | grep \"id\" | cut -d":" -f2 | sed s/[,]//g | while read -r id;
      do
         name=$(echo "$myAirData" | jq -e ".myLights.lights.${id}.name" | sed s/\"//g)
         value=$(echo "$myAirData" | jq -e ".myLights.lights.${id}.value ")
         if [ "${value}" = "null" ]; then
            cmd5LightbulbNoDimmer "${cmd5ConfigAccessoriesAA}" "${name}" "${id}"
         else
            cmd5LightbulbWithDimmer "${cmd5ConfigAccessoriesAA}" "${name}" "${id}"
         fi
      done
   fi

   # Things - Garage and blinds 
   if [ "$hasThings" = true ]; then
      echo "$myAirData" | jq -e ".myThings.things" | grep \"id\" | cut -d":" -f2 | sed s/[,]//g | while read -r id;
      do
         channelDipState=$(echo "$myAirData" | jq -e ".myThings.things.${id}.channelDipState" | sed s/\"//g)
         name=$(echo "$myAirData" | jq -e ".myThings.things.${id}.name" | sed s/\"//g)
         if [ "${channelDipState}" = "3" ]; then
            cmd5GarageDoorOpener "${cmd5ConfigAccessoriesAA}" "${name}" "${id}"
         elif [[ "${channelDipState}" = "1" || "${channelDipState}" = "2" ]]; then
            cmd5WindowCovering "${cmd5ConfigAccessoriesAA}" "${name}" "${id}"
         fi
      done
   fi

done

# Now write the created ${cmd5ConfigJsonAA} to ${HomebridgeConfigJson} replacing all
# existing AA-related configuration

# Assemble a complete Cmd5 configuration file for the specified AA device(s)
assembleCmd5ConfigJson

# Read the existing Homebridge config.json file
readHomebridgeConfigJson

# Extract all non-AA related Cmd5 devices
extractCmd5ConfigFromConfigJson
extractNonAAaccessoriesrConstantsQueueTypesMisc

# Assemble a complete Cmd5 configuration file for the specified AA devices(s) with the extracted
# non-AA related Cmd5 devices
assembleCmd5ConfigJsonAAwithNonAA

# Write the assembled AA + non-AA Cmd5 configuration into the Homebridge config.json
writeToHomebridgeConfigJson

if [ "${rc}" = "0" ]; then
   echo "${TGRN}${BOLD}DONE! Run CheckConfig then restart Homebridge or HOOBS.${TNRM}"
   rm -f "${cmd5ConfigJsonAA}"
   if [ "${UIversion}" = "nonUI" ]; then
      echo ""
      echo "${TYEL}To run CheckConfig, please copy/paste and run the following command to check whether the Cmd5 configuration meets all the requirements${TNRM}"
      echo "${MYPLACE_SH_PATH%/*}/CheckConfig.sh"
   fi
else
   # Copying of the new config.json to homebridge config.json failed so restore the homebridge config.json from backup
   if [ "${UIversion}" = "nonUI" ]; then
     sudo cp "${configJson}" "${homebridgeConfigJson}"
   else
     cp "${configJson}" "${homebridgeConfigJson}"
   fi
   echo "${TRED}${BOLD}ERROR: Copying of \"${cmd5ConfigJsonAA}\" to Homebridge config.json failed! Original config.json restored.${TNRM}"
   echo "${TLBL}${BOLD}INFO: Instead you can copy/paste the content of \"${cmd5ConfigJsonAA}\" into Cmd5 JASON Config editor.${TNRM}"
fi

cleanUp
exit 0
