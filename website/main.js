import ApplicationService from './services/applicationService.js'
import SnackBar from './framework/snack-bar.js';
import { ThemeHelper } from './framework/theme.js';
import { io } from './framework/socket.io.esm.min.js';

let myInterval;
const messageClient = io(`http://localhost:${PORT_SERVER}`); // connect to messageServer

export default class Main {
    themeHelper = ThemeHelper;

    dateNow = new Date().toISOString().slice(0, 10);
    date10YearsAgo = new Date();

    tradeHistoryOptions = {};

    constructor() {
        this.date10YearsAgo.setFullYear(this.date10YearsAgo.getFullYear() - 10);
        this.date10YearsAgo = this.date10YearsAgo.toISOString().slice(0, 10);
        this.tradeHistoryOptions = {
            take: 10,
            fromDateTime: `${this.date10YearsAgo}T00:00`,
            toDateTime: `${this.dateNow}T23:59`,
            hideNA: false,
            hideBP: false
        };

        ThemeHelper.toggleAppTargetBox(PORT_SERVER);

        this.htmlReadySetup();
        this.showPrice(generalSetup.coinPair);
        window.ThemeHelper = ThemeHelper;
        ThemeHelper.setDarkTheme();

        messageClient.emit('client-connection', { client: 'ceapa' });

        messageClient.on('connection-status', (message) => {
            console.log('connection status from server', message);
            if (message.isConnected) {
                SnackBar.showSuccess('Connected to message server');
            } else {
                SnackBar.showError('Could not connect to message server!');
            }
        });

        messageClient.on('message', (message) => {
            // console.log('message from server', message);
        });

        messageClient.on('tradeHistory', (message) => {
            tradeHistoryList.push(message);                 // HERE is there any risk of overfilling this param?
            this.addRowToTradingHistoryTable(message);
        });

        messageClient.on('overallReport', (message) => {

            overallReport = message;

            overallReport.priceChangeAveragePrice = overallReport.priceChangeAveragePrice * 100;
            overallReport.priceChangeLastBuy = overallReport.priceChangeLastBuy * 100;

            overallReportForm = FormHelper.setupForm(overallReport, 'overallReport');

            this.formatOverallReport();

            this.formatBuyFixedAmountBox();
        });

        messageClient.on('appSetup', (message) => {

            appSetup = message;

            if (appSetup.lowBudgetEmailSent) {
                if (appSetup.status === appStatusEnum.online) { this.setAppStatus(appStatusEnum.onlineLowBudget, appStatusEnum.online); }
                else if (appSetup.status === appStatusEnum.simulation) { this.setAppStatus(appStatusEnum.simulationLowBudget, appStatusEnum.simulation); }
            }
            else {
                if (appSetup.status === appStatusEnum.onlineLowBudget) { this.setAppStatus(appStatusEnum.online, appStatusEnum.online); }
                else if (appSetup.status === appStatusEnum.simulationLowBudget) { this.setAppStatus(appStatusEnum.simulation, appStatusEnum.simulation); }
            }
        });
    }

    async showPrice(gCoinPair) {
        let sPrice = await ApplicationService.getPrice(gCoinPair);
        document.getElementById("redDiv").innerHTML = `${new Date().toLocaleDateString("en-GB") || '#'} - ${new Date().toLocaleTimeString("en-GB") || '#'} : ${generalSetup.coin} : ${sPrice} ${generalSetup.currency}`;
    }

    // async startExec() {
    //     // tradeCheck();
    //     // let sPrice = await ApplicationService.getPrice(generalSetup.coinPair);
    //     // document.getElementById("redDiv").innerHTML = `${new Date().toLocaleDateString("en-GB") || '#'} - ${new Date().toLocaleTimeString("en-GB") || '#'} : ${generalSetup.coin} : ${sPrice} ${generalSetup.currency}`;

    //     await this.showPrice(generalSetup.coinPair);
    //     await ApplicationService.getOverallReport();
    //     await ApplicationService.getTradingHistory(this.tradeHistoryOptions);

    //     // console.log(`${new Date().toLocaleDateString("en-GB") || '#'} - ${new Date().toLocaleTimeString("en-GB") || '#'} : startExec`);
    // }

    // startProcess - Used by the START button to start execution of the program
    async startProcess() {

        await ApplicationService.getAppSetup();
        if (appSetup.status === appStatusEnum.online || appSetup.status === appStatusEnum.onlineLowBudget || appSetup.status === appStatusEnum.simulation) {
            SnackBar.showError(`Application is already running in ${appSetup.status} mode!!!`);
            return false;
        }

        const response = await this.actionConfirmation('START Trading', 'Trading Started!');
        if (response === false) { return false; };

        if (generalSetup.simulationON === true) { await this.setAppStatus(appStatusEnum.simulation, appStatusEnum.simulation); }
        else { await this.setAppStatus(appStatusEnum.online, appStatusEnum.online); };

        // await ApplicationService.sendEmail(`[${user.env.USER}] - START Button Pressed !!!`, `Application Started.`);

        await ApplicationService.sendAppSetup();          // used to send the App Status Parameter
        // HERE Should we calculate the status on the server and read it here instead of sending it directly?

        await ApplicationService.startAppExecution();

        // HERE Need a way to constantly read the Price, Overall Report & Trading History data for table

        // await this.startExec();
        // myInterval = setInterval(await this.startExec, 5000);
        // myInterval = setInterval(await this.startExec.bind(this), 600000);   // HERE do we need to use await?
    }

    // stopProcess - Used by the STOP button to stop execution of the program
    async stopProcess() {

        const response = await this.actionConfirmation('STOP Trading', 'Trading Stopped!');
        if (response === false) { return false; };

        await this.setAppStatus(appStatusEnum.offline, appStatusEnum.offline);

        // await ApplicationService.sendEmail(`[${user.env.USER}] - STOP Button Pressed !!!`, `Application Stopped.`);

        await ApplicationService.sendAppSetup();          // used to send the App Status Parameter
        // HERE Should we calculate the status on the server and read it here instead of sending it directly?

        await ApplicationService.stopAppExecution();

        exportAsCSV(generalSetup.coinPair);


        clearInterval(myInterval);
    }

    // instantBuyProcess - Used by the BUY button to instantly buy a number of coins when pressed
    async instantBuyProcess() {

        const response = await this.actionConfirmation('BUY now', 'BUY Order Sent!');
        if (response === false) { return false; };

        appSetup.instantBuy = true;
        await ApplicationService.sendAppSetup();

        // await ApplicationService.sendEmail(`Instant BUY Button Pressed !!!`, `Instant Buy order sent to Server.`);

        // instantBuy(generalSetup.coinPair);
        // exportAsCSV(generalSetup.coinPair);
        await ApplicationService.sendInstantBuy(generalSetup.coinPair);
    }

    // instantSellProcess - Used by the SELL button to instantly sell a number of coins when pressed
    async instantSellProcess() {

        const response = await this.actionConfirmation('SELL now', 'SELL Order Sent!');
        if (response === false) { return false; };

        // await ApplicationService.sendEmail(`Instant SELL Button Pressed !!!`, `Instant Sell order sent to Server.`);

        // instantSell(generalSetup.coinPair);
        // exportAsCSV(generalSetup.coinPair);
        await ApplicationService.sendInstantSell(generalSetup.coinPair);
    }

    // pauseProcess - Used by the PAUSE button to pause the code execution when pressed
    async pauseProcess() {

        const response = await this.actionConfirmation('PAUSE Trading', 'Trading Paused!');
        if (response === false) { return false; };

        exportAsCSV(generalSetup.coinPair);
        appSetup.paused = true;

        await this.setAppStatus(appStatusEnum.paused, appSetup.previousStatus);   // HERE should we do this on the server and then read the data back?
        await ApplicationService.sendAppSetup();      // HERE send this to DB
        await ApplicationService.sendEmail(`PAUSE Button Pressed !!!`, `Application Paused.`);
    }

    // resumeProcess - Used by the RESUME button to resume the code execution when pressed
    async resumeProcess() {

        const response = await this.actionConfirmation('RESUME Trading', 'Trading Resumed!');
        if (response === false) { return false; };

        exportAsCSV(generalSetup.coinPair);
        appSetup.paused = false;

        await this.setAppStatus(appSetup.previousStatus, appSetup.previousStatus);   // HERE should we do this on the server and then read the data back?
        await ApplicationService.sendAppSetup();      // HERE send this to DB
        await ApplicationService.sendEmail(`RESUME Button Pressed !!!`, `Application Resumed.`);
    }

    // saveSetupProcess - Used by the SAVE SETUP button to save the configured setup on the Server DB
    async saveSetupProcess() {

        const response = await this.actionConfirmation('SAVE Setup', 'Setup Saved!');
        if (response === false) { return false; };

        if (forms.any().filter(form => form.hasChanges()).length === 0) {
            SnackBar.showWarning('There are no changes!');
            return false;
        }

        try {

            if (generalSetupForm.hasChanges()) {
                const result = await ApplicationService.sendGeneralSetup();
                if (result) {
                    generalSetup = result;
                    generalSetupForm = FormHelper.setupForm(generalSetup, 'generalSetup');
                }
            }

            if (sellSetupForm.hasChanges()) {
                const result = await ApplicationService.sendSellSetup();
                if (result) {
                    sellSetup = result;
                    sellSetupForm = FormHelper.setupForm(sellSetup, 'sellSetup');
                }
            }

            if (buy1SetupForm.hasChanges() || buy2SetupForm.hasChanges() || buy3SetupForm.hasChanges()) {
                const result = await ApplicationService.sendBuySetup();
                if (result) {
                    buySetupList = result;
                    buy1SetupForm = FormHelper.setupForm(buySetupList.items[0], 'buy1Setup');
                    buy2SetupForm = FormHelper.setupForm(buySetupList.items[1], 'buy2Setup');
                    buy3SetupForm = FormHelper.setupForm(buySetupList.items[2], 'buy3Setup');
                }
            }
        }
        catch (ex) {
            SnackBar.showError('Something went wrong! Could not save the data!');
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${ex}`);
            return false;
        }

        SnackBar.showSuccess('Data successfully saved!')
    }

    // loadSetupProcess - Used by the LOAD SETUP button to load the previously saved configured setup from Server DB
    async loadSetupProcess() {
        const response = await this.actionConfirmation('LOAD Setup', 'Setup Loaded!');
        if (response === false) { return false; };

        // loadSetupLS();
        // populateSetupPage();
        await this.loadDataFromDb();
    }

    // loadReportProcess - Used by the LOAD REPORT button to load the Overall Report parameters from Server DB
    async loadReportProcess() {

        const response = await this.actionConfirmation('LOAD Report', 'Report Loaded!');
        if (response === false) { return false; };

        try {
            await ApplicationService.getOverallReport();
            overallReportForm = FormHelper.setupForm(overallReport, 'overallReport');

            SnackBar.showSuccess('Data loaded successfully!');
        }
        catch (ex) {
            SnackBar.showError('Data cannot be loaded!');
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${ex}`);
        }
    }

    // // saveTradeProcess - Used by the SAVE TRADE button to save the current trade parameters locally
    // async saveTradeProcess() {
    //     exportAsCSV(generalSetup.coinPair);
    //     localStorage.setItem("savedTradeHist", JSON.stringify(tradeHistory));
    //     localStorage.setItem("savedOverall", JSON.stringify(overallReport));
    // }

    // // loadTradeProcess - Used by the LOAD TRADE button to load the last trade parameters from local storage
    // async loadTradeProcess() {
    //     tradeHistory = JSON.parse(localStorage.getItem("savedTradeHist"));
    //     overallReport = JSON.parse(localStorage.getItem("savedOverall"));

    // }

    // readBudgetCoinsInWallet - Used by the READ BUDGET & COINS IN WALLET button to load the actual Budget & Coins available in Binance Wallet
    async readBudgetCoinsInWallet() {
        // await this.loadDataFromDb();
        const response = await this.actionConfirmation('READ Budget from Wallet', 'Budget read from Wallet!');
        if (response === false) { return false; };

        try {
            let result = await ApplicationService.getBudgetCoinsInWallet(generalSetup.currency);
            let budgetInWallet = Number(+result?.content.toFixed(priceFixedDecimals));
            result = await ApplicationService.getBudgetCoinsInWallet(generalSetup.coin);
            let coinsInWallet = Number(+result?.content.toFixed(priceFixedDecimals));
            generalSetupForm.budgetStart.value = budgetInWallet;
            generalSetupForm.coinsStart.value = coinsInWallet;
            generalSetupForm.budgetStart.hasChanges = true;
            generalSetupForm.coinsStart.hasChanges = true;

            SnackBar.showSuccess('Budget/Coins In Wallet loaded successfully!');
        }
        catch (ex) {
            SnackBar.showError('readBudgetCoinsInWallet: Data cannot be loaded!');
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${ex}`);
        }
    }

    // clearTable - Used by the CLEAR TABLE button to delete all rows
    async clearTable() {
        const response = await this.actionConfirmation('CLEAR Trading History Table', 'Trading History Table Cleared!');
        if (response === false) { return false; };

        exportAsCSV(generalSetup.coinPair);
        // clearHistTableRows();
    }

    // exportCSV - Used by the EXPORT CSV button
    async exportCSV() {
        await ApplicationService.getTradingHistory(this.tradeHistoryOptions);
        exportAsCSV(generalSetup.coinPair);
    }

    // sendEmail - Used by the SEND EMAIL button
    async sendEmail() {

        let sBody = 'This is an example<pre> </pre>1<br>This is an example<pre>  </pre>2<br>This is an example<pre>   </pre>3<br>';

        console.log(sBody);

        const response = await this.actionConfirmation(`send Email`, 'Email sent!');
        if (response === false) { return false; };

        // exportAsCSV(generalSetup.coinPair);
        // let sBody = 'line 1\t\t\t\ttext 1'
        await ApplicationService.sendEmail(String('Test Subj Btn'), String(sBody));
    }

    minimizeCards() {
        const cards = document.getElementsByClassName("card");

        for (let index = 0; index < cards.length; index++) {
            this.minimizeCard(cards[index]);
        }
    }

    minimizeCard(element) {
        const el = element.closest(".card");

        const ch = el.clientHeight,
            sh = el.scrollHeight,
            isCollapsed = ch < 40,
            noHeightSet = el.style.height < 40;

        el.style.height = (isCollapsed || noHeightSet ? '100%' : '36px');
        if (noHeightSet) return this.minimizeCard(element);
    }

    // HERE This one to be updated as it does not work if data in DB is the TEXT
    generateOptionsForSelect(selectId, enumObject) {
        // ex: generateOptionsForSelect(generalSetup.coinPair,coinPairEnum)
        const select = document.getElementById(selectId);

        let option;
        for (const key in enumObject) {
            option = document.createElement("option");
            option.value = key;
            option.text = enumObject[key];
            select.options.add(option);
        }
    }

    async loadDataFromDb() {
        try {
            this.setUpTradeHistory();
            await ApplicationService.getGeneralSetup();
            await ApplicationService.getBuySetup();
            await ApplicationService.getSellSetup();
            await ApplicationService.getOverallReport();
            await ApplicationService.getAppSetup();
            await ApplicationService.getTradingHistory(this.tradeHistoryOptions);

            generalSetupForm = FormHelper.setupForm(generalSetup, 'generalSetup');
            sellSetupForm = FormHelper.setupForm(sellSetup, 'sellSetup');
            buy1SetupForm = FormHelper.setupForm(buySetupList.items[0], 'buy1Setup');
            buy2SetupForm = FormHelper.setupForm(buySetupList.items[1], 'buy2Setup');
            buy3SetupForm = FormHelper.setupForm(buySetupList.items[2], 'buy3Setup');
            overallReportForm = FormHelper.setupForm(overallReport, 'overallReport');
            this.createTradingHistoryTable();

            ThemeHelper.toggleAppStatusBox(appSetup.status);

            SnackBar.showSuccess('Data loaded successfully!');
        }
        catch (ex) {
            SnackBar.showError('Data cannot be loaded!');
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${ex}`);
        }
    }

    createTradingHistoryTable() {
        if (!tradeHistoryList.length) return;

        let table = document.getElementById('orderHistoryTable');
        table.innerHTML = '';

        // Loop through the JSON data and create table rows
        tradeHistoryList.reverse().forEach((item) => {
            this.addRowToTradingHistoryTable(item);
        });
    }

    addRowToTradingHistoryTable(item) {
        let table = document.getElementById('orderHistoryTable');

        // Get the values of the current object in the JSON data
        let cols = Object.keys(item).filter(k => k !== 'universalTime');//.map(key => key.toLocaleUpperCase());
        let row;
        if (!table.innerHTML) {
            row = table.insertRow(0);

            cols.forEach(col => {
                let th = document.createElement("th");
                if (col === 'id') { col = 'ID'; }
                if (col === 'coinPair') { col = 'Coin Pair'; }
                if (col === 'date') { col = 'Date'; }
                if (col === 'time') { col = 'Time'; }
                if (col === 'type') { col = 'Type'; }
                if (col === 'priceActual') { col = `Price Actual (${generalSetup.currency})`; }
                if (col === 'priceExpected') { col = `Price Expected (${generalSetup.currency})`; }
                if (col === 'filled') { col = `Filled (${generalSetup.coin})`; }
                if (col === 'fee') { col = `Fee (${generalSetup.currency})`; }
                if (col === 'tradeSpent') { col = `Trade Spent (${generalSetup.currency})`; }
                if (col === 'balance') { col = `Balance (${generalSetup.currency})`; }
                if (col === 'totalCoins') { col = `Total Coins (${generalSetup.coin})`; }
                if (col === 'averageBuyPrice') { col = `Average Buy Price (${generalSetup.currency})`; }
                if (col === 'lastBuyPrice') { col = `Last Buy Price (${generalSetup.currency})`; }
                if (col === 'priceChangeLastBuy') { col = 'Price Change Last Buy (%)'; }
                if (col === 'priceChangeAverageBuy') { col = 'Price Change Average Buy (%)'; }
                if (col === 'peakBottomChange') { col = 'Peak/Bottom Change (%)'; }
                if (col === 'buy1Counter') { col = 'Buy 1 Counter'; }
                if (col === 'buy2Counter') { col = 'Buy 2 Counter'; }
                if (col === 'buy3Counter') { col = 'Buy 3 Counter'; }

                th.innerText = col; // Set the column name as the text of the header cell
                row.appendChild(th); // Append the header cell to the header row
            });
        }

        // Delete last row from Table
        let tbodyRowCount = table.tBodies[0].rows.length;
        if (tbodyRowCount > tradeHistoryLatestRowNo.value) {
            table.deleteRow(tradeHistoryLatestRowNo.value);
        }

        // Insert new row to Table
        row = table.insertRow(1);

        // Loop through the values and create table cells
        cols.forEach((elem) => {
            let td = document.createElement("td");
            td.innerText = item[elem]; // Set the value as the text of the table cell
            row.appendChild(td); // Append the table cell to the table row
        });

    }

    async setAppStatus(currentStatus, previousStatus) {
        appSetup.previousStatus = previousStatus;
        appSetup.status = currentStatus;
        // HERE send above two items to Server
        ThemeHelper.toggleAppStatusBox(appSetup.status);
    }

    async tradeHistoryLatestRowsChange() {
        const tradeHistoryFromDateTime = document.getElementById('tradeHistoryFromDateTime');
        this.tradeHistoryOptions.fromDateTime = tradeHistoryFromDateTime.value;
        const tradeHistoryToDateTime = document.getElementById('tradeHistoryToDateTime');
        this.tradeHistoryOptions.toDateTime = tradeHistoryToDateTime.value;
        const tradeHistoryLatestRowNo = document.getElementById('tradeHistoryLatestRowNo');
        this.tradeHistoryOptions.take = tradeHistoryLatestRowNo.value;
        const tradeHistoryHideNA = document.getElementById('tradeHistoryHideNA');
        this.tradeHistoryOptions.hideNA = tradeHistoryHideNA.checked;
        const tradeHistoryHideBP = document.getElementById('tradeHistoryHideBP');
        this.tradeHistoryOptions.hideBP = tradeHistoryHideBP.checked;

        await ApplicationService.getTradingHistory(this.tradeHistoryOptions);
        this.createTradingHistoryTable();
    }

    async init() {
        // clear options in the html and generate them in code with the following function
        this.generateOptionsForSelect('generalSetup.coinPair', coinPairEnum);
        this.generateOptionsForSelect('buy1Setup.priceDropCheck', priceDropCheckEnum);
        this.generateOptionsForSelect('buy2Setup.priceDropCheck', priceDropCheckEnum);
        this.generateOptionsForSelect('buy3Setup.priceDropCheck', priceDropCheckEnum);
        this.generateOptionsForSelect('sellSetup.option', sellOptionEnum);
        // this.generateOptionsForSelect('appSetup.status', appStatusEnum);     // HERE not sure if this is needed as it is not used in a dropdown

        await this.loadDataFromDb();
    }

    setUpTradeHistory() {
        const tradeHistoryFromDateTime = document.getElementById('tradeHistoryFromDateTime');
        tradeHistoryFromDateTime.value = this.tradeHistoryOptions.fromDateTime;
        const tradeHistoryToDateTime = document.getElementById('tradeHistoryToDateTime');
        tradeHistoryToDateTime.value = this.tradeHistoryOptions.toDateTime;
        const tradeHistoryLatestRowNo = document.getElementById('tradeHistoryLatestRowNo');
        tradeHistoryLatestRowNo.value = this.tradeHistoryOptions.take;
    }

    htmlReadySetup() {
        window.onload = async () => { await this.init() };
    }

    async actionConfirmation(confirmMsg, infoMsg) {
        const response = confirm(`Are you sure you want to ${confirmMsg}?`);

        if (response === false) {
            SnackBar.showInfo(`Action Cancelled.`);
            return false;
        }
        else {
            SnackBar.showInfo(`${infoMsg}`);
            return true;
        }
    }

    formatOverallReport() {

        document.getElementById("redDiv").innerHTML = `${new Date().toLocaleDateString("en-GB") || '#'} - ${new Date().toLocaleTimeString("en-GB") || '#'} : ${generalSetup.coin} : ${overallReport.priceNow} ${generalSetup.currency}`;

        const inputBudgetDifference = document.getElementById('overallReport.budgetDifference');
        const inputPriceChangeLastBuy = document.getElementById('overallReport.priceChangeLastBuy');
        const inputPriceChangeAveragePrice = document.getElementById('overallReport.priceChangeAveragePrice');
        const inputUnrealisedGain = document.getElementById('overallReport.unrealisedGain');
        const inputWaitRoundsAfterSellCounter = document.getElementById('overallReport.waitRoundsAfterSellCounter');
        const labelTotalTradeSpent = document.getElementById('overallReport.totalTradeSpentLabel');
        const labelPriceLastBuyLabel = document.getElementById('overallReport.priceLastBuyLabel');
        const labelSellTargetPriceLabel = document.getElementById('overallReport.sellTargetPriceLabel');

        if (overallReport.totalCoins === 0) {
            labelTotalTradeSpent.innerHTML = "Total Sold / Trade Profit";
            labelPriceLastBuyLabel.innerHTML = "Last Sell Price / Change";
            labelSellTargetPriceLabel.innerHTML = "Buy Target Price / Unrealised Gain";
        }
        else {
            labelTotalTradeSpent.innerHTML = "Total Traded / Last Trade Spent";
            labelPriceLastBuyLabel.innerHTML = "Last Buy Price / Change";
            labelSellTargetPriceLabel.innerHTML = "Sell Target Price / Unrealised Gain";
        }

        if (overallReport.budgetDifference < 0) { inputBudgetDifference.style.color = '#f6465d'; }
        else { inputBudgetDifference.style.color = '#0ecb83'; }

        if (overallReport.priceChangeLastBuy < 0) { inputPriceChangeLastBuy.style.color = '#f6465d'; }
        else { inputPriceChangeLastBuy.style.color = '#0ecb83'; }

        if (overallReport.priceChangeAveragePrice < 0) { inputPriceChangeAveragePrice.style.color = '#f6465d'; }
        else { inputPriceChangeAveragePrice.style.color = '#0ecb83'; }

        if (overallReport.unrealisedGain < 0) { inputUnrealisedGain.style.color = '#f6465d'; }
        else { inputUnrealisedGain.style.color = '#0ecb83'; }

        if (overallReport.waitRoundsAfterSellCounter > 0) {
            inputWaitRoundsAfterSellCounter.style.color = 'blue';
            inputWaitRoundsAfterSellCounter.style.backgroundColor = 'yellow';
        }
        else {
            inputWaitRoundsAfterSellCounter.style.color = 'white';
            inputWaitRoundsAfterSellCounter.style.backgroundColor = 'black';
        }
    }

    formatBuyFixedAmountBox() {

        const inputBuy1SetupAmountFixed1 = document.getElementById('buy1Setup.amountFixed1');
        const inputBuy1SetupAmountFixed2 = document.getElementById('buy1Setup.amountFixed2');
        const inputBuy1SetupAmountFixed3 = document.getElementById('buy1Setup.amountFixed3');
        const inputBuy1SetupAmountFixed4 = document.getElementById('buy1Setup.amountFixed4');
        const inputBuy1SetupAmountFixed5 = document.getElementById('buy1Setup.amountFixed5');
        const inputBuy2SetupAmountFixed1 = document.getElementById('buy2Setup.amountFixed1');
        const inputBuy2SetupAmountFixed2 = document.getElementById('buy2Setup.amountFixed2');
        const inputBuy2SetupAmountFixed3 = document.getElementById('buy2Setup.amountFixed3');
        const inputBuy2SetupAmountFixed4 = document.getElementById('buy2Setup.amountFixed4');
        const inputBuy2SetupAmountFixed5 = document.getElementById('buy2Setup.amountFixed5');
        const inputBuy3SetupAmountFixed1 = document.getElementById('buy3Setup.amountFixed1');
        const inputBuy3SetupAmountFixed2 = document.getElementById('buy3Setup.amountFixed2');
        const inputBuy3SetupAmountFixed3 = document.getElementById('buy3Setup.amountFixed3');
        const inputBuy3SetupAmountFixed4 = document.getElementById('buy3Setup.amountFixed4');
        const inputBuy3SetupAmountFixed5 = document.getElementById('buy3Setup.amountFixed5');

        if (overallReport.roundCounterBuy1 > 0) { inputBuy1SetupAmountFixed1.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy1 > 1) { inputBuy1SetupAmountFixed2.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy1 > 2) { inputBuy1SetupAmountFixed3.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy1 > 3) { inputBuy1SetupAmountFixed4.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy1 > 4) { inputBuy1SetupAmountFixed5.style.backgroundColor = '#505152'; };

        if (overallReport.roundCounterBuy2 > 0) { inputBuy2SetupAmountFixed1.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy2 > 1) { inputBuy2SetupAmountFixed2.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy2 > 2) { inputBuy2SetupAmountFixed3.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy2 > 3) { inputBuy2SetupAmountFixed4.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy2 > 4) { inputBuy2SetupAmountFixed5.style.backgroundColor = '#505152'; };

        if (overallReport.roundCounterBuy3 > 0) { inputBuy3SetupAmountFixed1.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy3 > 1) { inputBuy3SetupAmountFixed2.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy3 > 2) { inputBuy3SetupAmountFixed3.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy3 > 3) { inputBuy3SetupAmountFixed4.style.backgroundColor = '#505152'; };
        if (overallReport.roundCounterBuy3 > 4) { inputBuy3SetupAmountFixed5.style.backgroundColor = '#505152'; };

        if (overallReport.roundCounterBuy1 === 0) {
            inputBuy1SetupAmountFixed1.style.backgroundColor = '';
            inputBuy1SetupAmountFixed2.style.backgroundColor = '';
            inputBuy1SetupAmountFixed3.style.backgroundColor = '';
            inputBuy1SetupAmountFixed4.style.backgroundColor = '';
            inputBuy1SetupAmountFixed5.style.backgroundColor = '';
        };
        if (overallReport.roundCounterBuy2 === 0) {
            inputBuy2SetupAmountFixed1.style.backgroundColor = '';
            inputBuy2SetupAmountFixed2.style.backgroundColor = '';
            inputBuy2SetupAmountFixed3.style.backgroundColor = '';
            inputBuy2SetupAmountFixed4.style.backgroundColor = '';
            inputBuy2SetupAmountFixed5.style.backgroundColor = '';
        };
        if (overallReport.roundCounterBuy3 === 0) {
            inputBuy3SetupAmountFixed1.style.backgroundColor = '';
            inputBuy3SetupAmountFixed2.style.backgroundColor = '';
            inputBuy3SetupAmountFixed3.style.backgroundColor = '';
            inputBuy3SetupAmountFixed4.style.backgroundColor = '';
            inputBuy3SetupAmountFixed5.style.backgroundColor = '';
        };

    }
}