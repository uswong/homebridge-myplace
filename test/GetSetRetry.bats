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

@test "MyPlace Test Get CurrentTemperature ( PassOn5 - Retry )" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?repeat=4&load=testData/failedAirConRetrieveSystemData.txt"
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   # Bats "run" gobbles up all the stdout. Remove for debugging
   run ../MyPlace.sh Get Blah CurrentTemperature TEST_ON 127.0.0.1 z01
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Try 1"
   assert_equal "${lines[4]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[5]}" "Try 2"
   assert_equal "${lines[6]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[7]}" "Try 3"
   assert_equal "${lines[8]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[9]}" "Try 4"
   assert_equal "${lines[10]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[11]}" "Parsing for jqPath: .aircons.ac1.zones.z01.measuredTemp"
   assert_equal "${lines[12]}" "25.4"
   # No more lines than expected
   assert_equal "${#lines[@]}" 13
}

@test "MyPlace Test Get CurrentTemperature ( PassOn1 - No Retry )" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   # Bats "run" gobbles up all the stdout. Remove for debugging
   run ../MyPlace.sh Get Blah CurrentTemperature TEST_ON 127.0.0.1 z01
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Parsing for jqPath: .aircons.ac1.zones.z01.measuredTemp"
   assert_equal "${lines[4]}" "25.4"
   # No more lines than expected
   assert_equal "${#lines[@]}" 5
}

@test "MyPlace Test Get CurrentTemperature ( PassOn3 - Retry )" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?repeat=2&load=testData/failedAirConRetrieveSystemData.txt"
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   # Bats "run" gobbles up all the stdout. Remove for debugging
   run ../MyPlace.sh Get Blah CurrentTemperature TEST_ON 127.0.0.1 z01
   assert_equal "$status" 0
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Try 1"
   assert_equal "${lines[4]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[5]}" "Try 2"
   assert_equal "${lines[6]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[7]}" "Parsing for jqPath: .aircons.ac1.zones.z01.measuredTemp"
   assert_equal "${lines[8]}" "25.4"
   # No more lines than expected
   assert_equal "${#lines[@]}" 9
}

@test "MyPlace Test Get CurrentTemperature ( FailOn5 - Retry )" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/failedAirConRetrieveSystemData.txt"
   # Bats "run" gobbles up all the stdout. Remove for debugging
   run ../MyPlace.sh Get Blah CurrentTemperature TEST_ON 127.0.0.1 z01
   assert_equal "$status" 1
   assert_equal "${lines[0]}" "Using IP: 127.0.0.1"
   assert_equal "${lines[1]}" "Try 0"
   assert_equal "${lines[2]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[3]}" "Try 1"
   assert_equal "${lines[4]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[5]}" "Try 2"
   assert_equal "${lines[6]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[7]}" "Try 3"
   assert_equal "${lines[8]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[9]}" "Try 4"
   assert_equal "${lines[10]}" "Parsing for jqPath failed: .aircons.ac1.info"
   # No more lines than expected
   assert_equal "${#lines[@]}" 11
}


@test "MyPlace Test Set On 1 Fan ( PassOn5 - Retry )" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?repeat=4&load=testData/failedAirConRetrieveSystemData.txt"
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   # Bats "run" gobbles up all the stdout. Remove for debugging
   run ../MyPlace.sh Set Fan On 1 127.0.0.1 TEST_ON
   assert_equal "$status" 0
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[2]}" "Try 1"
   assert_equal "${lines[3]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[4]}" "Try 2"
   assert_equal "${lines[5]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[6]}" "Try 3"
   assert_equal "${lines[7]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[8]}" "Try 4"
   assert_equal "${lines[9]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[10]}" "Setting url: http://127.0.0.1:2025/setAircon?json={ac1:{info:{state:on,mode:vent}}}"
   assert_equal "${lines[11]}" "Try 0"
   assert_equal "${lines[12]}" "Setting json: .aircons.ac1.info.state=\"on\""
   assert_equal "${lines[13]}" "Setting json: .aircons.ac1.info.mode=\"vent\""
   # No more lines than expected
   assert_equal "${#lines[@]}" 14

}

# ezone (Cannot use compare as old does not allow IP and IP is now mandatory
@test "MyPlace Test Set On 1 Fan ( PassOn3 - Retry )" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?repeat=2&load=testData/failedAirConRetrieveSystemData.txt"
   curl -s -g "http://localhost:$PORT?load=testData/basicPassingSystemData.txt"
   run ../MyPlace.sh Set Fan On 1 127.0.0.1 TEST_ON
   assert_equal "$status" 0
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[2]}" "Try 1"
   assert_equal "${lines[3]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[4]}" "Try 2"
   assert_equal "${lines[5]}" "Parsing for jqPath: .aircons.ac1.info"
   # No longer the same
   assert_equal "${lines[6]}" "Setting url: http://127.0.0.1:2025/setAircon?json={ac1:{info:{state:on,mode:vent}}}"
   assert_equal "${lines[7]}" "Try 0"
   assert_equal "${lines[8]}" "Setting json: .aircons.ac1.info.state=\"on\""
   assert_equal "${lines[9]}" "Setting json: .aircons.ac1.info.mode=\"vent\""
   # No more lines than expected
   assert_equal "${#lines[@]}" 10
}

@test "MyPlace Test Set On 1 Fan ( FailOn5 - Retry )" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/failedAirConRetrieveSystemData.txt"
   run ../MyPlace.sh Set Fan On 1 127.0.0.1 TEST_ON
   # The new air will fail after the first 5
   assert_equal "$status" "1"
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[2]}" "Try 1"
   assert_equal "${lines[3]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[4]}" "Try 2"
   assert_equal "${lines[5]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[6]}" "Try 3"
   assert_equal "${lines[7]}" "Parsing for jqPath failed: .aircons.ac1.info"
   assert_equal "${lines[8]}" "Try 4"
   assert_equal "${lines[9]}" "Parsing for jqPath failed: .aircons.ac1.info"
   # No more lines than expected
   assert_equal "${#lines[@]}" 10
}


# zones (Cannot use compare as old does not allow IP and IP is now mandatory
@test "MyPlace Test Set On 1 z01 ( PassOn1 - No Retry )" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?repeat=1&load=testData/basicPassingSystemData.txt"
   run ../MyPlace.sh Set Fan On 1 z01 127.0.0.1 TEST_ON
   # MyPlace.sh does a get first
   assert_equal "$status" "0"
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath: .aircons.ac1.info"
   assert_equal "${lines[2]}" "Setting url: http://127.0.0.1:2025/setAircon?json={ac1:{zones:{z01:{state:open}}}}"
   assert_equal "${lines[3]}" "Try 0"
   assert_equal "${lines[4]}" "Setting json: .aircons.ac1.zones.z01.state=\"open\""
   # No more lines than expected
   assert_equal "${#lines[@]}" 5
}
