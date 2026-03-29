// Hlavní inicializace
document.addEventListener('DOMContentLoaded', () => {
    populateCurrencySelects();

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    loadPersistentData();
    applyTheme();
    setupNavigation();

    if (currentPage === 'index.html' || currentPage === 'index.html' || currentPage === '') {
        initConverterPage();
    } else if (currentPage === 'historie.html') {
        initHistoryPage();
    } else if (currentPage === 'nastaveni.html') {
        initSettingsPage();
    }
});