// Fetch system data with real timeout
async function isIpAccessible(ip, i, noOfDevices, log) {
  let myAirData;

  for (let attempt = 0; attempt < 6; attempt++) {

    try {
      const response = await fetch(`http://${ip}/getSystemData`);

      if (!response.ok) {
        log.error(`HTTP error ${response.status}`);
        return false;
      }

      myAirData = await response.json();
      return true;

    } catch (err) {

      // If this was the last attempt (attempt 5), stop retrying
      if (attempt === 5) {
        log.warn(`⚠️  All 5 retry attempts on Device ${i +1} failed!`)
        return false;
      }

      log.warn(`⚠️  Device ${i + 1}/${noOfDevices} with IP ${ip} is inaccessible - may be temporarily not available. Retying (${attempt + 1}/5) in 5s...`)

      // Wait 5 seconds before next retry
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

module.exports = { isIpAccessible };
