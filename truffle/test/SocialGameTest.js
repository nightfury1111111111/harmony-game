
/**
 * Test the SocialGameToken
 * @author victaphu
 * 
 * execute with: 
 *  #> truffle test test/SocialGameTokenTest.js
 * 
 * Test cases:
 * - Verify game entry logic (fixed amount, single address)
 * - Verify game completion logic (after number of participants met, game is complete, deposits prevented)
 * - Verify game cancel logic (cancel trigger will prevent deposits, allow depositors to withdraw)
 * - Verify withdraw of DAO and winners funds on game completion
 * - Verify deposit logic (transfer money to contract and rejection)
 * 
 * endorsements
 * - game starts without endorsements
 * - game requires endorsements (not met vs met)
 * - endorsers get a cut of the prize if game completed
 * - endorsers cannot get a cut if not won
 * - fail when game is cancelled
 * - endorsers can re-claim ticket on game cancelled
 * */
var SocialGame = artifacts.require("contracts/SocialGame.sol");
var SocialGameToken = artifacts.require("contracts/SocialGameToken.sol");
const { Unit } = require('@harmony-js/utils');
const  {ErrorCodes} = require("./ErrorCodes");

contract('SocialGame', (accounts) => {
    var creatorAddress = accounts[0];
    var firstOwnerAddress = accounts[1];
    var secondOwnerAddress = accounts[2];
    var externalAddress = accounts[3];
    var unprivilegedAddress = accounts[4];
    let newSocialGameToken;
    let newSocialGame;

    before(async () => {
        /* before tests */
        newSocialGameToken = await SocialGameToken.new();
    });

    beforeEach(async () => {
        /* before each context */
        const { receipt } = await newSocialGameToken.createSocialGame(creatorAddress, firstOwnerAddress, 5, new Unit('1').asOne().toWei(), 0);
        newSocialGame = await SocialGame.at(receipt.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);
    })

    context('testgroup - security tests - Verify game entry logic (fixed amount, single address)', () => {
        // can only participate once in the game
        it('should revert if a user has already entered the game once', async () => {
            await newSocialGame.participate({ from: externalAddress, value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.equal(result.logs[0].event, "Participated", "Participation event not fired");
                })
                .catch(error => {
                    assert.fail();
                });


            await newSocialGame.participate({ from: externalAddress, value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_006");
                });
        });

        // must donate fixed amount
        it('should revert if a user does not donate the correct amount', async () => {
            await newSocialGame.participate({ from: creatorAddress, value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.equal(result.logs[0].event, "Participated", "Participation event not fired");
                })
                .catch(error => {
                    assert.fail();
                });

            await newSocialGame.participate({ from: secondOwnerAddress, value: new Unit('0.5').asOne().toWei() })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_004");
                });
        });
        // check the getter functions
        it('should increase participant count when a participant joins the game successfully', async () => {
            const participants = (await newSocialGame.totalParticipants()).toString();
            await newSocialGame.participate({ from: unprivilegedAddress, value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.equal(result.logs[0].event, "Participated", "Participation event not fired");
                })
                .catch(error => {
                    assert.fail();
                });
            assert.equal(await newSocialGame.totalParticipants(), (+participants) + 1, "Total participants did not increase");
            // fail because we already added
            await newSocialGame.participate({ from: unprivilegedAddress, value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_006");
                });
            assert.equal(await newSocialGame.totalParticipants(), (+participants) + 1, "Should not increase participation on fail");

            // fail because invalid amount sent
            await newSocialGame.participate({ from: accounts[5], value: new Unit('0.5').asOne().toWei() })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_004");
                });
            assert.equal(await newSocialGame.totalParticipants(), (+participants) + 1, "Should not increase participation on fail");
        });
        it('should return balance of dao and winner escrows according to 65/35 breakdown', async () => {
            await newSocialGame.participate({ from: externalAddress, value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.equal(result.logs[0].event, "Participated", "Participation event not fired");
                })
                .catch(error => {
                    assert.fail();
                });

            const deposits = await newSocialGame.getDeposits.call(externalAddress, { from: externalAddress });
            const dao = new Unit(deposits.daoEscrow.toString()).toOne();
            const winner = new Unit(deposits.winnersEscrow.toString()).toOne();
            assert.equal(dao, 0.65, "DAO should take 0.65 ONE tokens based on a 1 ONE deposit requirement");
            assert.equal(winner, 0.35, "Winners should take 0.35 ONE tokens based on a 1 ONE deposit requirement");
        });
        it('should return 0 for those not registered', async () => {
            const deposits = await newSocialGame.getDeposits.call(secondOwnerAddress, { from: secondOwnerAddress });
            const dao = new Unit(deposits.daoEscrow.toString()).toOne();
            const winner = new Unit(deposits.winnersEscrow.toString()).toOne();
            assert.equal(dao, 0, "Not part of the game, should return 0 for dao escrow");
            assert.equal(winner, 0, "Not part of the game, should return 0 for winner escrow");
        });
        it('should revert if a user attempts to refund when the game is not cancelled', async () => {
            await newSocialGame.refund({ from: externalAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_008");
                });
        });
        it('should revert if a user attempts to claim prize when the game is not completed', async () => {
            await newSocialGame.claimPrize({ from: externalAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_012");
                });
        });
        it('should return false for cancelled and completed', async () => {
            await newSocialGame.isGameCancelled({ from: externalAddress })
                .then(result => {
                    assert.isFalse(result, "Game shoud not be cancelled at this point");
                })
                .catch(error => {
                    assert.fail();
                });

            await newSocialGame.isGameComplete({ from: externalAddress })
                .then(result => {
                    assert.isFalse(result, "Game shoud not be completed at this point");
                })
                .catch(error => {
                    assert.fail();
                });
        });
        it('should return false for winner check', async () => {
            await newSocialGame.didIWin(externalAddress, { from: externalAddress })
                .then(result => {
                    assert.isFalse(result, "The game has not yet concluded now, so no winner");
                })
                .catch(error => {
                    assert.fail();
                });
        });
        it('should revert if beneficiaryWithdraw is called not by benefactor of DAO fund, or if it is not complete yet', async () => {
            await newSocialGame.beneficiaryWithdraw({ from: externalAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_019");
                });
            await newSocialGame.beneficiaryWithdraw({ from: firstOwnerAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_020");
                });
        });
        it('should only allow the owner to cancel the game', async () => {
            await newSocialGame.gameCancelled({ from: externalAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "Ownable: caller is not the owner");
                });

            await newSocialGame.gameCancelled({ from: creatorAddress })
                .catch(error => {
                    assert.fail();
                });
            assert.isTrue(await newSocialGame.isGameCancelled(), "Game should be cancelled");
        });
    });

    const setup = async (tokenIds, full, game) => {
        let acc = accounts.slice(0, full ? 5 : 4);

        if (!game) {
            game = newSocialGame;
        }

        await Promise.all(acc.map(async acc => {
            let tx = await game.participate({ from: acc, value: new Unit('1').asOne().toWei() });
            tokenIds.push(tx.logs[0].args.value.toString());
            return Promise.resolve();
        }));
    }
    context('testgroup - functional tests - game logic completed game', () => {

        // test after game is completed, verify the different logic
        it('should handle game completion logic by returning correct state, and preventing participants after game is over', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, false);

            // confirm game state is still not complete/cancelled
            assert.isFalse(
                await newSocialGame.isGameCancelled({ from: externalAddress }),
                "Game should not be cancelled at this point");

            assert.isFalse(
                await newSocialGame.isGameComplete({ from: externalAddress }),
                "Game should not be completed at this point");

            let tx = await newSocialGame.participate({ from: accounts[4], value: new Unit('1').asOne().toWei() });
            tokenIds.push(tx.logs[0].args.value.toString());

            assert.isTrue(
                await newSocialGame.isGameComplete({ from: externalAddress }),
                "Game should now be completed"
            );
            assert.isFalse(
                await newSocialGame.isGameCancelled({ from: externalAddress }),
                "Game should not be cancelled here either");

        });

        it('should only have winners after game complete, and winners should be part of the list of accounts for participants', async () => {
            const tokenIds = [];
            await setup(tokenIds, false);

            assert.equal(await newSocialGame.winner1st(), "0x0000000000000000000000000000000000000000", "no winners should be announced yet");
            assert.equal(await newSocialGame.winner2nd(), "0x0000000000000000000000000000000000000000", "no winners should be announced yet");
            assert.equal(await newSocialGame.winner3rd(), "0x0000000000000000000000000000000000000000", "no winners should be announced yet");

            let tx = await newSocialGame.participate({ from: accounts[4], value: new Unit('1').asOne().toWei() });
            tokenIds.push(tx.logs[0].args.value.toString());

            const addressObject = {};
            const winner1 = await newSocialGame.winner1st();
            const winner2 = await newSocialGame.winner2nd();
            const winner3 = await newSocialGame.winner3rd();

            // assert selected addresses are unique
            addressObject[winner1] = 1;
            assert.isUndefined(addressObject[winner2], "Same winner chosen more than once!");
            addressObject[winner2] = 1;
            assert.isUndefined(addressObject[winner3], "Same winner chosen more than once!");
            addressObject[winner3] = 1;

            // assert addresses in the accounts we used
            assert.isTrue(accounts.indexOf(winner1) >= 0, "Winners should be part of account list");
            assert.isTrue(accounts.indexOf(winner2) >= 0, "Winners should be part of account list");
            assert.isTrue(accounts.indexOf(winner3) >= 0, "Winners should be part of account list");

            // confirm you cannot participate after the game is completed
            await newSocialGame.participate({ from: accounts[4], value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_005");
                });
            assert.isTrue(await newSocialGame.didIWin.call(winner1, { from: winner1 }), "Should be a winner");
        });

        it('should allow beneficiary to withdraw the DAO fund', async () => {
            const tokenIds = [];
            await setup(tokenIds, true);
            const beforeWithdraw = new Unit(await web3.eth.getBalance(firstOwnerAddress)).toOne();
            await newSocialGame.beneficiaryWithdraw({ from: firstOwnerAddress });
            const afterWithdraw = new Unit(await web3.eth.getBalance(firstOwnerAddress)).toOne();
            assert.isTrue(+afterWithdraw > +beforeWithdraw, "Beneficiary should be able to withdraw their funds");
        });

        it('should revert if the beneficiary tries to withdraw more than once', async () => {
            const tokenIds = [];
            await setup(tokenIds, true);
            await newSocialGame.beneficiaryWithdraw({ from: firstOwnerAddress });
            await newSocialGame.beneficiaryWithdraw({ from: firstOwnerAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_021");
                });
        });

        it('should revert if someone other than the beneficiary attempts to withdraw the DAO fund', async () => {
            const tokenIds = [];
            await setup(tokenIds, true);
            await newSocialGame.beneficiaryWithdraw({ from: unprivilegedAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_019");
                });
        });

        it('should allow winners to withdraw the winners fund', async () => {
            const tokenIds = [];
            await setup(tokenIds, true);
            const winner1 = await newSocialGame.winner1st();
            const winner2 = await newSocialGame.winner2nd();
            const winner3 = await newSocialGame.winner3rd();

            // 1st place 20% x 5 one (1 one)
            // 2nd place 10% x 5 one (0.5 one)
            // 3rd place  5% x 5 one (0.25 one)
            // do rounding so we accomodate for gas costs 
            const participants = await newSocialGame.participants();
            const costPerEntry = await newSocialGame.pricePerRound();
            const prize1st = await newSocialGame.PRIZE_1ST();
            const prize2nd = await newSocialGame.PRIZE_2ND();
            const prize3rd = await newSocialGame.PRIZE_3RD();

            const expected_1st = new Unit(participants * costPerEntry * prize1st / 100).toOne();
            const expected_2nd = new Unit(participants * costPerEntry * prize2nd / 100).toOne();
            const expected_3rd = new Unit(participants * costPerEntry * prize3rd / 100).toOne();

            const claimAndCheck = async (winner, expected) => {
                const beforeClaim = new Unit(await web3.eth.getBalance(winner));
                await newSocialGame.claimPrize({ from: winner });
                const afterClaim = new Unit(await web3.eth.getBalance(winner));
                assert.isTrue(afterClaim.toOne() > beforeClaim.toOne(), "Claim was unsuccessful");

                const result = Math.round(100 * (afterClaim.toOne() - beforeClaim.toOne())) / 100;
                assert.equal(expected, result, "Claim amount does not match");
            }

            await claimAndCheck(winner1, expected_1st);
            await claimAndCheck(winner2, expected_2nd);
            await claimAndCheck(winner3, expected_3rd);
        });

        it('should revert if anyone other than the winners attempt to withdraw the winning funds', async () => {
            const tokenIds = [];
            await setup(tokenIds, true);
            await newSocialGame.claimPrize({ from: accounts[6] })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_013");
                });
        });

        it('should revert if winners attempt to withdraw the winning funds more than once', async () => {
            const tokenIds = [];
            await setup(tokenIds, true);
            const winner1 = await newSocialGame.winner1st();
            await newSocialGame.claimPrize({ from: winner1 });
            await newSocialGame.claimPrize({ from: winner1 })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_014");
                });
        });
    });
    context('testgroup - functional tests - game logic cancelled game', () => {
        // * - Verify game cancel logic (cancel trigger will prevent deposits, allow depositors to withdraw)
        it('should update state when owner issues cancel on contract', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, false);

            assert.isFalse(
                await newSocialGame.isGameCancelled({ from: creatorAddress }),
                "Game should not be cancelled at this point");

            assert.isFalse(
                await newSocialGame.isGameComplete({ from: creatorAddress }),
                "Game should not be completed at this point");

            await newSocialGame.gameCancelled({ from: creatorAddress });

            assert.isTrue(
                await newSocialGame.isGameCancelled({ from: creatorAddress }),
                "Game should not be cancelled at this point");

            assert.isFalse(
                await newSocialGame.isGameComplete({ from: externalAddress }),
                "Game should not be completed at this point");
        });
        it('should revert when user attempts to cancel a completed game', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, true);
            await newSocialGame.gameCancelled({ from: creatorAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_022");
                });

        });
        it('should revert when user attempts to participate in cancelled game', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, false); // cannot complete the game or we cannot cancel
            await newSocialGame.gameCancelled({ from: creatorAddress })
            // // confirm you cannot participate after the game is cancelled
            await newSocialGame.participate({ from: accounts[5], value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "RefundEscrow: can only deposit while active");
                });
        });
        it('should not have any winners for a cancelled game', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, false); // cannot complete the game or we cannot cancel
            await newSocialGame.gameCancelled({ from: creatorAddress })
            // // confirm you cannot participate after the game is cancelled
            assert.equal(await newSocialGame.winner1st(), "0x0000000000000000000000000000000000000000", "no winners should be announced yet");
            assert.equal(await newSocialGame.winner2nd(), "0x0000000000000000000000000000000000000000", "no winners should be announced yet");
            assert.equal(await newSocialGame.winner3rd(), "0x0000000000000000000000000000000000000000", "no winners should be announced yet");
        });
        it('should prevent the beneficiary to withdraw money for cancelled games', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, false); // cannot complete the game or we cannot cancel
            await newSocialGame.gameCancelled({ from: creatorAddress });
            await newSocialGame.beneficiaryWithdraw({ from: firstOwnerAddress })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_018");
                });

        });
        it('should allow depositors to withdraw their tokens when a game is cancelled', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, false); // cannot complete the game or we cannot cancel
            await newSocialGame.gameCancelled({ from: creatorAddress })
            const beforeRefund = new Unit(await web3.eth.getBalance(accounts[1])).toOne();
            await newSocialGame.refund({ from: accounts[1] });
            const afterRefund = new Unit(await web3.eth.getBalance(accounts[1])).toOne();
            assert.isTrue(afterRefund > beforeRefund, "Refund was not accepted?");

        });
        it('should allow depositors to withdraw their tokens only once when a game is cancelled', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, false); // cannot complete the game or we cannot cancel
            await newSocialGame.gameCancelled({ from: creatorAddress })
            await newSocialGame.refund({ from: accounts[1] });
            await newSocialGame.refund({ from: accounts[1] })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_009");
                }); //Cannot refund account, not a participant

        });
        it('should revert if random address from withdrawing tokens when a game is cancelled', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, false); // cannot complete the game or we cannot cancel
            await newSocialGame.gameCancelled({ from: creatorAddress })
            await newSocialGame.refund({ from: accounts[7] })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_009");
                }); //Cannot refund account, not a participant
        });
        it('should have enough eth to refund all when game is cancelled', async () => {
            // need 5 accounts
            const tokenIds = [];
            await setup(tokenIds, false); // cannot complete the game or we cannot cancel
            await newSocialGame.gameCancelled({ from: creatorAddress })
            let acc = accounts.slice(0, 4);

            await Promise.all(acc.map(async acc => {
                const beforeRefund = new Unit(await web3.eth.getBalance(acc)).toOne();
                await newSocialGame.refund({ from: acc });
                const afterRefund = new Unit(await web3.eth.getBalance(acc)).toOne();
                assert.isTrue(afterRefund > beforeRefund, "Refund was not accepted?");
                return Promise.resolve();
            }));
        });
    });
    context('testgroup - functional tests - game endorsement validation', () => {
        const createGameToken = async (participants, pricePerRound, endorsers) => {
            // create game generated by sending a token to our 

            // create a sample token from the social game, finish the game so we have tokens we can use
            const sampleToken = await SocialGameToken.new();
            const { receipt } = await sampleToken.createSocialGame(creatorAddress, firstOwnerAddress, 5, new Unit('1').asOne().toWei(), 0);
            const sampleGame = await SocialGame.at(receipt.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);

            let tokens = [];
            await setup(tokens, true, sampleGame);

            // transfer a token into our social token to generate a game
            // assert that the generated game matches our configuration
            participants = web3.utils.padLeft(web3.utils.numberToHex(participants), 64);
            pricePerRound = web3.utils.padLeft(web3.utils.numberToHex(new Unit(pricePerRound).asOne().toWei()), 64);
            endorsers = web3.utils.padLeft(endorsers, 64); // no endorsers required

            const receipt2 = await sampleToken.methods["safeTransferFrom(address,address,uint256,bytes)"](
                firstOwnerAddress,
                newSocialGameToken.address, // create game by sending erc721 token to the social game token address
                tokens[1],
                "0x" + (participants + pricePerRound + endorsers).replaceAll("0x", ""),
                { from: firstOwnerAddress }
            );
            const generatedGame = await SocialGame.at(receipt2.logs.filter(e => e.event === "GameCreated")[0].args.SocialGame);
            return generatedGame;
        }
        // * - Verify game endorsement logic 
        it('should be able to play the game if there are no endorsers required', async () => {
            const generatedGame = await createGameToken(5, 1, 0);
            // play the game
            let tokens = [];
            await setup(tokens, true, generatedGame); // game is successfully played
            assert.isTrue(
                await generatedGame.isGameComplete({ from: creatorAddress }),
                "Game should be completed at this point");
        });

        it('should revert if not enough endorsements received to start a game', async () => {
            const generatedGame = await createGameToken(5, 1, 2);

            await generatedGame.participate({ from: accounts[5], value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_007");
                });
        });

        it('should be able to start again once endorsements confirmed', async () => {
            const generatedGame = await createGameToken(5, 1, 0); // generate with 0
            let tokens = [];
            await setup(tokens, true, generatedGame); // complete this game so that we can get some tokens for endorsement

            // create another game, this one with endorsement requirements
            const endorsementGame = await createGameToken(5, 1, 2);
            await endorsementGame.participate({ from: accounts[5], value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_007");
                });

            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                endorsementGame.address,
                tokens[1],
                { from: firstOwnerAddress }
            );

            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                secondOwnerAddress,
                endorsementGame.address,
                tokens[2],
                { from: secondOwnerAddress }
            );

            // now try to play the game
            await endorsementGame.participate({ from: accounts[5], value: new Unit('1').asOne().toWei() })
                .then(result => {
                })
                .catch(error => {
                    assert.fail();
                });
        });

        it('should revert if a user tries to endorse the same game more than once', async () => {
            // complete two games so that we have more than one token!
            let generatedGame = await createGameToken(5, 1, 0); // generate with 0
            let tokens = [];
            await setup(tokens, true, generatedGame); // complete this game so that we can get some tokens for endorsement

            const firstToken = tokens[1];

            generatedGame = await createGameToken(5, 1, 0); // generate with 0
            tokens = [];
            await setup(tokens, true, generatedGame); // complete this game so that we can get some tokens for endorsement

            const secondToken = tokens[1];

            // create another game, this one with endorsement requirements
            const endorsementGame = await createGameToken(5, 1, 2);
            await endorsementGame.participate({ from: accounts[5], value: new Unit('1').asOne().toWei() })
                .then(result => {
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_007");
                });

            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                endorsementGame.address,
                firstToken,
                { from: firstOwnerAddress }
            );

            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                endorsementGame.address,
                secondToken,
                { from: firstOwnerAddress }
            ).then(result => {
                assert.fail()
            }).catch(error => {
                assert.equal(error.reason, "ER_026")
            });
        });

        it('should not be able to fake an endorsement from external contract (not social game token)', async () => {
            // complete two games so that we have more than one token!
            let generatedGame = await createGameToken(5, 1, 2); // generate with 0

            const result = await generatedGame.onERC721Received(
                creatorAddress,
                creatorAddress,
                12345,
                "0x0"
            ).then(result => {
                assert.fail();
            }).catch(error => {
                assert.equal(error.reason, "ER_025");
            });

            console.log(result);
        });

        it('should revert if endorser tries to claim their prize before the game ends', async () => {
            let generatedGame = await createGameToken(5, 1, 0); // generate with 0
            // CASE 1: no endorser ... should fail
            await generatedGame.claimEndorsementFee()
                .then(result => assert.fail())
                .catch(error => {
                    assert.equal(error.reason, "ER_015", "unexpected error on endorsement claim");
                });

            // complete the game and check again
            let tokens = [];
            await setup(tokens, true, generatedGame);
            await generatedGame.claimEndorsementFee()
                .then(result => assert.fail())
                .catch(error => {
                    assert.equal(error.reason, "ER_016", "unexpected error on endorsement claim");
                });


            // CASE 2: two endorsers
            generatedGame = await createGameToken(5, 1, 2); // generate with 0
            // two endorser, game not started
            await generatedGame.claimEndorsementFee()
                .then(result => assert.fail())
                .catch(error => {
                    assert.equal(error.reason, "ER_015", "unexpected error on endorsement claim");
                });

            // endorse the game
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                generatedGame.address,
                tokens[1],
                { from: firstOwnerAddress }
            );
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                secondOwnerAddress,
                generatedGame.address,
                tokens[2],
                { from: secondOwnerAddress }
            );

            // game is started but not completed
            await setup(tokens, false, generatedGame);
            await generatedGame.claimEndorsementFee({ from: firstOwnerAddress })
                .then(result => assert.fail())
                .catch(error => {
                    assert.equal(error.reason, "ER_015", "unexpected error on endorsement claim");
                });

            // game is completed, should be able to claim
            await generatedGame.participate({ from: accounts[5], value: new Unit('1').asOne().toWei() })
                .then(result => {
                })
                .catch(error => {
                    assert.fail();
                });

            // make sure that once the endorsement is claimed
            const beforeWithdraw = new Unit(await web3.eth.getBalance(firstOwnerAddress)).toOne();
            const result = await generatedGame.claimEndorsementFee({ from: firstOwnerAddress })
                .catch(error => {
                    assert.fail();
                });
            const afterWithdraw = new Unit(await web3.eth.getBalance(firstOwnerAddress)).toOne();
            assert.isTrue(+afterWithdraw > +beforeWithdraw, "After claiming the endorsement fee, the balance should increase");
        });

        it('should revert if endorser tries to refund endorsement when the game has not been cancelled', async () => {
            let generatedGame = await createGameToken(5, 1, 0); // generate with 0

            let tokens = [];
            await setup(tokens, true, generatedGame);

            generatedGame = await createGameToken(5, 1, 2); // generate with 0

            // endorse the game
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                generatedGame.address,
                tokens[1],
                { from: firstOwnerAddress }
            );
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                secondOwnerAddress,
                generatedGame.address,
                tokens[2],
                { from: secondOwnerAddress }
            );

            // claim refund on non-cancelled game
            await generatedGame.refundEndorsement({ from: firstOwnerAddress })
                .then(result => assert.fail())
                .catch(error => {
                    assert.equal(error.reason, "ER_010", "unexpected error on refund endorsement");
                });
        });

        it('should revert if address is not endorser trying to claim refund on cancelled game', async () => {
            let generatedGame = await createGameToken(5, 1, 0); // generate with 0

            let tokens = [];
            await setup(tokens, true, generatedGame);

            generatedGame = await createGameToken(5, 1, 2); // generate with 0

            // endorse the game
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                generatedGame.address,
                tokens[1],
                { from: firstOwnerAddress }
            );
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                secondOwnerAddress,
                generatedGame.address,
                tokens[2],
                { from: secondOwnerAddress }
            );

            await generatedGame.gameCancelled({ from: firstOwnerAddress });

            // claim refund on non-cancelled game
            await generatedGame.refundEndorsement({ from: accounts[5] })
                .then(result => assert.fail())
                .catch(error => {
                    assert.equal(error.reason, "ER_011", "unexpected error on refund endorsement");
                });
        });

        it('should revert if address is not endorser trying to claim prize on completed game', async () => {
            let generatedGame = await createGameToken(5, 1, 0); // generate with 0

            let tokens = [];
            await setup(tokens, true, generatedGame);

            generatedGame = await createGameToken(5, 1, 2); // generate with 0

            // endorse the game
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                generatedGame.address,
                tokens[1],
                { from: firstOwnerAddress }
            );
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                secondOwnerAddress,
                generatedGame.address,
                tokens[2],
                { from: secondOwnerAddress }
            );

            await setup(tokens, true, generatedGame);

            // cannot claim refund on a completed game!
            await generatedGame.refundEndorsement({ from: accounts[5] })
                .then(result => assert.fail())
                .catch(error => {
                    assert.equal(error.reason, "ER_010", "unexpected error on refund endorsement");
                });

            // make sure that once the endorsement is claimed
            const result = await generatedGame.claimEndorsementFee({ from: accounts[5] })
                .catch(error => {
                    assert.equal(error.reason, "ER_017", "unexpected error on endorsement claim");
                });

        });

        it('should revert if endorser tries to claim their prize twice on a completed game', async () => {
            let generatedGame = await createGameToken(5, 1, 0); // generate with 0

            let tokens = [];
            await setup(tokens, true, generatedGame);

            generatedGame = await createGameToken(5, 1, 2); // generate with 0

            // endorse the game
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                generatedGame.address,
                tokens[1],
                { from: firstOwnerAddress }
            );
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                secondOwnerAddress,
                generatedGame.address,
                tokens[2],
                { from: secondOwnerAddress }
            );

            // game is started but not completed
            await setup(tokens, true, generatedGame);
            // make sure that once the endorsement is claimed
            const result = await generatedGame.claimEndorsementFee({ from: firstOwnerAddress })
                .catch(error => {
                    assert.fail();
                });

            // second time should fail
            await generatedGame.claimEndorsementFee({ from: firstOwnerAddress })
                .then(result => { 
                    console.log(result);
                    assert.fail();
                })
                .catch(error => {
                    assert.equal(error.reason, "ER_017", "unexpected error on refund endorsement");
                });
        });

        it('should revert if endorser tries to claim their refund twice on a cancelled game', async () => {
            let generatedGame = await createGameToken(5, 1, 0); // generate with 0

            let tokens = [];
            await setup(tokens, true, generatedGame);

            generatedGame = await createGameToken(5, 1, 2); // generate with 0

            // endorse the game
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                generatedGame.address,
                tokens[1],
                { from: firstOwnerAddress }
            );
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                secondOwnerAddress,
                generatedGame.address,
                tokens[2],
                { from: secondOwnerAddress }
            );

            await generatedGame.gameCancelled({ from: firstOwnerAddress });
            const before = ((await newSocialGameToken.balanceOf(secondOwnerAddress)).toNumber());
            await generatedGame.refundEndorsement({ from: secondOwnerAddress })
                .catch(error => {
                    assert.fail();
                });
            const after = ((await newSocialGameToken.balanceOf(secondOwnerAddress)).toNumber());
            assert.isTrue(+before < +after, "endorser claiming refund did not get their token back ...");

            await generatedGame.refundEndorsement({ from: secondOwnerAddress })
                .then(result => assert.fail())
                .catch(error => {
                    assert.equal(error.reason, "ER_011", "unexpected error on endorsement claim");
                });
        });

        it('should allow an endorser to claim refund on cancelled game', async () => {
            let generatedGame = await createGameToken(5, 1, 0); // generate with 0

            let tokens = [];
            await setup(tokens, true, generatedGame);

            generatedGame = await createGameToken(5, 1, 2); // generate with 0

            // endorse the game
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                generatedGame.address,
                tokens[1],
                { from: firstOwnerAddress }
            );
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                secondOwnerAddress,
                generatedGame.address,
                tokens[2],
                { from: secondOwnerAddress }
            );

            await generatedGame.gameCancelled({ from: firstOwnerAddress });
            const before = ((await newSocialGameToken.balanceOf(secondOwnerAddress)).toNumber());
            await generatedGame.refundEndorsement({ from: secondOwnerAddress })
                .catch(error => {
                    assert.fail();
                });
            const after = ((await newSocialGameToken.balanceOf(secondOwnerAddress)).toNumber());
            assert.isTrue(+before < +after, "endorser claiming refund did not get their token back ...");

        });

        it('should allow an endorser to claim prize on completed game', async () => {
            let generatedGame = await createGameToken(5, 1, 0); // generate with 0

            let tokens = [];
            await setup(tokens, true, generatedGame);

            generatedGame = await createGameToken(5, 1, 2); // generate with 0

            // endorse the game
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                firstOwnerAddress,
                generatedGame.address,
                tokens[1],
                { from: firstOwnerAddress }
            );
            await newSocialGameToken.methods["safeTransferFrom(address,address,uint256)"](
                secondOwnerAddress,
                generatedGame.address,
                tokens[2],
                { from: secondOwnerAddress }
            );

            // game is started but not completed
            await setup(tokens, true, generatedGame);
            // make sure that once the endorsement is claimed

            const beforeWithdraw = new Unit(await web3.eth.getBalance(firstOwnerAddress)).toOne();
            const result = await generatedGame.claimEndorsementFee({ from: firstOwnerAddress })
                .catch(error => {
                    assert.fail();
                });
            const afterWithdraw = new Unit(await web3.eth.getBalance(firstOwnerAddress)).toOne();
            assert.isTrue(+afterWithdraw > +beforeWithdraw, "After claiming the endorsement fee, the balance should increase");
        });
    });
});
