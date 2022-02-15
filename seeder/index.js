// run make in root folder before manually running this
// typically this is not required as make will run this to seed data

const { config } = require("./config");
const Web3 = require("web3");
const registry = require("./contracts/SocialHarmonyRegistry.json");
const token = require("./contracts/SocialGameToken.json");
const game = require("./contracts/SocialGame.json");

require('dotenv').config();

const web3 = new Web3(process.env.HMY_TESTNET_RPC_URL);

let hmyMasterAccount = web3.eth.accounts.privateKeyToAccount(process.env.HMY_PRIVATE_KEY);
web3.eth.accounts.wallet.add(hmyMasterAccount);
web3.eth.defaultAccount = hmyMasterAccount.address

const myAddress = web3.eth.defaultAccount;

const getRegistry = async () => {
    const contract = new web3.eth.Contract(registry.abi, config.addresses.registry);
    return contract;
}

const getToken = async () => {
    const contract = new web3.eth.Contract(token.abi, config.addresses.token);
    return contract;
}

const getSocialGame = async (gameAddress) => {
    const contract = new web3.eth.Contract(game.abi, gameAddress);
    return contract;
}

// org details: /samples/paws.json
async function seedOrg() {
    const reg = await getRegistry();
    console.log("Before Seed Org: ", await reg.methods.getOrgs().call());
    const res = await reg.methods.registerURI("/samples/paws.json").send({ from: myAddress, gas: 1000000 });
    console.log("After Seed Org: ", await reg.methods.getOrgs().call());
}

async function createSocialGame(uri) {
    try {
        const tok = await getToken();
        const res = await tok.methods.createSocialGame(
            myAddress, // owner
            myAddress, // beneficiary
            5, // players
            web3.utils.toWei('1', 'ether'), // 1 ethereum
            0 // no endorsers
        ).send({ from: myAddress, gas: 10000000 });
        const gameId = res.events.GameCreated.returnValues.SocialGame;
        console.log("Created Game ID for", gameId, uri);
        const gameObj = await getSocialGame(gameId);
        await gameObj.methods.setMetadataURI(uri).send({ from: myAddress, gas: 1000000 });
        console.log("Updated Game Metdata", await gameObj.methods.metadataURI().call());
        return 0;
    }
    catch (e) {
        console.log(e);
    }
}

// game details: /samples/paws.game[1..4].json
async function seedGames() {
    const tok = await getToken();
    console.log("Before Seed Game: ", await tok.methods.getGamesPlayed().call());
    console.log("Before Seed Game: ", await tok.methods.getGameAddresses().call());

    await createSocialGame("/samples/paws.game1.json");
    await createSocialGame("/samples/paws.game2.json");
    await createSocialGame("/samples/paws.game3.json");
    await createSocialGame("/samples/paws.game4.json");
    

    console.log("After Seed Game: ", await tok.methods.getGamesPlayed().call());
    console.log("After Seed Game: ", await tok.methods.getGameAddresses().call());
}

console.log("Seeder v1.0 - Seeding Social Harmony Game");

seedOrg().then(e => {
    console.log("Organisation Seeded ...");
    seedGames().then(e => console.log("Games Seeded ..."));
});