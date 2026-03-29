// Inicializace historie
function initHistoryPage() {
    renderHistory();

    const clearBtn = document.getElementById('clearHistoryButton');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearHistory);
    }
}