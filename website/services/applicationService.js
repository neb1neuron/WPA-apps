export default class ApplicationService {
    static async getPrice(gCoinPair) {
        let xPriceNow;

        // try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${gCoinPair.toUpperCase() || 'SOLUSDT'}`);
        const body = await response.json();

        xPriceNow = Number(body);
        xPriceNow = Number(xPriceNow.toFixed(priceFixedDecimals));
        // }
        // catch (error) {
        //     console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
        // }

        // If result is not valid then set value to previous Price
        if (isNaN(xPriceNow)) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : PriceNow: ${xPriceNow}`);
            xPriceNow = overallReport.priceNow;
        };

        return Number(xPriceNow);
    }

    static async getGeneralSetup() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/general-setup`);
            const content = await rawResponse.json();
            generalSetup = content;

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async sendGeneralSetup() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/general-setup`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(generalSetup)
            });
            const content = await rawResponse.json();

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);      //TO BE UPDATED
            throw error;
        }
    }

    static async getBuySetup() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/buy-setup`);
            const content = await rawResponse.json();
            buySetupList = content;

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async sendBuySetup() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/buy-setup`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(buySetupList.items)
            });
            const content = await rawResponse.json();

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);      //TO BE UPDATED
            throw error;
        }
    }

    static async getSellSetup() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/sell-setup`);
            const content = await rawResponse.json();
            sellSetup = content;

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async sendSellSetup() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/sell-setup`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sellSetup)
            });
            const content = await rawResponse.json();

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);      //TO BE UPDATED
            throw error;
        }
    }

    static async getOverallReport() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/overall-report`);
            const content = await rawResponse.json();
            overallReport = content;

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async getAppSetup() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/app-setup`);
            const content = await rawResponse.json();
            appSetup = content;

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async sendAppSetup() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/app-setup`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appSetup)
            });
            const content = await rawResponse.json();

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);      //TO BE UPDATED
            throw error;
        }
    }

    static async getBudgetCoinsInWallet(data) {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/trading/coin-Balance?gCoin=${data}`);
            const content = await rawResponse.json();
            let dataInWallet = { content: content };

            return dataInWallet;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async getTradingHistory(options) {
        try {
            options.fromDateTime = new Date(options.fromDateTime).getTime();
            options.toDateTime = new Date(options.toDateTime).getTime();

            let url = new URL(`http://localhost:${PORT_SERVER}/v1/app/trade-history`);
            url.search = new URLSearchParams(options).toString();
            const rawResponse = await fetch(url);

            const content = await rawResponse.json();
            tradeHistoryList = content;

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async sendEmail(sSubject, sBody) {
        try {
            const response = await fetch(`http://localhost:${PORT_SERVER}/v1/app/send-email?subject=${sSubject}&body=${sBody}`);
            const body = await response.json();

            return body;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async saveErrorHistory(errorLog) {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/error-log`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorLog)
            });
            const content = await rawResponse.json();

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);      //TO BE UPDATED
            throw error;
        }
    }

    static async startAppExecution() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/start-code-execution`);
            const content = await rawResponse.json();

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async stopAppExecution() {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/app/stop-code-execution`);
            const content = await rawResponse.json();

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async sendInstantBuy(sCoinPair) {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/trading/instant-buy-Now?gCoinPair=${sCoinPair.toLocaleUpperCase()}`);
            const content = await rawResponse.json();

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

    static async sendInstantSell(sCoinPair) {
        try {
            const rawResponse = await fetch(`http://localhost:${PORT_SERVER}/v1/trading/instant-sell-Now?gCoinPair=${sCoinPair.toLocaleUpperCase()}`);
            const content = await rawResponse.json();

            return content;
        }
        catch (error) {
            console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : ${error}`);
            throw error;
        }
    }

}