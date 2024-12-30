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

# ezone
@test "MyPlace Test Get On Fan" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   run ../MyPlace.sh Get Fan On TEST_ON 127.0.0.1
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac1.info.state"
   assert_equal "${lines[4]}" "Parsing for jqPath: .aircons.ac1.info.mode"
   assert_equal "${lines[5]}" "0"
   # No more lines than expected
   assert_equal "${#lines[@]}" 6
}

@test "MyPlace Test Get On timer" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   run ../MyPlace.sh Get Blab On TEST_ON timer 127.0.0.1
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac1.info.state"
   assert_equal "${lines[4]}" "Parsing for jqPath: .aircons.ac1.info.countDownToOn"
   assert_equal "${lines[5]}" "Parsing for jqPath: .aircons.ac1.info.countDownToOff"
   assert_equal "${lines[6]}" "0"
   # No more lines than expected
   assert_equal "${#lines[@]}" 7
}

@test "MyPlace Test Get On fanTimer" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   run ../MyPlace.sh Get Blab On TEST_ON fanTimer 127.0.0.1
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Query the state file: ${TMPDIR}/AA-001/extraTimers.txt"
   assert_equal "${lines[4]}" "Parsing for jqPath: .aircons.ac1.info.state"
   assert_equal "${lines[5]}" "Parsing for jqPath: .aircons.ac1.info.mode"
   assert_equal "${lines[6]}" "0"
   # No more lines than expected
   assert_equal "${#lines[@]}" 7
}

@test "MyPlace Test Get On coolTimer" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   run ../MyPlace.sh Get Blab On TEST_ON coolTimer 127.0.0.1
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Query the state file: ${TMPDIR}/AA-001/extraTimers.txt"
   assert_equal "${lines[4]}" "Parsing for jqPath: .aircons.ac1.info.state"
   assert_equal "${lines[5]}" "Parsing for jqPath: .aircons.ac1.info.mode"
   assert_equal "${lines[6]}" "0"
   # No more lines than expected
   assert_equal "${#lines[@]}" 7
}

@test "MyPlace Test Get On heatTimer" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   run ../MyPlace.sh Get Blab On TEST_ON heatTimer 127.0.0.1
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Query the state file: ${TMPDIR}/AA-001/extraTimers.txt"
   assert_equal "${lines[4]}" "Parsing for jqPath: .aircons.ac1.info.state"
   assert_equal "${lines[5]}" "Parsing for jqPath: .aircons.ac1.info.mode"
   assert_equal "${lines[6]}" "0"
   # No more lines than expected
   assert_equal "${#lines[@]}" 7
}

@test "MyPlace Test Get On z01" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   run ../MyPlace.sh Get Blab On TEST_ON 127.0.0.1 z01
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac1.zones.z01.state"
   assert_equal "${lines[4]}" "1"
   # No more lines than expected
   assert_equal "${#lines[@]}" 5
}
@test "MyPlace Test Get On ligID:a70e005" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/myPlaceFull.txt"
   # TimerEnabled requires On to be set to 0
   run ../MyPlace.sh Get "Study Patio" On ligID:a70e005 127.0.0.1 TEST_ON
   assert_equal "$status" "0"
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[2]}" "Parsing for jqPath: .myLights.lights.\"a70e005\".state"
   assert_equal "${lines[3]}" "0"
   # No more lines than expected
   assert_equal "${#lines[@]}" 4
}
@test "MyPlace Test Get On ligID:a77f105 (an offline light)" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/myPlaceFull.txt"
   # TimerEnabled requires On to be set to 0
   run ../MyPlace.sh Get "Theatre" On 'ligID:a77f105' 127.0.0.1 TEST_ON
   assert_equal "$status" "1"
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[2]}" "Parsing for jqPath failed: .myLights.lights.\"a77f105\".state"
   # No more lines than expected
   assert_equal "${#lines[@]}" 3
}
