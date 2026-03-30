// =============================================================================
// history.js – Inicializace stránky historie
// Záměrně minimální soubor – veškerá logika vykreslování je v ui.js (renderHistory)
// a mazání v storage.js (clearHistory), aby byly na jednom místě pro snadnou údržbu.
// =============================================================================

// -----------------------------------------------------------------------------
// initHistoryPage()
//
// CO: Inicializuje stránku historie – vykreslí seznam a připojí listener na mazání.
//
// JAK: Zavolá renderHistory() pro první vykreslení a přidá click listener
//      na tlačítko "Vymazat vše". Volá ji main.js po detekci historie.html.
//
// PROČ takhle jednoduše: Historie je čistě read-only zobrazení dat z paměti.
//      Nepotřebuje API volání ani složitou inicializaci – jen vykreslit a čekat
//      na případné smazání.
// -----------------------------------------------------------------------------
function initHistoryPage() {
    renderHistory(); // ui.js – vykreslí seznam převodů nebo prázdný stav

    const clearBtn = document.getElementById('clearHistoryButton');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearHistory); // storage.js – smaže historii a překreslí
    }
}