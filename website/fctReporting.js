// exportAsCSV
function exportAsCSV(sCoinPair) {
    var currentDate = new Date();
    let xDate = currentDate.toLocaleDateString("en-GB");
    let xTime = currentDate.toLocaleTimeString("en-GB");

    try {
        let csvHead = ["No.", "Coin Pair", "Date", "Time", "Type", "Price", "Filled", "Fee", "Trade Spent", "Balance", "Total Coins", "Avg Buy Price", "Last Buy Price", "Price Change LB", "Price Change AB", "Peak Bottom Change", "Buy 1 Cnt", "Buy 2 Cnt", "Buy 3 Cnt"];
        let csvArray = [];
        let csvArrItems = csvArray.push(csvHead);

        for (var i = 1; i < maxNumberOfRows; i++) {
            // if ((tradeHistory.coinPair[i] === undefined) || (tradeHistory.coinPair[i] === 0)) { break; }
            if ((tradeHistory.coinPair[i])) {       // HERE error given when tradeHistory.coinPair[i] === undefined
                let csvRow = [i, tradeHistory.coinPair[i], tradeHistory.date[i], tradeHistory.time[i], tradeHistory.type[i], tradeHistory.price[i], tradeHistory.filled[i],
                    tradeHistory.fee[i], tradeHistory.tradeSpent[i], tradeHistory.balance[i], tradeHistory.totalCoins[i], tradeHistory.averageBuyPrice[i], tradeHistory.lastBuyPrice[i],
                    tradeHistory.priceChangeLastBuy[i], tradeHistory.priceChangeAverageBuy[i], tradeHistory.peakBottomChange[i], tradeHistory.buy1Counter[i], tradeHistory.buy2Counter[i], tradeHistory.buy3Counter[i]];
                csvArrItems = csvArray.push(csvRow);
            }
            else { break; }
        }

        var blob = new Blob([CSV.serialize(csvArray)], { type: "text/csv" });

        var url = window.URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `Export_Data_${sCoinPair}_${xDate}_${xTime}.csv`;

        anchor.click();
        window.URL.revokeObjectURL(url);
        anchor.remove();
    } catch (error) {
        console.log(`${new Date().toLocaleDateString("en-GB")} - ${new Date().toLocaleTimeString("en-GB")} : Error Exporting CSV : ${error}`);
        // throw error;
    }

}