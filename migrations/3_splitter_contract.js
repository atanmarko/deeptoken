const SplitterContract = artifacts.require("./SplitterContract.sol");

module.exports = function (deployer, network, account) {

    if (network === "ropsten") {

    } else if (network === "development") {
        const defaultAccount = account[1];
        const addrHolders = [account[2], account[3], account[4], account[5]];
        const basePoints = [100, 200, 300, 400];

        deployer.deploy(SplitterContract, defaultAccount, addrHolders, basePoints).then(function () {
            console.log("Using deployed SplitterContract: " + SplitterContract.address);
        });
    } else if (network === "coverage") {
        const defaultAccount = account[1];
        const addrHolders = [account[2], account[3], account[4], account[5]];
        const basePoints = [100, 200, 300, 400];

        deployer.deploy(SplitterContract, defaultAccount, addrHolders, basePoints).then(function () {
            console.log("Using deployed SplitterContract: " + SplitterContract.address);
        });
    } else if (network === "private") {

    }
};
