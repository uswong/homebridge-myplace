// Update myplaceConfig
const { devicesAutoDiscovery } = require("./devicesAutoDiscovery");
const { createMyPlaceConfig } = require("./createMyPlaceConfig");
const chalk = require("chalk");

async function updateConfig(config, log, pluginPath) {
  // Enforce maxAccessories: default 149 (Homebridge hard limit)
  const maxAccessories = (typeof config.maxAccessories === "number"
    && config.maxAccessories > 0 && config.maxAccessories < 150)
    ? config.maxAccessories
    : 149;

  // Check if devices are missing IPs
  const devicesMissingIPs = Array.isArray(config.devices)
    && config.devices.some(d => !d.ipAddress);

  // Default ports to scan
  let portsToTry = [2025, 10211];
  let doDevicesAutoDiscovery = false;
  let devicesAutoDiscoveryCounter = 0;

  // Insert custom device ports (user-configured) to the front
  if (Array.isArray(config.devices)) {
    config.devices.slice().reverse().forEach(device => {
      if (device.port) {
        portsToTry = portsToTry.filter(p => p !== device.port); // remove duplicates
        portsToTry.unshift(device.port);
      }
    });
  }

  if (!Array.isArray(config.devices) || devicesMissingIPs) {
    log.warn(chalk.yellow("⚠️  No devices found in the original config — triggering auto-discovery..."));
    doDevicesAutoDiscovery = true;
  }

  while (portsToTry.length > 0) {
    // Auto-discovery stage
    if (doDevicesAutoDiscovery) {
      log.info("🔍 Ports to scan for devices:", portsToTry);
      const { foundDevices, portsToTry: remainingPorts } =
        await devicesAutoDiscovery(config, log, portsToTry);

      portsToTry = remainingPorts;
      devicesAutoDiscoveryCounter++;

      if (foundDevices.length > 0) {
        config.devices = foundDevices;
        log.info("Devices config:\n" + JSON.stringify(config.devices, null, 2));
      } else {
        log.warn("⚠️  No devices found on any ports.");
        log.warn("⚠️  Proceeding with original config — no accessories will be created and cached accessories will be removed!");
        return config;
      }
    }

    // Run ConfigCreator
    log.info(chalk.yellow(
      devicesAutoDiscoveryCounter > 1
        ? "Running createMyPlaceConfig again..."
        : "Running createMyPlaceConfig..."
    ));

    try {
      const myplaceConfig = await createMyPlaceConfig(config, pluginPath);
      log.info(chalk.green("✅ DONE! createMyPlaceConfig completed successfully!"));
      log.debug("Updated MyPlace config:\n" + JSON.stringify(myplaceConfig, null, 2));

      // Enforce accessories limit
      if (Array.isArray(myplaceConfig.accessories) &&
          myplaceConfig.accessories.length > maxAccessories) {
        log.warn(`⚠️ Configured accessories exceed limit of ${maxAccessories}. ` +
                 `Only the first ${maxAccessories} will be bridged, ` +
                 `${myplaceConfig.accessories.length - maxAccessories} ignored.`);
        log.info("Note: Homebridge only allows a maximum of 149 bridged accessories per bridge.");

        myplaceConfig.accessories = myplaceConfig.accessories.slice(0, maxAccessories);
      }

      return myplaceConfig;
    } catch (err) {
      const autoDiscoveryErrors = ["wrong format", "inaccessible"];
      doDevicesAutoDiscovery = autoDiscoveryErrors.some(e =>
        err.message.toLowerCase().includes(e)
      );

      if (doDevicesAutoDiscovery && portsToTry.length > 0) {
        log.warn(`⚠️ ${err.message}`);
        if (devicesAutoDiscoveryCounter === 0) {
          log.info(chalk.yellow("🔍 Starting devices auto-discovery..."));
        } else {
          log.info(chalk.yellow(`🔄 Retrying devices auto-discovery (attempt #${devicesAutoDiscoveryCounter + 1})...`));
        }
      } else {
        log.error(`❌ ${err.message}`);
        log.warn("⚠️  No devices found in your network!");
        log.warn("⚠️  Proceeding with original config — no accessories will be created and cached accessories will be removed!");
        return config;
      }
    }
  }

  return config; // fallback
}

module.exports = { updateConfig };
