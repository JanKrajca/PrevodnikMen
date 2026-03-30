// =============================================================================
// converter.js – Logika převodu měn a inicializace stránky převodníku
// Tento soubor obsahuje výpočetní jádro aplikace a obsluhu UI na index.html.
// =============================================================================

// -----------------------------------------------------------------------------
// convertCurrency()
//
// CO: Přečte vstup od uživatele, vypočítá převod a zobrazí výsledek.
//
// JAK: Načte hodnoty z DOM elementů, provede výpočet přes exchangeRates
//      a výsledek zapíše zpět do DOM. Také uloží převod do historie.
//
// PROČ přepočet přes USD: API vrací kurzy relativně k základní měně (base).
//      Pokud uživatel chce převést EUR→CZK ale kurzy máme v USD jako základně,
//      musíme nejdřív EUR→USD (1/rates[EUR]) a pak USD→CZK (rates[CZK]).
// -----------------------------------------------------------------------------
async function convertCurrency() {
    // Načteme reference na DOM elementy – používáme const, protože reference se nemění
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const resultValue = document.getElementById('resultValue');
    const resultRate = document.getElementById('resultRate');
    const errorDiv = document.getElementById('errorMessage');

    // Ochrana: tato funkce běží na všech stránkách (sdílený main.js),
    // ale elementy existují jen na index.html – bez kontroly by JS hodil chybu
    if (!amountInput || !fromSelect || !toSelect) return;

    let amount = parseFloat(amountInput.value);

    // Validace vstupu – záporné nebo nulové částky nedávají smysl
    if (isNaN(amount) || amount <= 0) {
        if (resultValue) resultValue.textContent = '0.00';
        if (resultRate) resultRate.textContent = 'Zadejte platnou částku';
        return;
    }

    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    // Speciální případ: stejná měna = kurz 1:1, není třeba volat API
    if (fromCurrency === toCurrency) {
        if (resultValue) resultValue.textContent = `${amount.toFixed(2)} ${toCurrency}`;
        if (resultRate) resultRate.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
        return;
    }

    // Lazy loading kurzů: načteme jen pokud ještě nemáme
    // (při normálním běhu je načte initConverterPage při startu)
    if (!exchangeRates) {
        await fetchExchangeRates(fromCurrency);
        if (!exchangeRates) return; // ani demo kurzy se nenačetly, vzdáváme to
    }

    let convertedAmount, rate;

    // Případ A: Máme kurzy pro obě měny → přepočítáme křížem přes společného jmenovatele
    // Příklad (base = USD): chceme EUR→CZK
    //   rateToUSD = 1 / rates['EUR'] = 1 / 0.92 ≈ 1.087  (1 EUR = 1.087 USD)
    //   rate = 1.087 * rates['CZK'] = 1.087 * 22.5 ≈ 24.46  (1 EUR = 24.46 CZK)
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
        const rateToUSD = 1 / exchangeRates[fromCurrency];
        rate = rateToUSD * exchangeRates[toCurrency];
        convertedAmount = amount * rate;

        // Případ B: Základní měna (base) je přímo fromCurrency → kurz čteme přímo
        // Nastane, když uživatel zvolí stejnou měnu jako base v API
    } else if (exchangeRates[toCurrency]) {
        rate = exchangeRates[toCurrency];
        convertedAmount = amount * rate;

        // Případ C: Měna vůbec není v kurzech (nemělo by nastat, ale pro jistotu)
    } else {
        if (errorDiv) {
            errorDiv.textContent = 'Kurzy nejsou dostupné';
            errorDiv.classList.add('show');
            setTimeout(() => errorDiv.classList.remove('show'), 3000); // chyba zmizí po 3s
        }
        return;
    }

    // Zobrazení výsledku v UI
    // toFixed(2) = dvě desetinná místa pro částku, toFixed(6) pro kurz (přesnost)
    if (resultValue) resultValue.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`;
    if (resultRate) resultRate.textContent = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;

    // Uložení do historie a zapamatování posledního nastavení
    saveToHistory(amount, fromCurrency, convertedAmount, toCurrency, rate);

    // Zapamatujeme si poslední použité hodnoty, aby se obnovily po refreshi stránky
    localStorage.setItem('last_from_currency', fromCurrency);
    localStorage.setItem('last_to_currency', toCurrency);
    localStorage.setItem('last_amount', amount.toString());
}

// -----------------------------------------------------------------------------
// swapCurrencies(fromSelect, toSelect)
//
// CO: Prohodí hodnoty v obou dropdown selectech a spustí nový převod.
//
// PROČ samostatná funkce: Logika prohození je jednoduchá, ale volá se
//      z event listeneru tlačítka ⇄ – oddělení zlepšuje čitelnost.
// -----------------------------------------------------------------------------
function swapCurrencies(fromSelect, toSelect) {
    const fromValue = fromSelect.value;
    const toValue = toSelect.value;
    fromSelect.value = toValue;
    toSelect.value = fromValue;
    convertCurrency(); // ihned přepočítáme s novými hodnotami
}

// -----------------------------------------------------------------------------
// initConverterPage()
//
// CO: Inicializuje stránku převodníku – obnoví poslední stav a připojí listenery.
//
// JAK: Čte localStorage pro obnovení posledního nastavení uživatele,
//      načte kurzy z API a zaregistruje event listenery na tlačítka.
//
// PROČ async: Čekáme na fetchExchangeRates(), která je asynchronní (volá síť).
//      Kdybychom nečekali, kurzy by nemusely být připraveny před prvním převodem.
//
// Volá ji main.js po zjištění, že jsme na stránce index.html.
// -----------------------------------------------------------------------------
async function initConverterPage() {
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const convertBtn = document.getElementById('convertBtn');
    const swapBtn = document.getElementById('swapBtn');

    // Pokud prvky neexistují, nejsme na správné stránce – tiše odejdeme
    if (!amountInput) return;

    // Obnovení posledního stavu z localStorage
    // Díky tomu si aplikace pamatuje nastavení i po zavření prohlížeče
    const savedFrom = localStorage.getItem('last_from_currency');
    const savedTo = localStorage.getItem('last_to_currency');
    const savedAmount = localStorage.getItem('last_amount');

    if (savedFrom && fromSelect) fromSelect.value = savedFrom;
    if (savedTo && toSelect) toSelect.value = savedTo;
    if (savedAmount && amountInput) amountInput.value = savedAmount;

    // Načteme kurzy hned při startu, aby uživatel nemusel čekat po kliknutí na Převést
    await fetchExchangeRates(fromSelect.value);

    // Event listenery – registrujeme až po načtení kurzů, aby vše bylo připraveno
    if (convertBtn) convertBtn.addEventListener('click', convertCurrency);
    if (swapBtn) swapBtn.addEventListener('click', () => swapCurrencies(fromSelect, toSelect));

    // Při změně zdrojové měny znovu načteme kurzy s novou základnou (base currency)
    // Přeskočíme v offline režimu – nemá smysl volat API, když je vypnutý internet
    if (fromSelect) fromSelect.addEventListener('change', async () => {
        if (!offlineMode) await fetchExchangeRates(fromSelect.value);
    });
}