// =============================================================================
// main.js – Vstupní bod aplikace, orchestrace inicializace
// Tento soubor se načítá jako poslední (viz HTML) a spouští vše ostatní.
// Jeho jediná úloha: zjistit na jaké stránce jsme a zavolat správný init.
// =============================================================================

// -----------------------------------------------------------------------------
// DOMContentLoaded event
//
// CO: Spustí inicializaci aplikace až poté, co prohlížeč zparsuje celé HTML.
//
// PROČ ne okamžitě: Skript je v <body> za obsahem, ale DOMContentLoaded
//      je explicitní garance – funkce jako getElementById() potřebují,
//      aby DOM elementy již existovaly v době volání.
//
// Pořadí volání je důležité:
//   1. populateCurrencySelects() – musí být první, selecty potřebují obsah
//      dříve než se do nich zkusí nastavit uložená hodnota z localStorage
//   2. loadPersistentData() – načte historii, kurzy, téma z localStorage
//   3. applyTheme() – aplikuje uložené téma a nastaví listener na toggle
//   4. setupNavigation() – připojí listenery na navigační tlačítka
//   5. init*Page() – inicializace specifická pro aktuální stránku
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    populateCurrencySelects(); // ui.js – naplní dropdown selecty měnami

    // Zjistíme název aktuálního souboru z URL cesty
    // pathname.split('/').pop() vrátí poslední část cesty, např. "historie.html"
    // || 'index.html' ošetří případ kdy je URL "https://example.com/" bez souboru
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    loadPersistentData(); // storage.js – kurzy, historie, téma, offline mode
    applyTheme();         // ui.js – smooth transition + listener na dark mode toggle
    setupNavigation();    // ui.js – click listenery na .nav-btn tlačítka

    // Routování: zavoláme inicializaci odpovídající aktuální stránce.
    // Každá stránka má svůj init, který připojí listenery a načte data.
    // Podmínky pro index.html jsou tři, protože:
    //   - "index.html" = přímý přístup přes název souboru
    //   - "prevodnik.html" = stará URL pro zpětnou kompatibilitu
    //   - "" = přístup přes root URL (https://example.com/)
    if (currentPage === 'index.html' || currentPage === 'prevodnik.html' || currentPage === '') {
        initConverterPage(); // converter.js
    } else if (currentPage === 'historie.html') {
        initHistoryPage();   // history.js
    } else if (currentPage === 'nastaveni.html') {
        initSettingsPage();  // settings.js
    }
});