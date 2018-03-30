Deep Token Contract
=================
This repository contains the implementation of the smart contract used for the Deep Token sale.

For more information please check https://deeptoken.io


Building and testing
=====================

    sudo npm install -g truffle@3.4.11
    sudo npm install -g ethereumjs-testrpc@4.1.3
    npm install .
    truffle install zeppelin

start testrpc with
 
    ./scripts/start_testrpc.sh

run tests with

    truffle test
    
Coverage tests
=====================
Install solidity-coverage tool

    npm install --save-dev solidity-coverage

Run tests with 

    ./scripts/coverage.sh
    
Report will be generated in _coverage/index.html_ file


Authors
=======

(C) 2017-2018 Jita Ltd

[Jerome Rousselot](https://github.com/jeromerousselot)

[Marko Atanasievski](https://github.com/atanmarko)

[Srdjan Obucina](https://github.com/obucinac)

