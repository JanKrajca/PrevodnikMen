// =====================================================================
// settings.js – Inicializace stránky nastavení (nastaveni.html)
// Obsahuje: propojení všech přepínačů a tlačítek nastavení s jejich funkcemi
// =====================================================================

// Inicializuje všechny ovládací prvky stránky nastavení
// Volá se z main.js pouze tehdy, když je aktuální stránka 'nastaveni.html'
function initSettingsPage() {
    // Získá reference na všechny interaktivní elementy stránky nastaveni.html
    const darkToggle    = document.getElementById('darkModeToggle');        // Přepínač tmavého režimu
    const offlineToggle = document.getElementById('offlineModeToggle');     // Přepínač offline režimu
    const refreshBtn    = document.getElementById('refreshRatesButton');    // Tlačítko pro obnovení kurzů
    const exportBtn     = document.getElementById('exportDataButton');      // Tlačítko pro export dat
    const importBtn     = document.getElementById('importDataButton');      // Tlačítko pro import dat
    const resetBtn      = document.getElementById('resetAllButton');        // Tlačítko pro reset všeho
    const saveDefaultsBtn = document.getElementById('saveDefaultsButton'); // Tlačítko pro uložení výchozích měn
    const defaultFrom   = document.getElementById('defaultFromCurrency');   // Select výchozí zdrojové měny
    const defaultTo     = document.getElementById('defaultToCurrency');     // Select výchozí cílové měny

    // Synchronizuje vizuální stav přepínače tmavého režimu s aktuálním tématem
    // (téma mohlo být změněno přes localStorage před načtením stránky)
    if (darkToggle) {
        // document.body.classList.contains() vrátí true, pokud <body> má třídu 'dark-mode'
        // Nastaví checked na true (přepínač zapnut) nebo false (přepínač vypnut)
        darkToggle.checked = document.body.classList.contains('dark-mode');
        // Samotný event listener pro přepínání tématu je registrován v ui.js (applyTheme)
    }

    // Propojí přepínač offline režimu s globální proměnnou offlineMode
    if (offlineToggle) {
        offlineToggle.checked = offlineMode; // Nastaví vizuální stav podle globální proměnné

        // Při změně přepínače aktualizuje globální stav a localStorage
        offlineToggle.addEventListener('change', () => {
            offlineMode = offlineToggle.checked; // Přepne globální příznak (true/false)
            localStorage.setItem('offline_mode', offlineMode); // Uloží jako 'true' nebo 'false'

            // Aktualizuje informativní text stavu v UI
            updateCacheStatus(offlineMode ? 'Offline režim' : 'Online režim'); // Ternární operátor
        });
    }

    // Tlačítko „Aktualizovat kurzy" – vynutí okamžité stažení čerstvých kurzů z API
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            // Pokusí se zjistit aktuálně vybranou měnu z převodníku (může být null na jiné stránce)
            const fromSelect = document.getElementById('fromCurrency');
            const baseCurrency = fromSelect ? fromSelect.value : 'USD'; // Fallback na USD

            // Asynchronně stáhne kurzy a počká na dokončení
            await fetchExchangeRates(baseCurrency); // Definováno v api.js

            // Informuje uživatele o dokončení aktualizace
            alert('Kurzy byly aktualizovány');
        });
    }

    // Tlačítko „Exportovat data" – spustí stahování JSON zálohy
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData); // exportData() definovaná v utils.js
    }

    // Tlačítko „Importovat data" – otevře systémový dialog pro výběr souboru
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            // Simuluje kliknutí na skrytý <input type="file"> element
            // Přímé kliknutí na input je ošklivé UI, proto se používá tento vzor
            document.getElementById('importFile').click();
        });

        // Samotné zpracování souboru se řeší na události 'change' skrytého input elementu
        const importFile = document.getElementById('importFile');
        if (importFile) {
            // Jakmile uživatel vybere soubor, zavolá se importData() z utils.js
            importFile.addEventListener('change', importData);
        }
    }

    // Tlačítko „Resetovat vše" – po potvrzení smaže všechna data aplikace
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll); // resetAll() definovaná v utils.js
    }

    // Sekce výchozích měn – načte a uloží preferované výchozí měny pro převodník
    if (saveDefaultsBtn && defaultFrom && defaultTo) {
        // Pokusí se obnovit dříve uložené výchozí měny z localStorage
        const savedFrom = localStorage.getItem('default_from_currency'); // 'USD', 'EUR' atd. nebo null
        const savedTo   = localStorage.getItem('default_to_currency');

        // Pokud uložené výchozí měny existují, předvyplní selectboxy
        if (savedFrom) defaultFrom.value = savedFrom;
        if (savedTo)   defaultTo.value   = savedTo;

        // Tlačítko „Uložit výchozí měny" uloží aktuálně vybrané hodnoty do localStorage
        saveDefaultsBtn.addEventListener('click', () => {
            localStorage.setItem('default_from_currency', defaultFrom.value); // Uloží kód zdrojové měny
            localStorage.setItem('default_to_currency', defaultTo.value);     // Uloží kód cílové měny
            alert('Výchozí měny byly uloženy'); // Potvrzení uložení
        });
    }
}
