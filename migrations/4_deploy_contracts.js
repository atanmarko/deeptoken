const DeepToken = artifacts.require("./DeepToken.sol");
const SplitterContract = artifacts.require("./SplitterContract.sol");

module.exports = function (deployer, network, account) {

    if (network === "live") {
        const stateControl = "0x10CA9409265c2938167856725945db35da3Ca149";
        const whitelist = "0xD076556513165EE138cFB054A84f7B48154c4667";
        const withdraw = "0x52245Ee29f243ff3A55B720C32DEe77EB1DCe334";
        const initialHolder = "0x38b50101cCE32A15e906A32bFda0939D01a1776f";
        //const usdCurrencyFuncing = "add actual account here";

        console.log("params: ");
        console.log(network);
        console.log(account);
        console.log("whitelist account: ", whitelist);
        const deepTokenAddress = deployer.deploy(DeepToken,
                stateControl,
                whitelist,
                withdraw,
                initialHolder,
                usdCurrencyFunding).then(function () {
            console.log("Using deployed DeepToken: " + DeepToken.address);
        });
    } else if (network === "ropsten") {
        // preparation for ropsten deployment
        //
        console.log("Deploying on ropsten network!!!");
        const doNotUse = account[0];
        const stateControl = account[1]; //0xc50fc1192bf2e1b8092ab6da529838db9e9be8bb
        const whitelist = account[2]; //0x15087b9d85a866bc96fe4ff0bae5cb71993ff7a5
        const withdraw = account[3]; //0x90c56f564f376a76aa1ef456b89905cb1f4cffc3
        const initialHolder = account[4]; //0x12d86ce44e20521f202888bd8ea0958a3014d2d0
        const usdCurrencyFunding = account[8]; //0xb0b95017bb7813d08404f71bd8a027cfdd255bf0
        const user1 = account[5];
        const user2 = account[6];
        const user3 = account[7];
        console.log("params: ");
        console.log(network);
        console.log(account);
        console.log("stateControl account: ", stateControl);
        console.log("whitelist account: ", whitelist);
        console.log("withdraw account: ", withdraw);
        console.log("initialHolder account: ", initialHolder);
        console.log("usd currency funding account: ", usdCurrencyFunding);
        const deepTokenAddress = deployer.deploy(DeepToken,
                stateControl,
                whitelist,
                withdraw,
                initialHolder,
                usdCurrencyFunding).then(function () {
            console.log("Using deployed DeepToken: " + DeepToken.address);
        });
    } else if (network === "development") {
        // testrpc
        const doNotUse = account[0];
        const stateControl = account[1];
        const whitelist = account[2];
        //const withdraw = account[3];
        const withdraw = "0x8aed771183c73ef8509bc7e08e0b8064403dcf3d"; // Splitter contract address
        const initialHolder = account[4];
        const usdCurrencyFunding = account[8];
        const user1 = account[5];
        const user2 = account[6];
        const user3 = account[7];
        const deepTokenAddress = deployer.deploy(DeepToken,
                stateControl,
                whitelist,
                withdraw,
                initialHolder,
                usdCurrencyFunding,
                {gas: 4000000}).then(function () {
            console.log("Using deployed DeepToken: " + DeepToken.address);
        });
    } else if (network === "coverage") {
        // testrpc
        const doNotUse = account[0];
        const stateControl = account[1];
        const whitelist = account[2];
        const withdraw = "0x8aed771183c73ef8509bc7e08e0b8064403dcf3d"; // Splitter contract address
        const initialHolder = account[4];
        const usdCurrencyFunding = account[8];
        const user1 = account[5];
        const user2 = account[6];
        const user3 = account[7];
        const deepTokenAddress = deployer.deploy(DeepToken,
                stateControl,
                whitelist,
                withdraw,
                initialHolder,
                usdCurrencyFunding).then(function () {
            console.log("Using deployed DeepToken: " + DeepToken.address);
        });
    } else if (network === "private") {
        console.log('>> Unlocking account ' + account[0]);
        web3.personal.unlockAccount(account[0], "ethereum");
        console.log('>> Unlocking account ' + account[1]);
        web3.personal.unlockAccount(account[1], "ethereum");
        console.log('>> Unlocking account ' + account[2]);
        web3.personal.unlockAccount(account[2], "ethereum");
        console.log('>> Unlocking account ' + account[3]);
        web3.personal.unlockAccount(account[3], "ethereum");
        console.log('>> Unlocking account ' + account[4]);
        web3.personal.unlockAccount(account[4], "ethereum");
        console.log('>> Unlocking account ' + account[5]);
        web3.personal.unlockAccount(account[5], "ethereum");
        console.log('>> Unlocking account ' + account[6]);
        web3.personal.unlockAccount(account[6], "ethereum");
        console.log('>> Unlocking account ' + account[7]);
        web3.personal.unlockAccount(account[7], "ethereum");
        console.log('>> Unlocking account ' + account[8]);
        web3.personal.unlockAccount(account[8], "ethereum");
        console.log('>> Unlocking account ' + account[9]);
        web3.personal.unlockAccount(account[9], "ethereum");

        const doNotUse = account[0];
        const stateControl = account[1];
        const whitelist = account[2];
        const withdraw = account[3];
        const initialHolder = account[4];
        const usdCurrencyFunding = account[8];
        const user1 = account[5];
        const user2 = account[6];
        const user3 = account[7];

        console.log('>> DeepToken contract deployment');
        const deepTokenAddress = deployer.deploy(DeepToken,
                stateControl,
                whitelist,
                withdraw,
                initialHolder,
                usdCurrencyFunding,
                {gas: 4000000}).then(function () {
            console.log("Using deployed DeepToken: " + DeepToken.address);
        });
    }
};
