
/**
 * Test the Report framework
 * @author victaphu
 * 
 * execute with: 
 *  #> truffle test test/ReportTest.js
 * 
 * Test cases:
 * - Verify reporting time normalisation for weekly values
 * - Verify reporting security for approved / revoked reporters
 * - Verify accumulation logic for report at key and category levels
 * */
var Report = artifacts.require("contracts/reports/Report.sol");

contract('Report Framework', (accounts) => {
    var creatorAddress = accounts[0];
    var firstOwnerAddress = accounts[1];
    var secondOwnerAddress = accounts[2];
    var externalAddress = accounts[3];
    var unprivilegedAddress = accounts[4];
    let reporting;
    before(async () => {
        /* before tests */
        reporting = await Report.new();
    });

    context('testgroup - reporting timestamp (weekly slots)', () => {
        it('should return correct day of week for range of tests', async () => {
            // test the boundary conditions for the timestamp normalisation function
            // see https://github.com/pipermerriam/ethereum-datetime/blob/master/tests/datetime/test_weekday.py
            let tests = [[67737599, 3],
            [67737600, 4],
            [67823999, 4],
            [67824000, 5],
            [67910399, 5],
            [67910400, 6],
            [67996799, 6],
            [67996800, 0],
            [68083199, 0],
            [68083200, 1],
            [68169599, 1],
            [68169600, 2],
            [68255999, 2],
            [68256000, 3],
            [68342399, 3],
            [68342400, 4]];

            await Promise.all(tests.map(async (test) => {
                assert.equal((await reporting.getWeekday.call(test[0])).toNumber(), test[1], "Expected weekday value not met");
                return Promise.resolve();
            }));
        });

        it('should return expected normalised timestamp for the start of the day of week', async () => {
            // test boundary (sunday, saturday, monday)
            // test normal operations (wednesday, thursday, friday, tuesday)
            let tests = [
                [Date.parse('10 July 2021 23:59:59 GMT') / 1000, Date.parse('04 July 2021 00:00:00 GMT') / 1000],
                [Date.parse('11 July 2021 23:59:59 GMT') / 1000, Date.parse('11 July 2021 00:00:00 GMT') / 1000], // sunday
                [Date.parse('12 July 2021 16:00:00 GMT') / 1000, Date.parse('11 July 2021 00:00:00 GMT') / 1000], // monday
                [Date.parse('13 July 2021 16:00:00 GMT') / 1000, Date.parse('11 July 2021 00:00:00 GMT') / 1000], // tuesday
                [Date.parse('14 July 2021 16:00:00 GMT') / 1000, Date.parse('11 July 2021 00:00:00 GMT') / 1000], // wednesday
                [Date.parse('09 July 2021 00:00:00 GMT') / 1000, Date.parse('04 July 2021 00:00:00 GMT') / 1000], // friday
                [Date.parse('07 July 2021 16:00:00 GMT') / 1000, Date.parse('04 July 2021 00:00:00 GMT') / 1000], // thursday
            ];
            await Promise.all(tests.map(async (test) => {
                assert.equal((await reporting.getReportPeriodFor.call(test[0])).toNumber(), test[1], "Not matching timestamp to normalised timestamp");
                return Promise.resolve();
            }));
        });
    });

    context('testgroup - security validation for reporters (grant and revoke) - updateGlobalReport', () => {
        let args = [["updateGlobalReport(uint256)", [1000]], ["updateGlobalReport(bytes,uint256)", ["0x0", 1000]], ["updateGlobalReport(bytes,bytes,uint256)", ["0x0", "0x1", 1000]]];
        it('should revert if unauthorised user tries to publish a report', async () => {

            await Promise.all(args.map(async arg => {
                await reporting.methods[arg[0]](...arg[1], { from: externalAddress })
                    .then(result => {
                        assert.fail();
                    })
                    .catch(error => {
                        assert.equal(error.reason, "Cannot access reporting function");
                    });
                return Promise.resolve();
            }))

        });

        it('should allow owner and those granted access to publish a report', async () => {

            await Promise.all(args.map(async arg => {

                await reporting.methods[arg[0]](...arg[1]) // creator can publish
                    .then(result => {
                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.methods[arg[0]](...arg[1], { from: externalAddress })
                    .then(result => {
                        assert.fail();
                    })
                    .catch(error => {
                        assert.equal(error.reason, "Cannot access reporting function");
                    });

                await reporting.grantAccess(externalAddress)
                    .then(result => {

                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.methods[arg[0]](...arg[1], { from: externalAddress })
                    .then(result => {
                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.revokeAccess(externalAddress)
                    .then(result => {

                    })
                    .catch(error => {
                        assert.fail();
                    });

                return Promise.resolve();

            }))
        });

        it('should revert after reporter address is revoked', async () => {

            await Promise.all(args.map((async fn => {
                await reporting.methods[fn[0]](...fn[1], { from: externalAddress })
                    .then(result => {
                        console.log(result);
                        assert.fail();
                    })
                    .catch(error => {
                        assert.equal(error.reason, "Cannot access reporting function");
                    });

                await reporting.grantAccess(externalAddress)
                    .then(result => {

                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.methods[fn[0]](...fn[1], { from: externalAddress })
                    .then(result => {
                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.revokeAccess(externalAddress)
                    .then(result => {

                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.methods[fn[0]](...fn[1], { from: externalAddress })
                    .then(result => {
                        assert.fail();
                    })
                    .catch(error => {
                        assert.equal(error.reason, "Cannot access reporting function");
                    });

                return Promise.resolve();
            })));
        });
    });

    context('testgroup - security validation for reporters (grant and revoke) - updateLatestReport', () => {
        let args = [["updateLatestReport(uint256)", [1000]], ["updateLatestReport(bytes,uint256)", ["0x0", 1000]], ["updateLatestReport(bytes,bytes,uint256)", ["0x0", "0x1", 1000]]];


        it('should revert if unauthorised user tries to publish a report', async () => {
            await Promise.all(args.map(async (arg) => {
                await reporting.methods[arg[0]](...arg[1], { from: externalAddress })
                    .then(result => {
                        assert.fail();
                    })
                    .catch(error => {
                        assert.equal(error.reason, "Cannot access reporting function");
                    });
            }));

        });

        it('should allow owner and those granted access to publish a report', async () => {
            await Promise.all(args.map(async (arg) => {

                await reporting.methods[arg[0]](...arg[1]) // creator can publish
                    .then(result => {
                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.methods[arg[0]](...arg[1], { from: externalAddress })
                    .then(result => {
                        assert.fail();
                    })
                    .catch(error => {
                        assert.equal(error.reason, "Cannot access reporting function");
                    });

                await reporting.grantAccess(externalAddress)
                    .then(result => {

                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.methods[arg[0]](...arg[1], { from: externalAddress })
                    .then(result => {
                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.revokeAccess(externalAddress)
                    .then(result => {

                    })
                    .catch(error => {
                        assert.fail();
                    });

            }));
        });

        it('should revert after reporter address is revoked', async () => {
            await Promise.all(args.map(async (arg) => {

                await reporting.methods[arg[0]](...arg[1], { from: externalAddress })
                    .then(result => {
                        assert.fail();
                    })
                    .catch(error => {
                        assert.equal(error.reason, "Cannot access reporting function");
                    });

                await reporting.grantAccess(externalAddress)
                    .then(result => {

                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.methods[arg[0]](...arg[1], { from: externalAddress })
                    .then(result => {
                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.revokeAccess(externalAddress)
                    .then(result => {

                    })
                    .catch(error => {
                        assert.fail();
                    });

                await reporting.methods[arg[0]](...arg[1], { from: externalAddress })
                    .then(result => {
                        assert.fail();
                    })
                    .catch(error => {
                        assert.equal(error.reason, "Cannot access reporting function");
                    });
            }));
        });
    });

    context('testgroup - validation of reporting functionality - global test', () => {
        // get current values
        it('should accumulate correct values when we update the values', async () => {
            let sum = 0, count = 0; // global values
            await reporting.methods["getReportForPeriod(uint256)"].call(0)
                .then(result => {
                    sum = result.sum.toNumber();
                    count = result.count.toNumber();
                })
                .catch(error => assert.fail());

            // update global value by 1000 for a specific key and category (0x1, 0x11)
            await reporting.methods["updateGlobalReport(bytes,bytes,uint256)"]("0x11", "0x1111", 1000) // creator can publish
                .then(result => {
                })
                .catch(error => {
                    assert.fail();
                });

            // validate that result.keys now contains 0x11
            // validate that sum increased by 1000, and count increased by 1
            await reporting.methods["getReportForPeriod(uint256)"].call(0)
                .then(result => {
                    assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    assert.isTrue(result.keys.indexOf("0x11") > 0, "Report key and category is not updated correctly");
                    assert.equal(result.keys.length, 2, "Key length is not correct");
                })
                .catch(error => assert.fail());

            await reporting.methods["getReportForPeriod(uint256,bytes)"].call(0, "0x11")
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), 1000, "key sum is not correct");
                    assert.equal(result.count.toNumber(), 1, "key count is not correct");
                    assert.equal(result.keys.length, 1, "key length is not correct");
                    assert.isTrue(result.keys.indexOf("0x1111") >= 0, "key not found");

                })
                .catch(error => assert.fail());
        });

        it('should correctly accumulate for different keys', async () => {
            let sum = 0, count = 0; // global values
            let keys = [];
            await reporting.methods["getReportForPeriod(uint256)"].call(0)
                .then(result => {
                    sum = result.sum.toNumber();
                    count = result.count.toNumber();
                    keys = result.keys;
                })
                .catch(error => assert.fail());

            // update global value by 1000 for a specific key and category (0x22, 0x2222)
            await reporting.methods["updateGlobalReport(bytes,bytes,uint256)"]("0x22", "0x2222", 1000) // creator can publish
                .then(result => {
                })
                .catch(error => {
                    assert.fail();
                });

            // check the global values
            await reporting.methods["getReportForPeriod(uint256)"].call(0)
                .then(result => {
                    assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    assert.isTrue(result.keys.indexOf("0x11") > 0, "Report key and category is not updated correctly");
                    assert.equal(result.keys.length, 3, "Key length is not correct");
                })
                .catch(error => assert.fail());

            // check the global report for updated values
            await reporting.methods["getReportForPeriod(uint256)"].call(0)
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), sum + 1000, "key sum is not correct");
                    assert.equal(result.count.toNumber(), count + 1, "key count is not correct");
                    assert.equal(result.keys.length, keys.length + 1, "key length is not correct");
                    assert.isTrue(result.keys.indexOf("0x22") >= 0, "key not found");

                })
                .catch(error => assert.fail());

            // check the global report with key
            await reporting.methods["getReportForPeriod(uint256,bytes)"].call(0, "0x22")
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), 1000, "key sum is not correct");
                    assert.equal(result.count.toNumber(), 1, "key count is not correct");
                    assert.equal(result.keys.length, 1, "key length is not correct");
                    assert.isTrue(result.keys.indexOf("0x2222") >= 0, "key not found");

                })
                .catch(error => assert.fail());

            // check the global report with key and values
            await reporting.methods["getReportForPeriod(uint256,bytes,bytes)"].call(0, "0x22", "0x2222")
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), 1000, "key sum is not correct");
                    assert.equal(result.count.toNumber(), 1, "key count is not correct");
                })
                .catch(error => assert.fail());
        });

        it('should correctly accumulate for same keys and same categories', async () => {
            let sum = 0, count = 0; // global values
            await reporting.methods["getReportForPeriod(uint256)"].call(0)
                .then(result => {
                    sum = result.sum.toNumber();
                    count = result.count.toNumber();
                })
                .catch(error => assert.fail());

            // update global value by 1000 for a specific key and category (0x22, 0x2222)
            await reporting.methods["updateGlobalReport(bytes,bytes,uint256)"]("0x22", "0x2222", 1000) // creator can publish
                .then(result => {
                })
                .catch(error => {
                    assert.fail();
                });

            // check the global values
            await reporting.methods["getReportForPeriod(uint256)"].call(0)
                .then(result => {
                    assert.equal(result.sum.toNumber(), sum + 1000, "Report sum did not change as expected");
                    assert.equal(result.count.toNumber(), count + 1, "Report count did not change as expected");
                    assert.isTrue(result.keys.indexOf("0x22") > 0, "Report key and category is not updated correctly");
                    assert.equal(result.keys.length, 3, "Key length is not correct");
                })
                .catch(error => console.log(error) && assert.fail());

            // check the global report with key
            await reporting.methods["getReportForPeriod(uint256,bytes)"].call(0, "0x22")
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), 2000, "key sum is not correct");
                    assert.equal(result.count.toNumber(), 2, "key count is not correct");
                    assert.equal(result.keys.length, 1, "key length is not correct");
                    assert.isTrue(result.keys.indexOf("0x2222") >= 0, "key not found");

                })
                .catch(error => assert.fail());

            // check the global report with key and values
            await reporting.methods["getReportForPeriod(uint256,bytes,bytes)"].call(0, "0x22", "0x2222")
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), 2000, "key sum is not correct");
                    assert.equal(result.count.toNumber(), 2, "key count is not correct");
                })
                .catch(error => assert.fail());
        });

        it('should correctly accumulate for same keys and different categories', async () => {
            let sum = 0, count = 0; // global values
            await reporting.methods["getReportForPeriod(uint256)"].call(0)
                .then(result => {
                    sum = result.sum.toNumber();
                    count = result.count.toNumber();
                })
                .catch(error => assert.fail());

            // update global value by 1000 for a specific key and category (0x22, 0x2222)
            await reporting.methods["updateGlobalReport(bytes,bytes,uint256)"]("0x22", "0x3333", 1000) // creator can publish
                .then(result => {
                })
                .catch(error => {
                    assert.fail();
                });

            // check the global values
            await reporting.methods["getReportForPeriod(uint256)"].call(0)
                .then(result => {
                    assert.equal(result.sum.toNumber(), sum + 1000, "Report sum did not change as expected");
                    assert.equal(result.count.toNumber(), count + 1, "Report count did not change as expected");
                    assert.isTrue(result.keys.indexOf("0x22") > 0, "Report key and category is not updated correctly");
                    assert.equal(result.keys.length, 3, "Key length is not correct");
                })
                .catch(error => console.log(error) && assert.fail());

            // check the global report with key
            await reporting.methods["getReportForPeriod(uint256,bytes)"].call(0, "0x22")
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), 3000, "key sum is not correct");
                    assert.equal(result.count.toNumber(), 3, "key count is not correct");
                    assert.equal(result.keys.length, 2, "key length is not correct");
                    assert.isTrue(result.keys.indexOf("0x3333") >= 0, "key not found");

                })
                .catch(error => assert.fail());

            // check the global report with key and values
            await reporting.methods["getReportForPeriod(uint256,bytes,bytes)"].call(0, "0x22", "0x2222")
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), 2000, "key sum is not correct");
                    assert.equal(result.count.toNumber(), 2, "key count is not correct");
                })
                .catch(error => assert.fail());

            // check the global report with key and values
            await reporting.methods["getReportForPeriod(uint256,bytes,bytes)"].call(0, "0x22", "0x3333")
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), 1000, "key sum is not correct");
                    assert.equal(result.count.toNumber(), 1, "key count is not correct");
                })
                .catch(error => assert.fail());

            // non existent category
            await reporting.methods["getReportForPeriod(uint256,bytes,bytes)"].call(0, "0x22", "0x1111")
                .then(result => {
                    // assert.equal(sum + 1000, result.sum.toNumber(), "Report sum did not change as expected");
                    // assert.equal(count + 1, result.count.toNumber(), "Report count did not change as expected");
                    // assert.isTrue(result.keys.indexOf("0x11")> 0, "Report key and category is not updated correctly");
                    assert.equal(result.sum.toNumber(), 0, "key sum is not correct");
                    assert.equal(result.count.toNumber(), 0, "key count is not correct");
                })
                .catch(error => assert.fail());
        });
    });
});
