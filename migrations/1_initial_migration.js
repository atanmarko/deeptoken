var Migrations = artifacts.require("./Migrations.sol");

module.exports = function (deployer) {

    //console.log('>> Unlocking account ' + web3.personal.listAccounts[0]);
    //web3.personal.unlockAccount(web3.personal.listAccounts[0], "ethereum");

    console.log('>> Migrations contract deployment');
    deployer.deploy(Migrations);
};
