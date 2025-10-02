// devices auto-discovery
const { scanDevicesWithOpenPort } = require("./scanDevicesWithOpenPort");
const chalk = require("chalk");

async function devicesAutoDiscovery(config, log, portsToTry) {
  let foundDevices = [];

  for (const port of [...portsToTry]) { // copy so we can safely mutate
    log.info(chalk.green(`🔍 Scanning for devices with port ${port} open...`));
    portsToTry = portsToTry.filter(p => p !== port);

    try {
      const { AAIP1, AAIP2, AAIP3 } = await scanDevicesWithOpenPort(port);

      foundDevices = [
        {
          name: config.devices?.[0]?.name ?? "Aircon",
          ipAddress: AAIP1,
          port,
          extraTimers: config.devices?.[0]?.extraTimers ?? false,
          debug: config.devices?.[0]?.debug ?? false,
        },
        {
          name: config.devices?.[1]?.name ?? "Aircon2",
          ipAddress: AAIP2,
          port,
          extraTimers: config.devices?.[1]?.extraTimers ?? false,
          debug: config.devices?.[1]?.debug ?? false,
        },
        {
          name: config.devices?.[2]?.name ?? "Aircon3",
          ipAddress: AAIP3,
          port,
          extraTimers: config.devices?.[2]?.extraTimers ?? false,
          debug: config.devices?.[2]?.debug ?? false,
        },
      ].filter(d => d.ipAddress); // remove empty devices

      if (foundDevices.length > 0) {
        log.info(chalk.blue(`✅ Found ${foundDevices.length} devices on port ${port}`));
        break;
      } else {
        log.warn(chalk.yellow(`⚠️ No devices found on port ${port}, trying next...`));
      }
    } catch (err) {
      log.error(chalk.red(`❌ Scan failed on port ${port}: ${err.message}`));
    }
  }

  return { foundDevices, portsToTry };
}

module.exports = { devicesAutoDiscovery };
