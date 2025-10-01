// Remove MyPlace shell script temporary working directories on Homebridge RESTART
const fs = require("fs");
const chalk = require("chalk");

function removeTempDir( log )
{
   log.info( chalk.yellow( "*** Removing temporary working directories..." ) );
   try {
      const directoryPath = process.env.TMPDIR || "/tmp";
      const files = fs.readdirSync(directoryPath);
      const filteredFiles = files.filter(file => file.match(/^AA-\d{3}$/));

      filteredFiles.forEach(file => {
      const sdir = `${directoryPath}/${file}`;
      try {
          fs.rmSync(sdir, { recursive: true, force: true });
          log.info(`✅ Temporary working directory ${sdir} removed`);
          } catch (err) {
             log.error(`❌ Unable to remove temporary working directory ${sdir}: [${err}]`);
          }
      });
   } catch (err) {
      log.error(`❌ Unable to scan and remove temporary working directory: [${err}]`);
   }
}

module.exports = { removeTempDir };
