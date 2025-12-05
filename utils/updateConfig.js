// Update myplaceConfig
const { isIpAccessible } = require("./isIpAccessible");
const { devicesAutoDiscovery } = require("./devicesAutoDiscovery");
const { createMyPlaceConfig } = require("./createMyPlaceConfig");
const { readConfig } = require("./readConfig");
const chalk = require("chalk");

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const isValidIp = (value) => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value);

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

  let IPs = [];
  if (!Array.isArray(config.devices) || devicesMissingIPs) {
    log.warn(`⚠️  No devices found in the original config!`);
    log.warn(`🔍 *** Triggering device auto-discovery...`);
    doDevicesAutoDiscovery = true;
  } else {
    // check if the device(s) in config is accessbile or not with retry up to 5 times, if not, set it to "undefined".
    log.warn(`🕵️  *** Validating device IP address(es)...`);
    const noOfDevices = config.devices.length;
    for ( let i = 0; i < noOfDevices; i++ ) {
      const ip = config.devices[i].ipAddress;
      const port = config.devices[i].port || 2025;
      if (ip) {
        IPs.push(`${ip}:${port}`);
        if ( !isValidIp(ip) ) {
          log.warn(`⚠️  Device ${i + 1}/${noOfDevices} with IP ${ip}:${port} has its IP in wrong format!`);
          log.warn(`⚠️  Device ${i + 1}/${noOfDevices} will NOT be processed!`);
          IPs[i] = "undefined";
        } else {
          const isIpAccessibleTest = await isIpAccessible( `${ip}:${port}`, i, noOfDevices, log );
          if ( !isIpAccessibleTest ) {
            log.warn(`⚠️  Device ${i + 1}/${noOfDevices} with IP ${ip}:${port} is inaccessible! May be power OFF, wrong IP or wrong port.`);
            log.warn(`⚠️  Device ${i + 1}/${noOfDevices} will NOT be processed!`);
            IPs[i] = "undefined";
          } else {
            log.info(`✅ Device ${i + 1}/${noOfDevices} validated!`);
          }
        }
      } else {
        IPs.push("undefined");
      }
    }
    // check that not all IPs are "undefined", if so, do devucesAutoDiscovery...
    if (IPs.every((el) => el === "undefined")) {
      // final attempt to auto discover a Bond device
      log.warn(`⚠️  No specified device is accessible on the LAN network!`);
      log.warn(`🔍 *** Triggering device auto-discovery...`);
      doDevicesAutoDiscovery = true;
    }
  }

  // Auto-discovery stage
  if ( doDevicesAutoDiscovery ) {
    log.info("🔍 Ports to scan for devices:", portsToTry);
    const foundDevices = await devicesAutoDiscovery(config, log, portsToTry);

    const noOfDevices = foundDevices.length;
    if (noOfDevices > 0) {
      config.devices = foundDevices;
      log.info("Devices config:\n" + JSON.stringify(config.devices, null, 2));

      // Store found devices IPs
      for ( let i = 0; i < noOfDevices; i++ ) {
        IPs[i] = foundDevices[i].ipAddress + ':' + foundDevices[i].port;
      }
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

  // Run CreateMyPlaceConfig
  log.warn(`*** Running createMyPlaceConfig...`);
  try {
    const noOfDevices = IPs.length;
    const noOfDevicesProcessed = IPs.filter(ip => ip !== "undefined").length;

    const myplaceConfig = await createMyPlaceConfig(config, IPs, pluginPath, log);
    if (doDevicesAutoDiscovery) {
      log.info(`✅ DONE! createMyPlaceConfig completed successfully for ${noOfDevicesProcessed}/${noOfDevices} "auto-discovered" device(s)!`);
    } else {
      log.info(`✅ DONE! createMyPlaceConfig completed successfully for ${noOfDevicesProcessed}/${noOfDevices} device(s)!`);
    }

    log.debug("Updated MyPlace config:\n" + JSON.stringify(myplaceConfig));

    // Enforce accessories limit
    if (Array.isArray(myplaceConfig.accessories) &&
        myplaceConfig.accessories.length > maxAccessories) {
      log.warn(`⚠️  Configured accessories exceed limit of ${maxAccessories}. ` +
               `Only the first ${maxAccessories} will be bridged, ` +
               `${myplaceConfig.accessories.length - maxAccessories} ignored.`);
      log.info("Note: Homebridge only allows a maximum of 149 bridged accessories per bridge.");

      myplaceConfig.accessories = myplaceConfig.accessories.slice(0, maxAccessories);
    }

    return myplaceConfig;
  } catch (err) {
    log.warn(`⚠️  ${err.message}`);
    log.warn(`⚠️  Config not updated!`);
    // check if an existing config.json is present in this.storagePath/.myplace, if so use it
    existingConfig = readConfig( storagePath, log );
    if (existingConfig) {
      log.warn(`⚠️  Proceeding with existing config — all cached accessories will be restored.`);
      return existingConfig;
    }
    log.warn(`⚠️  Proceeding with original config — no accessories will be created and cached accessories will be removed!`);
    return config;
  }

  return config; // fallback
}

module.exports = { updateConfig };
