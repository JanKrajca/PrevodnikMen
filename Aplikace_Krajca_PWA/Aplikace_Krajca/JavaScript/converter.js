async function convertCurrency() {
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const resultValue = document.getElementById('resultValue');
    const resultRate = document.getElementById('resultRate');
    const errorDiv = document.getElementById('errorMessage');

    if (!amountInput || !fromSelect || !toSelect) return;

    let amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        if (resultValue) resultValue.textContent = '0.00';
        if (resultRate) resultRate.textContent = 'Zadejte platnou částku';
        return;
    }

    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    if (fromCurrency === toCurrency) {
        if (resultValue) resultValue.textContent = `${amount.toFixed(2)} ${toCurrency}`;
        if (resultRate) resultRate.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
        return;
    }

    if (!exchangeRates) {
        await fetchExchangeRates(fromCurrency);
        if (!exchangeRates) return;
    }

    let convertedAmount, rate;

    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
        const rateToUSD = 1 / exchangeRates[fromCurrency];
        rate = rateToUSD * exchangeRates[toCurrency];
        convertedAmount = amount * rate;
    } else if (exchangeRates[toCurrency]) {
        rate = exchangeRates[toCurrency];
        convertedAmount = amount * rate;
    } else {
        if (errorDiv) {
            errorDiv.textContent = 'Kurzy nejsou dostupné';
            errorDiv.classList.add('show');
            setTimeout(() => errorDiv.classList.remove('show'), 3000);
        }
        return;
    }

    if (resultValue) resultValue.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`;
    if (resultRate) resultRate.textContent = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;

    saveToHistory(amount, fromCurrency, convertedAmount, toCurrency, rate);

    localStorage.setItem('last_from_currency', fromCurrency);
    localStorage.setItem('last_to_currency', toCurrency);
    localStorage.setItem('last_amount', amount.toString());
}

// Prohození měn
function swapCurrencies(fromSelect, toSelect) {
    const fromValue = fromSelect.value;
    const toValue = toSelect.value;
    fromSelect.value = toValue;
    toSelect.value = fromValue;
    convertCurrency();
}

// Inicializace převodníku
async function initConverterPage() {
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const convertBtn = document.getElementById('convertBtn');
    const swapBtn = document.getElementById('swapBtn');

    if (!amountInput) return;

    const savedFrom = localStorage.getItem('last_from_currency');
    const savedTo = localStorage.getItem('last_to_currency');
    const savedAmount = localStorage.getItem('last_amount');

    if (savedFrom && fromSelect) fromSelect.value = savedFrom;
    if (savedTo && toSelect) toSelect.value = savedTo;
    if (savedAmount && amountInput) amountInput.value = savedAmount;

    await fetchExchangeRates(fromSelect.value);

    if (convertBtn) convertBtn.addEventListener('click', convertCurrency);
    if (swapBtn) swapBtn.addEventListener('click', () => swapCurrencies(fromSelect, toSelect));
    if (fromSelect) fromSelect.addEventListener('change', async () => {
        if (!offlineMode) await fetchExchangeRates(fromSelect.value);
    });
}