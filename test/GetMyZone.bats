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

# ezone
 
@test "MyPlace Test Get myZone (RotationDirection) ac2 z07" {
   beforeEach
   # Issue the reInit
   curl -s -g "http://localhost:$PORT/reInit"
   # Do the load
   curl -s -g "http://localhost:$PORT?load=testData/myPlaceFull.txt"
   # TimerEnabled requires On to be set to 0
   run ../MyPlace.sh Get Blab RotationDirection z07 127.0.0.1 ac2 TEST_ON
   # MyPlace.sh does a get first
   assert_equal "$status" "0"
   # MyPlace.sh does a get first
   assert_equal "${lines[0]}" "Try 0"
   assert_equal "${lines[1]}" "Parsing for jqPath: .aircons.ac2.info"
   assert_equal "${lines[2]}" "Parsing for jqPath: .aircons.ac2.info.myZone"
   assert_equal "${lines[3]}" "0" 
   # No more lines than expected
   assert_equal "${#lines[@]}" 4
}
