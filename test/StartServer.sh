#!/bin/bash

# fun color stuff
TRED=$(tput setaf 1)
TNRM=$(tput sgr0)

if [ -z "$TMPDIR" ]; then TMPDIR="/tmp"; fi
sudo rm -rf "${TMPDIR}/AA-001"
mkdir "${TMPDIR}/AA-001"
chmod a+w "${TMPDIR}/AA-001"
touch "${TMPDIR}/AA-001/AirConServer.out"
echo  "In startServer" >> "${TMPDIR}"/AA-001/AirConServer.out

# Start a new AirConServer for a simulated big Aircon system
echo "Setup: Starting daemon" >> "${TMPDIR}"/AA-001/AirConServer.out
# Just to make sure that commander is installed
if [ ! -d "../node_modules/commander" ]; then
   npm i commander
fi
node ./AirConServer.js >> "${TMPDIR}/AA-001/AirConServer.out" 2>&1 &
rc=$?
if [ "$rc" != 0 ]; then
   echo "Setup: Starting Daemon failed rc: $rc" >> "${TMPDIR}"/AA-001/AirConServer.out
   echo "Starting AirConServer Daemon failed rc: $rc" >> "${TMPDIR}"/AA-001/AirConServer.out
   exit
fi
sleep 3
echo "Setup: Daemon should be started rc: $rc" >> "${TMPDIR}"/AA-001/AirConServer.out
echo "AirConServer Daemon shold be started rc: $rc"

# load the myAirData for MyPlace_Simulated system
curl -s -g "http://localhost:2025/reInit"
temp=$(curl -s -g "http://localhost:2025?load=testData/$1")
if [ -n "$temp" ]; then
   echo "Data Loading failed: $temp"  >> "${TMPDIR}"/AA-001/AirConServer.out
   echo "${TRED}Data Loading failed: $temp${TNRM}"
   ./StopServer.sh
else
   echo "Data Loading sucessful" >> "${TMPDIR}"/AA-001/AirConServer.out
   echo "Data Loading sucessful"
   echo "myAirData=$1"
fi
