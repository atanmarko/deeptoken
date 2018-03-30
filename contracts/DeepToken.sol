/*
Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20.
*/
pragma solidity ^0.4.15;


import "zeppelin/token/StandardToken.sol";


contract DeepToken is StandardToken {

    using SafeMath for uint256;

    // data structures
    enum States {
    Initial, // deployment time
    ValuationSet, // set ICO parameters
    Ico, // whitelist addresses, accept funds, update balances
    Operational, // manage contests
    Paused // for contract upgrades
    }

    string public constant name = "DeepToken";

    string public constant symbol = "DTA";

    uint8 public constant decimals = 18;

    uint256 public constant pointMultiplier = (10 ** uint256(decimals));

    mapping (address => bool) public whitelist;

    address public initialHolder;

    address public stateControl;

    address public whitelistControl;

    address public withdrawControl;

    address public usdCurrencyFunding;

    States public state;

    uint256 public tokenPriceInWei;

    uint256 public percentForSale;

    uint256 public totalNumberOfTokensForSale;

    uint256 public silencePeriod;

    uint256 public startAcceptingFundsBlock;

    uint256 public endBlock;

    uint256 public etherBalance;

    uint256 public usdCentsBalance;

    uint256 public tokensSold;

    //this creates the contract and stores the owner. it also passes in 3 addresses to be used later during the lifetime of the contract.
    function DeepToken(address _stateControl, address _whitelistControl, address _withdraw, address _initialHolder, address _usdCurrencyFunding) {
        require (_initialHolder != address(0));
        require (_stateControl != address(0));
        require (_whitelistControl != address(0));
        require (_withdraw != address(0));
        require (_usdCurrencyFunding != address(0));
        initialHolder = _initialHolder;
        stateControl = _stateControl;
        whitelistControl = _whitelistControl;
        withdrawControl = _withdraw;
        usdCurrencyFunding = _usdCurrencyFunding;
        moveToState(States.Initial);
        totalSupply = 0;
        tokenPriceInWei = 0;
        percentForSale = 0;
        totalNumberOfTokensForSale = 0;
        silencePeriod = 0;
        startAcceptingFundsBlock = uint256(int256(-1));
        endBlock = 0;
        etherBalance = 0;
        usdCentsBalance = 0;
        tokensSold = 0;
        balances[initialHolder] = totalSupply;
    }

    event Whitelisted(address addr);

    event Dewhitelisted(address addr);

    event Credited(address addr, uint balance, uint txAmount);

    event USDCentsBalance(uint balance);

    event TokenByFiatCredited(address addr, uint balance, uint txAmount, uint256 requestId);

    event StateTransition(States oldState, States newState);

    modifier onlyWhitelist() {
        require(msg.sender == whitelistControl);
        _;
    }

    modifier onlyStateControl() {
        require(msg.sender == stateControl);
        _;
    }

    modifier requireState(States _requiredState) {
        require(state == _requiredState);
        _;
    }

    /**
    BEGIN ICO functions
    */

    //this is the main funding function, it updates the balances of DeepTokens during the ICO.
    //no particular incentive schemes have been implemented here
    //it is only accessible during the "ICO" phase.
    function() payable
    requireState(States.Ico)
    {
        require(msg.sender != whitelistControl);
        require(whitelist[msg.sender] == true);
        uint256 deepTokenIncrease = (msg.value * pointMultiplier) / tokenPriceInWei;
        require(getTokensAvailableForSale() >= deepTokenIncrease);
        require(block.number < endBlock);
        require(block.number >= startAcceptingFundsBlock);
        etherBalance = etherBalance.add(msg.value);
        balances[initialHolder] = balances[initialHolder].sub(deepTokenIncrease);
        balances[msg.sender] = balances[msg.sender].add(deepTokenIncrease);
        tokensSold = tokensSold.add(deepTokenIncrease);
        withdrawControl.transfer(msg.value);
        Credited(msg.sender, balances[msg.sender], msg.value);
    }

    function recordPayment(uint256 usdCentsAmount, uint256 tokenAmount, uint256 requestId)
    onlyWhitelist
    requireState(States.Ico)
    {
        require(getTokensAvailableForSale() >= tokenAmount);
        require(block.number < endBlock);
        require(block.number >= startAcceptingFundsBlock);

        usdCentsBalance = usdCentsBalance.add(usdCentsAmount);
        balances[initialHolder] = balances[initialHolder].sub(tokenAmount);
        balances[usdCurrencyFunding] = balances[usdCurrencyFunding].add(tokenAmount);
        tokensSold = tokensSold.add(tokenAmount);

        USDCentsBalance(usdCentsBalance);
        TokenByFiatCredited(usdCurrencyFunding, balances[usdCurrencyFunding], tokenAmount, requestId);
    }

    function moveToState(States _newState)
    internal
    {
        StateTransition(state, _newState);
        state = _newState;
    }

    function getTokensAvailableForSale()
    constant
    returns (uint256 tokensAvailableForSale)
    {
        return (totalNumberOfTokensForSale.sub(tokensSold));
    }

    // ICO contract configuration function
    // _newTotalSupply is the number of tokens available
    // _newTokenPriceInWei is the token price in wei
    // _newPercentForSale is the percentage of _newTotalSupply available for sale
    // _newsilencePeriod is a number of blocks to wait after starting the ICO. No funds are accepted during the silence period. It can be set to zero.
    // _newEndBlock is the absolute block number at which the ICO must stop. It must be set after now + silence period.
    function updateEthICOThresholds(uint256 _newTotalSupply, uint256 _newTokenPriceInWei, uint256 _newPercentForSale, uint256 _newSilencePeriod, uint256 _newEndBlock)
    onlyStateControl
    {
        require(state == States.Initial || state == States.ValuationSet);
        require(_newTotalSupply > 0);
        require(_newTokenPriceInWei > 0);
        require(_newPercentForSale > 0);
        require(_newPercentForSale <= 100);
        require((_newTotalSupply * _newPercentForSale / 100) > 0);
        require(block.number < _newEndBlock);
        require(block.number + _newSilencePeriod < _newEndBlock);

        totalSupply = _newTotalSupply;
        percentForSale = _newPercentForSale;
        totalNumberOfTokensForSale = totalSupply.mul(percentForSale).div(100);
        tokenPriceInWei = _newTokenPriceInWei;
        silencePeriod = _newSilencePeriod;
        endBlock = _newEndBlock;

        balances[initialHolder] = totalSupply;

        moveToState(States.ValuationSet);
    }

    function startICO()
    onlyStateControl
    requireState(States.ValuationSet)
    {
        require(block.number < endBlock);
        require(block.number + silencePeriod < endBlock);
        startAcceptingFundsBlock = block.number + silencePeriod;
        moveToState(States.Ico);
    }

    function endICO()
    onlyStateControl
    requireState(States.Ico)
    {
        burnUnsoldCoins();
        moveToState(States.Operational);
    }

    function anyoneEndICO()
    requireState(States.Ico)
    {
        require(block.number > endBlock);
        burnUnsoldCoins();
        moveToState(States.Operational);
    }

    function burnUnsoldCoins()
    internal
    {
        //slashing the initial supply, so that the ICO is selling percentForSale% total
        totalSupply = tokensSold.mul(100).div(percentForSale);
        balances[initialHolder] = totalSupply.sub(tokensSold);
    }

    function addToWhitelist(address _whitelisted)
    onlyWhitelist
    {
        whitelist[_whitelisted] = true;
        Whitelisted(_whitelisted);
    }

    function removeFromWhitelist(address _whitelisted)
    onlyWhitelist
    {
        whitelist[_whitelisted] = false;
        Dewhitelisted(_whitelisted);
    }

    //emergency pause for the ICO
    function pause()
    onlyStateControl
    requireState(States.Ico)
    {
        moveToState(States.Paused);
    }

    //un-pause
    function resumeICO()
    onlyStateControl
    requireState(States.Paused)
    {
        moveToState(States.Ico);
    }
    /**
    END ICO functions
    */

    /**
    BEGIN ERC20 functions
    */

    function transfer(address _to, uint256 _value)
    returns (bool success) {
        require((state == States.Ico) || (state == States.Operational));
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value)
    returns (bool success) {
        require((state == States.Ico) || (state == States.Operational));
        return super.transferFrom(_from, _to, _value);
    }

    function balanceOf(address _account)
    constant
    returns (uint256 balance) {
        return balances[_account];
    }

    /**
    END ERC20 functions
    */
}
