// Inicializace nastavení
function initSettingsPage() {
    const darkToggle = document.getElementById('darkModeToggle');
    const offlineToggle = document.getElementById('offlineModeToggle');
    const refreshBtn = document.getElementById('refreshRatesButton');
    const exportBtn = document.getElementById('exportDataButton');
    const importBtn = document.getElementById('importDataButton');
    const resetBtn = document.getElementById('resetAllButton');
    const saveDefaultsBtn = document.getElementById('saveDefaultsButton');
    const defaultFrom = document.getElementById('defaultFromCurrency');
    const defaultTo = document.getElementById('defaultToCurrency');

    if (darkToggle) {
        darkToggle.checked = document.body.classList.contains('dark-mode');
    }

    if (offlineToggle) {
        offlineToggle.checked = offlineMode;
        offlineToggle.addEventListener('change', () => {
            offlineMode = offlineToggle.checked;
            localStorage.setItem('offline_mode', offlineMode);
            updateCacheStatus(offlineMode ? 'Offline režim' : 'Online režim');
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            const fromSelect = document.getElementById('fromCurrency');
            const baseCurrency = fromSelect ? fromSelect.value : 'USD';
            await fetchExchangeRates(baseCurrency);
            alert('Kurzy byly aktualizovány');
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    if (importBtn) {
        importBtn.addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', importData);
        }
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll);
    }

    if (saveDefaultsBtn && defaultFrom && defaultTo) {
        const savedFrom = localStorage.getItem('default_from_currency');
        const savedTo = localStorage.getItem('default_to_currency');
        if (savedFrom) defaultFrom.value = savedFrom;
        if (savedTo) defaultTo.value = savedTo;

        saveDefaultsBtn.addEventListener('click', () => {
            localStorage.setItem('default_from_currency', defaultFrom.value);
            localStorage.setItem('default_to_currency', defaultTo.value);
            alert('Výchozí měny byly uloženy');
        });
    }
}