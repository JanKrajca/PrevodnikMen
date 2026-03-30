// =============================================================================
// api.js – Komunikace s externí API pro kurzy měn
// Zodpovídá výhradně za načítání kurzů ze sítě a jejich uložení do paměti.
// Ostatní části aplikace pak čtou proměnnou `exchangeRates` z config.js.
// =============================================================================

// -----------------------------------------------------------------------------
// fetchExchangeRates(baseCurrency)
//
// CO: Načte aktuální směnné kurzy z ExchangeRate-API pro zadanou základní měnu.
//
// JAK: Pošle HTTP GET požadavek na API endpoint. Pokud odpověď přijde v pořádku,
//      uloží kurzy do globální proměnné `exchangeRates` a zároveň je zapíše
//      do localStorage, aby byly dostupné i po refreshi nebo offline.
//
// PROČ takto: API vrací kurzy vždy relativně k jedné základní měně (base).
//      Když uživatel změní "z měny", zavoláme API znovu s novou základnou,
//      aby byly přepočty co nejpřesnější (místo dvojitého přepočtu přes USD).
//
// @param {string} baseCurrency – třípísmenný kód měny, výchozí 'USD'
// @returns {boolean} – true pokud máme kurzy (z API nebo cache), false při úplném selhání
// -----------------------------------------------------------------------------
async function fetchExchangeRates(baseCurrency = 'USD') {
    try {
        // Pokud je zapnutý offline režim a kurzy už máme v paměti,
        // rovnou skončíme – nechceme zbytečně volat síť
        if (offlineMode && exchangeRates) {
            updateCacheStatus('Offline režim');
            return true;
        }

        // Sestavení URL: API_URL + API_KEY + /latest/ + měna
        // Příklad: https://v6.exchangerate-api.com/v6/abc123/latest/EUR
        const response = await fetch(`${API_URL}${API_KEY}/latest/${baseCurrency}`);

        // HTTP chyba (401 špatný klíč, 404 neznámá měna, 429 překročen limit...)
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        // API vrací { result: "success", conversion_rates: { USD: 1.08, CZK: 25.3, ... } }
        // Ověříme, že odpověď má očekávaný formát
        if (data.result === 'success' && data.conversion_rates) {
            exchangeRates = data.conversion_rates;
            lastUpdateTime = new Date();

            // Uložíme kurzy do localStorage jako zálohu pro offline použití
            // getTime() vrací timestamp v ms – jednodušší na serializaci než Date objekt
            localStorage.setItem('exchange_rates', JSON.stringify(exchangeRates));
            localStorage.setItem('rates_timestamp', lastUpdateTime.getTime().toString());

            updateLastUpdateDisplay(); // aktualizuje text "Poslední aktualizace" v UI
            return true;
        } else {
            throw new Error('Neplatná odpověď');
        }

    } catch (error) {
        console.error('Chyba API:', error);

        // Fallback #1: Máme kurzy z předchozího úspěšného volání (v paměti nebo localStorage)?
        // Použijeme je – uživatel to pozná podle statusu "Používám uložené kurzy"
        if (exchangeRates) {
            updateCacheStatus('Používám uložené kurzy');
            return true;
        } else {
            // Fallback #2: Vůbec žádné kurzy nemáme (první spuštění bez internetu)
            // Nastavíme pevně zakódované demo kurzy, aby aplikace alespoň nějak fungovala
            setDemoRates(); // definováno v utils.js
            return false;
        }
    }
}