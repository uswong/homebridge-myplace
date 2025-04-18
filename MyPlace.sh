#!/bin/bash

#########################################################################
# Many thanks to John Talbot of homebridge-cmd4 and Mitch Williams of 
# homebridge-cmd4-advantageair for all their inital works from which this
# work was evolved from...
#
# Evolution credited to @uswong:
# 1. Fan speed control (2022)
# 2. Store myAirData in cache up to 2 minutes (2022)
# 3. Extend the control to lights and things (2022)
# 4. Update cache on Set request (2022)
# 5. Zone closing control (2022)
# 6. ConfigCreator - Created homebridge UI and developed scriptes to automate 
#    the generation of configuration file required (2023)
# 7. Optional extra timers to turn on aircon in specific mode (2023)
# 8. Added myZone capability (2023)
# 9. Added temperature control for zones with temperature sensor (2024)
#
# Game changer 1: storing myAirData in cache up to 2 minutes was a real game
# changer. This allows a big system with hundreds of devices to run properly,
# otherwise the AdvantageAir tablet will get overwhelmed with Get requests and
# will stop working.
#
# Game changer 2: ConfigCreator was another game changer.  It was a dreadful
# task to create a configureation file especially for a big system with
# hundred of devices, many users shy away from it.  To be able to automate
# the generation of the configureation file make this plugin so easy and
# simple to set up. 
#########################################################################

# Lets be explicit
typeset -i a argSTART argEND

#
# Passed in required Args
#
argEND=$#
IP=""
PORT=""
device=""
io=""
characteristic=""
value="1"

#
# Global returned data
#
myAirData=""
jqResult=""
fanState=0
coolState=0
heatState=0
rc=1

#
# For optional args and arg parsing
#

# Default values
zone=""
noOtherThermostat=false
zoneSpecified=false
fanSpecified=false
fanTimerSpecified=false
coolTimerSpecified=false
heatTimerSpecified=false
argSTART=4
logErrors=true
debugSpecified=false
fanSpeed=false
sameAsCached=false
myZoneAssigned=false
fspeed="low"
lightID=""
thingID=""

# By default selfTest is off
selfTest="TEST_OFF"

# Define the aircon system "ac1", "ac2", etc,  default to "ac1" if not explicitly specified
ac="ac1"

# Define some variables for zone open checking
zoneOpen=0

# For timer capability
timerEnabled=false

# For flip capability for things' open/close, up/down mode
flipEnabled=false

# For lights and things (like garage, etc) controls
lightSpecified=false
thingSpecified=false

#Temporary files - the subdirectory full path will be defined later
if [ -z "${TMPDIR}" ]; then TMPDIR="/tmp"; fi
tmpSubDir="${TMPDIR}"
QUERY_AIRCON_LOG_FILE="queryAirCon.log"
MY_AIRDATA_FILE="myAirData.txt"
TIMER_STATE_FILE="extraTimers.txt"
ZONEOPEN_FILE="zoneOpen.txt"

function showHelp()
{
   local rc="$1"
   cat <<'   HELP_EOF'
   Usage:
     MyPlace.sh Get < AccessoryName > < characteristic > [ Options ]
   or
     MyPlace.sh Set < AccessoryName > < characteristic > < value > [ Options ]
   Where Options maybe any of the following in any order:
     z01, z02, z03 ...  The zone to Set or Query
     XXX.XXX.XXX.XXX    The IP address of the AirCon to talk to
     fanSpeed           If the accessory is used to control the fan speed
     timer              To use a Lightbulb accessory as a timer
   Additional test options to the above are:
     TEST_OFF           The default
     TEST_ON            For npm run test
   HELP_EOF
   exit "$rc"
}

function logError()
{
   if [ "$logErrors" != true ]; then
      return
   fi
   local comment="$1"
   local result="$2"
   local data1="$3"
   local data2="$4"
   local sfx
   local file
   local count
   sfx="$rc-$io-$device-$characteristic"
   sfx=${sfx// /_}
   local fileName="${tmpSubDir}/AAerror-${sfx}.txt"
   file=$(find "${fileName}"* 2>&1|grep -v find)
   #
   # append a counter to the file so that the number of same error is logged
   if [ -f "${file}" ]; then
      count=$(echo "${file}" | cut -d'#' -f2)
      count=$((count + 1))
   else
      count=1
   fi
   rm -f "${file}"
   #
   fileName="${fileName}#${count}"
   { echo "$io $device $characteristic"
     echo "${comment}"
     echo "return code: $rc"
     echo "result: $result"
     echo "data1: $data1"
     echo "data2: $data2"
   } > "$fileName"

   if [ "${io}" = "Set" ]; then
      logQueryAirConDiagnostic "Unhandled $io $device $characteristic $value rc=$rc - this accessory is most likely offline"
   elif [ "${io}" = "Get" ]; then
      logQueryAirConDiagnostic "Unhandled $io $device $characteristic rc=$rc - this accessory is most likely offline!"
   fi
}

function logQueryAirConDiagnostic()
{
   if [ "$debugSpecified" != true ]; then
      return
   fi
   local str="$1"
   echo "$str" >> "$QUERY_AIRCON_LOG_FILE"

   # Delete the log if it is > 15 MB
   fSize=$(find "$QUERY_AIRCON_LOG_FILE" -ls | awk '{print $7}')
   if [ "$fSize" -gt 15728640 ];then
      rm "$QUERY_AIRCON_LOG_FILE"
   fi
}

function getFileStatDt()
{
   local fileName="$1"
   # This script is to determine the time of a file using 'stat'
   # command and calculate the age of the file in seconds
   # The return variables of this script:
   #    tf = last changed time of the file since Epoch
   #    t0 = current time since Epoch
   #    dt = the age of the file in seconds since last changed
   case "$OSTYPE" in
      darwin*)
         tf=$( stat -r "$fileName" | awk '{print $11}' )  # for Mac users
      ;;
      *)
         tf=$( stat -c %Z "$fileName" )
      ;;
   esac
   t0=$(date '+%s')
   dt=$((t0 - tf))
}

function queryAirCon()
{
   local url="$1"
   local exitOnFail="$2"
   local iteration="$3"
   local queryType
   local myAirData_cached="{}"

   local lockFile="${MY_AIRDATA_FILE}.lock"
   local dateFile="${MY_AIRDATA_FILE}.date"

   t0=$(date '+%s')

   # The dateFile is only valid if there is an MY_AIRDATA_FILE
   local useFileCache=false
   local dt=-1

   # The dateFile and MY_AIRDATA_FILE must exist together to check
   # for a valid date stamp
   if [[ -f "$dateFile" && -f "$MY_AIRDATA_FILE" ]]; then
      tf=$(cat "$dateFile")
      dt=$(( t0 - tf ))
      if [ "$dt" -le 120 ]; then
         useFileCache=true 
      elif [[ "$dt" -gt 180  &&  -f "$lockFile" ]]; then # an earlier curl may have timed out
         tlf=$(cat "$lockFile")
         dtlf=$(( t0 - tlf ))

         # If earlier curl timed out, recover by removing the lockFile and try again in 1.2s (max 5 tries)
         if [ "$dtlf" -ge 60 ]; then 
            rm "$lockFile"
            rc=99
            logQueryAirConDiagnostic "queryAirCon_calls_earlier_curl_timed_out $tf $t0 $dt $useFileCache rc=$rc itr=$iteration $io $device $characteristic $url"

            # To test the logic, issue this comment
            if [ "$selfTest" = "TEST_ON" ]; then
               echo "Earlier \"curl\" to getSystemData has timed out, recover and try again in 1.2s"
            fi

            return
         fi
      fi
   fi
   logQueryAirConDiagnostic "queryAirCon_calls $tf $t0 $dt $useFileCache itr=$iteration $io $device $characteristic $url" 

   # If $lockFile is detected, iterate until it is deleted or 60s whichever is earlier
   # The $lockfile can be there for 1s to 60s (even beyond occasionally) for a big system, with an average of ~6s
   if [ -f "$lockFile" ]; then
      queryType="copy"
      tlf=$(cat "$lockFile")
      while [ -f "$lockFile" ]; do
         sleep 1.0
         t2=$(date '+%s')
         dt=$(( t2 - t0 ))
         dtlf=$(( t2 - tlf ))

         # earlier curl has timed out (timeout:60000) - this rarely happen (<0.1% of the time)
         # flag it, remove the $lockFile and copy the existing cached file, try again next cycle.
         if [ "$dtlf" -ge 60 ]; then  
            rc=98
            logQueryAirConDiagnostic "queryAirCon_timed_out_so_copy_earlier_cache $t0 $t2 $dt $useFileCache rc=$rc itr=$iteration $io $device $characteristic $url"

            # Remove the lockFile
            rm "$lockFile"

            # To test the logic, issue this comment
            if [ "$selfTest" = "TEST_ON" ]; then
               echo "Earlier \"curl\" to getSystemData has timed out, recover and just copy the earlier cache"
            fi
            break 
         fi
      done
      myAirData=$( cat "$MY_AIRDATA_FILE" )
      rc=$?
      logQueryAirConDiagnostic "queryAirCon_copy  $t0 $t2 $dt $useFileCache rc=$rc itr=$iteration $io $device $characteristic $url"

      # To test the logic, issue this comment
      if [ "$selfTest" = "TEST_ON" ]; then
         echo "myAirData fetched from the Cache"
      fi

   # Fetch the data from the Cache
   elif [ "$useFileCache" = true ]; then
      queryType="cache"
      myAirData=$( cat "$MY_AIRDATA_FILE" )
      rc=$?

   # Fetch the data from the System
   elif [ "$useFileCache" = false ]; then
      queryType="curl"
      echo "$t0" > "$lockFile"
      myAirData=$( curl --fail -s -g "$url")
      rc=$?
      if [ "$rc" = "0" ]; then
         #Need to parse to ensure the json file is not empty
         parseMyAirDataWithJq ".aircons.$ac.info" "${exitOnFail}"
         if [ "$rc" = "0" ]; then
            t2=$(date '+%s') 
            echo "$t2" > "$dateFile"  # overwrite $dateFile
            #if $myAirData is not the same as the cached file, overwrite it with the new $myAirData 
            if [ -f "$MY_AIRDATA_FILE" ]; then isMyAirDataSameAsCached; fi
            if [ $sameAsCached = false ]; then echo "$myAirData" > "$MY_AIRDATA_FILE"; fi
            dt=$((t2 - t0))  # time-taken for curl command to complete
            logQueryAirConDiagnostic "queryAirCon_curl  $t0 $t2 $dt $useFileCache rc=$rc itr=$iteration $io $device $characteristic $url"
         else
            echo "{}" > "$MY_AIRDATA_FILE"
            echo "$t2" > "$dateFile" 
            logQueryAirConDiagnostic "queryAirCon_curl_invalid $t0 $t2 $dt $useFileCache rc=$rc itr=$iteration $io $device $characteristic $url"
            # just in case
            unset myAirData
         fi
      else
         echo "{}" > "$MY_AIRDATA_FILE"
         echo "$t2" > "$dateFile" 
         logQueryAirConDiagnostic "queryAirCon_curl_failed $t0 $t2 $dt $useFileCache rc=$rc itr=$iteration $io $device $characteristic $url"
         unset myAirData
      fi
      rm "$lockFile"
   fi

   if [ "$rc" != "0" ]; then
      if [ "$exitOnFail" = "1" ]; then
         logError "getValue_${queryType} failed" "" "" "$url"
         exit $rc
      fi
   fi
}

function isMyAirDataSameAsCached()
{
   local aircons
   local lights
   local things
   local myAirData_cached
   local aircons_cached
   local lights_cached
   local things_cached

   myAirData_cached=$(cat "$MY_AIRDATA_FILE")

   if [ "$myAirData_cached" = "$myAirData" ]; then
      sameAsCached=true
      return
   elif [ "$myAirData_cached" = "{}" ]; then
      return
   fi
   # For aircon system with temperature sensors, "rssi" and "measuredTemp" are changing all the time
   # do not need to compare "rssi" but if "measuredTemp" is changed, cached file will be updated 
   # compare only the aircons, lights and things - all the rest does not matter
   aircons=$(echo "$myAirData"|jq -ec ".aircons[]"|sed s/rssi\":[0-9]*/rssi\":0/g)
   lights=$(echo "$myAirData"|jq -ec ".myLights.lights[]")
   things=$(echo "$myAirData"|jq -ec ".myThings.things[]")

   aircons_cached=$(echo "$myAirData_cached"|jq -ec ".aircons[]"|sed s/rssi\":[0-9]*/rssi\":0/g)
   lights_cached=$(echo "$myAirData_cached"|jq -ec ".myLights.lights[]")
   things_cached=$(echo "$myAirData_cached"|jq -ec ".myThings.things[]")

   if [[ "$aircons" = "$aircons_cached" && "$lights" = "$lights_cached" && "$things" = "$things_cached" ]]; then sameAsCached=true; fi
}

function setAirConUsingIteration()
{
   local url="$1"
   local dateFile="${MY_AIRDATA_FILE}.date"

   # This script is purely used to 'Set' the AA system and to update the MY_AIRDATA_FILE cached file

   if [ "$selfTest" = "TEST_ON" ]; then
      # For Testing, you can compare whats sent
      echo "Setting url: $url";
   fi

   # Try 5 times, the last returning the error found.
   for i in 0 1 2 3 4
   do
      if [ "$selfTest" = "TEST_ON" ]; then
         echo "Try $i"
      fi
      local exitOnFail="0"
      if [ "$i" = "4" ]; then
         exitOnFail="1"
      fi

      t3=$(date '+%s')
      curlResult=$(curl --fail -s -g "$url")
      rc=$?
      curlResult=$(echo "${curlResult}" | grep false)
      if [[ "$rc" = "0" && -n "${curlResult}" ]]; then rc=5; fi 

      logQueryAirConDiagnostic "setAirCon_curl $t3 rc=$rc itr=$i $io $device $characteristic $value $url"

      if [ "$rc" = "0" ]; then
         # update $MY_AIRDATA_FILE directly instead of fetching a new copy from AdvantageAir controller after a set command
         updateMyAirDataCachedFile "$url"
         myAirData=$( cat "$MY_AIRDATA_FILE" )
         echo "$t3" > "$dateFile"
         return
      fi

      if [ "$exitOnFail" = "1" ]; then
         logQueryAirConDiagnostic "setAirCon_curl_failed $t3 rc=$rc $io $device $characteristic $value $url"
         logError "SetAirCon_curl failed" "" "$io" "$url"
         exit $rc
      fi

      sleep 1.0
   done
}

function updateMyAirDataCachedFile()
{
   local url="$1"
 
   # This script to parse the curl $url: input   - 'http://192.168.0.31:2025/setAircon?json={ac1:{zones:{z04:{state:open}}}}'
   #             into jq set path:      output  - '.aircons.ac1.zones.z04.state="open"'

   #                                     input   - 'http://192.168.0.31:2025/setAircon?json={ac1:{zones:{z04:{value:90}}}}'
   #                                     output  - '.aircons.ac1.zones.z04.value=90'

   #                                     input   - 'http://192.168.0.31:2025/setAircon?json={ac1:{info:{state:on,mode:vent}}}'
   #                                     output1 - '.aircons.ac1.info.state="on"    
   #                                     output2 - '.aircons.ac1.info.mode="vent"

   local setNumber
   local setMode 
   local jqPathToSetJson
   local jqPathToSetJsonState

   local JqHeader=${url:$((${#IP}+13)):8}
   local setJqPath=${url:$((${#IP}+13)):100}
   setNumber=$(echo "$setJqPath"|grep 'value\|setTemp\|countDownTo\|myZone')
   setMode=$(echo "$setJqPath"|grep mode)

   # Strip down $jqPath by removing `"`, `{`, `}` and replace the last `:` with `=`
   # then replace the rest of `:` with `.`
   setJqPath=$(echo "$setJqPath"|sed s/[\"\{\}]//g|sed -E 's/(.*)\:/\1=/'|sed s/:/./g)
   #
   case $JqHeader in
      setAirco)
         setJqPath=${setJqPath//setAircon?json=/.aircons.}
         if [ -n "$setNumber" ]; then
            jqPathToSetJson=$setJqPath
         elif [ -n "$setMode" ]; then
            jqPathToSetJson=$(echo "$setJqPath"|sed s/state.on,//|sed 's/\(=\)\(.*\)/\1"\2"/g')
            jqPathToSetJsonState=$(echo "$jqPathToSetJson"|cut -d"=" -f1|sed s/mode/state=\"on\"/)
            updateMyAirDataCachedFileWithJq "$url" "$jqPathToSetJsonState"
         else  # value is a string
            setJqPath=${setJqPath//=/=\"}
            jqPathToSetJson=$setJqPath\"
         fi
         updateMyAirDataCachedFileWithJq "$url" "$jqPathToSetJson"
         ;;
      setLight)
         setJqPath=$(echo "$setJqPath"|sed s/setLight?json=id./.myLights.lights.\"/|sed s/,/\"./)
         if [ -n "$setNumber" ]; then 
            jqPathToSetJson=$setJqPath
         else  # value is a string
            setJqPath=${setJqPath//=/=\"}
            jqPathToSetJson=$setJqPath\"
         fi
         updateMyAirDataCachedFileWithJq "$url" "$jqPathToSetJson"
         ;;
      setThing) # value for things is always a number
         jqPathToSetJson=$(echo "$setJqPath"|sed s/setThing?json=id./.myThings.things.\"/|sed s/,/\"./)
         updateMyAirDataCachedFileWithJq "$url" "$jqPathToSetJson"
         ;;
   esac
}

function updateMyAirDataCachedFileWithJq()
{
   # this script to use jq to update the $MY_AIRDATA_FILE 

   local url="$1"
   local jqPath="$2"
   local updatedMyAirData
   #
   updatedMyAirData=$(jq -ec "$jqPath" "$MY_AIRDATA_FILE")
   rc=$?
   if [ "$rc" = "0" ]; then
      echo "$updatedMyAirData" > "$MY_AIRDATA_FILE"
      logQueryAirConDiagnostic "setAirCon_setJson $t3 rc=$rc $io $device $characteristic $jqPath"
      if [ "$selfTest" = "TEST_ON" ]; then
         # For Testing, you can compare whats sent
         echo "Setting json: $jqPath"
      fi
   else
      logQueryAirConDiagnostic "setAirCon_setJson_failed $t3 rc=$rc $io $device $characteristic $jqPath"
      logError "setAirCon_setJson jq failed" "$jqPath" "" "$url"
      exit $rc
   fi
}

function parseMyAirDataWithJq()
{
   local jqPath="$1"
   local exitOnFail="$2"

   if [ -z "${exitOnFail}" ]; then exitOnFail=1; fi

   # Understanding jq options
   # -e                  (Upon bad data, exit with return code )
   # Updates global variable jqResult
   jqResult=$( echo "$myAirData" | jq -e "$jqPath" )
   rc=$?
   if [ "$rc" = "1" ] && [ "$jqResult" = false ]; then   # "false" is an acceptable answer
      rc=0
   fi
   if [ "$rc" != "0" ]; then
      if [ "$selfTest" = "TEST_ON" ]; then
         # For Testing, you can compare whats sent
         echo "Parsing for jqPath failed: $jqPath";
      fi
      if [ "$exitOnFail" = "1" ]; then
         logQueryAirConDiagnostic "parseMyAirDataWithJq_failed rc=$rc jqResult=$jqResult $io $device $characteristic $jqPath"
         logError "jq failed" "$rc" "$jqResult" "" "$jqPath"
         exit $rc
      fi
   else
      if [ "$selfTest" = "TEST_ON" ]; then
         # For Testing, you can compare whats sent
         echo "Parsing for jqPath: $jqPath";
      fi
   fi
}

function  queryAirConWithIterations()
{
   local url="$1"

   # Try 5 times, the last returning the error found.
   for i in 0 1 2 3 4
   do
      if [ "$selfTest" = "TEST_ON" ]; then
         echo "Try $i"
      fi
      local exitOnFail="0"
      if [ "$i" = "4" ]; then
         exitOnFail="1"
      fi
      # Updates global variable myAirData
      queryAirCon "$url" "$exitOnFail" "$i"
      if [ "$rc" = "0" ]; then
         break
      else
         sleep 1.2
      fi
   done
}

function getMyAirDataFromCachedFile()
{
   # get myAirData from $MY_AIRDATA_FILE cached file

   if [ -f "$MY_AIRDATA_FILE" ]; then
      myAirData=$(cat "$MY_AIRDATA_FILE")
      if [ "$selfTest" = "TEST_ON" ]; then
         echo "Getting myAirData.txt from cached file"
      fi
   else
      queryAirConWithIterations "http://$IP:$PORT/getSystemData"
   fi
}

function openZoneInFullWithZoneOpenCounter()
{
   Zone="$1"
   setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$Zone:{state:open}}}}"
   # update the number of zoneOpen in a temporary file to be used up to 10 seconds
   zoneOpen=$((zoneOpen + 1))
   ZONEOPEN_JSON=$( jq ".$ac |= $zoneOpen" "$ZONEOPEN_FILE" )
   echo "$ZONEOPEN_JSON" > "$ZONEOPEN_FILE"
   parseMyAirDataWithJq ".aircons.$ac.zones.${Zone}.rssi"
   if [ "${jqResult}"  = "0" ]; then
      setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$Zone:{value:100}}}}"
   fi
}

function closeZoneWithZoneOpenCounter()
{
   Zone="$1"
   setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$Zone:{state:close}}}}"
   # update the number of zoneOpen in a temporary file to be used up to 10 seconds
   zoneOpen=$((zoneOpen - 1))
   ZONEOPEN_JSON=$( jq ".$ac |= $zoneOpen" "$ZONEOPEN_FILE" )
   echo "$ZONEOPEN_JSON" > "$ZONEOPEN_FILE"
}

function setMyZoneToAnOpenedZoneWithTempSensorWithPriorityToCzones()
{
   # set myZone to an open zone with priority to an open cZone.  
   # Note: this routine is only called for the case where zoneOpen > noOfConstants.

   for cZone in $cZone1 $cZone2 $cZone3; do
      if [[ "${cZone}" != "z00" && "${cZone}" != "${zone}" ]]; then
         parseMyAirDataWithJq ".aircons.$ac.zones.${cZone}.state"
         if [ "${jqResult}" = '"open"' ]; then
            parseMyAirDataWithJq ".aircons.$ac.zones.${cZone}.rssi"
            if [ "${jqResult}" != "0" ]; then
               myZone="${cZone}"
               myZoneValue=$((10#$( echo "${myZone}" | cut -d"z" -f2 ))) 
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{myZone:$myZoneValue}}}"
               myZoneAssigned=true
               # the target temperature of myZone needs to be copied to the system target temperature
               parseMyAirDataWithJq ".aircons.$ac.zones.${myZone}.setTemp"
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{setTemp:$jqResult}}}"
               return
            fi
         fi
      fi
   done

   # if all cZones are closed then assign myZone to a next open zone
   for ((Zone=1; Zone<=nZones; Zone++)); do
      ZoneStr=$( printf "z%02d" "${Zone}" )
      if [[ "${ZoneStr}" != "${zone}" && "${ZoneStr}" != "${cZone1}" && "${ZoneStr}" != "${cZone2}" && "${ZoneStr}" != "${cZone3}" ]]; then
         parseMyAirDataWithJq ".aircons.$ac.zones.${ZoneStr}.state"
         if [ "${jqResult}" = '"open"' ]; then
            parseMyAirDataWithJq ".aircons.$ac.zones.${ZoneStr}.rssi"
            if [ "${jqResult}" != "0" ]; then
               myZone="${ZoneStr}"
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{myZone:$Zone}}}"
               myZoneAssigned=true
               # the target temperature of myZone needs to be copied to the system target temperature
               parseMyAirDataWithJq ".aircons.$ac.zones.${myZone}.setTemp"
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{setTemp:$jqResult}}}"
               return
            fi
         fi
      fi
   done
}

function openAclosedCzone()
{
   # Open up a closed cZone 
   # Note: this routine is only called for the case where zoneOpen = noOfConstants.

   for cZone in $cZone1 $cZone2 $cZone3; do
      if [ "${cZone}" != "z00" ]; then
         parseMyAirDataWithJq ".aircons.$ac.zones.${cZone}.state"
         if [ "${jqResult}" = '"close"' ]; then
            openZoneInFullWithZoneOpenCounter "${cZone}"
            return
         fi
      fi
   done
}

function openAclosedZoneWithTempSensorWithPriorityToCzones()
{
   # Open up a closed zone with temperature sensor

   for cZone in $cZone1 $cZone2 $cZone3; do
      if [[ "${cZone}" != "z00" && "${cZone}" != "${zone}" ]]; then
         parseMyAirDataWithJq ".aircons.$ac.zones.${cZone}.state"
         if [ "${jqResult}" = '"close"' ]; then
            parseMyAirDataWithJq ".aircons.$ac.zones.${cZone}.rssi"
            if [ "${jqResult}" != "0" ]; then
               openZoneInFullWithZoneOpenCounter "${cZone}"
               return
            fi
         fi
      fi
   done

   for ((Zone=1; Zone<=nZones; Zone++)); do
      ZoneStr=$( printf "z%02d" "${Zone}" )
      if [[ "${ZoneStr}" != "${zone}" && "${ZoneStr}" != "${cZone1}" && "${ZoneStr}" != "${cZone2}" && "${ZoneStr}" != "${cZone3}" ]]; then
         parseMyAirDataWithJq ".aircons.$ac.zones.${ZoneStr}.state"
         if [ "${jqResult}" = '"close"' ]; then
            parseMyAirDataWithJq ".aircons.$ac.zones.${ZoneStr}.rssi"
            if [ "${jqResult}" != "0" ]; then
               openZoneInFullWithZoneOpenCounter "${ZoneStr}"
               return
            fi
         fi
      fi
   done
}

function queryTimerStateFile()
{
   local mode="$1"
   local acStates
   addToStateFile=false

   if [ -f "${TIMER_STATE_FILE}" ]; then
      # fetch the timer states from the existing timer state file
      states=$( jq "." "${TIMER_STATE_FILE}" )
      # need to check if the ${states} include this $ac, if not add it
      acStates=$( echo "${states}" | jq -c ".$ac" )
      if [ "${acStates}" = "null" ]; then addToStateFile=true; fi
   else
      # create new timer state file
      states="{}"
      addToStateFile=true
   fi

   if [ "${addToStateFile}" = true ]; then
      states=$( echo "${states}" | jq ".$ac.fan.timeToOn |= 0" \
                                 | jq ".$ac.fan.timeToOff |= 0" \
                                 | jq ".$ac.fan.setTime |= 0" \
                                 | jq ".$ac.cool.timeToOn |= 0" \
                                 | jq ".$ac.cool.timeToOff |= 0" \
                                 | jq ".$ac.cool.setTime |= 0" \
                                 | jq ".$ac.heat.timeToOn |= 0" \
                                 | jq ".$ac.heat.timeToOff |= 0" \
                                 | jq ".$ac.heat.setTime |= 0" )

      echo "${states}" > "$TIMER_STATE_FILE"
   fi

   if [ "$selfTest" = "TEST_ON" ]; then
      echo "Query the state file: ${TIMER_STATE_FILE}"
   fi

   timeToOn=$(echo "${states}"  | jq -e ".$ac.$mode.timeToOn"  )
   timeToOff=$(echo "${states}" | jq -e ".$ac.$mode.timeToOff" )
   setTime=$(echo "${states}"   | jq -e ".$ac.$mode.setTime"   )

   # Retrieve the current state and mode of the aircon
   parseMyAirDataWithJq ".aircons.$ac.info.state"
   acState="${jqResult}"
   parseMyAirDataWithJq ".aircons.$ac.info.mode"
   acMode="${jqResult}"

   # Get the state of the fan mode
   if [ $fanTimerSpecified = true ]; then
      if [[ "${acState}" = '"on"' && "${acMode}" = '"vent"' ]]; then
         fanState=1
      else
         fanState=0
      fi
      logQueryAirConDiagnostic "queryFanTimer           ${t0} ${t0} fanState=${fanState} ${timeToOn} ${timeToOff} ${setTime} $io $device $characteristic"

   # Get the state of the cool mode
   elif [ $coolTimerSpecified = true ]; then
      if [[ "${acState}" = '"on"' && "${acMode}" = '"cool"' ]]; then
         coolState=1
      else
         coolState=0
      fi
      logQueryAirConDiagnostic "queryCoolTimer          ${t0} ${t0} coolState=${coolState} ${timeToOn} ${timeToOff} ${setTime} $io $device $characteristic"

   # Get the state of the heat mode
   elif [ $heatTimerSpecified = true ]; then
      if [[ "${acState}" = '"on"' && "${acMode}" = '"heat"' ]]; then
         heatState=1
      else
         heatState=0
      fi
      logQueryAirConDiagnostic "queryHeatTimer          ${t0} ${t0} heatState=${heatState} ${timeToOn} ${timeToOff} ${setTime} $io $device $characteristic"
   fi
}

function updateTimer()
{
   local state="$1"
   local mode="$2"

   if [ "$selfTest" = "TEST_ON" ]; then
      t0=$((setTime + 2)) 
   fi

   # Update fan timer
   if [[ "${timeToOn}" = "0" && "${timeToOff}" = "0" ]]; then # no update required
      echo ""
      return
   elif [[ "${state}" = "1" && "${timeToOn}" != "0" ]]; then # reset timer
      timeToOn=0
      setTime=${t0}
   elif [[ "${state}" = "1" && "${timeToOff}" != "0" ]]; then # update timer
      timeToOff=$((timeToOff - t0 + setTime))
      timeToOff=$((timeToOff > 30? timeToOff : 0))
      setTime=${t0}
      if [ "${timeToOff}" = "0" ]; then # turn off the fan
         setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{state:off}}}"
      fi
   elif [[ "${state}" = "0" && "${timeToOff}" != "0" ]]; then # reset timer
      timeToOff=0
      setTime=${t0}
   elif [[ "${state}" = "0" && "${timeToOn}" != "0" ]]; then # update timer
      timeToOn=$((timeToOn - t0 + setTime))
      timeToOn=$((timeToOn > 30? timeToOn : 0))
      setTime=${t0}
      if [ "${timeToOn}" = "0" ]; then # turn on the fan, cool or heat
         setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{state:on,mode:$mode}}}"
      fi
   fi

   if [ "$selfTest" = "TEST_ON" ]; then
      echo "Update the timer for ${mode} with timeToOn: ${timeToOn} and timeToOff: ${timeToOff}" 
   fi

   # Diagnostic logging
   if [ $fanTimerSpecified = true ]; then
      logQueryAirConDiagnostic "updateFanTimer          ${t0} ${t0} fanState=${fanState} ${timeToOn} ${timeToOff} ${setTime} $io $device $characteristic"
   elif [ $coolTimerSpecified = true ]; then
      logQueryAirConDiagnostic "updateCoolTimer         ${t0} ${t0} coolState=${coolState} ${timeToOn} ${timeToOff} ${setTime} $io $device $characteristic"
   elif [ $heatTimerSpecified = true ]; then
      logQueryAirConDiagnostic "updateHeatTimer         ${t0} ${t0} heatState=${heatState} ${timeToOn} ${timeToOff} ${setTime} $io $device $characteristic"
   fi

   if [ "${mode}" = "vent" ]; then mode="fan"; fi
   updateTimerStateFile "${mode}"
}

function updateTimerStateFile()
{
   local mode="$1"

   updatedStates=$( jq ".$ac.$mode.timeToOn  |= $timeToOn" "$TIMER_STATE_FILE" \
                  | jq ".$ac.$mode.timeToOff |= $timeToOff" \
                  | jq ".$ac.$mode.setTime   |= $setTime" )

   echo "$updatedStates" > "$TIMER_STATE_FILE"

   # Diagnostic logging
   if [ "${io}" = "Get" ]; then
      prefix="update"
      space=""
   else
      prefix="set"
      space="e  "
   fi

   if [ "$selfTest" = "TEST_ON" ]; then
      echo "Update the timer state file: ${TIMER_STATE_FILE} with timeToOn: ${timeToOn} and timeToOff: ${timeToOff}" 
   fi

   if [ $fanTimerSpecified = true ]; then
      logQueryAirConDiagnostic "${prefix}FanTimerStateFil${space}  ${t0} ${t0} fanState=${fanState} ${timeToOn} ${timeToOff} ${setTime} $io $device $characteristic"
   elif [ $coolTimerSpecified = true ]; then
      logQueryAirConDiagnostic "${prefix}CoolTimerStateFil${space} ${t0} ${t0} coolState=${coolState} ${timeToOn} ${timeToOff} ${setTime} $io $device $characteristic"
   elif [ $heatTimerSpecified = true ]; then
      logQueryAirConDiagnostic "${prefix}HeatTimerStateFil${space} ${t0} ${t0} heatState=${heatState} ${timeToOn} ${timeToOff} ${setTime} $io $device $characteristic"
   fi
}

# main starts here
if [ $argEND -le 1 ]; then
   showHelp 199
fi
if [ $argEND -ge 1 ]; then
   io=$1
   if [ $argEND -ge 2 ]; then
      device=$2
   else
      echo "Error - No device given for io: ${io}"
      exit 1
   fi
   if [ $argEND -ge 3 ]; then
      characteristic=$3
   else
      echo "Error - No Characteristic given for io: ${io} ${device}"
      exit 1
   fi
   if [ "$io" = "Get" ]; then
      argSTART=4
   elif [[ "$io" = "Set" ]]; then
      argSTART=5
      if [ $argEND -ge 4 ]; then
         value=$4
      else
         echo "Error - No value given to Set: ${io}"
         exit 1
      fi
   else
      echo "Error - Invalid io: ${io}"
      exit 1
   fi
fi
# For any unprocessed arguments
if [ $argEND -ge $argSTART ]; then
   # Scan the remaining options
   for (( a=argSTART;a<=argEND;a++ ))
   do
      # convert argument number to its value
      v=${!a}
      optionUnderstood=false
      # Check the actual option against patterns
      case ${v} in
         TEST_OFF)
            # Standard production usage
            selfTest="${v}"
            ;;
         TEST_ON)
            # For npm run test
            selfTest="${v}"
            PORT="2025"
            ;;
         noOtherThermostat)
            # If only the control unit Thermostat is specified, ie no zone Thermostat is defined 
            noOtherThermostat=true
            ;;
         fanSpeed)
            # If the accessory is used to control the fan speed
            fanSpeed=true
            ;;
         timer)
            # For timer capability
            timerEnabled=true
            ;;
         fanTimer )
            fanTimerSpecified=true
            ;;
         coolTimer )
            coolTimerSpecified=true
            ;;
         heatTimer )
            heatTimerSpecified=true
            ;;
         flip)
            # To flip open/close, up/down mode for garage or gate
            flipEnabled=true
            ;;
         ac*)
            # Specify the aircon system, if not defined, ac="ac1"
            ac="${v}"
            ;;
         z*)
            #
            # if the option starts with a 'z' for zone
            #
            zone="${v}"
            zoneSpecified=true
            ;;
         ligID*)
            #
            # if the option starts with a "ligID" for lightings
            #
            lightID="${v:6}"
            lightSpecified=true
            ;;
         thiID*)
            #
            # if the option starts with a "thiID" for garage, blinds, etc
            #
            thingID="${v:6}"
            thingSpecified=true
            ;;
         *)
            #
            # See if the option is in the format of an IP
            #
            if expr "$v" : '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*[:0-9]*[-a-z]*$' >/dev/null; then
               IP=$(echo "$v"|cut -d":" -f1|cut -d"-" -f1)
               PORT=$(echo "$v"|cut -d":" -f2)
               if ! expr "$PORT" : '[0-9]*$' > /dev/null; then
                  PORT=2025
               fi
               debug=$(echo "$v"|cut -d"-" -f2)
               if [ "$debug" = "debug" ]; then debugSpecified=true; fi

               if [ "$selfTest" = "TEST_ON" ]; then
                  echo "Using IP: $IP"
                  if [ "$debugSpecified" = true ]; then
                     echo "Diagnostic log is turned on"
                  fi
               fi
               optionUnderstood=true
            fi
            if [ "$optionUnderstood" = false ]; then
               echo "Unknown Option: ${v}"
               showHelp 1
            fi
      esac
   done
fi

# Create a temporary sub-directory "${tmpSubDir}" to store the temporary files
subDir=$( echo "$IP"|cut -d"." -f4 )
tmpSubDir=$( printf "${TMPDIR}/AA-%03d" "$subDir" )
if [ ! -d "${tmpSubDir}/" ]; then mkdir "${tmpSubDir}/"; fi

# Redefine temporary files with full path
QUERY_AIRCON_LOG_FILE="${tmpSubDir}/${QUERY_AIRCON_LOG_FILE}"
QUERY_IDBYNAME_LOG_FILE="${tmpSubDir}/${QUERY_IDBYNAME_LOG_FILE}"
MY_AIRDATA_FILE="${tmpSubDir}/${MY_AIRDATA_FILE}"
TIMER_STATE_FILE="${tmpSubDir}/${TIMER_STATE_FILE}"
ZONEOPEN_FILE="${tmpSubDir}/${ZONEOPEN_FILE}"

# Fan accessory is the only accessory without identification constant, hence
# give it an identification "fanSpecified"
if [[ $zoneSpecified = false && $fanSpeed = false && $timerEnabled = false && $lightSpecified = false && $thingSpecified = false && $fanTimerSpecified = false && $coolTimerSpecified = false && $heatTimerSpecified = false ]]; then
   fanSpecified=true
fi

# set the current time
t0=$(date '+%s')

# For "Get" Directives
if [ "$io" = "Get" ]; then

   # Get the systemData, but not forcefully
   queryAirConWithIterations "http://$IP:$PORT/getSystemData"

   case "$characteristic" in
      # Gets the current temperature.
      CurrentTemperature )
         # check whether a zone is defined, if so, use the measuredTemp of this zone
         # if not, check myZone is defined, if so, use the measuredTemp of myZone 
         # if not, check rssi is defined for cZone1, if so, use measuredTemp of cZone1 
         # if not again, use setTemp   

         if [ $zoneSpecified = true ]; then
            parseMyAirDataWithJq ".aircons.$ac.zones.$zone.measuredTemp"
            echo "$jqResult"
            exit 0
         fi
         parseMyAirDataWithJq ".aircons.$ac.info.myZone"
         myZone=$( printf "z%02d" "$jqResult" )
         if [ "${myZone}" != "z00" ]; then 
            parseMyAirDataWithJq ".aircons.$ac.zones.$myZone.measuredTemp"
            echo "$jqResult"
            exit 0
         fi
         parseMyAirDataWithJq ".aircons.$ac.info.constant1"
         cZone1=$( printf "z%02d" "$jqResult" )
         parseMyAirDataWithJq ".aircons.$ac.zones.$cZone1.rssi"
         if [ "${jqResult}" != "0" ]; then
            parseMyAirDataWithJq ".aircons.$ac.zones.$cZone1.measuredTemp"
            echo "$jqResult"
            exit 0
         else 
            parseMyAirDataWithJq ".aircons.$ac.info.setTemp"
            echo "$jqResult"
            exit 0
         fi
      ;;
      # Gets the target temperature.
      TargetTemperature )
         if [ $zoneSpecified = true ]; then
            parseMyAirDataWithJq ".aircons.$ac.zones.$zone.setTemp"
            echo "$jqResult"
            exit 0
         else
            # check whether myZone is defined
            parseMyAirDataWithJq ".aircons.$ac.info.myZone"
            myZone=$( printf "z%02d" "$jqResult" )
            if [ "${myZone}" != "z00" ]; then 
               parseMyAirDataWithJq ".aircons.$ac.zones.$myZone.setTemp"
               echo "$jqResult"
               exit 0
            else
               parseMyAirDataWithJq ".aircons.$ac.info.setTemp"
               echo "$jqResult"
               exit 0
            fi
         fi
      ;;
      # Makes the target Control Unit state the current Control Unit state.
      TargetHeatingCoolingState | CurrentHeatingCoolingState )
         # Updates global variable jqResult
         parseMyAirDataWithJq ".aircons.$ac.info.state"
         state="$jqResult"
         # If the state of the Aircon is Off, set Main Thermostat to Off (0) and Zone Thermostat to Auto (3)
         if [  "$state" = '"off"' ]; then
            if [ $zoneSpecified = true ]; then 
               # set to "AUTO" for zoneThermostat
               echo 3
               exit 0
            else
               # set to "OFF" for main Thermostat
               echo 0
               exit 0
            fi
         fi
         # Get the current mode of the Thermostat; Heat=1, Cool=2, Dry(Auto)=3
         # Updates global variable jqResult
         parseMyAirDataWithJq ".aircons.$ac.info.mode"
         mode="$jqResult"
         case "$mode" in
            '"heat"' )
               # Thermostat in Heat Mode.
               echo 1
               exit 0
            ;;
            '"cool"' )
               # Thermostat in Cool Mode.
               echo 2
               exit 0
            ;;
            '"vent"' )
               # for Fan mode, set main Thermostat to Off (0) or zone Thermostat to Auto (3)
               if [ $zoneSpecified = true ]; then
                  echo 3
                  exit 0
               else
                  echo 0
                  exit 0
               fi
            ;;
            '"dry"' )
               # Dry mode, set Thermostat to Auto Mode as a proxy.
               echo 3
               exit 0
            ;;
            * )
               # If anything unexpected is retruned than the above, return value Off.
               echo 0
               exit 0
            ;;
         esac
      ;;
      # for garage door opener: get the value from MyPlace
      # (100=open, 0=close) (in Homekit 0=open, 1=close)
      TargetDoorState | CurrentDoorState )
         if [ $thingSpecified = true ]; then
            parseMyAirDataWithJq ".myThings.things.\"${thingID}\".value"
            if [ "$jqResult" = 100 ]; then
               if [ $flipEnabled = true ]; then echo 1; else echo 0; fi
               exit 0
            else
               if [ $flipEnabled = true ]; then echo 0; else echo 1; fi
               exit 0
            fi
         fi
      ;;
      # for blinds: get the value from MyPlace
      # (100=open, 0=close) (in Homekit 0=open, 1=close)
      TargetPosition | CurrentPosition )
         if [ $thingSpecified = true ]; then
            parseMyAirDataWithJq ".myThings.things.\"${thingID}\".value"
            echo "${jqResult}"
            exit 0
         fi
      ;;
      Active )
         # use Fanv2 Active characteristic for zone open or close
         if [ $zoneSpecified = true ]; then
            # Damper open/closed = Switch on/off = 1/0
            parseMyAirDataWithJq ".aircons.$ac.zones.$zone.state"
            if [ "$jqResult" = '"open"' ]; then
               echo 1
               exit 0
            else
               echo 0
               exit 0
            fi
         fi
      ;;
      RotationDirection )
         # use Fanv2 RotationDirection characteristic for myZone open or close
         if [ $zoneSpecified = true ]; then
            # Check which zone is myZone
            myZoneValue=$(( 10#$( echo "${zone}" | cut -d'z' -f2 ) ))
            parseMyAirDataWithJq ".aircons.$ac.info.myZone"
            if [ "$jqResult" = "$myZoneValue" ]; then
               echo 0
               exit 0
            else
               echo 1
               exit 0
            fi
         fi
      ;;
      On )
         if [ $fanSpecified = true ]; then
            # Return value of Off if the zone is closed or the Control Unit is Off.
            # fanSpecified is true when no zone (z01) given or timer given
            # Updates global variable jqResult
            parseMyAirDataWithJq ".aircons.$ac.info.state"
            if [  "$jqResult" = '"off"' ]; then
               echo 0
               exit 0
            else
               # Get the current mode of the Control Unit. Fan can only be On
               # or Off; if not Vent, set all other modes to Off.
               # Updates global variable jqResult
               parseMyAirDataWithJq ".aircons.$ac.info.mode"
               mode="$jqResult"
               case "$mode" in
                  '"heat"' )
                     # Fan does not support Heat Mode.
                     echo 0
                     exit 0
                  ;;
                  '"cool"' )
                     # Fan does not support Cool Mode.
                     echo 0
                     exit 0
                  ;;
                  '"vent"' )
                     # Set Fan to On.
                     echo 1
                     exit 0
                  ;;
                  '"dry"' )
                     # Fan does not support Dry Mode.
                     echo 0
                     exit 0
                  ;;
                  * )
                     # If anything unexpected is retruned than the above, set to Off.
                     echo 0
                     exit 0
                  ;;
               esac
            fi
         elif [ $zoneSpecified = true ]; then
            # Damper open/closed = Switch on/off = 1/0
            parseMyAirDataWithJq ".aircons.$ac.zones.$zone.state"
            if [ "$jqResult" = '"open"' ]; then
               echo 1
               exit 0
            else
               echo 0
               exit 0
            fi
         # get the fan timer current setting
         elif [ $fanTimerSpecified = true ]; then
            queryTimerStateFile "fan"
            if [[ "$timeToOn" = "0" && "$timeToOff" = "0" ]]; then
               echo 0
               exit 0
            elif [[ "$fanState" = "1" && "$timeToOff" != "0" ]]; then
               echo 1
               exit 0
            elif [[ "$fanState" = "0" && "$timeToOn" != "0" ]]; then
               echo 1
               exit 0
            fi
         # get the cool timer current setting
         elif [ $coolTimerSpecified = true ]; then
            queryTimerStateFile "cool"
            if [[ "$timeToOn" = "0" && "$timeToOff" = "0" ]]; then
               echo 0
               exit 0
            elif [[ "$coolState" = "1" && "$timeToOff" != "0" ]]; then
               echo 1
               exit 0
            elif [[ "$coolState" = "0" && "$timeToOn" != "0" ]]; then
               echo 1
               exit 0
            fi
         # get the heat timer current setting
         elif [ $heatTimerSpecified = true ]; then
            queryTimerStateFile "heat"
            if [[ "$timeToOn" = "0" && "$timeToOff" = "0" ]]; then
               echo 0
               exit 0
            elif [[ "$heatState" = "1" && "$timeToOff" != "0" ]]; then
               echo 1
               exit 0
            elif [[ "$heatState" = "0" && "$timeToOn" != "0" ]]; then
               echo 1
               exit 0
            fi
         # get the timer current setting
         elif [ $timerEnabled = true ]; then
            parseMyAirDataWithJq ".aircons.$ac.info.state"
            airconState=$jqResult
            parseMyAirDataWithJq ".aircons.$ac.info.countDownToOn"
            countDownToOn=$jqResult
            parseMyAirDataWithJq ".aircons.$ac.info.countDownToOff"
            countDownToOff=$jqResult

            if [[ "$countDownToOn" = "0" && "$countDownToOff" = "0" ]]; then
               echo 0
               exit 0
            fi
            if [[ "$countDownToOn" != "0" && "$airconState" = '"on"' ]]; then
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{countDownToOn:0}}}"
               echo 0
               exit 0
            fi
            if [[ "$countDownToOff" != "0" && "$airconState" = '"on"' ]]; then
               echo 1
               exit 0
            fi
            if [[ "$countDownToOn" != "0" && "$airconState" = '"off"' ]]; then
               echo 1
               exit 0
            fi
            if [[ "$countDownToOff" != "0" && "$airconState" = '"off"' ]]; then
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{countDownToOff:0}}}"
               echo 0
               exit 0
            fi
         elif [ $fanSpeed = true ]; then
            # Set the "Fan Speed" accessory to "on" at all time
               echo 1
               exit 0
         elif [ $lightSpecified = true ]; then
            parseMyAirDataWithJq ".myLights.lights.\"${lightID}\".state"
            if [ "$jqResult" = '"on"' ]; then
               echo 1
               exit 0
            else
               echo 0
               exit 0
            fi
         fi
      ;;  # End of On
      #Light Bulb service used for controlling damper % open
      Brightness )
         # get the zone damper % information
         if [ $zoneSpecified = true ]; then
            # Get the zone damper % open
            parseMyAirDataWithJq ".aircons.$ac.zones.$zone.value"
            echo "$jqResult"
            exit 0
         # Get the fan timer setting - 10% = 1 hour
         elif [ $fanTimerSpecified = true ]; then
            queryTimerStateFile "fan"
            updateTimer "${fanState}" "vent"
            value=$((timeToOn > timeToOff? timeToOn : timeToOff))
            value=$(((value / 360) + (value % 360 > 0)))
            echo $((value > 1? value : 1))
            exit 0
         # Get the cool timer setting - 10% = 1 hour
         elif [ $coolTimerSpecified = true ]; then
            queryTimerStateFile "cool"
            updateTimer "${coolState}" "cool"
            value=$((timeToOn > timeToOff? timeToOn : timeToOff))
            value=$(((value / 360) + (value % 360 > 0)))
            echo $((value > 1? value : 1))
            exit 0
         # Get the heat timer setting - 10% = 1 hour
         elif [ $heatTimerSpecified = true ]; then
            queryTimerStateFile "heat"
            updateTimer "${heatState}" "heat"
            value=$((timeToOn > timeToOff? timeToOn : timeToOff))
            value=$(((value / 360) + (value % 360 > 0)))
            echo $((value > 1? value : 1))
            exit 0
         # Get the AA timer setting - 10% = 1 hour
         elif [ $timerEnabled = true ]; then
            parseMyAirDataWithJq ".aircons.$ac.info.state"
            # Get the timer countDowqnToOff value if the state of the aircon is "on"
            if [ "$jqResult" = '"on"' ]; then
               parseMyAirDataWithJq ".aircons.$ac.info.countDownToOff"
               timerInPercentage=$(((jqResult / 6) + (jqResult % 6 > 0)))
               timerInPercentage=$((timerInPercentage < 100? timerInPercentage : 100)) 
               echo $((timerInPercentage > 1? timerInPercentage : 1))
               exit 0
            # Get the timer countDownToOn value if the state of the aircon is "off"
            else
               parseMyAirDataWithJq ".aircons.$ac.info.countDownToOn"
               timerInPercentage=$(((jqResult / 6) + (jqResult % 6 > 0)))
               timerInPercentage=$((timerInPercentage < 100? timerInPercentage : 100)) 
               echo $timerInPercentage
               exit 0
            fi
         # get the lights dim level
         elif [ $lightSpecified = true ]; then
            parseMyAirDataWithJq ".myLights.lights.\"${lightID}\".value"
            echo "$jqResult"
            exit 0
         fi
      ;;
      # Fan service for controlling fan speed (low, medium and high)
      RotationSpeed )
         # get the zone damper % information
         if [ $zoneSpecified = true ]; then
            # Get the zone damper % open
            parseMyAirDataWithJq ".aircons.$ac.zones.$zone.value"
            echo "$jqResult"
            exit 0
         else
            # Update the current fan speed
            parseMyAirDataWithJq ".aircons.$ac.info.fan"
            if [ "$jqResult" = '"low"' ]; then
               #25% as low speed
               echo 25
               exit 0
            elif [ "$jqResult" = '"medium"' ]; then
               #50% as medium speed
               echo 50
               exit 0
            elif [ "$jqResult" = '"high"' ]; then
               #90% as high speed
               echo 90
               exit 0
            else
               # one other possibility is "autoAA/auto", then echo 100
               echo 100
               exit 0
            fi
         fi
      ;;
   esac
fi
# For "Set" Directives
if [ "$io" = "Set" ]; then

   # Get the systemData, requiring the latest
   # the $MY_AIRDATA_FILE cached file is maintained up to date at all time
   getMyAirDataFromCachedFile

   case "$characteristic" in
      TargetHeatingCoolingState )
         if [ $zoneSpecified = false ]; then
            case "$value" in
               0 )
                  # Shut Off Control Unit.
                  setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{state:off}}}"
                  exit 0
               ;;
               1 )
                  # Turn On Control Unit, Set Mode to Heat, Open Current Zone.
                  setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{state:on,mode:heat}}}"
                  exit 0
               ;;
               2 )
                  # Turn On Control Unit, Set Mode to Cool, Open Current Zone.
                  setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{state:on,mode:cool}}}"
                  exit 0
               ;;
               3 )
                  # Turn On Control Unit, Set Mode to Dry.  Auto mode in Homekit as a proxy to Dry mode
                  setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{state:on,mode:dry}}}"
                  exit 0
               ;;
            esac
         fi
      ;;
      TargetTemperature )
         parseMyAirDataWithJq ".aircons.$ac.info.myZone"
         myZone=$( printf "z%02d" "$jqResult" )
         if [ $zoneSpecified = true ]; then
            setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$zone:{setTemp:$value}}}}"
            # if this zone is myZone, then set the target temperature of the system too
            if [ "${zone}" = "${myZone}" ]; then
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{setTemp:$value}}}"
            fi
         else
            setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{setTemp:$value}}}"
            # if myZone is defined, set the target temperature to the defined myZone too
            if [ "${myZone}" != "z00" ]; then 
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$myZone:{setTemp:$value}}}}"
            elif [ $noOtherThermostat = true ]; then
               # if myZone is not defined and noOtherThermostat=true, set the target temperature to all zones with temperature sensors
               parseMyAirDataWithJq ".aircons.$ac.info.noOfZones"
               nZones="${jqResult}"
               for (( a=1;a<=nZones;a++ )); do
                  zoneStr=$( printf "z%02d" "$a" )
                  parseMyAirDataWithJq ".aircons.$ac.zones.$zoneStr.rssi"
                  rssi="${jqResult}"
                  if [ "${rssi}" != "0" ]; then
                     setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$zoneStr:{setTemp:$value}}}}"
                  fi
               done
            fi
         fi
         exit 0
      ;;
      TargetDoorState )
         # Set the value of the garage door (100=open, 0=close) to MyPlace,
         # (0=open, 1=close for Homekit)
         if [ $thingSpecified = true ]; then
            if [ $flipEnabled = true ]; then value=$((value-1)); value=${value#-}; fi
            if [ "$value" = "1" ]; then
               setAirConUsingIteration "http://$IP:$PORT/setThing?json={id:\"${thingID}\",value:0}"
               exit 0
            else
               setAirConUsingIteration "http://$IP:$PORT/setThing?json={id:\"${thingID}\",value:100}"
               exit 0
            fi
         fi
      ;;
      TargetPosition )
         # Set the value of the blinds (100=open, 0=close) to MyPlace,
         if [ $thingSpecified = true ]; then
            setAirConUsingIteration "http://$IP:$PORT/setThing?json={id:\"${thingID}\",value:${value}}"
            exit 0
         fi
      ;;
      RotationDirection )
         # Uses the Fanv2 RotationDirection characteristic for myZone switches.
         if [ $zoneSpecified = true ]; then
            if [ "$value" = "0" ]; then
               # Before setting myZone open the zone if it is currently closed
               myZoneValue=$(( 10#$( echo "${zone}" | cut -d'z' -f2 ) ))
               parseMyAirDataWithJq ".aircons.$ac.zones.$zone.state"
               if [ "${jqResult}" = '"close"' ]; then
                  setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$zone:{state:open}}}}"
               fi
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{myZone:$myZoneValue}}}"
               # when the myZone is changed, update the setTemp of the aircon to be same as active myZone
               parseMyAirDataWithJq ".aircons.$ac.zones.$zone.setTemp"
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{setTemp:$jqResult}}}"
               exit 0
            else
               # do nothing
               exit 0
            fi
         fi
      ;;
      On | Active )
         # Uses the On characteristic for Fan/Vent mode.
         if [ $fanSpecified = true ]; then
            if [ "$value" = "1" ]; then
               # Sets Control Unit to On, sets to Fan mode aqnd fan speed will
               # default to last used.
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{state:on,mode:vent}}}"
            else
               # Shut Off Control Unit.
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{state:off}}}"
            fi
            exit 0

         # Uses the fan/On or fanv2/Active characteristic for zone switches.
         elif [ $zoneSpecified = true ]; then
            if [ "$value" = "1" ]; then
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$zone:{state:open}}}}"
               rm -f "$ZONEOPEN_FILE"
               exit 0
            else
               # Ensures that at least ${noOfConstants} zone is/are open at all time to protect
               # the aircon system before closing any zone:
               # > if the only zone(s) open is/are the constant zone(s), leave it open (and set it to 100%).
               # > if the constant zone(s) is/are in close state, and to close this zone will reduce the number
               # > of zones open below ${noOfConstants}, then one constant zone will open (and set to 100%) before 
               # > closing this zone.

               # retrieve myZone, nZones, noOfConstants, cZone1, cZone2 and cZone3 from $myAirData
               parseMyAirDataWithJq ".aircons.$ac.info.myZone"
               myZone=$( printf "z%02d" "$jqResult" )
               parseMyAirDataWithJq ".aircons.$ac.info.noOfZones"
               nZones="${jqResult}"
               parseMyAirDataWithJq ".aircons.$ac.info.noOfConstants"
               noOfConstants="${jqResult}"
               parseMyAirDataWithJq ".aircons.$ac.info.constant1"
               cZone1=$( printf "z%02d" "$jqResult" )
               parseMyAirDataWithJq ".aircons.$ac.info.constant2"
               cZone2=$( printf "z%02d" "$jqResult" )
               parseMyAirDataWithJq ".aircons.$ac.info.constant3"
               cZone3=$( printf "z%02d" "$jqResult" )

               # Check how many zones are currently open for this $ac
               if [ -f "$ZONEOPEN_FILE" ]; then
                  thisZoneOpen=$( jq ".$ac" "$ZONEOPEN_FILE" )
                  getFileStatDt "$ZONEOPEN_FILE"
                  if [ "$dt" -ge 10 ]; then rm "$ZONEOPEN_FILE"; fi
               fi

               if [[ -f "$ZONEOPEN_FILE" && "${thisZoneOpen}" != "null" ]]; then
                  zoneOpen="${thisZoneOpen}"
               else
                  if [ ! -f "$ZONEOPEN_FILE" ]; then echo "{}" > "$ZONEOPEN_FILE"; fi
                  for (( a=1;a<=nZones;a++ ))
                  do
                     zoneStr=$( printf "z%02d" "$a" )
                     parseMyAirDataWithJq ".aircons.$ac.zones.$zoneStr.state"
                     if [ "$jqResult" = '"open"' ]; then
                        zoneOpen=$((zoneOpen + 1))
                     fi
                  done
               fi

               if [ "$zoneOpen" -gt "${noOfConstants}" ]; then
                  # If there are more than "$noOfConstants" zones open, it is safe to close this zone.
                  # BUT if this zone is myZone then set myZone to an open cZone or if all cZones are
                  # closed, set myZone to a next open zone before closing this zone.
                  if [ "${zone}" = "${myZone}" ]; then 
                     setMyZoneToAnOpenedZoneWithTempSensorWithPriorityToCzones
                     if [ "$myZoneAssigned" = false ]; then
                        openAclosedZoneWithTempSensorWithPriorityToCzones
                        setMyZoneToAnOpenedZoneWithTempSensorWithPriorityToCzones
                     fi
                  fi
                  closeZoneWithZoneOpenCounter "${zone}"
                  exit 0
               elif [[ "$zone" = "$cZone1" || "$zone" = "$cZone2" || "$zone" = "$cZone3" ]]; then
                  # If only "$noOfConstants" zones open and the zone to close is one of the constant zones, do not
                  # close but set to 100%
                  parseMyAirDataWithJq ".aircons.$ac.zones.$zone.rssi"
                  if [ "${jqResult}" = "0" ]; then
                     setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$zone:{value:100}}}}"
                  fi
                  exit 0
               else
                  # If only "$noOfConstants" zones open and the zone to close is not a cZone but a myZone, then open a
                  # closed zone with temperature sensor with priority to cZones and set myZone to it before closing this
                  # zone. If the zone to close is also not a myZone, then just open a closed cZone before closing this zone. 
                  if [ "${zone}" = "${myZone}" ]; then 
                     openAclosedZoneWithTempSensorWithPriorityToCzones
                     setMyZoneToAnOpenedZoneWithTempSensorWithPriorityToCzones
                  else
                     openAclosedCzone
                  fi
                  closeZoneWithZoneOpenCounter "${zone}"
                  exit 0
               fi
            fi
         # setting the fan timer
         elif [ $fanTimerSpecified = true ]; then
            if [ "$value" = "1" ]; then # do nothing
               exit 0
            else
               fanState=0
               timeToOn=0
               timeToOff=0
               setTime=${t0}
               updateTimerStateFile "fan"
               exit 0
            fi
         # setting the cool timer
         elif [ $coolTimerSpecified = true ]; then
            if [ "$value" = "1" ]; then # do nothing
               exit 0
            else
               coolState=0
               timeToOn=0
               timeToOff=0
               setTime=${t0}
               updateTimerStateFile "cool"
               exit 0
            fi
         # setting the heat timer
         elif [ $heatTimerSpecified = true ]; then
            if [ "$value" = "1" ]; then # do nothing
               exit 0
            else
               heatState=0
               timeToOn=0
               timeToOff=0
               setTime=${t0}
               updateTimerStateFile "heat"
               exit 0
            fi
         # setting the AA timer
         elif [ $timerEnabled = true ]; then
            if [ "$value" = "0" ]; then
               # Set both "countDownToOn" and "countDownToOff" to 0, otherwise
               # do nothing
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{countDownToOn:0}}}"
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{countDownToOff:0}}}"
               exit 0
            else
               # Do nothing
               exit 0
            fi
         # fanSpeed is always on, so there is no on/off function but need to issue "exit 0"
         # to let cmd5 know that action is satisfied
         elif [ $fanSpeed = true ]; then
            exit 0
         # setting the state of the light
         elif [ $lightSpecified = true ]; then
            if [ "$value" = "1" ]; then
               setAirConUsingIteration "http://$IP:$PORT/setLight?json={id:\"${lightID}\",state:on}"
               exit 0
            else
               setAirConUsingIteration "http://$IP:$PORT/setLight?json={id:\"${lightID}\",state:off}"
               exit 0
            fi
         fi
      ;;
      #Light Bulb service for used controlling damper % open and timer
      Brightness )
         if [ $zoneSpecified = true ]; then
            parseMyAirDataWithJq ".aircons.$ac.zones.$zone.rssi"
            rssi="${jqResult}"
            if [ "${rssi}" = "0" ]; then
               # Round the $value to its nearest 5%
               damper=$(($(($((value + 2)) / 5)) * 5))
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$zone:{value:$damper}}}}"
            fi
            exit 0
         # settting the fan timer - 10% = 1 hr
         elif [ $fanTimerSpecified = true ]; then
            queryTimerStateFile "fan"
            if [ "$fanState" = "1" ]; then
               timeToOn=0
               timeToOff=$((value * 360))
               setTime=${t0}
            else
               timeToOn=$((value * 360))
               timeToOff=0
               setTime=${t0}
            fi
            updateTimerStateFile "fan"
            exit 0
         # settting the cool timer - 10% = 1 hr
         elif [ $coolTimerSpecified = true ]; then
            queryTimerStateFile "cool"
            if [ "$coolState" = "1" ]; then
               timeToOn=0
               timeToOff=$((value * 360))
               setTime=${t0}
            else
               timeToOn=$((value * 360))
               timeToOff=0
               setTime=${t0}
            fi
            updateTimerStateFile "cool"
            exit 0
         # settting the heat timer - 10% = 1 hr
         elif [ $heatTimerSpecified = true ]; then
            queryTimerStateFile "heat"
            if [ "$heatState" = "1" ]; then
               timeToOn=0
               timeToOff=$((value * 360))
               setTime=${t0}
            else
               timeToOn=$((value * 360))
               timeToOff=0
               setTime=${t0}
            fi
            updateTimerStateFile "heat"
            exit 0
         # settting the AA timer - 10% = 1 hr
         elif [ $timerEnabled = true ]; then
            # Make 10% to 1 hour (1% = 6 minutes) and capped at a max of 600 minutes
            timerInMinutes=$((value * 6))
            parseMyAirDataWithJq ".aircons.$ac.info.state"
            if [ "$jqResult" = '"on"' ]; then
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{countDownToOff:$timerInMinutes}}}"
            else
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{countDownToOn:$timerInMinutes}}}"
            fi
            exit 0

         # Set light brightness
         elif [ $lightSpecified = true ]; then
            setAirConUsingIteration "http://$IP:$PORT/setLight?json={id:\"${lightID}\",value:$value}"
            exit 0
         fi
      ;;
      # Fan service for controlling fan speed (0-33%:low, 34-67%:medium, 68-99%:high, 100%:autoAA/auto)
      RotationSpeed )
         if [ $zoneSpecified = true ]; then
            parseMyAirDataWithJq ".aircons.$ac.zones.$zone.rssi"
            rssi="${jqResult}"
            if [ "${rssi}" = "0" ]; then
               # Round the $value to its nearest 5%
               damper=$(($(($((value + 2)) / 5)) * 5))
               setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{zones:{$zone:{value:$damper}}}}"
            fi
            exit 0
         else
            # fspeed=$value (0-33%:low, 34-67%:medium, 68-99%:high, 100%:autoAA/auto)
            if [ "$value" -le 33 ]; then
               fspeed="low"
            elif [ "$value" -ge 34 ] && [ "$value" -le 67 ]; then
               fspeed="medium"
            elif [ "$value" -ge 68 ] && [ "$value" -le 99 ]; then
               fspeed="high"
            else
               # 'ezfan' users have 'autoAA' and regular users have 'auto'. But
               # 'autoAA' works for all, so hardcoded to 'autoAA'
               fspeed="autoAA"
            fi
            setAirConUsingIteration "http://$IP:$PORT/setAircon?json={$ac:{info:{fan:$fspeed}}}"
            exit 0
         fi
      ;;
   esac
fi
echo "Unhandled $io $device $characteristic" >&2
exit 150
