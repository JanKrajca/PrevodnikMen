// =============================================================================
// settings.js – Inicializace stránky nastavení
// Připojuje listenery na všechny ovládací prvky v nastaveni.html a synchronizuje
// jejich stav s aktuálními hodnotami z localStorage / globálních proměnných.
// =============================================================================

// -----------------------------------------------------------------------------
// initSettingsPage()
//
// CO: Inicializuje celou stránku nastavení – nastaví počáteční stavy toggleů
//     a připojí event listenery na všechna tlačítka a přepínače.
//
// JAK: Nejdřív načte reference na všechny DOM elementy, pak každý nakonfiguruje
//     zvlášť. Listener se přidává jen pokud element existuje (obrana před null).
//
// Volá ji main.js po detekci nastaveni.html v URL.
// -----------------------------------------------------------------------------
function initSettingsPage() {
    // Načteme reference na všechny ovládací prvky nastavení
    const darkToggle = document.getElementById('darkModeToggle');
    const offlineToggle = document.getElementById('offlineModeToggle');
    const refreshBtn = document.getElementById('refreshRatesButton');
    const exportBtn = document.getElementById('exportDataButton');
    const importBtn = document.getElementById('importDataButton');
    const resetBtn = document.getElementById('resetAllButton');
    const saveDefaultsBtn = document.getElementById('saveDefaultsButton');
    const defaultFrom = document.getElementById('defaultFromCurrency');
    const defaultTo = document.getElementById('defaultToCurrency');

    // --- Tmavý režim ---
    // Synchronizujeme stav checkboxu s aktuálním stavem UI.
    // body.classList.contains() je spolehlivější než čtení localStorage,
    // protože třída mohla být přidána skriptem v <head> ještě před DOMContentLoaded.
    if (darkToggle) {
        darkToggle.checked = document.body.classList.contains('dark-mode');
        // Listener pro přepínání tématu je přidán v applyTheme() v ui.js,
        // tady jen nastavujeme počáteční stav checkboxu
    }

    // --- Offline režim ---
    // offlineMode je globální proměnná z config.js, nastavená v loadPersistentData()
    if (offlineToggle) {
        offlineToggle.checked = offlineMode;
        offlineToggle.addEventListener('change', () => {
            offlineMode = offlineToggle.checked; // aktualizujeme globální stav
            localStorage.setItem('offline_mode', offlineMode); // persistujeme
            // Informujeme uživatele o aktuálním stavu v textu pod přepínačem
            updateCacheStatus(offlineMode ? 'Offline režim' : 'Online režim');
        });
    }

    // --- Aktualizace kurzů ---
    // Tlačítko manuálně spustí nové načtení kurzů z API bez čekání na změnu měny.
    // Záměrně ignorujeme offline režim – tlačítko by mělo být způsob jak ho obejít.
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            // Na stránce nastavení select fromCurrency neexistuje,
            // použijeme USD jako výchozí základní měnu pro API
            const fromSelect = document.getElementById('fromCurrency');
            const baseCurrency = fromSelect ? fromSelect.value : 'USD';
            await fetchExchangeRates(baseCurrency); // api.js
            alert('Kurzy byly aktualizovány');
        });
    }

    // --- Export dat ---
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData); // utils.js
    }

    // --- Import dat ---
    // Import funguje přes skrytý <input type="file"> – programatické kliknutí
    // na něj otevře dialog pro výběr souboru bez nutnosti viditelného file inputu.
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            document.getElementById('importFile').click(); // otevře dialog výběru souboru
        });
        const importFile = document.getElementById('importFile');
        if (importFile) {
            // 'change' event se spustí po výběru souboru uživatelem
            importFile.addEventListener('change', importData); // utils.js
        }
    }

    // --- Reset všeho ---
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll); // utils.js
    }

    // --- Výchozí měny ---
    // Načteme a zobrazíme uložené výchozí měny, pokud existují.
    // Tyto hodnoty přepíší výchozí EUR/CZK při příštím spuštění převodníku.
    if (saveDefaultsBtn && defaultFrom && defaultTo) {
        const savedFrom = localStorage.getItem('default_from_currency');
        const savedTo = localStorage.getItem('default_to_currency');
        if (savedFrom) defaultFrom.value = savedFrom; // nastavíme uložený výběr v selectu
        if (savedTo) defaultTo.value = savedTo;

        saveDefaultsBtn.addEventListener('click', () => {
            // Uložíme aktuálně vybrané hodnoty jako výchozí pro převodník
            localStorage.setItem('default_from_currency', defaultFrom.value);
            localStorage.setItem('default_to_currency', defaultTo.value);
            alert('Výchozí měny byly uloženy');
        });
    }
}
