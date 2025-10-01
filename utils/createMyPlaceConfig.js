// This async function is to generate a complete configuration file needed for the myPlace plugin
// It can handle up to 3 independent myPlace (BB) systems

async function createMyPlaceConfig(config, pluginPath) {

  const path = require("path");

  let AAIP1 = config.devices[0]?.ipAddress;
  let AAname1 = config.devices[0]?.name || "Aircon";
  let extraTimers1 = config.devices[0]?.extraTimers || false;
  let AAdebug1 = config.devices[0]?.debug || false;
  let AAIP2 = config.devices[1]?.ipAddress;
  let AAname2 = config.devices[1]?.name || "Aircon2";
  let extraTimers2 = config.devices[1]?.extraTimers || false;
  let AAdebug2 = config.devices[1]?.debug || false;
  let AAIP3 = config.devices[2]?.ipAddress;
  let AAname3 = config.devices[2]?.name || "Aircon3";
  let extraTimers3 = config.devices[2]?.extraTimers || false;
  let AAdebug3 = config.devices[2]?.debug || false;
  let MYPLACE_SH_PATH = path.join(pluginPath, "MyPlace.sh");

  // Define variables
  let myPlaceModelQueue = {};
  let myPlaceConstants = { constants: [] };
  let myPlaceQueueTypes = { queueTypes: [] };
  let myPlaceAccessories = { accessories: [] };
  let thisAAname

  function createModelQueue(sysType, tspModel, queue) {
    myPlaceModelQueue = {
      manufacturer: "Advantage Air Australia",
      model: sysType,
      serialNumber: tspModel,
      queue: queue
    };
  }

  function createConstants(ip, IPA, debug) {
    const debugA = debug == true ? "-debug" : "";

    const constant = {
      key: ip,
      value: `${IPA}${debugA}`
    };
    myPlaceConstants.constants.push(constant);
  }

  function createQueueTypes(queue) {
    const queueType= {
      queue: queue,
      queueType: "WoRm2"
    };
    myPlaceQueueTypes.queueTypes.push(queueType);
  }

  function createThermostat(name, zone, ac, ip) {
    let ac_l = ` ${ac}`;
    if (zone !== "") zone = `${zone} `;
    if (ac_l === " ac1") ac_l = "";

    const myPlaceThermostat = {
      type: "Thermostat",
      displayName: name,
      currentHeatingCoolingState: "OFF",
      targetHeatingCoolingState: "OFF",
      currentTemperature: 24,
      targetTemperature: 24,
      temperatureDisplayUnits: "CELSIUS",
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "currentHeatingCoolingState" },
        { characteristic: "targetHeatingCoolingState" },
        { characteristic: "currentTemperature" },
        { characteristic: "targetTemperature" }
      ],
      props: {
        targetTemperature: {
          maxValue: 32,
          minValue: 16,
          minStep: 1
        }
      },
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `${zone}${ip}${ac_l}`
    };

    // Attach the fan speed type to this switch as a linkedType
    createLinkedTypesFanSpeed(`${name} FanSpeed`, myPlaceThermostat, ac, ip);
  }

  function createLinkedTypesFanSpeed(name, motherAcc, ac, ip) {
    let ac_l = ` ${ac}`;
    if (ac_l === " ac1") ac_l = "";

    // Create the linked fan accessory
    const myPlaceLinkedTypesFanSpeed = {
      type: "Fan",
      displayName: name,
      on: true,
      rotationSpeed: 25,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "on" },
        { characteristic: "rotationSpeed" }
      ],
      props: {
        rotationSpeed: {
          minStep: 1
        }
      },
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `fanSpeed ${ip}${ac_l}`
    };

    // Attach the fan accessory to the Thermostat's `linkedTypes`
    motherAcc.linkedTypes = [myPlaceLinkedTypesFanSpeed];

    myPlaceAccessories.accessories.push(motherAcc);
  }

  function createFanSwitch(name, AAname, ac, ip) {
    let ac_l = ` ${ac}`;
    if (ac_l === " ac1") ac_l = "";

    // Build the fan switch object
    const myPlaceFanSwitch = {
      type: "Switch",
      displayName: name,
      on: false,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "on" }
      ],
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `${ip}${ac_l}`
    };

    // Attach the fan speed type to this switch as a linkedType
    createLinkedTypesFanSpeed(`${AAname} FanSpeed`, myPlaceFanSwitch, ac, ip);
  }

  function createTimerLightbulb(name, suffix, ac, ip) {
    let ac_l = ` ${ac}`;
    if (ac_l === " ac1") ac_l = "";

    // Construct the lightbulb accessory
    const myPlaceTimerLightbulb = {
      type: "Lightbulb",
      displayName: name,
      on: false,
      brightness: 0,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "on" },
        { characteristic: "brightness" }
      ],
      props: {
        brightness: {
          minStep: 1
        }
      },
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `${suffix} ${ip}${ac_l}`
    };

    myPlaceAccessories.accessories.push(myPlaceTimerLightbulb);
  }

  function createZoneFan(name, zoneStr, ac, ip) {
    let ac_l = ` ${ac}`;
    if (ac_l === " ac1") ac_l = "";

    // Build the zone fan object
    const myPlaceZoneFan = {
      type: "Fan",
      displayName: name,
      on: false,
      rotationSpeed: 100,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "on" },
        { characteristic: "rotationSpeed" }
      ],
      props: {
        rotationSpeed: {
          minStep: 5
        }
      },
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `${zoneStr} ${ip}${ac_l}`
    };

    myPlaceAccessories.accessories.push(myPlaceZoneFan);
  }

  function createZoneFanv2(name, thisZoneName, zoneStr, ac, ip) {
    let ac_l = ` ${ac}`;
    if (ac_l === " ac1") ac_l = "";

    // Create the base Fanv2 accessory
    const myPlaceZoneFanv2 = {
      type: "Fanv2",
      displayName: name,
      active: 0,
      rotationSpeed: 100,
      rotationDirection: 1,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "active" },
        { characteristic: "rotationSpeed" },
        { characteristic: "rotationDirection" }
      ],
      props: {
        rotationSpeed: {
          minStep: 5
        }
      },
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `${zoneStr} ${ip}${ac_l}`,
      linkedTypes: []
    };

    // Call the external function to generate the linked thermostat accessory
    const myPlaceZoneThermostatLinkedTypes = createZoneThermostat(`${thisZoneName} Thermostat`, zoneStr, ac, ip);

    // Append linked thermostat
    myPlaceZoneFanv2.linkedTypes.push(myPlaceZoneThermostatLinkedTypes);

    myPlaceAccessories.accessories.push(myPlaceZoneFanv2);
  }

  function createZoneThermostat(name, zone, ac, ip) {
    let ac_l = ` ${ac}`;
    if (ac_l === " ac1") ac_l = "";

    if (zone !== "") zone = `${zone} `;

    // Construct the thermostat object
    return {
      type: "Thermostat",
      displayName: name,
      currentHeatingCoolingState: "OFF",
      targetHeatingCoolingState: "OFF",
      currentTemperature: 24,
      targetTemperature: 24,
      temperatureDisplayUnits: "CELSIUS",
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "targetHeatingCoolingState" },
        { characteristic: "currentTemperature" },
        { characteristic: "targetTemperature" }
      ],
      props: {
        targetTemperature: {
          maxValue: 32,
          minValue: 16,
          minStep: 1
        }
      },
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `${zone}${ip}${ac_l}`
    };
  }

  function createZoneFanv2noRotationDirection(name, thisZoneName, zoneStr, ac, ip) {
    let ac_l = ` ${ac}`;
    if (ac_l === " ac1") ac_l = "";

    // Build Fanv2 object without rotationDirection
    const myPlaceZoneFanv2noRotationDirection = {
      type: "Fanv2",
      displayName: name,
      active: 0,
      rotationSpeed: 100,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "active" },
        { characteristic: "rotationSpeed" }
      ],
      props: {
        rotationSpeed: {
          minStep: 5
        }
      },
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `${zoneStr} ${ip}${ac_l}`,
      linkedTypes: []
    };

    // Generate linked thermostat accessory
    const myPlaceZoneThermostatLinkedTypes = createZoneThermostat(`${thisZoneName} Thermostat`, zoneStr, ac, ip);

    // Add linked thermostat
    myPlaceZoneFanv2noRotationDirection.linkedTypes.push(myPlaceZoneThermostatLinkedTypes);

    myPlaceAccessories.accessories.push(myPlaceZoneFanv2noRotationDirection);
  }

  function createLightbulbNoDimmer(name, id, ip) {
    // Remove quotes from id, like Bash's ${id//\"/}
    id = id.replace(/"/g, "");

    const myPlaceLightbulbNoDimmer = {
      type: "Lightbulb",
      displayName: name,
      on: false,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "on" }
      ],
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `ligID:${id} ${ip}`
    };

    myPlaceAccessories.accessories.push(myPlaceLightbulbNoDimmer);
  }

  function createLightbulbWithDimmer(name, id, ip) {
    // Remove quotes from id (like Bash's ${id//\"/})
    id = id.replace(/"/g, "");

    const myPlaceLightbulbWithDimmer = {
      type: "Lightbulb",
      displayName: name,
      on: false,
      brightness: 80,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "on" },
        { characteristic: "brightness" }
      ],
      props: {
        brightness: {
          minStep: 1
        }
      },
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `ligID:${id} ${ip}`
    };

    myPlaceAccessories.accessories.push(myPlaceLightbulbWithDimmer);
  }

  function createFanNoRotationSpeed(name, id, ip) {
    // Remove quotes from id
    id = id.replace(/"/g, "");

    const myPlaceFanNoRotationSpeed = {
      type: "Fan",
      displayName: name,
      on: false,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "on" }
      ],
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `ligID:${id} ${ip}`
    };

    myPlaceAccessories.accessories.push(myPlaceFanNoRotationSpeed);
  }

  function createGarageDoorOpener(name, id, ip) {
    // Remove quotes from id
    id = id.replace(/"/g, "");

    const myPlaceGarageDoorOpener = {
      type: "GarageDoorOpener",
      displayName: name,
      obstructionDetected: false,
      currentDoorState: 1,
      targetDoorState: 1,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "currentDoorState" },
        { characteristic: "targetDoorState" }
      ],
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `thiID:${id} ${ip}`
    };

    myPlaceAccessories.accessories.push(myPlaceGarageDoorOpener);
  }

  function createWindowCovering(name, id, ip) {
    // Remove quotes from id
    id = id.replace(/"/g, "");

    const myPlaceWindowCovering = {
      type: "WindowCovering",
      displayName: name,
      obstructionDetected: false,
      currentPosition: 0,
      positionState: 2,
      targetPosition: 0,
      name: name,
      ...myPlaceModelQueue,
      polling: [
        { characteristic: "currentPosition" },
        { characteristic: "targetPosition" }
      ],
      state_cmd: `'${MYPLACE_SH_PATH}'`,
      state_cmd_suffix: `thiID:${id} ${ip}`
    };

    myPlaceAccessories.accessories.push(myPlaceWindowCovering);
  }

  function assembleMyPlaceConfig() {
    return {
      name: "MyPlace",
      ...myPlaceConstants,
      ...myPlaceQueueTypes,
      ...myPlaceAccessories,
      platform: "MyPlace"
    };
  }

  // Helper regex to validate IP and IP:port
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipPortRegex = /^(\d{1,3}\.){3}\d{1,3}:\d+$/;

  // Validate and normalize IPs
  function normalizeIP(ip) {
    if (!ip || ip === "undefined" ) return "";
    if (ipRegex.test(ip)) return `${ip}:2025`;
    if (ipPortRegex.test(ip)) return ip;
    throw new Error(`ERROR: the specified IP address ${ip} is in wrong format`);
  }

  AAIP1 = normalizeIP(AAIP1);
  AAIP2 = normalizeIP(AAIP2);
  AAIP3 = normalizeIP(AAIP3);

  // Determine number of tablets/devices
  let noOfTablets = 0;
  if (AAIP1) noOfTablets = 1;
  if (AAIP2) noOfTablets = 2;
  if (AAIP3) noOfTablets = 3;

  // Initialize global config objects (assumed to be declared globally or passed)
  // myPlaceConstants, myPlaceQueueTypes, myPlaceModelQueue, myPlaceAccessories, myPlaceConfig

  for (let n = 1; n <= noOfTablets; n++) {
    let ip, IPA, AAname, extraTimers, debug, queue;

    if (n === 1) {
      ip = "${AAIP1}";
      IPA = AAIP1;
      AAname = AAname1;
      extraTimers = extraTimers1;
      debug = AAdebug1;
      queue = "AAA";
    } else if (n === 2) {
      ip = "${AAIP2}";
      IPA = AAIP2;
      AAname = AAname2;
      extraTimers = extraTimers2;
      debug = AAdebug2;
      queue = "AAB";
    } else if (n === 3) {
      ip = "${AAIP3}";
      IPA = AAIP3;
      AAname = AAname3;
      extraTimers = extraTimers3;
      debug = AAdebug3;
      queue = "AAC";
    }

    // Fetch system data
    let myAirData;
    try {
      const response = await fetch(`http://${IPA}/getSystemData`, {timeout: 45000});
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      myAirData = await response.json();
    } catch {
      throw new Error(`ERROR: AdvantageAir system is inaccessible - not power ON or wrong IP address ${IPA}`);
    }

    // Extract system info (use safe chaining or checks as needed)
    const sysName = (myAirData.system?.name ?? "").replace(/ /g, "_").replace(/['"]/g, "");
    if (!sysName) {
      throw new Error("ERROR: failed to get system info from your AdvantageAir system!");
    }
    const sysType = (myAirData.system?.sysType ?? "").replace(/ /g, "_").replace(/"/g, "");
    const tspModel = (myAirData.system?.tspModel ?? "").replace(/ /g, "_").replace(/"/g, "");

    const hasAircons = myAirData.system?.hasAircons ?? false;
    const noOfAircons = myAirData.system?.noOfAircons ?? 0;
    const hasLights = myAirData.system?.hasLights ?? false;
    const hasThings = myAirData.system?.hasThings ?? false;

    // Create constants and queueTypes
    createModelQueue(sysType, tspModel, queue);
    createConstants(ip, IPA, debug);
    createQueueTypes(queue);

    // Aircon processing
    if (hasAircons) {
      for (let a = 1; a <= noOfAircons; a++) {
        const ac = `ac${a}`;
        const aircon = myAirData.aircons?.[ac]?.info;
        if (!aircon) continue;

        // Check zones for zoneSetTemp
        let zoneSetTemp = false;
        const nZones = aircon.noOfZones ?? 0;
        for (let b = 1; b <= nZones; b++) {
          const zoneStr = `z${String(b).padStart(2, "0")}`;
          const rssi = myAirData.aircons?.[ac]?.zones?.[zoneStr]?.rssi ?? 0;
          if (rssi !== 0) {
            zoneSetTemp = true;
            break;
          }
        }

        if (a >= 2) {
          thisAAname = `${AAname}${a}`;
        } else {
          thisAAname = AAname;
        }
        const AAzone = zoneSetTemp ? "" : "noOtherThermostat";

        // Create aircon configs
        createThermostat(thisAAname, AAzone, ac, ip);
        createFanSwitch(`${thisAAname} Fan`, AAname, ac, ip);
        createTimerLightbulb(`${thisAAname} Timer`, "timer", ac, ip);
        if (extraTimers) {
          createTimerLightbulb(`${thisAAname} Fan Timer`, "fanTimer", ac, ip);
          createTimerLightbulb(`${thisAAname} Cool Timer`, "coolTimer", ac, ip);
          createTimerLightbulb(`${thisAAname} Heat Timer`, "heatTimer", ac, ip);
        }

        // Create zone configs
        const myZoneValue = aircon.myZone ?? 0;
        for (let b = 1; b <= nZones; b++) {
          const zoneStr = `z${String(b).padStart(2, "0")}`;
          const thisZoneName = myAirData.aircons?.[ac]?.zones?.[zoneStr]?.name ?? "";
          const rssi = myAirData.aircons?.[ac]?.zones?.[zoneStr]?.rssi ?? 0;
          if (rssi === 0) {
            createZoneFan(`${thisZoneName} Zone`, zoneStr, ac, ip);
          } else if (myZoneValue !== 0) {
            createZoneFanv2(`${thisZoneName} Zone`, thisZoneName, zoneStr, ac, ip);
          } else {
            createZoneFanv2noRotationDirection(`${thisZoneName} Zone`, thisZoneName, zoneStr, ac, ip);
          }
        }
      }
    }

    // Lighting processing
    if (hasLights) {
      const idArray = Object.keys(myAirData.myLights?.lights ?? {});
      for (const id of idArray) {
        const light = myAirData.myLights.lights[id];
        const name = light?.name ?? "";
        const value = light?.value ?? null;

        // All switches with names starting with "Fan " or "Ex " and those ending with " Fan" or " Ex" will consider to be Fan accessories
        const fanPattern = /^(Fan |Ex )|( Fan| Ex)$/;
        if (fanPattern.test(name)) {
          createFanNoRotationSpeed(name, id, ip);
        } else if (value === null) {
          createLightbulbNoDimmer(name, id, ip);
        } else {
          createLightbulbWithDimmer(name, id, ip);
        }
      }
    }

    // Things processing (garage/blinds)
    if (hasThings) {
      const idArray = Object.keys(myAirData.myThings?.things ?? {});
      for (const id of idArray) {
        const thing = myAirData.myThings.things[id];
        const name = thing?.name ?? "";
        const channelDipState = thing?.channelDipState ?? "";

        if (channelDipState == "3") {
          createGarageDoorOpener(name, id, ip);
        } else if (channelDipState == "1" || channelDipState == "2") {
          createWindowCovering(name, id, ip);
        }
      }
    }
  }

  // Assemble final config
  const myPlaceConfig = assembleMyPlaceConfig();
  return myPlaceConfig
}

// export this function
module.exports = { createMyPlaceConfig };
