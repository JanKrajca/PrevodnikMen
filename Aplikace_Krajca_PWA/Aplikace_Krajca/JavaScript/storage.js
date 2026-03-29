// =====================================================================
// storage.js – Správa persistentních dat v localStorage
// Obsahuje: načtení uložených dat při startu, ukládání a mazání historie
// =====================================================================

// Načte všechna persistentní data uložená v localStorage a aplikuje je do globálního stavu
// Volá se jako první věc při startu aplikace (viz main.js), aby bylo vše dostupné okamžitě
function loadPersistentData() {
    // --- Téma (světlé / tmavé) ---
    const savedTheme = localStorage.getItem('theme'); // Vrátí 'dark', 'light' nebo null

    // Pokud bylo uloženo tmavé téma, přidá CSS třídu 'dark-mode' na <html> i <body>
    // Tím se okamžitě aplikují pravidla .dark-mode z style.css bez čekání na JS
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode'); // <html> – pro okamžitý efekt před DOMContentLoaded
        document.body.classList.add('dark-mode');            // <body> – pro CSS selektory v style.css
    }

    // --- Offline režim ---
    const savedOffline = localStorage.getItem('offline_mode'); // 'true' nebo null

    // localStorage ukládá vždy řetězce, proto porovnáváme s řetězcem 'true', ne s boolenem
    if (savedOffline === 'true') {
        offlineMode = true; // Nastaví globální příznak (definovaný v config.js)

        // Pokud je na stránce přepínač offline režimu (stránka nastaveni.html), vizuálně ho zaškrtne
        const offlineToggle = document.getElementById('offlineModeToggle');
        if (offlineToggle) offlineToggle.checked = true;
    }

    // --- Historie převodů ---
    const savedHistory = localStorage.getItem('conversion_history'); // JSON řetězec nebo null

    // Pokud existují uložená data, parsujeme je zpět na pole objektů
    if (savedHistory) {
        try {
            conversionHistory = JSON.parse(savedHistory); // Naplní globální pole (z config.js)
        } catch (e) {
            // Pokud jsou data poškozená (nevalidní JSON), resetujeme historii na prázdné pole
            // bez try/catch by JSON.parse hodil výjimku a přerušil načítání celé stránky
            conversionHistory = [];
        }
    }

    // --- Uložené kurzy a čas jejich poslední aktualizace ---
    const savedRates = localStorage.getItem('exchange_rates');  // JSON řetězec kurzů nebo null
    const savedTime = localStorage.getItem('rates_timestamp'); // Číslo (Unix ms) jako řetězec nebo null

    // Obě hodnoty musí existovat, aby mělo smysl kurzy obnovovat
    if (savedRates && savedTime) {
        try {
            exchangeRates = JSON.parse(savedRates); // Rekonstruuje objekt kurzů (globální proměnná)

            // parseInt() převede řetězec na číslo, new Date() ho přemění na objekt Date
            lastUpdateTime = new Date(parseInt(savedTime));

            // Zobrazí čas poslední aktualizace v UI (prvek #lastUpdate na index.html)
            updateLastUpdateDisplay(); // Definováno v utils.js
        } catch (e) {
            // Pokud jsou data poškozená, tiše selžeme – kurzy se znovu stáhnou z API
        }
    }
}

// Uloží jeden záznam o provedeném převodu do globálního pole i do localStorage
// Voláno z converter.js po každém úspěšném výpočtu kurzu
// Parametry: amount=vstupní částka, fromCurr=zdrojová měna, converted=výsledná částka,
//            toCurr=cílová měna, rate=použitý kurz
function saveToHistory(amount, fromCurr, converted, toCurr, rate) {
    // Sestaví objekt záznamu – Date.now() jako id zajistí jedinečnost (Unix timestamp v ms)
    const historyItem = {
        id: Date.now(),          // Jedinečný identifikátor záznamu (číslo ms od 1.1.1970)
        amount: amount,          // Původní zadaná částka (číslo)
        from: fromCurr,          // Kód zdrojové měny, např. 'USD'
        converted: converted,    // Vypočtená výsledná částka (číslo)
        to: toCurr,              // Kód cílové měny, např. 'CZK'
        rate: rate,              // Použitý kurz (počet jednotek cílové měny za 1 zdrojové)
        date: new Date().toISOString() // Čas převodu ve formátu ISO 8601 (řetězec, např. '2024-01-15T14:30:00.000Z')
    };

    // Přidá nový záznam na začátek pole (unshift) – nejnovější záznamy budou zobrazeny jako první
    conversionHistory.unshift(historyItem);

    // Omezení délky historie na 50 záznamů – předchází nadměrnému plnění localStorage
    // slice(0, 50) vrátí nové pole s prvními 50 prvky a přepíše původní
    if (conversionHistory.length > 50) conversionHistory = conversionHistory.slice(0, 50);

    // Uloží aktualizované pole do localStorage jako JSON řetězec
    // Přepíše předchozí hodnotu klíče 'conversion_history'
    localStorage.setItem('conversion_history', JSON.stringify(conversionHistory));
}

// Smaže celou historii převodů po potvrzení uživatelem
// Volá se kliknutím na tlačítko „Vymazat vše" na stránce historie.html
function clearHistory() {
    // Nativní potvrzovací dialog – vrací true (OK) nebo false (Zrušit)
    if (confirm('Opravdu chcete vymazat celou historii převodů?')) {
        conversionHistory = []; // Vyprázdní globální pole v paměti

        // Přepíše localStorage prázdným polem – []  (nelze použít removeItem, data by mohla zůstat)
        localStorage.setItem('conversion_history', JSON.stringify(conversionHistory));

        // Znovu vykreslí (přepíše) sekci historie v DOM – ukáže prázdný stav
        renderHistory(); // Definováno v ui.js
    }
}
