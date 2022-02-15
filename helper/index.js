// open file migration.output
// extract out configurable properties
// save configurable properties to seeder and ui configuration
var fs = require("fs");
const output = fs.readFileSync("migrate.output").toString();

function findContractAddress(searchString) {
    let start = output.indexOf(searchString);
    start = output.indexOf("contract address:", start);
    const result = output.substring(start, output.indexOf("block number", start));
    return result.replace("contract address:", "").replace(">", "").trim();
}

const registry = findContractAddress("Replacing 'SocialHarmonyRegistry'");
const token = findContractAddress("Replacing 'SocialGameToken'");

const uiConfig = `const config = {
    network: 'testnet',
    addresses: {
      "token": "${token}",
      "registry": "${registry}"
    }
  };
  
  export default config;`

const seederConfig = `const config = {
    network: 'testnet',
    addresses: {
      "token": "${token}",
      "registry": "${registry}"
    }
  };
  
  module.exports = {config}`


fs.writeFileSync("../ui/components/config/testnet.config.js", uiConfig);

fs.writeFileSync("../seeder/config.js", seederConfig);
