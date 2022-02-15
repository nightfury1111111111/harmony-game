const SocialHarmonyRegistry = artifacts.require("SocialHarmonyRegistry");

module.exports = function (deployer, network, accounts) {
  
  deployer.deploy(SocialHarmonyRegistry);
};
