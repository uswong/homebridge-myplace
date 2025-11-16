// This async function is to generate a complete configuration file needed for the myPlace plugin
// It can handle up to 3 independent myPlace (BB) systems

async function createMyPlaceConfig(config, pluginPath) {
  const path = require("path");

  const MYPLACE_SH_PATH = path.join(pluginPath, "MyPlace.sh");

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
      key: IPA,
      value: `${ip}${debugA}`
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

  function createThermostat(name, zone, ac, IPA) {
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
      state_cmd_suffix: `${zone}${IPA}${ac_l}`
    };

    // Attach the fan speed type to this switch as a linkedType
    createLinkedTypesFanSpeed(`${name} FanSpeed`, myPlaceThermostat, ac, IPA);
  }

  function createLinkedTypesFanSpeed(name, motherAcc, ac, IPA) {
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
      state_cmd_suffix: `fanSpeed ${IPA}${ac_l}`
    };

    // Attach the fan accessory to the Thermostat's `linkedTypes`
    motherAcc.linkedTypes = [myPlaceLinkedTypesFanSpeed];

    myPlaceAccessories.accessories.push(motherAcc);
  }

  function createFanSwitch(name, AAname, ac, IPA) {
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
      state_cmd_suffix: `${IPA}${ac_l}`
    };

    // Attach the fan speed type to this switch as a linkedType
    createLinkedTypesFanSpeed(`${AAname} FanSpeed`, myPlaceFanSwitch, ac, IPA);
  }

  function createTimerLightbulb(name, suffix, ac, IPA) {
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
      state_cmd_suffix: `${suffix} ${IPA}${ac_l}`
    };

    myPlaceAccessories.accessories.push(myPlaceTimerLightbulb);
  }

  function createZoneFan(name, zoneStr, ac, IPA) {
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
      state_cmd_suffix: `${zoneStr} ${IPA}${ac_l}`
    };

    myPlaceAccessories.accessories.push(myPlaceZoneFan);
  }

  function createZoneFanv2(name, thisZoneName, zoneStr, ac, IPA) {
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
      state_cmd_suffix: `${zoneStr} ${IPA}${ac_l}`,
      linkedTypes: []
    };

    // Call the external function to generate the linked thermostat accessory
    const myPlaceZoneThermostatLinkedTypes = createZoneThermostat(`${thisZoneName} Thermostat`, zoneStr, ac, IPA);

    // Append linked thermostat
    myPlaceZoneFanv2.linkedTypes.push(myPlaceZoneThermostatLinkedTypes);

    myPlaceAccessories.accessories.push(myPlaceZoneFanv2);
  }

  function createZoneThermostat(name, zone, ac, IPA) {
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
      state_cmd_suffix: `${zone}${IPA}${ac_l}`
    };
  }

  function createZoneFanv2noRotationDirection(name, thisZoneName, zoneStr, ac, IPA) {
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
      state_cmd_suffix: `${zoneStr} ${IPA}${ac_l}`,
      linkedTypes: []
    };

    // Generate linked thermostat accessory
    const myPlaceZoneThermostatLinkedTypes = createZoneThermostat(`${thisZoneName} Thermostat`, zoneStr, ac, IPA);

    // Add linked thermostat
    myPlaceZoneFanv2noRotationDirection.linkedTypes.push(myPlaceZoneThermostatLinkedTypes);

    myPlaceAccessories.accessories.push(myPlaceZoneFanv2noRotationDirection);
  }

  function createLightbulbNoDimmer(name, id, IPA) {
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
      state_cmd_suffix: `ligID:${id} ${IPA}`
    };

    myPlaceAccessories.accessories.push(myPlaceLightbulbNoDimmer);
  }

  function createLightbulbWithDimmer(name, id, IPA) {
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
      state_cmd_suffix: `ligID:${id} ${IPA}`
    };

    myPlaceAccessories.accessories.push(myPlaceLightbulbWithDimmer);
  }

  function createFanNoRotationSpeed(name, id, IPA) {
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
      state_cmd_suffix: `ligID:${id} ${IPA}`
    };

    myPlaceAccessories.accessories.push(myPlaceFanNoRotationSpeed);
  }

  function createGarageDoorOpener(name, id, IPA) {
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
      state_cmd_suffix: `thiID:${id} ${IPA}`
    };

    myPlaceAccessories.accessories.push(myPlaceGarageDoorOpener);
  }

  function createWindowCovering(name, id, IPA) {
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
      state_cmd_suffix: `thiID:${id} ${IPA}`
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
  function normalizeIP( ip, port = 2025 ) {
    if (!ip || ip === "undefined" ) return "";
    if (ipRegex.test(ip)) return `${ip}:${port}`;
    if (ipPortRegex.test(ip)) return ip;
    throw new Error(`ERROR: Device ${n + 1} - the specified IP address ${ip} is in wrong format`);
  }

  // Determine number of tablets/devices
  let noOfTablets = config.devices.length;

  // Initialize global config objects (assumed to be declared globally or passed)
  // myPlaceConstants, myPlaceQueueTypes, myPlaceModelQueue, myPlaceAccessories, myPlaceConfig

  for (let n = 0; n < noOfTablets; n++) {
    let AAname
    if (n == 0) {
      AAname = config.devices[n]?.name || `Aircon`;
    } else {
      AAname = config.devices[n]?.name || `Aircon${n + 1}`;
    }
    const AAIP = config.devices[n]?.ipAddress;
    const AAport = config.devices[n]?.port || 2025;
    const extraTimers = config.devices[n]?.extraTimers || false;
    const debug = config.devices[n]?.debug || false;
    const queue=["AAA", "AAB", "AAC"][n]

    const ip = normalizeIP(AAIP, AAport);
    const IPA = `\${AAIP${n + 1}}`

    // if (!ip || ip === "undefined" || !ipRegex.test(ip)) continue;

    // Fetch system data
    let myAirData;
    try {
      const response = await fetch(`http://${ip}/getSystemData`, {timeout: 45000});
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      myAirData = await response.json();
    } catch {
      throw new Error(`ERROR: Device ${n + 1} is inaccessible - not power ON or wrong IP ${AAIP} or wrong port ${AAport}`);
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
        createThermostat(thisAAname, AAzone, ac, IPA);
        createFanSwitch(`${thisAAname} Fan`, AAname, ac, IPA);
        createTimerLightbulb(`${thisAAname} Timer`, "timer", ac, IPA);
        if (extraTimers) {
          createTimerLightbulb(`${thisAAname} Fan Timer`, "fanTimer", ac, IPA);
          createTimerLightbulb(`${thisAAname} Cool Timer`, "coolTimer", ac, IPA);
          createTimerLightbulb(`${thisAAname} Heat Timer`, "heatTimer", ac, IPA);
        }

        // Create zone configs
        const myZoneValue = aircon.myZone ?? 0;
        for (let b = 1; b <= nZones; b++) {
          const zoneStr = `z${String(b).padStart(2, "0")}`;
          const thisZoneName = myAirData.aircons?.[ac]?.zones?.[zoneStr]?.name ?? "";
          const rssi = myAirData.aircons?.[ac]?.zones?.[zoneStr]?.rssi ?? 0;
          if (rssi === 0) {
            createZoneFan(`${thisZoneName} Zone`, zoneStr, ac, IPA);
          } else if (myZoneValue !== 0) {
            createZoneFanv2(`${thisZoneName} Zone`, thisZoneName, zoneStr, ac, IPA);
          } else {
            createZoneFanv2noRotationDirection(`${thisZoneName} Zone`, thisZoneName, zoneStr, ac, IPA);
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
          createFanNoRotationSpeed(name, id, IPA);
        } else if (value === null) {
          createLightbulbNoDimmer(name, id, IPA);
        } else {
          createLightbulbWithDimmer(name, id, IPA);
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
          createGarageDoorOpener(name, id, IPA);
        } else if (channelDipState == "1" || channelDipState == "2") {
          createWindowCovering(name, id, IPA);
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
