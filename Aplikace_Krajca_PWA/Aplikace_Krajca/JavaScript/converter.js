// =====================================================================
// converter.js – Logika převodu měn a inicializace stránky převodníku
// Obsahuje: výpočet kurzu, prohození měn, inicializaci event listenerů
// =====================================================================

// Hlavní funkce pro provedení převodu měny
// Čte hodnoty z formuláře, vypočítá výsledek a zobrazí ho v UI
// Je asynchronní, protože může potřebovat stáhnout kurzy z API (await)
async function convertCurrency() {
    // Získání referencí na DOM elementy formuláře – vše z aktuální stránky
    const amountInput = document.getElementById('amount');       // Vstupní pole pro částku
    const fromSelect  = document.getElementById('fromCurrency'); // Selectbox zdrojové měny
    const toSelect    = document.getElementById('toCurrency');   // Selectbox cílové měny
    const resultValue = document.getElementById('resultValue'); // Element pro zobrazení výsledku
    const resultRate  = document.getElementById('resultRate');  // Element pro zobrazení kurzu
    const errorDiv    = document.getElementById('errorMessage'); // Element pro chybové zprávy

    // Bezpečnostní kontrola – pokud elementy formuláře neexistují (jiná stránka), funkce skončí
    if (!amountInput || !fromSelect || !toSelect) return;

    // Parsuje hodnotu vstupního pole na číslo s desetinnou čárkou/tečkou
    // parseFloat vrátí NaN, pokud vstup není číslo (prázdné pole, text apod.)
    let amount = parseFloat(amountInput.value);

    // Validace vstupu: NaN nebo záporná/nulová částka nejsou platné pro převod
    if (isNaN(amount) || amount <= 0) {
        if (resultValue) resultValue.textContent = '0.00'; // Zobrazí nulový výsledek
        if (resultRate) resultRate.textContent = 'Zadejte platnou částku'; // Informace pro uživatele
        return; // Přeruší funkci – nema smysl počítat s neplatnou částkou
    }

    // Přečte aktuálně vybrané kódy měn z obou selectboxů
    const fromCurrency = fromSelect.value; // Např. 'EUR'
    const toCurrency   = toSelect.value;   // Např. 'CZK'

    // Speciální případ: převod stejné měny na sebe – výsledek je vždy stejná částka, kurz 1:1
    if (fromCurrency === toCurrency) {
        if (resultValue) resultValue.textContent = `${amount.toFixed(2)} ${toCurrency}`; // Zobrazí vstupní částku
        if (resultRate) resultRate.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;  // Kurz je vždy 1
        return;
    }

    // Pokud kurzy ještě nejsou načteny (první spuštění nebo po resetu), stáhne je
    if (!exchangeRates) {
        await fetchExchangeRates(fromCurrency); // Čeká na dokončení stahování (viz api.js)
        if (!exchangeRates) return; // Pokud se stahování nepodařilo ani s fallbackem, ukončí funkci
    }

    let convertedAmount, rate; // Proměnné pro výsledek a použitý kurz

    // Výpočet kurzu – API vrací kurzy relativní k base měně (té, kterou jsme poslali v požadavku)
    // Proto musíme přepočítat přes USD jako prostředníka, pokud máme kurzy s jiným základem
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
        // Oba kurzy jsou dostupné → přepočet přes společného jmenovatele (base měna API, typicky USD)
        // rateToUSD: kolik USD dostaneme za 1 jednotku fromCurrency (převrácená hodnota kurzu)
        const rateToUSD = 1 / exchangeRates[fromCurrency];

        // Výsledný kurz: z fromCurrency do toCurrency přes USD jako mezičlánek
        rate = rateToUSD * exchangeRates[toCurrency];

        // Výsledná částka = vstupní × kurz
        convertedAmount = amount * rate;
    } else if (exchangeRates[toCurrency]) {
        // Záložní větev: pokud fromCurrency je shodná s base měnou API (kurz je 1),
        // stačí rovnou použít kurz cílové měny
        rate = exchangeRates[toCurrency];
        convertedAmount = amount * rate;
    } else {
        // Kurz cílové měny vůbec není dostupný – zobrazí chybovou zprávu v UI
        if (errorDiv) {
            errorDiv.textContent = 'Kurzy nejsou dostupné'; // Text chyby
            errorDiv.classList.add('show'); // Třída 'show' v CSS nastaví display: block

            // Po 3 sekundách chybová zpráva automaticky zmizí (odebere třídu 'show')
            setTimeout(() => errorDiv.classList.remove('show'), 3000);
        }
        return; // Nemá smysl pokračovat bez kurzu
    }

    // Zobrazí výsledek zaokrouhlený na 2 desetinná místa a kód měny
    if (resultValue) resultValue.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`;

    // Zobrazí přesný kurz zaokrouhlený na 6 desetinných míst (pro malé kurzy jako KRW)
    if (resultRate) resultRate.textContent = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;

    // Uloží provedený převod do historie (viz storage.js)
    saveToHistory(amount, fromCurrency, convertedAmount, toCurrency, rate);

    // Zapamatuje si poslední použité hodnoty – při příštím otevření stránky se obnoví
    localStorage.setItem('last_from_currency', fromCurrency); // Zdrojová měna
    localStorage.setItem('last_to_currency', toCurrency);     // Cílová měna
    localStorage.setItem('last_amount', amount.toString());   // Zadaná částka (jako řetězec)
}

// Prohodí hodnoty zdrojového a cílového selectboxu (přepne směr převodu)
// Po prohození automaticky spustí nový převod s přehozenými měnami
// Parametry jsou přímo reference na DOM elementy (předány z initConverterPage)
function swapCurrencies(fromSelect, toSelect) {
    const fromValue = fromSelect.value; // Dočasně uloží aktuální zdrojovou měnu
    const toValue   = toSelect.value;   // Dočasně uloží aktuální cílovou měnu

    fromSelect.value = toValue;   // Zdrojový selectbox dostane hodnotu cílového
    toSelect.value   = fromValue; // Cílový selectbox dostane původní zdrojovou hodnotu

    convertCurrency(); // Okamžitě přepočítá s přehozenými měnami
}

// Inicializuje stránku převodníku – zaregistruje event listenery a načte uložené hodnoty
// Volá se z main.js pouze na stránce index.html
async function initConverterPage() {
    // Získá reference na hlavní interaktivní elementy stránky
    const amountInput = document.getElementById('amount');
    const fromSelect  = document.getElementById('fromCurrency');
    const toSelect    = document.getElementById('toCurrency');
    const convertBtn  = document.getElementById('convertBtn');
    const swapBtn     = document.getElementById('swapBtn');

    // Pokud vstupní pole pro částku neexistuje, nejsme na správné stránce – konec
    if (!amountInput) return;

    // Pokusí se obnovit naposledy použité hodnoty z localStorage
    const savedFrom   = localStorage.getItem('last_from_currency'); // Kód zdrojové měny nebo null
    const savedTo     = localStorage.getItem('last_to_currency');   // Kód cílové měny nebo null
    const savedAmount = localStorage.getItem('last_amount');        // Částka jako řetězec nebo null

    // Obnoví naposledy vybrané měny, pokud existují (jinak zůstanou výchozí EUR/CZK z ui.js)
    if (savedFrom && fromSelect) fromSelect.value = savedFrom;
    if (savedTo   && toSelect)   toSelect.value   = savedTo;

    // Obnoví naposledy zadanou částku
    if (savedAmount && amountInput) amountInput.value = savedAmount;

    // Stáhne aktuální kurzy z API (nebo použije cache/demo) pro aktuálně vybranou zdrojovou měnu
    await fetchExchangeRates(fromSelect.value); // Čeká na dokončení, aby kurzy byly dostupné

    // Zaregistruje kliknutí na tlačítko „Převést" – spustí výpočet
    if (convertBtn) convertBtn.addEventListener('click', convertCurrency);

    // Zaregistruje kliknutí na tlačítko „⇄" – prohodí měny a přepočítá
    if (swapBtn) swapBtn.addEventListener('click', () => swapCurrencies(fromSelect, toSelect));

    // Při změně zdrojové měny přestáhne kurzy z API (pokud nejsme v offline režimu)
    // To zajistí, že kurzy jsou vždy vztaženy ke správné base měně
    if (fromSelect) fromSelect.addEventListener('change', async () => {
        if (!offlineMode) await fetchExchangeRates(fromSelect.value); // Refresh kurzů pro novou měnu
    });
}
