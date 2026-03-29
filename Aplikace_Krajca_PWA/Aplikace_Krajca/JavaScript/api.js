// API volání
async function fetchExchangeRates(baseCurrency = 'USD') {
    try {
        if (offlineMode && exchangeRates) {
            updateCacheStatus('Offline režim');
            return true;
        }

        const response = await fetch(`${API_URL}${API_KEY}/latest/${baseCurrency}`);

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        if (data.result === 'success' && data.conversion_rates) {
            exchangeRates = data.conversion_rates;
            lastUpdateTime = new Date();
            localStorage.setItem('exchange_rates', JSON.stringify(exchangeRates));
            localStorage.setItem('rates_timestamp', lastUpdateTime.getTime().toString());
            updateLastUpdateDisplay();
            return true;
        } else {
            throw new Error('Neplatná odpověď');
        }
    } catch (error) {
        console.error('Chyba API:', error);
        if (exchangeRates) {
            updateCacheStatus('Používám uložené kurzy');
            return true;
        } else {
            setDemoRates();
            return false;
        }
    }
}