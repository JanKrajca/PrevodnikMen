// =============================================================================
// ui.js – Vykreslování a správa uživatelského rozhraní
// Tento soubor manipuluje přímo s DOM: plní selecty, přepíná témata, kreslí historii.
// Neobsahuje business logiku (výpočty, API) – jen "co uživatel vidí".
// =============================================================================

// -----------------------------------------------------------------------------
// populateCurrencySelects()
//
// CO: Naplní oba dropdown selecty (Z měny / Do měny) seznamem měn.
//
// JAK: Iteruje přes pole CURRENCIES z config.js, pro každou měnu vytvoří
//      <option> element a přidá ho do obou selectů. Nakonec nastaví výchozí hodnoty.
//
// PROČ programaticky a ne v HTML: Seznam měn je definován na jednom místě (config.js),
//      takže přidání nové měny stačí udělat jen tam – HTML se aktualizuje automaticky.
//
// Volá se v main.js jako úplně první věc, protože selecty musí být připraveny
// dříve, než converter.js zkusí nastavit uloženou hodnotu z localStorage.
// -----------------------------------------------------------------------------
function populateCurrencySelects() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    // Selecty existují jen na index.html – na jiných stránkách tiše odejdeme
    if (!fromSelect || !toSelect) return;

    // Vyčistíme případný předchozí obsah
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    CURRENCIES.forEach(currency => {
        // Pro každý select vytváříme samostatný element – jeden <option> nelze sdílet
        const option1 = document.createElement('option');
        option1.value = currency;
        option1.textContent = `${currency} - ${CURRENCY_NAMES[currency]}`; // např. "EUR - Euro"
        fromSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = currency;
        option2.textContent = `${currency} - ${CURRENCY_NAMES[currency]}`;
        toSelect.appendChild(option2);
    });

    // Výchozí hodnoty – přepíše je initConverterPage() pokud najde uložené preference
    fromSelect.value = 'EUR';
    toSelect.value = 'CZK';
}

// -----------------------------------------------------------------------------
// setupNavigation()
//
// CO: Připojí click listenery na navigační tlačítka v dolní liště.
//
// JAK: Najde všechna tlačítka s třídou .nav-btn a přesměruje na stránku
//      definovanou v atributu data-page.
//
// PROČ ne přímé href v HTML: Navigace je řešena JavaScriptem, protože v budoucnu
//      by bylo snadné přidat animace přechodu nebo PWA routing bez refreshe stránky.
// -----------------------------------------------------------------------------
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = btn.getAttribute('data-page');
            if (page) {
                window.location.href = page; // prostý přechod na jinou HTML stránku
            }
        });
    });
}

// -----------------------------------------------------------------------------
// applyTheme()
//
// CO: Aktivuje smooth transition pro přepínání tématu a připojí listener na toggle.
//
// JAK: Třída 'theme-loaded' se přidá až po prvním vykreslení stránky (double rAF trik).
//      Díky tomu se CSS transition nespustí při samotném načtení stránky – bez toho
//      by tmavé téma "přebliklo" z bílé při každém načtení stránky.
//
// PROČ double requestAnimationFrame: Jeden rAF by stále mohl proběhnout před
//      vykreslením – dva rAF zaručí, že prohlížeč stihl vykreslit první frame.
// -----------------------------------------------------------------------------
function applyTheme() {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Teprve teď povolíme CSS transition – žádné blikání při načtení
            document.body.classList.add('theme-loaded');
        });
    });

    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('change', () => {
            if (darkToggle.checked) {
                // Tmavý režim: přidáme třídu na <html> i <body>
                // <html> zajistí okamžitý efekt ještě před DOMContentLoaded,
                // <body> je potřeba pro CSS selektory v style.css
                document.documentElement.classList.add('dark-mode');
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark-mode');
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

// -----------------------------------------------------------------------------
// renderHistory()
//
// CO: Vykreslí seznam převodů z pole `conversionHistory` do DOM na stránce historie.
//
// JAK: Zkontroluje, zda je historie prázdná – pokud ano, zobrazí prázdný stav.
//      Jinak vypočítá statistiky (počet, nejčastější měna) a vygeneruje HTML
//      pro každý záznam pomocí map() a template literals.
//
// PROČ innerHTML a ne createElement: Pro větší množství položek je innerHTML
//      výrazně rychlejší – vloží celý HTML najednou místo jednotlivých DOM operací.
//      Bezpečnostní riziko nehrozí, protože data pocházejí z vlastního localStorage.
//
// Volá se z history.js při inicializaci stránky a po vymazání historie.
// -----------------------------------------------------------------------------
function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');
    const totalConversionsSpan = document.getElementById('totalConversions');
    const mostUsedCurrencySpan = document.getElementById('mostUsedCurrency');

    // Elementy existují jen na historie.html – ochrana před chybou na jiných stránkách
    if (!historyList) return;

    // --- Prázdný stav ---
    if (conversionHistory.length === 0) {
        historyList.style.display = 'none';
        if (historyEmpty) historyEmpty.style.display = 'block';
        if (totalConversionsSpan) totalConversionsSpan.textContent = '0';
        if (mostUsedCurrencySpan) mostUsedCurrencySpan.textContent = '—';
        return;
    }

    // --- Neprázdná historie ---
    historyList.style.display = 'flex';
    if (historyEmpty) historyEmpty.style.display = 'none';

    // Celkový počet převodů
    if (totalConversionsSpan) {
        totalConversionsSpan.textContent = conversionHistory.length;
    }

    // Nejčastěji použitá měna – počítáme výskyty každé měny (jako "from" i "to")
    // a pak vybereme tu s nejvyšším počtem pomocí reduce()
    if (mostUsedCurrencySpan && conversionHistory.length > 0) {
        const currencyCount = {};
        conversionHistory.forEach(item => {
            currencyCount[item.from] = (currencyCount[item.from] || 0) + 1;
            currencyCount[item.to] = (currencyCount[item.to] || 0) + 1;
        });
        let mostUsed = Object.keys(currencyCount).reduce(
            (a, b) => currencyCount[a] > currencyCount[b] ? a : b
        );
        mostUsedCurrencySpan.textContent = mostUsed;
    }

    // Vygenerování HTML pro všechny záznamy najednou
    // toLocaleString('cs-CZ') formátuje datum a čas v českém formátu: "30. 3. 2026, 12:34:56"
    historyList.innerHTML = conversionHistory.map(item => `
        <div class="history-item">
            <div class="history-details">
                <div class="history-conversion">
                    ${item.amount.toFixed(2)} ${item.from} → ${item.converted.toFixed(2)} ${item.to}
                </div>
                <div class="history-date">
                    ${new Date(item.date).toLocaleString('cs-CZ')}
                </div>
            </div>
            <div class="history-result">
                ${item.converted.toFixed(2)} ${item.to}
            </div>
        </div>
    `).join(''); // join('') spojí pole stringů bez oddělovače
}