
/**
 * Test the SocialGameToken
 * @author victaphu
 * 
 * execute with: 
 *  #> truffle test test/SocialGameTokenTest.js
 * 
 * Test cases:
 * - security test to validate conditions for minting and transfer of tokens
 * - security test to validate conditions for game completion on token contract
 * - functional test for multiple active games on the same token contract
 * - functional test for token transfer on game completion (caused by cancel)
 * - functional test for token transfer on game completion (when game conditions are met)
 * - functional test for generation of game using configurable conditions
 * - functional test for generating a game by transferring a erc721 token
 * */
var SocialGame = artifacts.require("contracts/SocialGame.sol");
var SocialGameToken = artifacts.require("contracts/SocialGameToken.sol");
const { Unit } = require('@harmony-js/utils');

contract('SocialGameToken', (accounts) => {
    console.log(accounts);
    var creatorAddress = accounts[0];
    var firstOwnerAddress = accounts[1];
    var secondOwnerAddress = accounts[2];
    var externalAddress = accounts[3];
    var unprivilegedAddress = accounts[4];
    let newSocialGameToken;
    let newSocialGame;
    before(async () => {
        /* before tests, setup the environment, including creating a new game*/
        newSocialGameToken = await SocialGameToken.new();
        const { receipt } = await newSocialGameToken.createSocialGame(creatorAddress, firstOwnerAddress, 5, new Unit('1').asOne().toWei(), 0);
        newSocialGame = await SocialGame.at(receipt.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);
        return newSocialGameToken;
    })

    // test conditions on each smart contract function
    context('testgroup - security tests - validate conditions for minting and transfer of tokens', () => {
        it('should revert if enterGame called outside of SocialGame', async () => {
            await newSocialGameToken.enterGame(firstOwnerAddress, "", 1, { from: externalAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });
        });

        it('should revert if gameCompleted called outside of SocialGame', async () => {
            await newSocialGameToken.gameCompleted()
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });
        });

    });

    context('testgroup - security tests - transfer functions', () => {
        //deploy a new contract
        let tokenId = "";
        before(async () => {
            /* before tests */
            try {
                const txt = await newSocialGame.participate({ from: externalAddress, value: new Unit('1').asOne().toWei() });
                tokenId = txt.logs[0].args.value.toString();
            }
            catch (e) {
                console.log(e);
            }
        })
        it('should have sent 0.65 ONE to dao and 0.35 ONE to winners escrow', async () => {
            const result = await newSocialGame.getDeposits.call(externalAddress, { from: externalAddress });
            const dao = new Unit(result.daoEscrow.toString()).toOne();
            const winners = new Unit(result.winnersEscrow.toString()).toOne();
            assert.equal(dao, 0.65, "Failed, 65% of cost should go to DAO");
            assert.equal(winners, 0.35, "Failed, 35% of cost should go to Winners Pool");
        });
        it('should revert if I try to transfer the token somewhere (active game)', async () => {
            const result = await newSocialGameToken.safeTransferFrom(externalAddress, secondOwnerAddress, tokenId, { from: externalAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });
        });
        it('should allow transfer after the game is cancelled', async () => {
            await newSocialGameToken.safeTransferFrom(externalAddress, secondOwnerAddress, tokenId, { from: externalAddress })
                .then(result => {
                    // cannot transfer because game is not complete
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });

            await newSocialGame.gameCancelled();

            await newSocialGameToken.safeTransferFrom(externalAddress, secondOwnerAddress, tokenId, { from: externalAddress })
                .then(result => {
                    // success, transfer was accepted!
                })
                .catch(error => {
                    assert.fail();
                });
        });
    });

    context('testgroup - functional tests - multiple game entries and different game states', () => {
        //deploy a new contract
        let game1, game2;
        let token1, token2;
        before(async () => {
            /* before tests */
            try {
                const { receipt } = await newSocialGameToken.createSocialGame(creatorAddress, firstOwnerAddress, 5, new Unit('1').asOne().toWei(), 0);
                game1 = await SocialGame.at(receipt.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);
                const txt = await game1.participate({ from: externalAddress, value: new Unit('1').asOne().toWei() });
                token1 = txt.logs[0].args.value.toString();

                const receipt2 = await newSocialGameToken.createSocialGame(creatorAddress, firstOwnerAddress, 5, new Unit('1').asOne().toWei(), 0);
                game2 = await SocialGame.at(receipt2.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);
                const txt2 = await game2.participate({ from: externalAddress, value: new Unit('1').asOne().toWei() });
                token2 = txt2.logs[0].args.value.toString();
            }
            catch (e) {
                console.log(e);
            }
        })
        it('should have sent 0.65 ONE to dao and 0.35 ONE to winners escrow', async () => {
            const result = await game1.getDeposits.call(externalAddress, { from: externalAddress });
            const dao = new Unit(result.daoEscrow.toString()).toOne();
            const winners = new Unit(result.winnersEscrow.toString()).toOne();
            assert.equal(dao, 0.65, "Failed, 65% of cost should go to DAO");
            assert.equal(winners, 0.35, "Failed, 35% of cost should go to Winners Pool");

            const result2 = await game2.getDeposits.call(externalAddress, { from: externalAddress });
            const dao2 = new Unit(result2.daoEscrow.toString()).toOne();
            const winners2 = new Unit(result2.winnersEscrow.toString()).toOne();
            assert.equal(dao2, 0.65, "Failed, 65% of cost should go to DAO");
            assert.equal(winners2, 0.35, "Failed, 35% of cost should go to Winners Pool");
        });
        it('should revert if I try to transfer the token somewhere (active game)', async () => {
            await newSocialGameToken.safeTransferFrom(externalAddress, secondOwnerAddress, token1, { from: externalAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });
            await newSocialGameToken.safeTransferFrom(externalAddress, secondOwnerAddress, token2, { from: externalAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });
        });
        it('should allow transfer after the game is cancelled (game1) but cannot transfer for game2', async () => {
            await newSocialGameToken.safeTransferFrom(externalAddress, secondOwnerAddress, token1, { from: externalAddress })
                .then(result => {
                    // cannot transfer because game is not complete
                    console.log("Should not be here", result);
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });

            await newSocialGameToken.safeTransferFrom(externalAddress, secondOwnerAddress, token2, { from: externalAddress })
                .then(result => {
                    // cannot transfer because game is not complete
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });

            await game1.gameCancelled();

            assert.equal(await game1.isGameCancelled(), true, "Game 1 was not cancelled");
            assert.notEqual(await game2.isGameCancelled(), true, "Game 2 should not be cancelled");

            assert.equal((await newSocialGameToken.balanceOf(externalAddress)).toString(), "2", "Should have two tokens");

            await newSocialGameToken.safeTransferFrom(externalAddress, secondOwnerAddress, token1, { from: externalAddress })
                .then(result => {
                    // success, transfer was accepted!
                })
                .catch(error => {
                    assert.fail();
                });
            await newSocialGameToken.safeTransferFrom(externalAddress, secondOwnerAddress, token2, { from: externalAddress })
                .then(result => {
                    // cannot transfer because game is not complete
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });
        });

    });

    context('testgroup - functional tests - game completes and winners; allow transfer on auto-complete', () => {
        let game;
        let tokenIds = [];
        before(async () => {
            const { receipt } = await newSocialGameToken.createSocialGame(creatorAddress, firstOwnerAddress, 5, new Unit('1').asOne().toWei(), 0);
            game = await SocialGame.at(receipt.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);
            // deploy second game as a control group for testing
            await newSocialGameToken.createSocialGame(creatorAddress, secondOwnerAddress, 5, new Unit('1').asOne().toWei(), 0);
        });

        // use the accounts to pay for all 5 games
        it("should auto-complete after 5th user participates", async () => {
            assert.equal(await game.isGameComplete(), false, "Game should not be complete");
            assert.equal(await game.isGameCancelled(), false, "Game should not be cancelled");

            await Promise.all(accounts.slice(0, 4).map(async acc => {
                let tx = await game.participate({ from: acc, value: new Unit('1').asOne().toWei() });
                tokenIds.push(tx.logs[0].args.value.toString());
                return Promise.resolve();
            }));

            // confirm cannot transfer token
            await newSocialGameToken.safeTransferFrom(accounts[0], accounts[1], tokenIds[0], { from: accounts[0] })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.notEqual(error.message, "assert.fail()", "Reason ...");
                });

            // close the game (should auto-complete)
            let tx = await game.participate({ from: accounts[4], value: new Unit('1').asOne().toWei() });
            tokenIds.push(tx.logs[0].args.value.toString());

            // confirm can transfer token
            await newSocialGameToken.safeTransferFrom(accounts[0], accounts[1], tokenIds[0], { from: accounts[0] })
                .then(result => {

                })
                .catch(error => {
                    assert.fail();
                });

            assert.equal(await newSocialGameToken.balanceOf(accounts[0]), 0, "Transfered token out, balance should be 0");
            assert.equal(await newSocialGameToken.balanceOf(accounts[1]), 2, "Transfered token test, balance should be 2");

            // check state
            assert.equal(await game.isGameComplete(), true, "Game should be complete");
            assert.equal(await game.isGameCancelled(), false, "Game should not be cancelled");
            assert.equal((await game.totalParticipants()).toString(), 5, "Participants should be constant (5)");
        });
    });

    context('testgroup - configuration tests - create game using erc721 token transfer into the contract', () => {
        // test default arguments (no data supplied), validate configuration is expected
        it("should default configure a game when we send it an ERC721 token", async () => {
            // newSocialGameToken - test by calling the function onERC721Received directly 
            const result = await newSocialGameToken.onERC721Received(
                creatorAddress,
                creatorAddress,
                12345,
                "0x0"
            );
            const game = await SocialGame.at(result.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);

            assert.equal((await game.participants()).toNumber(), 100, "Default participants do not match");
            assert.equal((await game.requiredEndorsers()).toNumber(), 20, "Default endorsers do not match");
        });
        // test with argument configuration supplied, validate configuration is expected
        it("should allow configuration of the 3 parameters (participants, endorsers, one per entry)", async () => {
            const participants = web3.utils.padLeft(web3.utils.numberToHex(5000), 64);
            const pricePerRound = web3.utils.padLeft(web3.utils.numberToHex(new Unit(1).asOne().toWei()), 64);
            const endorsers = web3.utils.padLeft(0, 64);

            const result = await newSocialGameToken.onERC721Received(
                creatorAddress,
                creatorAddress,
                12345,
                "0x" + (participants + pricePerRound + endorsers).replaceAll("0x", "")
            );

            const game = await SocialGame.at(result.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);

            assert.equal((await game.participants()).toNumber(), 5000, "participants do not match");
            assert.equal((await game.requiredEndorsers()).toNumber(), 0, "endorsers do not match");

            assert.isTrue((await game.pricePerRound()).eq(new Unit(1).asOne().toWei()), "Price per round setting not valid");
        });

        it("should auto-transfer token back to owner when game is completed", async () => {
            // create a sample token from the social game, finish the game so we have tokens we can use
            const sampleToken = await SocialGameToken.new();
            const { receipt } = await sampleToken.createSocialGame(creatorAddress, firstOwnerAddress, 5, new Unit('1').asOne().toWei(), 0);
            const sampleGame = await SocialGame.at(receipt.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);

            const setup = async (game, tokenIds, full) => {
                let acc = accounts.slice(0, full ? 5 : 4);

                await Promise.all(acc.map(async acc => {
                    let tx = await game.participate({ from: acc, value: new Unit('1').asOne().toWei() });
                    tokenIds.push(tx.logs[0].args.value.toString());
                    return Promise.resolve();
                }));
            }
            let tokens = [];
            await setup(sampleGame, tokens, true);

            // transfer a token into our social token to generate a game
            // assert that the generated game matches our configuration
            const participants = web3.utils.padLeft(web3.utils.numberToHex(5), 64);
            const pricePerRound = web3.utils.padLeft(web3.utils.numberToHex(new Unit(1).asOne().toWei()), 64);
            const endorsers = web3.utils.padLeft(0, 64);

            const receipt2 = await sampleToken.methods["safeTransferFrom(address,address,uint256,bytes)"](
                firstOwnerAddress,
                newSocialGameToken.address,
                tokens[1],
                "0x" + (participants + pricePerRound + endorsers).replaceAll("0x", ""),
                { from: firstOwnerAddress }
            );
            const generatedGame = await SocialGame.at(receipt2.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);
            assert.equal((await generatedGame.participants()).toNumber(), 5, "participants do not match");
            assert.equal((await generatedGame.requiredEndorsers()).toNumber(), 0, "endorsers do not match");
            assert.isTrue((await generatedGame.pricePerRound()).eq(new Unit(1).asOne().toWei()), "Price per round setting not valid");

            // assert that firstOwner no longer holds any tokens
            assert.isTrue((await sampleToken.balanceOf(firstOwnerAddress)).toNumber() === 0, "token should no longer be owned once game is created");

            // play the game
            const firstOwnerAddressToken = tokens[1];
            tokens = [];
            await setup(generatedGame, tokens, true);

            // assert that token is now transferred back upon game completion
            assert.isTrue((await sampleToken.balanceOf(firstOwnerAddress)).toNumber() === 1, "token should no longer be owned once game is created");
            assert.isTrue((await sampleToken.ownerOf(firstOwnerAddressToken)) === firstOwnerAddress, "token should no longer be owned once game is created");

        });

        it("should auto-transfer token back to owner when game is cancelled", async () => {
            // create a sample token from the social game, finish the game so we have tokens we can use
            const sampleToken = await SocialGameToken.new();
            const { receipt } = await sampleToken.createSocialGame(creatorAddress, firstOwnerAddress, 5, new Unit('1').asOne().toWei(), 0);
            const sampleGame = await SocialGame.at(receipt.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);

            const setup = async (game, tokenIds, full) => {
                let acc = accounts.slice(0, full ? 5 : 4);

                await Promise.all(acc.map(async acc => {
                    let tx = await game.participate({ from: acc, value: new Unit('1').asOne().toWei() });
                    tokenIds.push(tx.logs[0].args.value.toString());
                    return Promise.resolve();
                }));
            }
            let tokens = [];
            await setup(sampleGame, tokens, true);

            // transfer a token into our social token to generate a game
            // assert that the generated game matches our configuration
            const participants = web3.utils.padLeft(web3.utils.numberToHex(5), 64);
            const pricePerRound = web3.utils.padLeft(web3.utils.numberToHex(new Unit(1).asOne().toWei()), 64);
            const endorsers = web3.utils.padLeft(0, 64);

            const receipt2 = await sampleToken.methods["safeTransferFrom(address,address,uint256,bytes)"](
                firstOwnerAddress,
                newSocialGameToken.address,
                tokens[1],
                "0x" + (participants + pricePerRound + endorsers).replaceAll("0x", ""),
                { from: firstOwnerAddress }
            );
            const generatedGame = await SocialGame.at(receipt2.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);
            assert.equal((await generatedGame.participants()).toNumber(), 5, "participants do not match");
            assert.equal((await generatedGame.requiredEndorsers()).toNumber(), 0, "endorsers do not match");
            assert.isTrue((await generatedGame.pricePerRound()).eq(new Unit(1).asOne().toWei()), "Price per round setting not valid");

            // assert that firstOwner no longer holds any tokens
            assert.isTrue((await sampleToken.balanceOf(firstOwnerAddress)).toNumber() === 0, "token should no longer be owned once game is created");

            // play the game
            const firstOwnerAddressToken = tokens[1];
            tokens = [];
            await setup(generatedGame, tokens, false);

            // cancel the game
            await generatedGame.gameCancelled({ from: firstOwnerAddress });

            // assert that token is now transferred back upon game cancelled
            assert.isTrue((await sampleToken.balanceOf(firstOwnerAddress)).toNumber() === 1, "token should no longer be owned once game is created");
            assert.isTrue((await sampleToken.ownerOf(firstOwnerAddressToken)) === firstOwnerAddress, "token should no longer be owned once game is created");

        })
    });
});
