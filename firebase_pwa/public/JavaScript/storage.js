// =============================================================================
// storage.js – Práce s daty uloženými v localStorage
// Tento soubor řeší persistence dat mezi návštěvami: kurzy, historii, nastavení.
// localStorage je synchronní key-value úložiště prohlížeče, data přežijí restart.
// =============================================================================

// -----------------------------------------------------------------------------
// loadPersistentData()
//
// CO: Při startu aplikace obnoví všechna uložená data z localStorage do paměti.
//
// JAK: Prochází jednotlivé klíče v localStorage a dekóduje JSON zpět na objekty.
//      Volá se v main.js jako jedno z prvních volání po načtení stránky.
//
// PROČ takhle brzy: Ostatní funkce (applyTheme, renderHistory...) potřebují
//      data v globálních proměnných ještě před tím, než se vykreslí UI.
// -----------------------------------------------------------------------------
function loadPersistentData() {
    // --- Téma (světlé/tmavé) ---
    // Přidáváme třídu na <html> i <body>, protože dark-mode CSS pravidla
    // cílí na oba elementy (kvůli přechodu bez bliknutí při načtení stránky)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
    }

    // --- Offline režim ---
    // localStorage ukládá vždy string, proto porovnáváme s řetězcem 'true'
    const savedOffline = localStorage.getItem('offline_mode');
    if (savedOffline === 'true') {
        offlineMode = true;
        // Pokud existuje toggle na stránce nastavení, synchronizujeme jeho stav
        const offlineToggle = document.getElementById('offlineModeToggle');
        if (offlineToggle) offlineToggle.checked = true;
    }

    // --- Historie převodů ---
    // Uložena jako JSON string, musíme parsovat zpět na pole objektů.
    // try/catch chrání před případným poškozením dat v localStorage.
    const savedHistory = localStorage.getItem('conversion_history');
    if (savedHistory) {
        try {
            conversionHistory = JSON.parse(savedHistory);
        } catch (e) {
            // Poškozená data – začneme s prázdnou historií
            conversionHistory = [];
        }
    }

    // --- Uložené kurzy ---
    // Kurzy si pamatujeme pro případ výpadku internetu nebo offline režimu.
    // Timestamp slouží k zobrazení "Poslední aktualizace: 12:34" v UI.
    const savedRates = localStorage.getItem('exchange_rates');
    const savedTime = localStorage.getItem('rates_timestamp');
    if (savedRates && savedTime) {
        try {
            exchangeRates = JSON.parse(savedRates);
            // parseInt převede string timestamp na číslo, new Date() z něj udělá objekt
            lastUpdateTime = new Date(parseInt(savedTime));
            updateLastUpdateDisplay(); // zobrazí čas v UI (definováno v utils.js)
        } catch (e) {
            // Poškozené kurzy ignorujeme – api.js je načte znovu ze sítě
        }
    }
}

// -----------------------------------------------------------------------------
// saveToHistory(amount, fromCurr, converted, toCurr, rate)
//
// CO: Přidá nový záznam o provedeném převodu na začátek pole historie.
//
// JAK: Vytvoří objekt s daty převodu, vloží ho na index 0 (unshift = přidání
//      na začátek, novější záznamy jsou nahoře), ořízne pole na max 50 položek
//      a uloží do localStorage.
//
// PROČ max 50: Omezení zabraňuje neomezenému růstu dat v localStorage,
//      který má limit ~5MB. 50 záznamů je dostatečné pro běžné použití.
// -----------------------------------------------------------------------------
function saveToHistory(amount, fromCurr, converted, toCurr, rate) {
    const historyItem = {
        id: Date.now(),        // unikátní ID = aktuální timestamp v ms
        amount: amount,        // původní částka
        from: fromCurr,        // zdrojová měna (např. 'EUR')
        converted: converted,  // převedená částka
        to: toCurr,            // cílová měna (např. 'CZK')
        rate: rate,            // použitý kurz (pro informaci uživatele)
        date: new Date().toISOString() // ISO 8601 formát, snadno parsovatelný
    };

    // unshift přidá na začátek – novější záznamy budou vždy nahoře v historii
    conversionHistory.unshift(historyItem);

    // Oříznutí na 50 položek – slice vrátí nové pole, nemodifikuje originál
    if (conversionHistory.length > 50) conversionHistory = conversionHistory.slice(0, 50);

    // Uložení do localStorage – JSON.stringify převede pole na řetězec
    localStorage.setItem('conversion_history', JSON.stringify(conversionHistory));
}

// -----------------------------------------------------------------------------
// clearHistory()
//
// CO: Smaže celou historii převodů po potvrzení uživatelem.
//
// PROČ confirm(): Mazání je nevratná akce – dáme uživateli šanci si to rozmyslet.
//      Po potvrzení vymažeme data z paměti i localStorage a překreslíme UI.
// -----------------------------------------------------------------------------
function clearHistory() {
    if (confirm('Opravdu chcete vymazat celou historii převodů?')) {
        conversionHistory = [];
        localStorage.setItem('conversion_history', JSON.stringify(conversionHistory));
        renderHistory(); // překreslí seznam (zobrazí prázdný stav), definováno v ui.js
    }
}