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
}

@test "MyPlace Test Get CurrentTemperature z03 ac2" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemDataAc2.txt"
   # Bats "run" gobbles up all the stdout. Remove for debugging
   run ../MyPlace.sh Get Blah CurrentTemperature TEST_ON 127.0.0.1 z03 ac2
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac2.info"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac2.zones.z03.measuredTemp"
   assert_equal "${lines[4]}" "23.8"
   # No more lines than expected
   assert_equal "${#lines[@]}" 5
}

@test "MyPlace Test Get CurrentTemperature (with NoSensors) ac2" {
   # The old scripts return 0 because it does not realize noSensors
   before
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/oneZonePassingSystemDataAc2.txt"
   # Bats "run" gobbles up all the stdout. Remove for debugging
   run ../MyPlace.sh Get Blah CurrentTemperature TEST_ON 127.0.0.1 ac2
   assert_equal "$status" "0"
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac2.info"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac2.info.myZone"
   assert_equal "${lines[4]}" "Parsing for jqPath: .aircons.ac2.info.constant1"
   assert_equal "${lines[5]}" "Parsing for jqPath: .aircons.ac2.zones.z01.rssi"
   assert_equal "${lines[6]}" "Parsing for jqPath: .aircons.ac2.info.setTemp"
   # The noSensors fixes this
   assert_equal "${lines[7]}" "21.0"
   # No more lines than expected
   assert_equal "${#lines[@]}" 8
}

@test "MyPlace Test Get CurrentTemperature (with sensors and myZone=5) ac2" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemDataAc2.txt"
   # Bats "run" gobbles up all the stdout. Remove for debugging
   run ../MyPlace.sh Get Blah CurrentTemperature TEST_ON 127.0.0.1 ac2
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac2.info"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac2.info.myZone"
   assert_equal "${lines[4]}" "Parsing for jqPath: .aircons.ac2.zones.z05.measuredTemp"
   assert_equal "${lines[5]}" "27.8"
   # No more lines than expected
   assert_equal "${#lines[@]}" 6
}
