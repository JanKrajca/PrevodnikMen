// Funkce pro naplnění selectů měnami
function populateCurrencySelects() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    if (!fromSelect || !toSelect) return;

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    CURRENCIES.forEach(currency => {
        const option1 = document.createElement('option');
        option1.value = currency;
        option1.textContent = `${currency} - ${CURRENCY_NAMES[currency]}`;
        fromSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = currency;
        option2.textContent = `${currency} - ${CURRENCY_NAMES[currency]}`;
        toSelect.appendChild(option2);
    });

    fromSelect.value = 'EUR';
    toSelect.value = 'CZK';
}

// Navigace
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = btn.getAttribute('data-page');
            if (page) {
                window.location.href = page;
            }
        });
    });
}

// Aplikace tématu
function applyTheme() {
    // Přidáme theme-loaded až po prvním vykreslení – transition se tak nespustí při načtení stránky
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add('theme-loaded');
        });
    });

    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('change', () => {
            if (darkToggle.checked) {
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

// Zobrazení historie
function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');
    const totalConversionsSpan = document.getElementById('totalConversions');
    const mostUsedCurrencySpan = document.getElementById('mostUsedCurrency');

    if (!historyList) return;

    if (conversionHistory.length === 0) {
        historyList.style.display = 'none';
        if (historyEmpty) historyEmpty.style.display = 'block';
        if (totalConversionsSpan) totalConversionsSpan.textContent = '0';
        if (mostUsedCurrencySpan) mostUsedCurrencySpan.textContent = '—';
        return;
    }

    historyList.style.display = 'flex';
    if (historyEmpty) historyEmpty.style.display = 'none';

    if (totalConversionsSpan) {
        totalConversionsSpan.textContent = conversionHistory.length;
    }

    if (mostUsedCurrencySpan && conversionHistory.length > 0) {
        const currencyCount = {};
        conversionHistory.forEach(item => {
            currencyCount[item.from] = (currencyCount[item.from] || 0) + 1;
            currencyCount[item.to] = (currencyCount[item.to] || 0) + 1;
        });
        let mostUsed = Object.keys(currencyCount).reduce((a, b) => currencyCount[a] > currencyCount[b] ? a : b);
        mostUsedCurrencySpan.textContent = mostUsed;
    }

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
    `).join('');
}