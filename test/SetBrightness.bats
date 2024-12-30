setup()
{
   load './test/setup'
   _common_setup
}

teardown()
{
   _common_teardown
}
before()
{
   rm -f "${TMPDIR}/AA-001/AirConServer.out"
}

beforeEach()
{
   _common_beforeEach
   rm -f "${TMPDIR}/AA-001/myAirData.txt"*
   rm -f "${TMPDIR}/AA-001/extraTimers.txt"
}

@test "MyPlace Test SetBrightness for Zone with no Temperature Sensor, specified damper 85" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/myAirDataWith3noSensors.txt"
   run ../MyPlace.sh Set Blah Brightness 85 z05 127.0.0.1 TEST_ON
   assert_equal "$status" 0
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath: .aircons.ac1.info"
   # No longer the same
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.zones.z05.rssi"
   assert_equal "${lines[3]}" "Setting url: http://127.0.0.1:2025/setAircon?json={ac1:{zones:{z05:{value:85}}}}"
   assert_equal "${lines[4]}" "Try 0"
   assert_equal "${lines[5]}" "Setting json: .aircons.ac1.zones.z05.value=85"
   # No more lines than expected
   assert_equal "${#lines[@]}" 6
}

@test "MyPlace Test SetBrightness for Zone with Temperature Sensor, specified damper 85" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/myAirDataWith3noSensors.txt"
   run ../MyPlace.sh Set Blah Brightness 85 z01 127.0.0.1 TEST_ON
   assert_equal "$status" 0
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath: .aircons.ac1.info"
   # No longer the same
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.zones.z01.rssi"
   # No more lines than expected
   assert_equal "${#lines[@]}" 3
}

@test "MyPlace Test SetBrightness 15 With timer enabled State Off" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   run ../MyPlace.sh Set Blah Brightness 15 timer 127.0.0.1 TEST_ON
   assert_equal "$status" 0
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info.state"
   # No longer the same
   assert_equal "${lines[3]}" "Setting url: http://127.0.0.1:2025/setAircon?json={ac1:{info:{countDownToOff:90}}}"
   assert_equal "${lines[4]}" "Try 0"
   assert_equal "${lines[5]}" "Setting json: .aircons.ac1.info.countDownToOff=90"
   # No more lines than expected
   assert_equal "${#lines[@]}" 6
}

@test "MyPlace Test SetBrightness 15 fanTimer" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   # need to create the extraTimers.txt file first
   run ../MyPlace.sh Get Blah Brightness fanTimer 127.0.0.1 TEST_ON
   run ../MyPlace.sh Set Blah Brightness 15 fanTimer 127.0.0.1 TEST_ON
   assert_equal "$status" 0
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Getting myAirData.txt from cached file"
   assert_equal "${lines[1]}" "Query the state file: ${TMPDIR}/AA-001/extraTimers.txt"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info.state"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac1.info.mode"
   assert_equal "${lines[4]}" "Update the timer state file: ${TMPDIR}/AA-001/extraTimers.txt with timeToOn: 5400 and timeToOff: 0"
   # No more lines than expected
   assert_equal "${#lines[@]}" 5
}

@test "MyPlace Test SetBrightness 20 coolTimer" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   # need to create the extraTimers.txt file first
   run ../MyPlace.sh Get Blah Brightness coolTimer 127.0.0.1 TEST_ON
   run ../MyPlace.sh Set Blah Brightness 20 coolTimer 127.0.0.1 TEST_ON
   assert_equal "$status" 0
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Getting myAirData.txt from cached file"
   assert_equal "${lines[1]}" "Query the state file: ${TMPDIR}/AA-001/extraTimers.txt"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info.state"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac1.info.mode"
   assert_equal "${lines[4]}" "Update the timer state file: ${TMPDIR}/AA-001/extraTimers.txt with timeToOn: 0 and timeToOff: 7200"
   # No more lines than expected
   assert_equal "${#lines[@]}" 5
}

@test "MyPlace Test SetBrightness 25 heatTimer" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   # need to create the extraTimers.txt file first
   run ../MyPlace.sh Get Blah Brightness heatTimer 127.0.0.1 TEST_ON
   run ../MyPlace.sh Set Blah Brightness 25 heatTimer 127.0.0.1 TEST_ON
   assert_equal "$status" 0
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Getting myAirData.txt from cached file"
   assert_equal "${lines[1]}" "Query the state file: ${TMPDIR}/AA-001/extraTimers.txt"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info.state"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac1.info.mode"
   assert_equal "${lines[4]}" "Update the timer state file: ${TMPDIR}/AA-001/extraTimers.txt with timeToOn: 9000 and timeToOff: 0"
   # No more lines than expected
   assert_equal "${#lines[@]}" 5
}

@test "MyPlace Test Set brightness 80 ligID:a70e005" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/myPlaceFull.txt"
   # TimerEnabled requires On to be set to 0
   run ../MyPlace.sh Set "Study Patio" Brightness 80 ligID:a70e005 127.0.0.1 TEST_ON
   # MyPlace.sh does a get first
   assert_equal "$status" "0"
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[2]}" "Setting url: http://127.0.0.1:2025/setLight?json={id:\"a70e005\",value:80}"
   assert_equal "${lines[3]}" "Try 0"
   assert_equal "${lines[4]}" "Setting json: .myLights.lights.\"a70e005\".value=80"
   # No more lines than expected
   assert_equal "${#lines[@]}" 5
}
