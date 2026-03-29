// =====================================================================
// history.js – Inicializace stránky s historií převodů (historie.html)
// Tento soubor je záměrně minimální – veškerá logika je v ui.js a storage.js
// =====================================================================

// Inicializuje stránku historie – vykreslí seznam převodů a přidá handler mazání
// Volá se z main.js pouze tehdy, když je aktuální stránka 'historie.html'
function initHistoryPage() {
    // Vykreslí historii převodů do DOM – funkce definovaná v ui.js
    // Automaticky zobrazí buď seznam záznamů, nebo prázdný stav podle obsahu conversionHistory
    renderHistory();

    // Najde tlačítko „Vymazat vše" na stránce (existuje jen na historie.html)
    const clearBtn = document.getElementById('clearHistoryButton');

    // Zaregistruje handler kliknutí jen pokud tlačítko existuje (obrana proti null chybě)
    if (clearBtn) {
        // Po kliknutí zavolá clearHistory() z storage.js, která:
        // 1. Zobrazí potvrzovací dialog
        // 2. Smaže historii z paměti i localStorage
        // 3. Znovu vykreslí prázdný stav (znovu zavolá renderHistory)
        clearBtn.addEventListener('click', clearHistory);
    }
}
