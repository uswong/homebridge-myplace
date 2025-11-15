const fs = require("fs");
const path = require("path");

function readConfig(storagePath, log) {
  const filePath = path.join(storagePath, ".myplace", "config.json");

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } else {
    log.warn(`⚠️ ${filePath} not found`);
    return null;
  }
}

module.exports = { readConfig };
