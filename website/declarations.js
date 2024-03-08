const PORT_SERVER = 8501;
const maxNumberOfRows = 44640;    // Trade History - Maximum number or rows allowed in Trade History Array - used in CSV export
const priceFixedDecimals = 2;

let generalSetup = {
    id: 0,
    simulationON: true,                 // Simulation ON Flag
    coinPair: 'solusdt',                // Coin Pair                        - Coin & Currency Pair
    coin: 'SOL',                        // Coin                             - Coin Name
    currency: 'USDT',                   // Currency                         - Currency used in Coin Pair
    priceRefreshRate: 30,               // Price Refresh Rate               - Price Reading Frequency 
    budgetStart: 300,                   // Start Budget                     - Budget available at the beginning
    coinsStart: 0,                      // Start Coins                      - Coins available at the beginning (these Coins will be ignored by the algorithm)
    budgetMin: 20,                      // Minimum Budget                   - Lowest value allowed for Available Budget
    fee: 0,                             // Fee                              - % paid in Fees per Trade (Buy or Sell)
    instantBuyAmountPercentage: 10,     // Instant Buy Amount Percentage    - % of Available Budget used for Instant Buy
    instantBuyAmountFixed: 10,          // Instant Buy Amount Fixed         - Value of Fixed Budget used for Instant Buy
    instantSellAmountPercentage: 100,   // Instant Sell Amount Percentage   - % of Total Coins used for Instant Sell
    instantSellAmountFixed: 0,          // Instant Sell Amount Fixed        - Number of Fixed Coins used for Instant Sell
    initialStartPrice: 0                // Initial Start Price              - Initial Buy Order will only start below this value
}

let buy1Setup = {
    id: 0,
    priceDropCheck: 'lastBuyPrice',     // Buy Price Drop Check 1           - Selection used of Price Drop Check (Average Price / Last Buy Price) used for "Buy 1 Strategy"
    priceDropPercentage: -0.5,          // Buy Price Drop Percentage 1      - Price Drop % during "Buy 1 Strategy" (depends on "Price Drop Check" selection)
    amountPercentage: 0,                // Buy Amount Percentage 1          - % of Available Budget bought during "Buy 1 Strategy"
    amountFixed1: 8,                    // Buy Amount Fixed value 1         - Fixed Amount to be bought during "Buy 1 Strategy" for the 1st buy
    amountFixed2: 10,                   // Buy Amount Fixed value 2         - Fixed Amount to be bought during "Buy 1 Strategy" for the 2nd buy
    amountFixed3: 12,                   // Buy Amount Fixed value 3         - Fixed Amount to be bought during "Buy 1 Strategy" for the 3rd buy
    amountFixed4: 14,                   // Buy Amount Fixed value 4         - Fixed Amount to be bought during "Buy 1 Strategy" for the 4th buy
    amountFixed5: 16,                   // Buy Amount Fixed value 5         - Fixed Amount to be bought during "Buy 1 Strategy" for the 5th buy
    roundDropMultiplier: 0,             // Buy Round Drop Multiplier 1      - Price Drop Percentage Multiplier for each Buy Round during "Buy 1 Strategy"
    roundAmountMultiplier: 0,           // Buy Round Amount % Multiplier 1  - Buy Amount Percentage Multiplier for each Buy Round during "Buy 1 Strategy"
    maxBuyRounds: 5,                    // Max Buy Rounds 1                 - Maximum No. of Buy Rounds during "Buy 1 Strategy"
    buyAtBottom: true,                  // Buy at Bottom                    - Flag for Buy at Bottom option
    bottomMaxWait: 4,                   // Buy Bottom Max Wait Rounds 1     - Number of Rounds to Wait before Buy if Bottom Price does not change during "Buy 1 Strategy"
    bottomMaxRaise: 0.08                // Buy Bottom Max Raise % 1         - Max % allowed for Bottom Price to raise before Buy during "Buy 1 Strategy"
}

let buy2Setup = {
    id: 0,
    priceDropCheck: 'lastBuyPrice',
    priceDropPercentage: -1.5,
    amountPercentage: 0,
    amountFixed1: 18,
    amountFixed2: 20,
    amountFixed3: 22,
    amountFixed4: 24,
    amountFixed5: 26,
    roundDropMultiplier: 0,
    roundAmountMultiplier: 0,
    maxBuyRounds: 5,
    buyAtBottom: true,
    bottomMaxWait: 4,
    bottomMaxRaise: 0.15
}

let buy3Setup = {
    id: 0,
    priceDropCheck: 'lastBuyPrice',
    priceDropPercentage: -3,
    amountPercentage: 0,
    amountFixed1: 28,
    amountFixed2: 30,
    amountFixed3: 32,
    amountFixed4: 34,
    amountFixed5: 36,
    roundDropMultiplier: 0,
    roundAmountMultiplier: 0,
    maxBuyRounds: 5,
    buyAtBottom: true,
    bottomMaxWait: 4,
    bottomMaxRaise: 0.2
}

let buySetupList = { items: [], count: 0 };

let sellSetup = {
    id: 0,
    option: 'sellAll',          // Sell Option                  - Sell Strategy Selection
    earn1Percentage: 0.5,       // Sell Earn Percentage 1       - Price Rise % during "Buy 1 Strategy"
    earn2Percentage: 1.5,       // Sell Earn Percentage 2       - Price Rise % during "Buy 2 Strategy"
    earn3Percentage: 3,         // Sell Earn Percentage 3       - Price Rise % during "Buy 3 Strategy"
    amountPercentage: 100,      // Sell Amount Percentage       - % of Total Coins sold during if selected Sell Option indicates partial Sell
    sellAtPeak: true,           // Sell at Peak                 - Flag for Sell at Peak option
    peakMaxWait: 4,             // Sell Peak Max Wait Rounds    - Number of Rounds to Wait bewfore Sell if Peak Price does not change
    peakMaxDrop: -0.08,         // Sell Peak Max Drop %         - Max % allowed for Peak Price to drop before Sell
    waitRoundsAfterSell: 20     // Wait Rounds After Sell All   - Number of idle executions before executing first Buy trade after a Total Sell
}

let overallReport = {
    id: 0,
    budgetAvailable: 0,             // Budget Available                 - Available Budget for Trading
    budgetDifference: 0,            // Budget Difference                - Difference btw Start Budget & Availabale Budget
    totalCoins: 0,                  // Total Coins                      - Current number of Coins in Wallet
    totalTradeSpent: 0,             // Total Trade Spent                - Calculates the Total Amount spent on all Active Trades
    lastTradeSpent: 0,              // Last Trade Spent                 - Amount spent on Last Trade
    totalFeePaid: 0,                // Total Fee Paid                   - Calculates the Total Amount of Fees paid on all Active Trades
    lastTradeFeePaid: 0,            // Last Trade Fee Paid              - Calculates the Fee paid on Last Trade
    priceNow: 0,                    // Price Now                        - Current Price for selected Coin Pair   
    priceLastBuy: 0,                // Price Last Buy                   - Price paid for last Buy Trade
    priceChangeLastBuy: 0,          // Price Change vs. Last Buy        - Price Change % btw Price Now & Last Buy Price
    priceAverage: 0,                // Average Buy Price                - Calculed Average Price for all Buy Trades
    priceChangeAveragePrice: 0,     // Price Change vs. Average Buy     - Price Change % btw Price Now & Average Buy Price
    sellTargetPrice: 0,             // Sell Target Price                - Calculated Sell Target Price based on current settings
    unrealisedGain: 0,              // Unrealised Gain Max Earn         - Calculates the Unrealised Gain Value vs. Budget Start
    roundCounterBuy1: 0,            // Buy Round Counter 1              - Counter used for Buy Rounds in "Buy 1 Strategy"
    roundCounterBuy2: 0,            // Buy Round Counter 2              - Counter used for Buy Rounds in "Buy 2 Strategy"
    roundCounterBuy3: 0,            // Buy Round Counter 3              - Counter used for Buy Rounds in "Buy 3 Strategy"
    waitRoundsAfterSellCounter: 0,  // Wait Rounds After Sell Counter   - Counter used to count down number of rounds after Last Sell
}

let tradeHistory = {
    id: 0,
    coinPair: '',             // Trade History - Coin Pair
    date: '',                 // Trade History - Date
    time: '',                 // Trade History - Time
    type: '',                 // Trade History - Trade Type
    price: 0,                 // Trade History - Price
    filled: 0,                // Trade History - Filled Coins
    fee: 0,                   // Trade History - Fee Paid
    tradeSpent: 0,            // Trade History - Total Spent for Trade
    balance: 0,               // Trade History - Budget Balance
    totalCoins: 0,            // Trade History - Total Coins
    averageBuyPrice: 0,       // Trade History - Average Buy Price
    lastBuyPrice: 0,          // Trade History - Last Buy Price
    priceChangeLastBuy: 0,    // Trade History - Price Change vs. Last Buy 
    priceChangeAverageBuy: 0, // Trade History - Price Change vs. Average Buy
    peakBottomChange: 0,      // Trade History - Price Change vs. Peak/Bottom Price
    buy1Counter: 0,           // Trade History - Round Counter for "Buy 1 Strategy"
    buy2Counter: 0,           // Trade History - Round Counter for "Buy 2 Strategy"
    buy3Counter: 0,           // Trade History - Round Counter for "Buy 3 Strategy"
}

let tradeHistoryList = [];

// let currentTrade = {
//     id: 0,
//     buyPricesArray: [],         // Buy Prices Array         - [1 = 1st Buy Price] ; [2 = 2nd Buy Price] ; [3 = 3rd Buy Price] ; etc...
//     buyCoinsArray: [],          // Buy Coins Array          - [1 = 1st Buy Coins Purchased] ; [2 = 2nd Buy Coins Purchased] ; [3 = 3rd Buy Coins Purchased] ; etc...
//     priceLastSell: 0,           // Price Last Sell          - Price when last Sell Trade was executed

//     pricePeak: 0,               // Peak Price               - Calculated Peak Price
//     priceBottom: 0,             // Bottom Price             - Calculated Bottom Price
//     pricePeakBottomChange: 0,   // Peak/Bottom Price Change - % of Price change btw. Current Price and previous Calculated Peak Price
//     counterPeakMaxWait: 0,      // Peak Max Wait Counter    - Counter for Peak Max Wait Rounds
//     counterBottomMaxWait: 0,    // Bottom Max Wait Counter  - Counter for Bottom Max Wait Rounds

//     buyAmountPercentage: 0,     // Buy Amount Percentage        - Calculated % of Available Budget bought based on "Buy X Strategy" selection
//     buyAmountFixed: 0,          // Buy Amount Fixed Value       - Fixed value bought for each Buy step
//     buyPriceDropPercentage: 0,  // Buy Price Drop Percentage    - Calculated Price Drop % based on "Buy X Strategy" selection
//     buyPriceDropCheck: 0,       // Buy Price Drop Check         - Calculated Selection used of Price Drop Check based on "Buy X Strategy" selection
//     buyAtBottom: true,
//     buyBottomMaxWait: 0,        // Buy Bottom Max Wait Rounds   - Calculated Number of Rounds to Wait bewfore Buy if Bottom Price does not change based on "Buy X Strategy" selection
//     buyBottomMaxRaise: 0,       // Buy Bottom Max Raise %       - Calculated Max % allowed for Bottom Price to raise before Buy based on "Buy X Strategy" selection
//     sellEarnPercentage: 0,      // Sell Earn Percentage         - Calculated Price Rise % based on "Buy 1 Strategy" selection
// }

let appSetup = {
    id: 0,
    initialStartPriceEmailSent: false,  // initialStartPriceEmailSent Flag  - Indicates if First Pass exection has completed
    lowBudgetEmailSent: false,          // lowBudgetEmailSent Flag          - Indicates if First Pass exection has completed
    instantBuy: false,          // Instant Buy Flag             - Indicates if an Instant Buy is required
    instantSell: false,         // Instant Sell Flag            - Indicates if an Instant Sell is required
    paused: false,              // Pause/Resume Flag            - Flag for Pausing/Resuming code execution
    status: 'OFFLINE',          // Current Status               - Indicates the current status of the application
    previousStatus: 'OFFLINE',  // Previous Status              - Indicates the previous status of the application
}

const coinPairEnum = {
    solusdt: 'SOLUSDT',
    soleur: 'SOLEUR',
    btcusdt: 'BTCUSDT',
    btceur: 'BTCEUR',
    adausdt: 'ADAUSDT',
    bnbusdt: 'BNBUSDT',
    dogeusdt: 'DOGEUSDT',
    dotusdt: 'DOTUSDT',
    egldusdt: 'EGLDUSDT',
    ethusdt: 'ETHUSDT',
    flokiusdt: 'FLOKIUSDT',
    mtlusdt: 'MTLUSDT',
    ogusdt: 'OGUSDT',
    pepeusdt: 'PEPEUSDT',
    wldusdt: 'WLDUSDT',
    xrpusdt: 'XRPUSDT'
};

const sellOptionEnum = {
    sellAll: 'Sell All',
    sellPercent: 'Sell Percent',
    sellPercentOfLastBuy: 'Sell Percent of Last Buy',
    sellLastBuy: 'Sell Last Buy'
};

const priceDropCheckEnum = {
    lastBuyPrice: 'Last Buy Price',
    averagePrice: 'Average Price',
};

const appStatusEnum = {
    offline: 'OFFLINE',
    simulation: 'SIMULATION',
    simulationLowBudget: 'SIMULATION - LOW BUDGET !!!',
    online: 'ONLINE',
    onlineLowBudget: 'ONLINE - LOW BUDGET !!!',
    paused: 'PAUSED',
};