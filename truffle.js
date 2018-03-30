require('babel-register');
require('babel-polyfill');

var provider;

var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = '[REDACTED]';

if (!process.env.SOLIDITY_COVERAGE) {
    provider = new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/')
}


module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            // port: 30303,
	    gas: 4000000,
            network_id: "*" // Match any network id
        },
        ropsten: {
            host: "localhost",
            port: 8545,
            network_id: "3",
            gas: 4500000
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        private: {
            host: "localhost",
            network_id: "1024",
            port: 8545,
            gas: 4000000,
            gasPrice: 0x1
        }
    }
};

