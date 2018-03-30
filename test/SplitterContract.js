import EVMThrow from './helpers/EVMThrow';

const BigNumber = web3.BigNumber;

require('chai')
        .use(require('chai-as-promised'))
        .use(require('chai-bignumber')(BigNumber))
        .should();

const SplitterContract = artifacts.require("./SplitterContract.sol");
const SelfDestructContract = artifacts.require("./SelfDestructContract.sol");



contract('SplitterContract funded', function (accounts) {

    it("should have an address", async function () {
        let splitterContract = await SplitterContract.deployed();
        splitterContract.should.exist;
    });

    it("should accept funds from anyone", async function () {
        let splitterContract = await SplitterContract.deployed();
        const preBalance = (await web3.eth.getBalance(splitterContract.address));
        preBalance.should.be.bignumber.equal(0);
        const weisSentToContract = 1000000000;
        const sendTransaction = splitterContract.sendTransaction({value: weisSentToContract});
        const chaiForwardTX = await sendTransaction.should.not.be.rejected;
        const newBalance = (await web3.eth.getBalance(splitterContract.address));
        preBalance.plus(weisSentToContract).should.be.bignumber.equal(newBalance);
    });

    it("should split funds properly", async function () {
        let splitterContract = await SplitterContract.deployed();

        const preAddrDefault = (await web3.eth.getBalance(accounts[1]));
        const preAddrShareHolder1 = (await web3.eth.getBalance(accounts[2]));
        const preAddrShareHolder2 = (await web3.eth.getBalance(accounts[3]));
        const preAddrShareHolder3 = (await web3.eth.getBalance(accounts[4]));
        const preAddrShareHolder4 = (await web3.eth.getBalance(accounts[5]));

        await splitterContract.triggerPayout();

        const postAddrDefault = (await web3.eth.getBalance(accounts[1]));
        const postAddrShareHolder1 = (await web3.eth.getBalance(accounts[2]));
        const postAddrShareHolder2 = (await web3.eth.getBalance(accounts[3]));
        const postAddrShareHolder3 = (await web3.eth.getBalance(accounts[4]));
        const postAddrShareHolder4 = (await web3.eth.getBalance(accounts[5]));

        preAddrShareHolder1.plus(10000000).should.be.bignumber.equal(postAddrShareHolder1);
        preAddrShareHolder2.plus(20000000).should.be.bignumber.equal(postAddrShareHolder2);
        preAddrShareHolder3.plus(30000000).should.be.bignumber.equal(postAddrShareHolder3);
        preAddrShareHolder4.plus(40000000).should.be.bignumber.equal(postAddrShareHolder4);
        preAddrDefault.plus(900000000).should.be.bignumber.equal(postAddrDefault);
    });

});



contract('SplitterContract funded', function (accounts) {

    it("should have an address", async function () {
        let splitterContract = await SplitterContract.deployed();
        splitterContract.should.exist;
    });

    it("should accept lots of small funds from anyone", async function () {
        let splitterContract = await SplitterContract.deployed();
        const preBalance = (await web3.eth.getBalance(splitterContract.address));
        preBalance.should.be.bignumber.equal(0);
        const weisSentToContract = 1000000;
        let currentBalance = new BigNumber(0);
        for (let i = 0; i < 100; i++) {
            let Idx = Math.floor(Math.random() * 10);
            await splitterContract.sendTransaction({from: accounts[Idx], value: weisSentToContract}).should.not.be.rejected;
            const postBalance = (await web3.eth.getBalance(splitterContract.address));
            currentBalance = currentBalance.plus(weisSentToContract);
            currentBalance.should.be.bignumber.equal(postBalance);
        }
    });

    it("should split funds properly", async function () {
        let splitterContract = await SplitterContract.deployed();

        const preAddrDefault = (await web3.eth.getBalance(accounts[1]));
        const preAddrShareHolder1 = (await web3.eth.getBalance(accounts[2]));
        const preAddrShareHolder2 = (await web3.eth.getBalance(accounts[3]));
        const preAddrShareHolder3 = (await web3.eth.getBalance(accounts[4]));
        const preAddrShareHolder4 = (await web3.eth.getBalance(accounts[5]));

        await splitterContract.triggerPayout();

        const postAddrDefault = (await web3.eth.getBalance(accounts[1]));
        const postAddrShareHolder1 = (await web3.eth.getBalance(accounts[2]));
        const postAddrShareHolder2 = (await web3.eth.getBalance(accounts[3]));
        const postAddrShareHolder3 = (await web3.eth.getBalance(accounts[4]));
        const postAddrShareHolder4 = (await web3.eth.getBalance(accounts[5]));

        preAddrDefault.plus(90000000).should.be.bignumber.equal(postAddrDefault);
        preAddrShareHolder1.plus(1000000).should.be.bignumber.equal(postAddrShareHolder1);
        preAddrShareHolder2.plus(2000000).should.be.bignumber.equal(postAddrShareHolder2);
        preAddrShareHolder3.plus(3000000).should.be.bignumber.equal(postAddrShareHolder3);
        preAddrShareHolder4.plus(4000000).should.be.bignumber.equal(postAddrShareHolder4);
    });

});
