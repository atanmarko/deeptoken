const SelfDestructContract = artifacts.require("./SelfDestructContract.sol");

module.exports = function (deployer, network, account) {

    if (network === "ropsten") {

    } else if (network === "development") {

        deployer.deploy(SelfDestructContract).then(function () {
            console.log("Using deployed SelfDestructContract: " + SelfDestructContract.address);
        });
    } else if (network === "coverage") {

        deployer.deploy(SelfDestructContract).then(function () {
            console.log("Using deployed SelfDestructContract: " + SelfDestructContract.address);
        });
    } else if (network === "private") {

        deployer.deploy(SelfDestructContract, {gas: 1000000}).then(function () {
            console.log("Using deployed SelfDestructContract: " + SelfDestructContract.address);
        });
    }

};
