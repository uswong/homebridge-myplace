const net = require("net");

// Simple port check (returns true/false)
function isPortReachable( ip ) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(1000);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      resolve(false);
    });

    const [ipStr, portStr] = ip.split(":");
    const port = Number(portStr);

    socket.connect(port, ipStr);
  });
}

// If port is not reachable, retry up to 5 times...
async function isIpAccessible( ip, i, noOfDevices, log ) {

  for (let attempt = 0; attempt < 6; attempt++) {

    try {
      const reachable = await isPortReachable( ip );

      if (reachable) {
        return true;  // success
      } else {
        throw new Error("Port unreachable");
      }

    } catch (err) {

      if (attempt === 5) {
        log.warn(`⚠️  All 5 retry attempts on Device ${i + 1} failed!`);
        return false;
      }

      log.warn(
        `⚠️  Device ${i + 1}/${noOfDevices} with IP ${ip} is inaccessible. ` +
        `Retrying (${attempt + 1}/5) in 5s...`
      );

      // wait 5 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

module.exports = { isIpAccessible };
