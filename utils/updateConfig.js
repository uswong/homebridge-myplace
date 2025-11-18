// Update myplaceConfig
const { devicesAutoDiscovery } = require("./devicesAutoDiscovery");
const { createMyPlaceConfig } = require("./createMyPlaceConfig");
const { readConfig } = require("./readConfig");
const chalk = require("chalk");

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateConfig(config, log, storagePath, pluginPath) {
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
        // check if an existing config.json is present in this.storagePath/.myplace, if so use it
        existingConfig = readConfig( storagePath, log );
        if (existingConfig) {
          log.warn("⚠️  Proceeding with existing config — all cached accessories will be restored.");
          return existingConfig;
        } else {
          log.warn("⚠️  Proceeding with original config — no accessories will be created and cached accessories will be removed!");
          return config;
        }
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
      const isInaccessibleError = err.message.toLowerCase().includes("inaccessible");

      doDevicesAutoDiscovery = autoDiscoveryErrors.some(e =>
        err.message.toLowerCase().includes(e)
      );

      if (doDevicesAutoDiscovery && portsToTry.length > 0) {
        log.warn(`⚠️ ${err.message}`);

        // Special handling for "inaccessible" errors - wait 5 seconds and retry up to 5 times
        if (isInaccessibleError) {
          const maxRetries = 5;
          let retryCount = 0;
          let retrySuccess = false;
          let lastRetryError = err;

          let deviceNumber = 1;
          let ipAddress;
          const match = err.message.match(/Device (\d+).*?IP ([\d.]+)/);
          if (match) {
            deviceNumber = parseInt(match[1], 10);
            ipAddress = match[2];
          }

          while (retryCount < maxRetries && !retrySuccess) {
            retryCount++;
            log.info(chalk.yellow(`⏳ Device ${deviceNumber} with IP ${ipAddress} is inaccessible, waiting 5 seconds before retry (${retryCount}/${maxRetries})...`));
            await delay(5000);

            // Retry createMyPlaceConfig immediately without auto-discovery
            try {
              log.info(chalk.yellow(`🔄 Retrying createMyPlaceConfig (attempt ${retryCount}/${maxRetries})...`));
              const myplaceConfig = await createMyPlaceConfig(config, pluginPath);
              log.info(chalk.green(`✅ SUCCESS! createMyPlaceConfig completed after ${retryCount} retry attempt(s)!`));

              // Enforce accessories limit on retry success
              if (Array.isArray(myplaceConfig.accessories) &&
                  myplaceConfig.accessories.length > maxAccessories) {
                log.warn(`⚠️ Configured accessories exceed limit of ${maxAccessories}. ` +
                         `Only the first ${maxAccessories} will be bridged, ` +
                         `${myplaceConfig.accessories.length - maxAccessories} ignored.`);
                myplaceConfig.accessories = myplaceConfig.accessories.slice(0, maxAccessories);
              }

              return myplaceConfig;
            } catch (retryErr) {
              lastRetryError = retryErr;
              log.warn(`⚠️ Retry attempt ${retryCount}/${maxRetries} failed: ${retryErr.message}`);

              // Check if it's still an "inaccessible" error for the next retry
              if (!retryErr.message.toLowerCase().includes("inaccessible")) {
                log.warn("⚠️ Error type changed, stopping retries and proceeding to auto-discovery...");
                break;
              }
            }
          }

          // If we exhausted all retries and still failed, log the final error
          if (!retrySuccess) {
            log.error(`❌ All ${maxRetries} retry attempts failed. Last error: ${lastRetryError.message}`);
          }
        }

        if (devicesAutoDiscoveryCounter === 0) {
          log.info(chalk.yellow("🔍 Starting devices auto-discovery..."));
        } else {
          log.info(chalk.yellow(`🔄 Retrying devices auto-discovery (attempt #${devicesAutoDiscoveryCounter + 1})...`));
        }
      } else {
        log.error(`❌ ${err.message}`);
        log.warn("⚠️  No devices found in your network!");
        // check if an existing config.json is present in this.storagePath/.myplace, if so use it
        existingConfig = readConfig( storagePath, log );
        if (existingConfig) {
          log.warn("⚠️  Proceeding with existing config — all cached accessories will be restored.");
          return existingConfig;
        }
        log.warn("⚠️  Proceeding with original config — no accessories will be created and cached accessories will be removed!");
        return config;
      }
    }
  }

  return config; // fallback
}

module.exports = { updateConfig };
