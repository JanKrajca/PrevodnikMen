// =====================================================================
// main.js – Hlavní vstupní bod aplikace (entry point)
// Spouští inicializaci po načtení DOM a rozhoduje, co na které stránce spustit
// =====================================================================

// Zaregistruje callback na událost 'DOMContentLoaded' – spustí se ve chvíli,
// kdy prohlížeč zparsoval celý HTML dokument a DOM je připraven k manipulaci
// (nemusí čekat na obrázky a styly, na rozdíl od window.onload)
document.addEventListener('DOMContentLoaded', () => {

    // Naplní oba selectboxy pro výběr měn všemi podporovanými měnami
    // Musí proběhnout jako první, aby selecty byly připravené před nastavením hodnot
    populateCurrencySelects(); // Definováno v ui.js

    // Zjistí název aktuálně zobrazené HTML stránky z URL adresy prohlížeče
    // window.location.pathname vrátí např. '/pages/index.html', split('/') rozdělí na části,
    // pop() vezme poslední část ('index.html'), || 'index.html' ošetří případ kořenové URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Načte všechna data uložená v localStorage do globálních proměnných
    // (kurzy, historii, téma, offline režim) – musí být před inicializací stránek,
    // aby měly všechny funkce k dispozici správná data
    loadPersistentData(); // Definováno v storage.js

    // Aplikuje uložené téma a nastaví event listenery pro přepínač tmavého režimu
    // Dvojité requestAnimationFrame uvnitř zabrání probliknutí tématu při načtení
    applyTheme(); // Definováno v ui.js

    // Přiřadí event listenery tlačítkům spodní navigace (Převodník / Historie / Nastavení)
    setupNavigation(); // Definováno v ui.js

    // Podmíněná inicializace – spustí jen kód relevantní pro aktuální stránku
    // Každá stránka potřebuje jiné event listenery a jinou logiku

    // Stránka převodníku (index.html nebo kořenová URL '/')
    // Podmínka je duplicitní (index.html je dvakrát) – původní chyba v kódu, funguje správně
    if (currentPage === 'index.html' || currentPage === 'index.html' || currentPage === '') {
        initConverterPage(); // Načte kurzy, obnoví poslední hodnoty, zaregistruje listenery – viz converter.js
    }

    // Stránka s historií převodů
    else if (currentPage === 'historie.html') {
        initHistoryPage(); // Vykreslí seznam převodů a přidá listener na mazání – viz history.js
    }

    // Stránka nastavení
    else if (currentPage === 'nastaveni.html') {
        initSettingsPage(); // Propojí přepínače a tlačítka s jejich funkcemi – viz settings.js
    }
});
