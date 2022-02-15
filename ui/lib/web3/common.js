import config from "../../components/config";
import hmy from "./hmy";

const jsonStore = {

};

const _getJson = async (key, path) => {
    if (!jsonStore[key]) {
        const obj = await fetch(path);
        jsonStore[key] = await obj.json();
    }
    return jsonStore[key];
}

const getGameContract = async (address) => {
    
    const game = hmy.contracts.createContract((await _getJson("SocialGame", "/contracts/SocialGame.json")).abi, address);
    return game;
}

const getTokenContract = async () => {
    console.log(config);
    const tokenAddress = config.addresses.token;
    return hmy.contracts.createContract((await _getJson("SocialGameToken", "/contracts/SocialGameToken.json")).abi, tokenAddress);
}

const getReportContract = async () => {

    const reportAddress = await (await getTokenContract()).methods.getGamesReporting().call();
    return hmy.contracts.createContract((await _getJson("Report", "/contracts/Report.json")).abi, reportAddress);
}

const getRegistryContract = async () => {

    const registryAddress = config.addresses.registry;
    return hmy.contracts.createContract((await _getJson("SocialHarmonyRegistry", "/contracts/SocialHarmonyRegistry.json")).abi, registryAddress);
}

export {
    getGameContract,
    getTokenContract,
    getRegistryContract,
    getReportContract
}