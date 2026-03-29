// =====================================================================
// api.js – Komunikace s externím API pro získání směnných kurzů
// Obsahuje jedinou funkci, která stáhne kurzy nebo použije záložní data
// =====================================================================

// Asynchronní funkce pro stažení aktuálních kurzů z ExchangeRate-API
// Parametr baseCurrency určuje základní měnu, vůči které jsou kurzy počítány
// Výchozí hodnota je 'USD', pokud volající funkce žádnou nepošle
async function fetchExchangeRates(baseCurrency = 'USD') {
    try {
        // Pokud je aktivní offline režim A kurzy již máme načtené z předchozí session,
        // API se vůbec nevolá – jen se zobrazí informace v UI a funkce vrátí true (= úspěch)
        if (offlineMode && exchangeRates) {
            updateCacheStatus('Offline režim'); // Zobrazí text v nastavení u pole „Stav"
            return true;
        }

        // Sestavení URL a odeslání HTTP GET požadavku na API
        // Výsledná URL vypadá např.: https://v6.exchangerate-api.com/v6/APIKEY/latest/USD
        const response = await fetch(`${API_URL}${API_KEY}/latest/${baseCurrency}`);

        // Pokud server vrátil chybový HTTP kód (4xx nebo 5xx), vyhodí výjimku
        // response.ok je true jen pro kódy 200–299
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        // Parsování těla odpovědi z formátu JSON do JavaScriptového objektu
        const data = await response.json();

        // Ověření, že odpověď má očekávanou strukturu a obsahuje kurzy
        // ExchangeRate-API vrací { result: 'success', conversion_rates: { USD: 1, EUR: 0.92, ... } }
        if (data.result === 'success' && data.conversion_rates) {
            // Uložení kurzů do globální proměnné (definované v config.js)
            exchangeRates = data.conversion_rates;

            // Uložení aktuálního času – zobrazí se jako „Poslední aktualizace: HH:MM:SS"
            lastUpdateTime = new Date();

            // Uložení kurzů do localStorage – přežijí reload stránky a fungují v offline režimu
            localStorage.setItem('exchange_rates', JSON.stringify(exchangeRates));

            // Uložení časového razítka jako číslo (millisekund od epochy Unix) do localStorage
            localStorage.setItem('rates_timestamp', lastUpdateTime.getTime().toString());

            // Aktualizace zobrazení času poslední aktualizace v hlavním UI
            updateLastUpdateDisplay();

            // Signalizace úspěchu volajícímu kódu
            return true;
        } else {
            // Data přišla, ale mají neočekávaný formát – hodíme výjimku a zpracujeme ji v catch
            throw new Error('Neplatná odpověď');
        }
    } catch (error) {
        // Zachycení jakékoliv chyby – síťové výpadky, špatný klíč, neplatná odpověď atd.
        console.error('Chyba API:', error); // Zápis chyby do konzole prohlížeče pro ladění

        // Záložní plán 1: Pokud máme kurzy z předchozího úspěšného načtení (nebo z localStorage),
        // použijeme je – aplikace stále funguje, jen s potenciálně staršími kurzy
        if (exchangeRates) {
            updateCacheStatus('Používám uložené kurzy'); // Informujeme uživatele v UI
            return true;
        } else {
            // Záložní plán 2: Žádné kurzy nemáme vůbec – nastavíme pevně zakódované demo kurzy
            // Ty jsou přibližné a slouží jen k základní demonstraci fungování aplikace
            setDemoRates(); // Definováno v utils.js

            // Vrátíme false, aby volající kód věděl, že nejde o skutečná data
            return false;
        }
    }
}
