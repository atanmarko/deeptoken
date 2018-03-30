import ether from './helpers/ether'
        import advanceToBlock from './helpers/advanceToBlock'
        import EVMThrow from './helpers/EVMThrow'

        const BigNumber = web3.BigNumber;

require('chai')
        .use(require('chai-as-promised'))
        .use(require('chai-bignumber')(BigNumber))
        .should();

const DeepToken = artifacts.require("./DeepToken.sol");
const SelfDestructContract = artifacts.require("./SelfDestructContract.sol");
const SplitterContract = artifacts.require("./SplitterContract.sol");



const addrSplitterContract = "0x8aed771183c73ef8509bc7e08e0b8064403dcf3d";



const newTotalSupply = 1000000000 * 1e18;
const newTokenPriceInWei = 10 * 1e15;
const newPercentForSale = 50;
const newSilencePeriod = 10;

const States = {
    Initial: 0, // deployment time
    ValuationSet: 1, // whitelist addresses, accept funds, update balances
    Ico: 2, // whitelist addresses, accept funds, update balances
    Operational: 3, // manage contests
    Paused: 4 // for contract upgrades
};



contract('DeepToken funded', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 50;

    it("should have an address", async function () {
        let deepToken = await DeepToken.deployed();
        deepToken.should.exist;
    });

    it("should have an owner from our known accounts", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.stateControl()).should.be.bignumber.equal(expectedStateControl);
        (await deepToken.whitelistControl()).should.be.bignumber.equal(expectedWhitelist);
        (await deepToken.withdrawControl()).should.be.bignumber.equal(expectedWithdraw);
        (await deepToken.initialHolder()).should.be.bignumber.equal(expectedInitialHolder);
        (await deepToken.usdCurrencyFunding()).should.be.bignumber.equal(expectedUsdCurrencyFunding);
    });

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should reject setting ICO params without stateControlKey", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
        (await deepToken.totalSupply()).should.be.bignumber.equal(0);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(0);
        (await deepToken.percentForSale()).should.be.bignumber.equal(0);
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: user1}).should.be.rejected;
        (await deepToken.totalSupply()).should.be.bignumber.equal(0);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(0);
        (await deepToken.percentForSale()).should.be.bignumber.equal(0);
        (await deepToken.endBlock()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should not let ICO start without correct key or without setting min and max.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.startICO().should.be.rejectedWith(EVMThrow);
        await deepToken.startICO({from: expectedStateControl}).should.be.rejectedWith(EVMThrow);
    });

    it("should reject total supply == 0", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.totalSupply()).should.be.bignumber.equal(0);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(0);
        (await deepToken.percentForSale()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
        await deepToken.updateEthICOThresholds(0, newPercentForSale, newTokenPriceInWei, 0, endBlock, {from: expectedStateControl}).should.be.rejectedWith(EVMThrow);
        (await deepToken.totalSupply()).should.be.bignumber.equal(0);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(0);
        (await deepToken.percentForSale()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should reject token price in wei == 0.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.totalSupply()).should.be.bignumber.equal(0);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(0);
        (await deepToken.percentForSale()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
        await deepToken.updateEthICOThresholds(newTotalSupply, 0, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.be.rejectedWith(EVMThrow);
        (await deepToken.totalSupply()).should.be.bignumber.equal(0);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(0);
        (await deepToken.percentForSale()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should reject token percentage for sale 0 or greater than 100", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.totalSupply()).should.be.bignumber.equal(0);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(0);
        (await deepToken.percentForSale()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, 0, 0, endBlock, {from: expectedStateControl}).should.be.rejectedWith(EVMThrow);
        (await deepToken.totalSupply()).should.be.bignumber.equal(0);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(0);
        (await deepToken.percentForSale()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, 101, 0, endBlock, {from: expectedStateControl}).should.be.rejectedWith(EVMThrow);
        (await deepToken.totalSupply()).should.be.bignumber.equal(0);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(0);
        (await deepToken.percentForSale()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should reject setting end block lower than current block.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, 1, {from: expectedStateControl}).should.be.rejectedWith(EVMThrow);
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should accept correct ICO parameters with correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, newSilencePeriod, endBlock, {from: expectedStateControl}).should.not.be.rejected;
        (await deepToken.totalSupply()).should.be.bignumber.equal(newTotalSupply);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(newTokenPriceInWei);
        (await deepToken.percentForSale()).should.be.bignumber.equal(newPercentForSale);
        (await deepToken.endBlock()).should.be.bignumber.equal(endBlock);
        (await deepToken.silencePeriod()).should.be.bignumber.equal(newSilencePeriod);
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
    });

    it("should start ICO. ", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.startICO({from: expectedStateControl});
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
    });

    it("should reject contract configuration if not in initial or valuation state.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, newSilencePeriod, endBlock, {from: expectedStateControl}).should.be.rejectedWith(EVMThrow);
    });

    it("should not whitelist by default address user1.", async function () {
        let deepToken = await DeepToken.deployed();
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(false);
    });

    it("should fail to whitelist address user1 without correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.addToWhitelist(user1).should.be.rejectedWith(EVMThrow);
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(false);
    });

    it("should fail to accept funds from non whitelisted address user1.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.sendTransaction({from: user1, value: newTokenPriceInWei}).should.be.rejectedWith(EVMThrow);
    });

    it("should fail to accept fiat funds from non whitelist account.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.recordPayment(100, 100, 1, {from: user1}).should.be.rejectedWith(EVMThrow);
        await deepToken.recordPayment(100, 100, 1, {from: user2}).should.be.rejectedWith(EVMThrow);
        await deepToken.recordPayment(100, 100, 1, {from: user3}).should.be.rejectedWith(EVMThrow);
    });

    it("should whitelist address user1 with correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.addToWhitelist(user1, {from: expectedWhitelist}).should.not.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);
    });

    it("should fail to accept funds during silence period.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.sendTransaction({from: user1, value: newTokenPriceInWei}).should.be.rejectedWith(EVMThrow);
        await deepToken.recordPayment(100, 100, 1, {from: expectedWhitelist}).should.be.rejectedWith(EVMThrow);
        await advanceToBlock(30);
    });

    it("should accept funds from whitelisted address user1.", async function () {
        let deepToken = await DeepToken.deployed();
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        const preBalance = (await deepToken.etherBalance());
        preBalance.should.be.bignumber.equal(0);
        isUser1Whitelisted.should.equal(true);
        const etherSentToContract = (await deepToken.tokenPriceInWei());
        const sendTransaction = deepToken.sendTransaction({from: user1, value: etherSentToContract});
        const chaiForwardTX = await sendTransaction.should.not.be.rejected;
        const newBalance = (await deepToken.etherBalance());
        preBalance.plus(etherSentToContract).should.be.bignumber.equal(newBalance);
        const firstEvent = chaiForwardTX.logs[0];
        firstEvent.event.should.be.equal('Credited');
        firstEvent.args.addr.should.be.equal(user1);
        const expectedDeepTokenAmount = 1 * 1e18;
        firstEvent.args.balance.should.be.bignumber.equal(expectedDeepTokenAmount);
        firstEvent.args.txAmount.should.be.bignumber.equal(etherSentToContract);
    });

    it("should reject funds from expectedWhitelist.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.sendTransaction({from: expectedWhitelist, value: newTokenPriceInWei}).should.be.rejectedWith(EVMThrow);
    });

    it("should accept USD payment from expectedWhitelist.", async function () {
        let deepToken = await DeepToken.deployed();

        const preUsdCentsBalance = (await deepToken.usdCentsBalance());
        preUsdCentsBalance.should.be.bignumber.equal(0);
        const preFiatTokenBalance = (await deepToken.balanceOf(expectedUsdCurrencyFunding));
        preFiatTokenBalance.should.be.bignumber.equal(0);

        const fiatUsdCentsSentToContract = 100;
        const fiatTokensSentToContract = 10000;

        const chaiForwardTX = await deepToken.recordPayment(fiatUsdCentsSentToContract, fiatTokensSentToContract, 1, {from: expectedWhitelist}).should.not.be.rejected;

        const newUsdCentsBalance = (await deepToken.usdCentsBalance());
        newUsdCentsBalance.should.be.bignumber.equal(fiatUsdCentsSentToContract);
        const newFiatTokenBalance = (await deepToken.balanceOf(expectedUsdCurrencyFunding));
        newFiatTokenBalance.should.be.bignumber.equal(fiatTokensSentToContract);

        const firstEvent = chaiForwardTX.logs[0];
        firstEvent.event.should.be.equal('USDCentsBalance');
        firstEvent.args.balance.should.be.bignumber.equal(newUsdCentsBalance);

        const secondEvent = chaiForwardTX.logs[1];
        secondEvent.event.should.be.equal('TokenByFiatCredited');
        secondEvent.args.addr.should.be.equal(expectedUsdCurrencyFunding);
        secondEvent.args.balance.should.be.bignumber.equal(newFiatTokenBalance);
        secondEvent.args.txAmount.should.be.bignumber.equal(fiatTokensSentToContract);
    });

    it("should fail to accept funds above the limit from whitelisted address user1.", async function () {
        let deepToken = await DeepToken.deployed();
        let tokensAvailableForSale = (await deepToken.getTokensAvailableForSale());
        tokensAvailableForSale = tokensAvailableForSale / 1e18 + 1;
        const etherSentToContract = new BigNumber(tokensAvailableForSale * newTokenPriceInWei);
        await deepToken.sendTransaction({
            from: user1,
            value: etherSentToContract
        }).should.be.rejectedWith(EVMThrow);
    });

    it("should fail to accept any currency funds if not enough tokens available.", async function () {
        let deepToken = await DeepToken.deployed();
        let tokensAvailableForSale = (await deepToken.getTokensAvailableForSale());
        tokensAvailableForSale = tokensAvailableForSale / 1e18 + 1;
        const etherSentToContract = tokensAvailableForSale * newTokenPriceInWei;
        await deepToken.sendTransaction({
            from: user1,
            value: etherSentToContract
        }).should.be.rejectedWith(EVMThrow);
    });

    it("should fail to stop ICO by anyone before ICO timeout.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
        await deepToken.anyoneEndICO().should.be.rejected;
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
    });

    it("should reject funds from whitelisted address user1 after ICO timeout.", async function () {
        let deepToken = await DeepToken.deployed();
        await advanceToBlock(endBlock + 1);
        await deepToken.sendTransaction({from: user1, value: newTokenPriceInWei}).should.be.rejectedWith(EVMThrow);
    });

    it("should reject USD funds from expectedWhitelist after ICO timeout.", async function () {
        let deepToken = await DeepToken.deployed();
        // Moved past the end in previous test
        await deepToken.recordPayment(100, 100, 1, {from: expectedWhitelist}).should.be.rejected;
    });

    it("should accept stopping ICO by anyone after ICO timeout.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
        await deepToken.anyoneEndICO().should.not.be.rejected;
        (await deepToken.state()).should.be.bignumber.equal(States.Operational);
    });

    it("burning coins should recalulate token total supply, so that sold coins make percentForSale % of it.", async function () {
        let deepToken = await DeepToken.deployed();
        const postTotalSupply = await deepToken.totalSupply();
        const postTotalUnsold = await deepToken.balanceOf(expectedInitialHolder);
        let SoldPercentageRatio = 100 - postTotalUnsold.dividedBy(postTotalSupply).times(100).plus(0.5).floor();
        SoldPercentageRatio.should.be.bignumber.equal(await deepToken.percentForSale());
    });

    it("should fail to dewhitelist address user1 without correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.removeFromWhitelist(user1).should.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);
    });

    it("should dewhitelist address user1 with correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.removeFromWhitelist(user1, {from: expectedWhitelist}).should.not.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(false);
    });

});

contract('DeepToken invalid contract configurations', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 20;

    it("should have an address", async function () {
        let deepToken = await DeepToken.deployed();
        deepToken.should.exist;
    });

    it("should have an owner from our known accounts", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.stateControl()).should.be.bignumber.equal(expectedStateControl);
        (await deepToken.whitelistControl()).should.be.bignumber.equal(expectedWhitelist);
        (await deepToken.withdrawControl()).should.be.bignumber.equal(expectedWithdraw);
        (await deepToken.initialHolder()).should.be.bignumber.equal(expectedInitialHolder);
        (await deepToken.usdCurrencyFunding()).should.be.bignumber.equal(expectedUsdCurrencyFunding);
    });

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should reject contract configuration if total supply percent for sale is 0.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(10, 1, 9, 0, endBlock, {from: expectedStateControl}).should.be.rejected;
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should reject contract configuration with end block before current block.", async function () {
        let deepToken = await DeepToken.deployed();
        let endBlockNumber = web3.eth.blockNumber;
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, newSilencePeriod, endBlockNumber, {from: expectedStateControl}).should.be.rejected;
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should reject contract configuration with current block + silence period behind end block.", async function () {
        let deepToken = await DeepToken.deployed();
        let endBlockNumber = web3.eth.blockNumber + newSilencePeriod;
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, newSilencePeriod, endBlockNumber, {from: expectedStateControl}).should.be.rejected;
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

});



contract('DeepToken invalid ICO start', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 25;

    it("should have an address", async function () {
        let deepToken = await DeepToken.deployed();
        deepToken.should.exist;
    });

    it("should have an owner from our known accounts", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.stateControl()).should.be.bignumber.equal(expectedStateControl);
        (await deepToken.whitelistControl()).should.be.bignumber.equal(expectedWhitelist);
        (await deepToken.withdrawControl()).should.be.bignumber.equal(expectedWithdraw);
        (await deepToken.initialHolder()).should.be.bignumber.equal(expectedInitialHolder);
        (await deepToken.usdCurrencyFunding()).should.be.bignumber.equal(expectedUsdCurrencyFunding);
    });

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should accept correct ICO parameters with correct key", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, newSilencePeriod, endBlock, {from: expectedStateControl}).should.not.be.rejected;
        (await deepToken.totalSupply()).should.be.bignumber.equal(newTotalSupply);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(newTokenPriceInWei);
        (await deepToken.percentForSale()).should.be.bignumber.equal(newPercentForSale);
        (await deepToken.endBlock()).should.be.bignumber.equal(endBlock);
        (await deepToken.silencePeriod()).should.be.bignumber.equal(newSilencePeriod);
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
    });

    it("should reject starting ICO if current block + silence period is behind end block.", async function () {
        let deepToken = await DeepToken.deployed();
        await advanceToBlock(endBlock - newSilencePeriod);
        await deepToken.startICO({from: expectedStateControl}).should.be.rejectedWith(EVMThrow);
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
    });

    it("should reject contract configuration with end block before current block.", async function () {
        let deepToken = await DeepToken.deployed();
        await advanceToBlock(endBlock);
        await deepToken.startICO({from: expectedStateControl}).should.be.rejectedWith(EVMThrow);
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
    });

});



contract('DeepToken funded and stopped by admin and operational.', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 20;

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should have an owner from our known accounts", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.stateControl()).should.be.bignumber.equal(expectedStateControl);
        (await deepToken.whitelistControl()).should.be.bignumber.equal(expectedWhitelist);
        (await deepToken.withdrawControl()).should.be.bignumber.equal(expectedWithdraw);
        (await deepToken.initialHolder()).should.be.bignumber.equal(expectedInitialHolder);
        (await deepToken.usdCurrencyFunding()).should.be.bignumber.equal(expectedUsdCurrencyFunding);
    });

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should accept correct ICO parameters with correct key", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.not.be.rejected;
        (await deepToken.totalSupply()).should.be.bignumber.equal(newTotalSupply);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(newTokenPriceInWei);
        (await deepToken.percentForSale()).should.be.bignumber.equal(newPercentForSale);
        (await deepToken.endBlock()).should.be.bignumber.equal(endBlock);
        (await deepToken.silencePeriod()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
    });

    it("should start ICO. ", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.startICO({from: expectedStateControl});
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
    });

    it("should whitelist address user1 with correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.addToWhitelist(user1, {from: expectedWhitelist}).should.not.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);
    });

    it("should accept funds from whitelisted address user1.", async function () {
        let deepToken = await DeepToken.deployed();
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);
        await deepToken.sendTransaction({from: user1, value: newTokenPriceInWei}).should.not.be.rejected;
    });

    it("should accept stopping ICO by admin before ICO timeout.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
        await deepToken.endICO({from: expectedStateControl}).should.not.be.rejected;
        (await deepToken.state()).should.not.be.bignumber.equal(States.Ico);
        (await deepToken.state()).should.be.bignumber.equal(States.Operational);
    });

});



contract('DeepToken accepts large numbers of ICO invests small and large but respects cap. Funded and stopped by admin and operational.', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 300;

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should have an owner from our known accounts", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.stateControl()).should.be.bignumber.equal(expectedStateControl);
        (await deepToken.whitelistControl()).should.be.bignumber.equal(expectedWhitelist);
        (await deepToken.withdrawControl()).should.be.bignumber.equal(expectedWithdraw);
        (await deepToken.initialHolder()).should.be.bignumber.equal(expectedInitialHolder);
        (await deepToken.usdCurrencyFunding()).should.be.bignumber.equal(expectedUsdCurrencyFunding);
    });

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should accept correct ICO parameters with correct key", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.not.be.rejected;
        (await deepToken.totalSupply()).should.be.bignumber.equal(newTotalSupply);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(newTokenPriceInWei);
        (await deepToken.percentForSale()).should.be.bignumber.equal(newPercentForSale);
        (await deepToken.endBlock()).should.be.bignumber.equal(endBlock);
        (await deepToken.silencePeriod()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
    });

    it("should start ICO. ", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.startICO({from: expectedStateControl});
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
    });

    it("should whitelist address user1 with correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.addToWhitelist(user1, {from: expectedWhitelist}).should.not.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);
    });

    it("should accept lots of small funds from whitelisted address user1.", async function () {
        let deepToken = await DeepToken.deployed();
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        const preBalance = (await deepToken.etherBalance());
        preBalance.should.be.bignumber.equal(0);
        let currentBalance = new BigNumber(0);
        isUser1Whitelisted.should.equal(true);
        for (let i = 0; i < 100; i++) {
            await deepToken.sendTransaction({from: user1, value: newTokenPriceInWei}).should.not.be.rejected;
            const postBalance = (await deepToken.etherBalance());
            currentBalance = currentBalance.plus(newTokenPriceInWei);
            currentBalance.should.be.bignumber.equal(postBalance);
        }
    });

    it("should accept lots of small USD funds from expectedWhitelist.", async function () {
        let deepToken = await DeepToken.deployed();

        const preUsdCentsBalance = (await deepToken.usdCentsBalance());
        preUsdCentsBalance.should.be.bignumber.equal(0);
        const preFiatTokenBalance = (await deepToken.balanceOf(expectedUsdCurrencyFunding));
        preFiatTokenBalance.should.be.bignumber.equal(0);

        const fiatUsdCentsSentToContract = 100;
        const fiatTokensSentToContract = 10000;

        let currentUsdCentsBalance = new BigNumber(0);
        let currentFiatTokensBalance = new BigNumber(0);
        for (let i = 0; i < 100; i++) {

            await deepToken.recordPayment(fiatUsdCentsSentToContract, fiatTokensSentToContract, 1, {from: expectedWhitelist}).should.not.be.rejected;
            const postUsdCentsBalance = (await deepToken.usdCentsBalance());
            const postFiatTokenBalance = (await deepToken.balanceOf(expectedUsdCurrencyFunding));

            currentUsdCentsBalance = currentUsdCentsBalance.plus(fiatUsdCentsSentToContract);
            currentFiatTokensBalance = currentFiatTokensBalance.plus(fiatTokensSentToContract);

            currentUsdCentsBalance.should.be.bignumber.equal(postUsdCentsBalance);
            currentFiatTokensBalance.should.be.bignumber.equal(postFiatTokenBalance);
        }
    });

    it("should reject funds if buying over max cap.", async function () {
        let deepToken = await DeepToken.deployed();
        let tokensAvailableForSale = (await deepToken.getTokensAvailableForSale());
        tokensAvailableForSale = tokensAvailableForSale / 1e18 + 1;
        const etherSentToContract = tokensAvailableForSale * newTokenPriceInWei;
        await deepToken.sendTransaction({
            from: user1,
            value: etherSentToContract
        }).should.be.rejectedWith(EVMThrow);
    });

    it("should reject funds if buying more tokens than available.", async function () {
        let deepToken = await DeepToken.deployed();
        let tokensAvailableForSale = (await deepToken.getTokensAvailableForSale());
        tokensAvailableForSale = tokensAvailableForSale / 1e18 + 1;
        const etherSentToContract = tokensAvailableForSale * newTokenPriceInWei;
        await deepToken.sendTransaction({
            from: user1,
            value: etherSentToContract
        }).should.be.rejectedWith(EVMThrow);
    });

    it("should reject USD funds if buying more tokens than available.", async function () {
        let deepToken = await DeepToken.deployed();
        const tokensAvailableForSale = (await deepToken.getTokensAvailableForSale());
        let aBitTooMuch = tokensAvailableForSale.plus(1);
        await deepToken.recordPayment(0, aBitTooMuch, 1, {from: expectedWhitelist}).should.be.rejected;
    });

    it("should allow USD funds for buying all available tokens.", async function () {
        let deepToken = await DeepToken.deployed();
        let tokensAvailableForSale = (await deepToken.getTokensAvailableForSale());
        await deepToken.recordPayment(0, tokensAvailableForSale, 1, {from: expectedWhitelist}).should.not.be.rejected;
    });

    it("should accept stopping ICO by admin before ICO timeout.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
        await deepToken.endICO({from: expectedStateControl}).should.not.be.rejected;
        (await deepToken.state()).should.not.be.bignumber.equal(States.Ico);
        (await deepToken.state()).should.be.bignumber.equal(States.Operational);
    });

});



contract('DeepToken paused and restarted', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 20;

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should have an owner from our known accounts", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.stateControl()).should.be.bignumber.equal(expectedStateControl);
        (await deepToken.whitelistControl()).should.be.bignumber.equal(expectedWhitelist);
        (await deepToken.withdrawControl()).should.be.bignumber.equal(expectedWithdraw);
        (await deepToken.initialHolder()).should.be.bignumber.equal(expectedInitialHolder);
        (await deepToken.usdCurrencyFunding()).should.be.bignumber.equal(expectedUsdCurrencyFunding);
    });

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should accept correct ICO parameters with correct key", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.not.be.rejected;
        (await deepToken.totalSupply()).should.be.bignumber.equal(newTotalSupply);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(newTokenPriceInWei);
        (await deepToken.percentForSale()).should.be.bignumber.equal(newPercentForSale);
        (await deepToken.endBlock()).should.be.bignumber.equal(endBlock);
        (await deepToken.silencePeriod()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
    });

    it("should start ICO. ", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.startICO({from: expectedStateControl});
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
    });

    it("should whitelist address user1 with correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.addToWhitelist(user1, {from: expectedWhitelist}).should.not.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);
    });

    it("should accept funds from whitelisted address user1.", async function () {
        let deepToken = await DeepToken.deployed();
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);
        await deepToken.sendTransaction({from: user1, value: newTokenPriceInWei}).should.not.be.rejected;
    });

    it("should not move to paused state when called with a user key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.pause().should.be.rejectedWith(EVMThrow);
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
    });

    it("should move to paused state when called with state control key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.pause({from: expectedStateControl});
        (await deepToken.state()).should.be.bignumber.equal(States.Paused);
    });

    it("should not be resumed when called with a user key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.resumeICO().should.be.rejectedWith(EVMThrow);
        (await deepToken.state()).should.be.bignumber.equal(States.Paused);
    });

    it("should be resumed when called with state control key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.resumeICO({from: expectedStateControl});
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
    });

    it("should move again to paused state when called with state control key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.pause({from: expectedStateControl});
        (await deepToken.state()).should.be.bignumber.equal(States.Paused);
    });

    it("should reject new funding in paused state.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Paused);
        await deepToken.sendTransaction({from: user1, value: (await deepToken.tokenPriceInWei())}).should.be.rejectedWith(EVMThrow);
    });

});


contract('DeepToken end of ICO after pause by admin', function (accounts) {

        const defaultKeyDoNotUse = accounts[0];
        const expectedStateControl = accounts[1];
        const expectedWhitelist = accounts[2];
        const expectedWithdraw = addrSplitterContract; //accounts[3];
        const expectedInitialHolder = accounts[4];
        const expectedUsdCurrencyFunding = accounts[8];
    
        const user1 = accounts[5];
        const user2 = accounts[6];
        const user3 = accounts[7];
    
        // must be adapted with number of tests
        const endBlock = 20;
    
        it("should fail to end ICO after pause state, before endBlock", async function () {
            let deepToken = await DeepToken.deployed();
            await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.not.be.rejected;
            await deepToken.startICO({from: expectedStateControl}).should.not.be.rejected;
            await deepToken.pause({from: expectedStateControl}).should.not.be.rejected;
            await deepToken.resumeICO({from: expectedStateControl}).should.not.be.rejected;
            await deepToken.endICO({from: expectedStateControl}).should.not.be.rejected;
            (await deepToken.state({from: expectedStateControl})).should.be.bignumber.equal(States.Operational);
        });
    });

    contract('DeepToken end of ICO after pause by admin', function (accounts) {

        const defaultKeyDoNotUse = accounts[0];
        const expectedStateControl = accounts[1];
        const expectedWhitelist = accounts[2];
        const expectedWithdraw = addrSplitterContract; //accounts[3];
        const expectedInitialHolder = accounts[4];
        const expectedUsdCurrencyFunding = accounts[8];
    
        const user1 = accounts[5];
        const user2 = accounts[6];
        const user3 = accounts[7];
    
        // must be adapted with number of tests
        const endBlock = 20;
    
        it("should fail to end ICO after pause state, after endBlock", async function () {
            let deepToken = await DeepToken.deployed();
            await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.not.be.rejected;
            await deepToken.startICO({from: expectedStateControl}).should.not.be.rejected;
            await deepToken.pause({from: expectedStateControl}).should.not.be.rejected;
            await deepToken.resumeICO({from: expectedStateControl}).should.not.be.rejected;
            await advanceToBlock(endBlock + 1);
            await deepToken.endICO({from: expectedStateControl}).should.not.be.rejected;
            (await deepToken.state({from: expectedStateControl})).should.be.bignumber.equal(States.Operational);
        });
    });



contract('DeepToken end of ICO by anyone, after pause', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 20;

    it("should fail to end ICO after pause state, before endBlock", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.not.be.rejected;
        await deepToken.startICO({from: expectedStateControl}).should.not.be.rejected;
        await deepToken.pause({from: expectedStateControl}).should.not.be.rejected;
        await deepToken.resumeICO({from: expectedStateControl}).should.not.be.rejected;
        await deepToken.anyoneEndICO({from: expectedStateControl}).should.be.rejected;
        (await deepToken.state({from: expectedStateControl})).should.be.bignumber.equal(States.Ico);
    });

    it("should end ICO after pause state, after endBlock", async function () {
        let deepToken = await DeepToken.deployed();
        await advanceToBlock(endBlock + 1);
        await deepToken.anyoneEndICO({from: expectedStateControl}).should.not.be.rejected;
        (await deepToken.state({from: expectedStateControl})).should.be.bignumber.equal(States.Operational);
    });
});


contract('DeepToken and selfdestruction', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 20;

    it("should properly keep internal ETH balance", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.not.be.rejected;
        await deepToken.startICO({from: expectedStateControl});

        const Balance1 = web3.eth.getBalance(deepToken.address);
        Balance1.should.be.bignumber.equal(0);
        (await deepToken.etherBalance()).should.be.bignumber.equal(Balance1);

        await deepToken.addToWhitelist(user1, {from: expectedWhitelist}).should.not.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);

        let etherSentToContract = await deepToken.tokenPriceInWei();

        await deepToken.sendTransaction({from: user1, value: etherSentToContract}).should.not.be.rejected;

        let SDC = await await SelfDestructContract.deployed();
        const Balance3 = web3.eth.getBalance(SDC.address);
        Balance3.should.be.bignumber.equal(0);

        await SDC.sendTransaction({from: user1, value: etherSentToContract}).should.not.be.rejected;

        const Balance4 = web3.eth.getBalance(SDC.address);
        Balance4.should.be.bignumber.greaterThan(0);

        await SDC.doSelfDestruct(deepToken.address);

        const Balance = web3.eth.getBalance(deepToken.address);
        (await deepToken.etherBalance()).should.be.bignumber.equal(etherSentToContract);
        Balance.should.be.bignumber.equal(etherSentToContract);
    });
});



contract('DeepToken and SplitterContract', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 300;

    it("should have an address", async function () {
        let deepToken = await DeepToken.deployed();
        deepToken.should.exist;
        let splitterContract = await SplitterContract.deployed();
        splitterContract.should.exist;
    });

    it("should accept lots of small funds from anyone", async function () {
        let deepToken = await DeepToken.deployed();
        let splitterContract = await SplitterContract.at(expectedWithdraw);
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.not.be.rejected;
        await deepToken.addToWhitelist(user1, {from: expectedWhitelist}).should.not.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);
        await deepToken.startICO({from: expectedStateControl});

        const preBalance = (await deepToken.etherBalance());
        preBalance.should.be.bignumber.equal(0);
        let currentBalance = new BigNumber(0);
        for (let i = 0; i < 100; i++) {
            await deepToken.sendTransaction({from: user1, value: newTokenPriceInWei}).should.not.be.rejected;
            const postBalance = (await deepToken.etherBalance());
            currentBalance = currentBalance.plus(newTokenPriceInWei);
            currentBalance.should.be.bignumber.equal(postBalance);
        }
        const weisSentToContract = (await web3.eth.getBalance(expectedWithdraw));
        weisSentToContract.should.be.bignumber.equal(currentBalance);
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

        preAddrDefault.plus(900000000000000000).should.be.bignumber.equal(postAddrDefault);
        preAddrShareHolder1.plus(10000000000000000).should.be.bignumber.equal(postAddrShareHolder1);
        preAddrShareHolder2.plus(20000000000000000).should.be.bignumber.equal(postAddrShareHolder2);
        preAddrShareHolder3.plus(30000000000000000).should.be.bignumber.equal(postAddrShareHolder3);
        preAddrShareHolder4.plus(40000000000000000).should.be.bignumber.equal(postAddrShareHolder4);
    });

});



contract('transfering tokens between accounts', function (accounts) {

    const defaultKeyDoNotUse = accounts[0];
    const expectedStateControl = accounts[1];
    const expectedWhitelist = accounts[2];
    const expectedWithdraw = addrSplitterContract; //accounts[3];
    const expectedInitialHolder = accounts[4];
    const expectedUsdCurrencyFunding = accounts[8];

    const user1 = accounts[5];
    const user2 = accounts[6];
    const user3 = accounts[7];

    // must be adapted with number of tests
    const endBlock = 35;

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should have an owner from our known accounts", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.stateControl()).should.be.bignumber.equal(expectedStateControl);
        (await deepToken.whitelistControl()).should.be.bignumber.equal(expectedWhitelist);
        (await deepToken.withdrawControl()).should.be.bignumber.equal(expectedWithdraw);
        (await deepToken.initialHolder()).should.be.bignumber.equal(expectedInitialHolder);
        (await deepToken.usdCurrencyFunding()).should.be.bignumber.equal(expectedUsdCurrencyFunding);
    });

    it("should be in Initial state", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Initial);
    });

    it("should accept correct ICO parameters with correct key", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.updateEthICOThresholds(newTotalSupply, newTokenPriceInWei, newPercentForSale, 0, endBlock, {from: expectedStateControl}).should.not.be.rejected;
        (await deepToken.totalSupply()).should.be.bignumber.equal(newTotalSupply);
        (await deepToken.tokenPriceInWei()).should.be.bignumber.equal(newTokenPriceInWei);
        (await deepToken.percentForSale()).should.be.bignumber.equal(newPercentForSale);
        (await deepToken.endBlock()).should.be.bignumber.equal(endBlock);
        (await deepToken.silencePeriod()).should.be.bignumber.equal(0);
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
    });

    it("should reject transfering tokens to account in non Operational state.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
        const tokensToTranfer = 100;
        const preUser1 = await deepToken.balanceOf(user1);
        const preUser2 = await deepToken.balanceOf(user2);
        await deepToken.transfer(user2, tokensToTranfer, {from: user1}).should.be.rejected;
        const postUser1 = await deepToken.balanceOf(user1);
        const postUser2 = await deepToken.balanceOf(user2);
        postUser1.should.be.bignumber.equal(preUser1);
        postUser2.should.be.bignumber.equal(preUser2);
    });

    it("should reject transfering tokens between accounts in Operational state.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.ValuationSet);
        const tokensToTranfer = 100;
        const preUser1 = await deepToken.balanceOf(user1);
        const preUser2 = await deepToken.balanceOf(user2);
        await deepToken.approve(user2, 0, {from: user1});
        await deepToken.approve(user2, tokensToTranfer, {from: user1});
        await deepToken.transferFrom(user1, user2, tokensToTranfer, {from: user2}).should.be.rejected;
        const postUser1 = await deepToken.balanceOf(user1);
        const postUser2 = await deepToken.balanceOf(user2);
        postUser1.should.be.bignumber.equal(preUser1);
        postUser2.should.be.bignumber.equal(preUser2);
    });

    it("should start ICO. ", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.startICO({from: expectedStateControl});
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
    });

    it("should whitelist address user1 with correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.addToWhitelist(user1, {from: expectedWhitelist}).should.not.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        isUser1Whitelisted.should.equal(true);
    });

    it("should whitelist address user2 with correct key.", async function () {
        let deepToken = await DeepToken.deployed();
        await deepToken.addToWhitelist(user2, {from: expectedWhitelist}).should.not.be.rejected;
        let isUser1Whitelisted = await deepToken.whitelist(user2);
        isUser1Whitelisted.should.equal(true);
    });

    it("should accept funds from whitelisted address user1.", async function () {
        let deepToken = await DeepToken.deployed();
        let isUser1Whitelisted = await deepToken.whitelist(user1);
        const preBalance = (await deepToken.etherBalance());
        preBalance.should.be.bignumber.equal(0);
        isUser1Whitelisted.should.equal(true);
        const weiSentToContract = 1000 * newTokenPriceInWei;
        const sendTransaction = deepToken.sendTransaction({from: user1, value: weiSentToContract});
        const chaiForwardTX = await sendTransaction.should.not.be.rejected;
        const newBalance = (await deepToken.etherBalance());
        preBalance.plus(weiSentToContract).should.be.bignumber.equal(newBalance);
        const firstEvent = chaiForwardTX.logs[0];
        firstEvent.event.should.be.equal('Credited');
        firstEvent.args.addr.should.be.equal(user1);
        const expectedDeepTokenAmount = 1000 * 1e18;
        firstEvent.args.balance.should.be.bignumber.equal(expectedDeepTokenAmount);
        firstEvent.args.txAmount.should.be.bignumber.equal(weiSentToContract);
    });

    it("should accept funds from whitelisted address user2.", async function () {
        let deepToken = await DeepToken.deployed();
        let isUser2Whitelisted = await deepToken.whitelist(user2);
        const preBalance = (await deepToken.etherBalance());
        isUser2Whitelisted.should.equal(true);
        const weiSentToContract = 1000 * newTokenPriceInWei;
        const sendTransaction = deepToken.sendTransaction({from: user2, value: weiSentToContract});
        const chaiForwardTX = await sendTransaction.should.not.be.rejected;
        const newBalance = (await deepToken.etherBalance());
        preBalance.plus(weiSentToContract).should.be.bignumber.equal(newBalance);
        const firstEvent = chaiForwardTX.logs[0];
        firstEvent.event.should.be.equal('Credited');
        firstEvent.args.addr.should.be.equal(user2);
        const expectedDeepTokenAmount = 1000 * 1e18;
        firstEvent.args.balance.should.be.bignumber.equal(expectedDeepTokenAmount);
        firstEvent.args.txAmount.should.be.bignumber.equal(weiSentToContract);
    });

    it("should allow transfering tokens to account in Ico state.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
        const tokensToTranfer = 100;
        const preUser1 = await deepToken.balanceOf(user1);
        const preUser2 = await deepToken.balanceOf(user2);
        await deepToken.transfer(user2, tokensToTranfer, {from: user1});
        const postUser1 = await deepToken.balanceOf(user1);
        const postUser2 = await deepToken.balanceOf(user2);
        postUser1.plus(tokensToTranfer).should.be.bignumber.equal(preUser1);
        postUser2.minus(tokensToTranfer).should.be.bignumber.equal(preUser2);
    });

    it("should allow transfering tokens between accounts in Ico state.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
        const tokensToTranfer = 100;
        const preUser1 = await deepToken.balanceOf(user1);
        const preUser2 = await deepToken.balanceOf(user2);
        await deepToken.approve(user2, 0, {from: user1});
        await deepToken.approve(user2, tokensToTranfer, {from: user1});
        await deepToken.transferFrom(user1, user2, tokensToTranfer, {from: user2});
        const postUser1 = await deepToken.balanceOf(user1);
        const postUser2 = await deepToken.balanceOf(user2);
        postUser1.plus(tokensToTranfer).should.be.bignumber.equal(preUser1);
        postUser2.minus(tokensToTranfer).should.be.bignumber.equal(preUser2);
    });

    it("should end ICO.", async function () {
        let deepToken = await DeepToken.deployed();
        await advanceToBlock(endBlock + 1);
        (await deepToken.state()).should.be.bignumber.equal(States.Ico);
        await deepToken.anyoneEndICO().should.not.be.rejected;
        (await deepToken.state()).should.not.be.bignumber.equal(States.Ico);
    });

    it("should allow transfering tokens to account in Operational state.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Operational);
        const tokensToTranfer = 100;
        const preUser1 = await deepToken.balanceOf(user1);
        const preUser2 = await deepToken.balanceOf(user2);
        await deepToken.transfer(user2, tokensToTranfer, {from: user1});
        const postUser1 = await deepToken.balanceOf(user1);
        const postUser2 = await deepToken.balanceOf(user2);
        postUser1.plus(tokensToTranfer).should.be.bignumber.equal(preUser1);
        postUser2.minus(tokensToTranfer).should.be.bignumber.equal(preUser2);
    });

    it("should allow transfering tokens between accounts in Operational state.", async function () {
        let deepToken = await DeepToken.deployed();
        (await deepToken.state()).should.be.bignumber.equal(States.Operational);
        const tokensToTranfer = 100;
        const preUser1 = await deepToken.balanceOf(user1);
        const preUser2 = await deepToken.balanceOf(user2);
        await deepToken.approve(user2, 0, {from: user1});
        await deepToken.approve(user2, tokensToTranfer, {from: user1});
        await deepToken.transferFrom(user1, user2, tokensToTranfer, {from: user2});
        const postUser1 = await deepToken.balanceOf(user1);
        const postUser2 = await deepToken.balanceOf(user2);
        postUser1.plus(tokensToTranfer).should.be.bignumber.equal(preUser1);
        postUser2.minus(tokensToTranfer).should.be.bignumber.equal(preUser2);
    });

});
