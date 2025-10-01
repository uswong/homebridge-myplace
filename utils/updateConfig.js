// Update myplaceConfig
const { devicesAutoDiscovery } = require("./devicesAutoDiscovery");
const { createMyPlaceConfig } = require("./createMyPlaceConfig");

const chalk = require("chalk");

async function updateConfig( config, log, pluginPath )
{
  // Store the maxAccessories from original config if set, otherwise default to 149
  const maxAccessories = ( typeof config.maxAccessories === 'number'
     && config.maxAccessories > 0 && config.maxAccessories < 150 )
     ? config.maxAccessories : 149;

  // check if any device was configured in the original config, if not scan and discover devices based on open port 2025 or 10211
  const devicesMissingIPs =
     Array.isArray(config.devices) &&
     config.devices.some(d => !d.ipAddress);

  if ( !Array.isArray(config.devices) || devicesMissingIPs ) {
     log.warn(chalk.yellow("⚠️  No devices found in the original config!"));

     const foundDevices = await devicesAutoDiscovery( config, log );

     if (foundDevices.length > 0) {
       config.devices = foundDevices;
       log.info(`Devices config:\n` + JSON.stringify(config.devices, null, 2));
     } else {
       log.warn("⚠️  No devices found on any of the specified ports.");
       log.warn("⚠️  Proceed with original config — no accessories will be created and any cached accessories will be removed!");
       return config;
     }
  }

  let shouldRetry = true;
  log.info(chalk.yellow("Running createMyPlaceConfig..."));

  while (shouldRetry) {
    shouldRetry = false;
    try {
      const myplaceConfig = await createMyPlaceConfig(config, pluginPath);
      log.info(chalk.green("✅ DONE! createMyPlaceConfig completed successfully!"));
      log.debug("Updated MyPlace config:\n" + JSON.stringify(myplaceConfig, null, 2));

      // Enforce a limit of specified maxAccessories to be bridged - the GRAND limit set by Homebridge is 149 accessories per bridge
      if (Array.isArray( myplaceConfig.accessories) && myplaceConfig.accessories.length > maxAccessories) {
         log.warn(`⚠️ Configured accessories exceed specified limit of ${maxAccessories}. Only the first ${maxAccessories} will be bridged and last ${myplaceConfig.accessories.length - maxAccessories} ignored.`);
         log.info("Note: Homebridge only allows a GRAND TOTAL of 149 accessories to be bridged to HomeKit per bridge.");

         // Keep only first maxAccessories devices
         myplaceConfig.accessories = myplaceConfig.accessories.slice(0, maxAccessories);
      }
      return myplaceConfig;
    } catch (err) {
      const autoDiscoveryErrors = ["wrong format", "inaccessible"];
      const deviceAutoDiscoveryOrNot = autoDiscoveryErrors.some(e =>
        err.message.toLowerCase().includes(e)
      );

      if (deviceAutoDiscoveryOrNot) {
        log.warn(`⚠️ ${err.message} – triggering devices auto-discovery...`);
        const foundDevices = await devicesAutoDiscovery(config, log);

        if (foundDevices.length > 0) {
          config.devices = foundDevices;
          log.info("Devices config:\n" + JSON.stringify(config.devices, null, 2));
          shouldRetry = true; // retry with new devices
          log.info(chalk.yellow("Running createMyPlaceConfig again..."));
        } else {
          log.error("❌ No devices found on your network!");
        }
      } else {
        log.error(`❌${err.message}`);
      }

      if (!shouldRetry) {
        log.warn("⚠️  Proceed with original config — no accessories will be created and any cached accessories will be removed!");
      }
    }
  }

  return config; // fallback
}

module.exports = { updateConfig };
