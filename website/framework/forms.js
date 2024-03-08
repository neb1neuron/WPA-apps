let generalSetupForm;
let sellSetupForm;
let buy1SetupForm;
let buy2SetupForm;
let buy3SetupForm;
let overallReportForm;

let formNames = {
    generalSetup: 'generalSetup',
    sellSetup: 'sellSetup',
    buy1Setup: 'buy1Setup',
    buy2Setup: 'buy2Setup',
    buy3Setup: 'buy3Setup',
    overallReport: 'overallReport'
};

let forms = {
    generalSetup: generalSetupForm,
    sellSetup: sellSetupForm,
    buy1Setup: buy1SetupForm,
    buy2Setup: buy2SetupForm,
    buy3Setup: buy3SetupForm,
    overallReport: overallReportForm,
    any: () => {
        const properties = Object.keys(formNames);
        let result = [];
        properties.forEach(property => {
            result.push(forms[property])
        });
        return result;
    }
}

class FormHelper {

    static setupForm(variable, name) {
        if (!variable) return;
        const form = {
            value: () => {
                const properties = Object.keys(variable);
                let result = {};
                properties.forEach(property => {
                    result[property] = form[property].value;
                });
                return result;
            },
            hasChanges: () => {
                const properties = Object.keys(variable);
                let result = false;
                for (let index = 0; index < properties.length; index++) {
                    const property = properties[index];
                    if (form[property].hasChanges) {
                        result = true;
                        break;
                    }
                }

                return result;
            },
            clearChanges: () => {
                const properties = Object.keys(variable);
                for (let index = 0; index < properties.length; index++) {
                    form[properties[index]].hasChanges = false;
                }

                return true;
            }
        };
        const properties = Object.keys(variable);

        properties.forEach(property => {
            form[property] = (function (el) {
                return {
                    set value(v) {
                        variable[property] = v;
                        if (el.tagName === 'SPAN') {
                            el.innerText = v;
                        } else {
                            el.value = v;
                        }

                        if (el.id === 'generalSetup.coinPair') {
                            const coinAndCurrency = getCoinAndCurrency(el.value);

                            Array.from(document.getElementsByClassName('generalSetup.coin')).forEach(element => {
                                element.innerText = coinAndCurrency.coin;
                            });
                            Array.from(document.getElementsByClassName('generalSetup.currency')).forEach(element => {
                                element.innerText = coinAndCurrency.currency;
                            });
                        }
                    },
                    get value() {
                        if (typeof variable[property] === 'number') {
                            variable[property] = +el.value;
                        }
                        else if (typeof variable[property] === 'boolean') {
                            variable[property] = el.value === 'true' ? true : false;
                        }
                        else {
                            variable[property] = el.value;
                        }

                        if (el.id === 'generalSetup.coinPair') {
                            const coinAndCurrency = getCoinAndCurrency(el.value);
                            form.coin.value = coinAndCurrency.coin;
                            form.currency.value = coinAndCurrency.currency;
                            Array.from(document.getElementsByClassName('generalSetup.coin')).forEach(element => {
                                element.innerText = coinAndCurrency.coin;
                            });
                            Array.from(document.getElementsByClassName('generalSetup.currency')).forEach(element => {
                                element.innerText = coinAndCurrency.currency;
                            });
                        }

                        return variable[property];
                    },
                    set hasChanges(c) {
                        if (c) {
                            el.classList.add('hasChanges');
                        } else {
                            el.classList.remove('hasChanges');
                        }
                    },
                    get hasChanges() {
                        return el.classList.contains('hasChanges');
                    }
                };
            })(document.getElementById(`${name}.${property}`));

            form[property].value = variable[property];
            form[property].originalValue = variable[property];
            form[property].hasChanges = false;

            document.getElementById(`${name}.${property}`).addEventListener('change', this.onChange)
        });

        forms[name] = form;

        return form;
    }

    static onChange(element) {
        // console.log('new value: ', this);

        const splitId = this.id.split('.');
        const formName = splitId[0];
        const property = splitId[1];
        if (forms[formName][property].value !== forms[formName][property].originalValue)
            forms[formName][property].hasChanges = true;
        else {
            forms[formName][property].hasChanges = false;
        }

        // console.log(forms[formName].value());
    }
}

function getCoinAndCurrency(value) {
    const coinAndCurrency = { coin: '', currency: '' };
    if (value.includes('eur')) {
        coinAndCurrency.currency = 'EUR';
        coinAndCurrency.coin = value.replace('eur', '').toLocaleUpperCase();
    }
    else if (value.includes('usdt')) {
        coinAndCurrency.currency = 'USDT';
        coinAndCurrency.coin = value.replace('usdt', '').toLocaleUpperCase();
    }

    return coinAndCurrency;
}