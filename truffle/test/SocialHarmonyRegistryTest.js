
/**
 * Test the Social Harmony Registry
 * @author victaphu
 * 
 * execute with: 
 *  #> truffle test test/SocialHarmonyRegistryTest.js
 * 
 * Test cases:
 * - security validation: granting and revoking admin, management, and verifier roles
 * - security validation: accessing restricted functions (verify and unverify)
 * - function validation: registering org (unverified), verify and validate verification
 * */
var SocialHarmonyRegistry = artifacts.require("contracts/reports/SocialHarmonyRegistry.sol");

contract('Report Framework', (accounts) => {
    var creatorAddress = accounts[0];
    var firstOwnerAddress = accounts[1];
    var secondOwnerAddress = accounts[2];
    var externalAddress = accounts[3];
    var unprivilegedAddress = accounts[4];
    let registry;
    before(async () => {
        /* before tests */
        registry = await SocialHarmonyRegistry.new({ from: creatorAddress });
    });

    context('testgroup - security validation: granting and revoking management and verifier roles', () => {
        it('should restrict role grant and revoking for management roles', async () => {

            // try to grant a role (from someone without authority)
            await registry.grantRole(await registry.DEFAULT_ADMIN_ROLE(), secondOwnerAddress, { from: firstOwnerAddress })
                .then(result => assert.fail())
                .catch(error => {
                    assert.isTrue(error.reason.indexOf("is missing role") >= 0, "Error not valid, should revert with missing role")
                });

            // grant access to admin role
            await registry.grantRole(await registry.DEFAULT_ADMIN_ROLE(), firstOwnerAddress, { from: creatorAddress })
                .catch(error => {
                    assert.fail();
                });

            // grant verifier access to second address owner
            await registry.grantRole(await registry.DEFAULT_ADMIN_ROLE(), secondOwnerAddress, { from: firstOwnerAddress })
                .catch(error => {
                    assert.fail();
                });

            // confirm that they can now grant access
            await registry.grantRole(await registry.DEFAULT_ADMIN_ROLE(), externalAddress, { from: secondOwnerAddress })
                .catch(error => {
                    assert.fail();
                });

            // revoke access and confirm they cannot grant anymore
            await registry.revokeRole(await registry.DEFAULT_ADMIN_ROLE(), firstOwnerAddress, { from: creatorAddress });

            await registry.grantRole(await registry.DEFAULT_ADMIN_ROLE(), unprivilegedAddress, { from: firstOwnerAddress })
                .then(result => assert.fail())
                .catch(error => {
                    assert.isTrue(error.reason.indexOf("is missing role") >= 0, "Error not valid, should revert with missing role")
                });
        });

        it('should restrict role grant and revoking for verifier roles', async () => {
            await registry.registerURI("abcdefg", { from: externalAddress });
            await registry.registerURI("abcdefghi", { from: unprivilegedAddress });

            // check that owner can grant and revoke roles
            await registry.verifyOrganisation(externalAddress, { from: firstOwnerAddress })
                .then(result => assert.fail())
                .catch(error => {
                    assert.isTrue(error.reason.indexOf("is missing role") >= 0, "Error not valid, should revert with missing role")
                });

            // grant role to firstOwner address then confirm they can verify
            await registry.grantRole(await registry.VERIFIER_GRANT_ROLE(), firstOwnerAddress, { from: creatorAddress });
            await registry.verifyOrganisation(externalAddress, { from: firstOwnerAddress })
                .catch(error => {
                    assert.fail();
                });

            const result = await registry.isVerified(externalAddress);
            assert.isTrue(result, "organisation should be verified");

            await registry.revokeRole(await registry.VERIFIER_GRANT_ROLE(), firstOwnerAddress, { from: creatorAddress });
            // check that owner can grant and revoke roles
            await registry.verifyOrganisation(externalAddress, { from: firstOwnerAddress })
                .then(result => assert.fail())
                .catch(error => {
                    assert.isTrue(error.reason.indexOf("is missing role") >= 0, "Error not valid, should revert with missing role")
                });
        });
    });

    context('testgroup - security validation: accessing restricted functions (verify and unverify)', () => {
        it('should revert when trying to access the verify, unverify functions', async () => {
            await registry.verifyOrganisation(unprivilegedAddress, { from: unprivilegedAddress })
                .then(result => assert.fail())
                .catch(error => {
                    assert.isTrue(error.reason.indexOf("is missing role") >= 0, "Error not valid, should revert with missing role")
                });

            await registry.unverifyOrganisation(unprivilegedAddress, { from: unprivilegedAddress })
                .then(result => assert.fail())
                .catch(error => {
                    assert.isTrue(error.reason.indexOf("is missing role") >= 0, "Error not valid, should revert with missing role")
                });
        });
    });


    context('testgroup - function validation: registering org (unverified), verify and validate verification', () => {
        it('should allow any user to register, should be unverified', async () => {
            await registry.registerURI("uri1", { from: accounts[7] });
            await registry.registerURI("uri2", { from: accounts[8] });

            assert.isFalse(await registry.isVerified(accounts[7]), "should not be verified");
            assert.isFalse(await registry.isVerified(accounts[8]), "should not be verified");

        });

        it('should return correct uri when requesting organisation details by public key', async () => {
            await registry.registerURI("uri1", { from: accounts[7] });
            await registry.registerURI("uri2", { from: accounts[8] });

            assert.equal(await registry.tokenURI(accounts[7]), "uri1", "registration unsuccessful");
            assert.equal(await registry.tokenURI(accounts[8]), "uri2", "registration unsuccessful");

            await registry.registerURI("uri3", { from: accounts[7] });
            assert.equal(await registry.tokenURI(accounts[7]), "uri3", "registration unsuccessful");
        });

        it('should change from verified to unverified if we update the uri', async () => {
            await registry.registerURI("uri1", { from: accounts[7] });
            await registry.registerURI("uri2", { from: accounts[8] });
            assert.isFalse(await registry.isVerified(accounts[7]), "should not be verified");
            assert.isFalse(await registry.isVerified(accounts[8]), "should not be verified");

            await registry.verifyOrganisation(accounts[7], { from: creatorAddress });
            assert.isTrue(await registry.isVerified(accounts[7]), "should be verified");

            await registry.registerURI("uri1", { from: accounts[7] });


        });

        it('should allow retrieval of the uris and addresses as a batch query', async () => {
            // note: do not expect this to be in order as we are running multiple
            await Promise.all(accounts.map(async (acc, i) => {
                await registry.registerURI("uri" + i, { from: acc });
                return Promise.resolve();
            }));
            assert.equal((await registry.getOrgsCount()).toNumber(), accounts.length, "number of registered orgs do not match");
            const { orgs, orgURIs } = (await registry.getURIs(0, 10));
            orgs.map((org, i) => {
                const idx = accounts.indexOf(org);
                assert.isTrue(idx >= 0 && idx < accounts.length, "invalid org index");
                assert.isTrue(orgURIs[i] == "uri" + idx, "invalid uri setting");
            })
        });

        it('should allow paging retrieval of uri data', async () => {
            await Promise.all(accounts.map(async (acc, i) => {
                await registry.registerURI("uri" + i, { from: acc });
                return Promise.resolve();
            }));
            assert.equal((await registry.getOrgsCount()).toNumber(), accounts.length, "number of registered orgs do not match");
            const { orgs, orgURIs } = (await registry.getURIs(0, 2));
            orgs.map((org, i) => {
                const idx = accounts.indexOf(org);
                assert.isTrue(idx >= 0 && idx < accounts.length, "invalid org index");
                assert.isTrue(orgURIs[i] == "uri" + idx, "invalid uri setting");
            })
        });

        it('should update lastUpdated field for better caching', async () => {
            let lastUpdated = await registry.lastUpdated({ from: unprivilegedAddress });
            // update the uri
            await registry.registerURI("uri1", { from: accounts[7] });
            assert.isTrue(lastUpdated < await registry.lastUpdated(), "Last updated did not change");
            lastUpdated = await registry.lastUpdated();

            // verify
            await registry.verifyOrganisation(unprivilegedAddress, { from: creatorAddress });
            assert.isTrue(lastUpdated < await registry.lastUpdated(), "Last updated did not change");
            lastUpdated = await registry.lastUpdated();

            // unverify
            await registry.unverifyOrganisation(unprivilegedAddress, { from: creatorAddress });
            assert.isTrue(lastUpdated < await registry.lastUpdated(), "Last updated did not change");
            
        });
    });
});
