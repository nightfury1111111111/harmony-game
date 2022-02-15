import testnet from "./testnet.config";
import mainnet from "./mainnet.config";
require("dotenv").config();

const env = process.env.REACT_APP_APP_ENV || process.env.NODE_ENV || 'testnet';

const config = {
  testnet,
  mainnet,
  development:testnet
};

console.log(env);

export default config[env] || config["testnet"];