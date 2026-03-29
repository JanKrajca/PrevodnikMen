// Načtení persistentních dat
function loadPersistentData() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
    }

    const savedOffline = localStorage.getItem('offline_mode');
    if (savedOffline === 'true') {
        offlineMode = true;
        const offlineToggle = document.getElementById('offlineModeToggle');
        if (offlineToggle) offlineToggle.checked = true;
    }

    const savedHistory = localStorage.getItem('conversion_history');
    if (savedHistory) {
        try {
            conversionHistory = JSON.parse(savedHistory);
        } catch (e) {
            conversionHistory = [];
        }
    }

    const savedRates = localStorage.getItem('exchange_rates');
    const savedTime = localStorage.getItem('rates_timestamp');
    if (savedRates && savedTime) {
        try {
            exchangeRates = JSON.parse(savedRates);
            lastUpdateTime = new Date(parseInt(savedTime));
            updateLastUpdateDisplay();
        } catch (e) {}
    }
}

// Uložení do historie
function saveToHistory(amount, fromCurr, converted, toCurr, rate) {
    const historyItem = {
        id: Date.now(),
        amount: amount,
        from: fromCurr,
        converted: converted,
        to: toCurr,
        rate: rate,
        date: new Date().toISOString()
    };

    conversionHistory.unshift(historyItem);
    if (conversionHistory.length > 50) conversionHistory = conversionHistory.slice(0, 50);
    localStorage.setItem('conversion_history', JSON.stringify(conversionHistory));
}

// Vymazání historie
function clearHistory() {
    if (confirm('Opravdu chcete vymazat celou historii převodů?')) {
        conversionHistory = [];
        localStorage.setItem('conversion_history', JSON.stringify(conversionHistory));
        renderHistory();
    }
}