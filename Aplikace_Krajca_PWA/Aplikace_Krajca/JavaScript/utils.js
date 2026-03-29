// Aktualizace zobrazení
function updateLastUpdateDisplay() {
    const lastUpdateSpan = document.getElementById('lastUpdate');
    if (lastUpdateTime && lastUpdateSpan) {
        lastUpdateSpan.textContent = `Poslední aktualizace: ${lastUpdateTime.toLocaleTimeString('cs-CZ')}`;
    }
}

function updateCacheStatus(message) {
    const cacheStatus = document.getElementById('cacheStatus');
    if (cacheStatus) {
        cacheStatus.textContent = message;
    }
}

// Demo kurzy
function setDemoRates() {
    exchangeRates = {
        'USD': 1, 'EUR': 0.92, 'CZK': 22.5, 'GBP': 0.79, 'JPY': 148.5,
        'CAD': 1.35, 'AUD': 1.52, 'CHF': 0.88, 'CNY': 7.18, 'PLN': 3.98,
        'HUF': 361.5, 'NOK': 10.65, 'SEK': 10.48, 'DKK': 6.89, 'RUB': 91.5,
        'TRY': 32.15, 'BRL': 5.02, 'INR': 83.5, 'KRW': 1335, 'MXN': 16.85
    };
    lastUpdateTime = new Date();
    updateCacheStatus('Demo kurzy');
}

// Export dat
function exportData() {
    const data = {
        history: conversionHistory,
        settings: {
            theme: localStorage.getItem('theme'),
            offline_mode: localStorage.getItem('offline_mode'),
            default_from: localStorage.getItem('default_from_currency'),
            default_to: localStorage.getItem('default_to_currency')
        }
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `currency_converter_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import dat
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.history) {
                conversionHistory = data.history;
                localStorage.setItem('conversion_history', JSON.stringify(conversionHistory));
            }
            if (data.settings) {
                if (data.settings.theme) localStorage.setItem('theme', data.settings.theme);
                if (data.settings.offline_mode) localStorage.setItem('offline_mode', data.settings.offline_mode);
                if (data.settings.default_from) localStorage.setItem('default_from_currency', data.settings.default_from);
                if (data.settings.default_to) localStorage.setItem('default_to_currency', data.settings.default_to);
            }
            alert('Data byla úspěšně importována');
            window.location.reload();
        } catch (error) {
            alert('Chyba při importu dat');
        }
    };
    reader.readAsText(file);
}

// Reset všeho
function resetAll() {
    if (confirm('Opravdu chcete resetovat všechna data? Tuto akci nelze vrátit zpět.')) {
        localStorage.clear();
        conversionHistory = [];
        exchangeRates = null;
        offlineMode = false;
        alert('Všechna data byla resetována');
        window.location.reload();
    }
}