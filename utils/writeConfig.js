const fs = require("fs");
const path = require("path");

async function writeConfig(configData, storagePath, log) {
  try {
    // Target directory and file path
    const dir = path.join(storagePath, ".myplace");
    const filePath = path.join(dir, "config.json");

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write (overwrite) config.json
    fs.writeFileSync(filePath, JSON.stringify(configData, null, 2));

  } catch (error) {
    log.error("❌ Failed to write config:", error);
  }
}

module.exports = { writeConfig };
