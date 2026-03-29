// =====================================================================
// ui.js – Funkce pro vykreslování a manipulaci s uživatelským rozhraním
// Obsahuje: plnění selectboxů, navigaci, téma, zobrazení historie
// =====================================================================

// Naplní oba selectboxy (<select>) pro výběr měn všemi podporovanými měnami
// Volá se při startu každé stránky – na stránkách bez selectboxů to projde bez chyby
function populateCurrencySelects() {
    // Najde oba select elementy na stránce (existují jen na index.html)
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    // Pokud selecty na aktuální stránce nejsou (např. nastaveni.html), funkce skončí
    if (!fromSelect || !toSelect) return;

    // Vymaže všechny předchozí <option> elementy – předchází duplicitám při opakovaném volání
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    // Prochází pole CURRENCIES (definované v config.js) a pro každou měnu vytvoří <option>
    CURRENCIES.forEach(currency => {
        // Vytvoří nový <option> element pro selectbox „Z měny"
        const option1 = document.createElement('option');
        option1.value = currency; // Hodnota odesílaná při výběru, např. 'USD'
        option1.textContent = `${currency} - ${CURRENCY_NAMES[currency]}`; // Zobrazený text, např. 'USD - Americký dolar'
        fromSelect.appendChild(option1); // Přidá <option> jako poslední dítě do <select>

        // Stejný postup pro selectbox „Do měny" – musí být samostatný element (nelze sdílet)
        const option2 = document.createElement('option');
        option2.value = currency;
        option2.textContent = `${currency} - ${CURRENCY_NAMES[currency]}`;
        toSelect.appendChild(option2);
    });

    // Nastaví výchozí vybrané měny: EUR → CZK (typická kombinace pro české uživatele)
    fromSelect.value = 'EUR';
    toSelect.value = 'CZK';
}

// Přiřadí event listenery tlačítkům spodní navigační lišty
// Po kliknutí na tlačítko přejde na odpovídající HTML stránku
function setupNavigation() {
    // Vybere všechna tlačítka s třídou .nav-btn (jsou tři – Převodník, Historie, Nastavení)
    const navBtns = document.querySelectorAll('.nav-btn');

    navBtns.forEach(btn => {
        // Pro každé tlačítko zaregistruje handler kliknutí
        btn.addEventListener('click', (e) => {
            // Přečte atribut data-page z HTML, např. data-page="historie.html"
            const page = btn.getAttribute('data-page');

            // Pokud atribut existuje (vždy by měl), přesměruje prohlížeč na danou stránku
            if (page) {
                window.location.href = page; // Standardní navigace – stránka se znovu načte
            }
        });
    });
}

// Inicializuje chování tmavého tématu – aktivuje CSS přechody AŽ PO prvním vykreslení
// Tím se zabrání probliknutí (flash) při načítání stránky, kdy by se téma přepnulo viditelně
function applyTheme() {
    // requestAnimationFrame odloží callback do dalšího překreslení prohlížeče
    // Dvojité vnořené rAF zajistí, že se třída přidá až po dvou snímcích (= stránka je vykreslena)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Přidá třídu 'theme-loaded' na <body> – spouští CSS transition pravidla z style.css
            // Bez tohoto by prohlížeč animoval i počáteční nastavení tématu při načtení stránky
            document.body.classList.add('theme-loaded');
        });
    });

    // Najde přepínač tmavého režimu – existuje jen na stránce nastaveni.html
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        // Zaregistruje handler změny stavu přepínače (zaškrtnutí / odškrtnutí)
        darkToggle.addEventListener('change', () => {
            if (darkToggle.checked) {
                // Přepínač zapnut → aktivuje tmavý režim na obou elementech kvůli různým CSS selektorům
                document.documentElement.classList.add('dark-mode'); // <html> – pro rychlé přepnutí
                document.body.classList.add('dark-mode');            // <body> – pro selektory v style.css
                localStorage.setItem('theme', 'dark'); // Uloží volbu, aby přežila reload
            } else {
                // Přepínač vypnut → odebere tmavý režim z obou elementů
                document.documentElement.classList.remove('dark-mode');
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light'); // Uloží světlé téma
            }
        });
    }
}

// Vykreslí (nebo aktualizuje) sekci s historií převodů na stránce historie.html
// Volá se při načtení stránky a po vymazání historie
function renderHistory() {
    // Najde DOM elementy přítomné na stránce historie.html
    const historyList = document.getElementById('historyList');       // <div> obsahující karty převodů
    const historyEmpty = document.getElementById('historyEmpty');     // <div> se zprávou „Zatím žádné převody"
    const totalConversionsSpan = document.getElementById('totalConversions'); // Počítadlo v statistikách
    const mostUsedCurrencySpan = document.getElementById('mostUsedCurrency'); // Nejčastější měna v statistikách

    // Pokud hlavní kontejner neexistuje (jsme na jiné stránce), funkce se ukončí bez chyby
    if (!historyList) return;

    // Případ prázdné historie – zobrazí informační stav místo prázdného seznamu
    if (conversionHistory.length === 0) {
        historyList.style.display = 'none';   // Skryje seznam (nebyl by co zobrazit)
        if (historyEmpty) historyEmpty.style.display = 'block'; // Zobrazí prázdný stav
        if (totalConversionsSpan) totalConversionsSpan.textContent = '0';  // Vynuluje počítadlo
        if (mostUsedCurrencySpan) mostUsedCurrencySpan.textContent = '—';  // Pomlčka místo měny
        return; // Není třeba pokračovat – nic k zobrazení není
    }

    // Historie není prázdná – zobrazí seznam a skryje prázdný stav
    historyList.style.display = 'flex';
    if (historyEmpty) historyEmpty.style.display = 'none';

    // Aktualizuje počítadlo celkového počtu převodů v statistické liště
    if (totalConversionsSpan) {
        totalConversionsSpan.textContent = conversionHistory.length; // Délka pole = počet záznamů
    }

    // Vypočítá nejčastěji použitou měnu (jak zdrojovou, tak cílovou) ze všech záznamů
    if (mostUsedCurrencySpan && conversionHistory.length > 0) {
        const currencyCount = {}; // Pomocný objekt pro počítání výskytů každé měny

        // Pro každý záznam v historii navýší počítadlo zdrojové i cílové měny
        conversionHistory.forEach(item => {
            currencyCount[item.from] = (currencyCount[item.from] || 0) + 1; // Zdrojová měna
            currencyCount[item.to]   = (currencyCount[item.to]   || 0) + 1; // Cílová měna
        });

        // Najde klíč (kód měny) s nejvyšší hodnotou (počtem výskytů) v objektu
        // Object.keys() vrátí pole klíčů, reduce() prochází a porovnává sousední hodnoty
        let mostUsed = Object.keys(currencyCount).reduce((a, b) => currencyCount[a] > currencyCount[b] ? a : b);

        // Zobrazí kód nejčastější měny, např. 'CZK'
        mostUsedCurrencySpan.textContent = mostUsed;
    }

    // Vygeneruje HTML markup pro všechny záznamy najednou pomocí map() a join()
    // map() převede každý objekt záznamu na HTML řetězec, join('') je sloučí bez oddělovačů
    historyList.innerHTML = conversionHistory.map(item => `
        <div class="history-item">
            <div class="history-details">
                <div class="history-conversion">
                    <!-- Zobrazí původní částku, zdrojovou měnu, šipku, výsledek a cílovou měnu -->
                    ${item.amount.toFixed(2)} ${item.from} → ${item.converted.toFixed(2)} ${item.to}
                </div>
                <div class="history-date">
                    <!-- Formátuje ISO datum do lokálního formátu cs-CZ, např. '15. 1. 2024, 14:30:00' -->
                    ${new Date(item.date).toLocaleString('cs-CZ')}
                </div>
            </div>
            <div class="history-result">
                <!-- Zobrazí výslednou částku znovu vpravo jako zvýrazněnou hodnotu -->
                ${item.converted.toFixed(2)} ${item.to}
            </div>
        </div>
    `).join(''); // Sloučí všechny vygenerované HTML řetězce do jednoho a přepíše obsah kontejneru
}
