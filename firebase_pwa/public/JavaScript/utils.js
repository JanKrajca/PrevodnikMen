// =============================================================================
// utils.js – Pomocné funkce sdílené napříč celou aplikací
// Obsahuje utility bez závislostí na konkrétní stránce: aktualizace UI textů,
// demo data a operace s celými daty aplikace (export, import, reset).
// =============================================================================

// -----------------------------------------------------------------------------
// updateLastUpdateDisplay()
//
// CO: Zobrazí čas posledního načtení kurzů v elementu #lastUpdate.
//
// PROČ existuje: Více míst v kódu potřebuje aktualizovat tento text
//      (api.js po úspěšném volání, storage.js při načítání uložených kurzů).
//      Centrální funkce zabraňuje duplicitě.
// -----------------------------------------------------------------------------
function updateLastUpdateDisplay() {
    const lastUpdateSpan = document.getElementById('lastUpdate');
    // Element existuje jen na index.html – na ostatních stránkách tiše odejdeme
    if (lastUpdateTime && lastUpdateSpan) {
        // toLocaleTimeString('cs-CZ') = český formát času, např. "12:34:56"
        lastUpdateSpan.textContent = `Poslední aktualizace: ${lastUpdateTime.toLocaleTimeString('cs-CZ')}`;
    }
}

// -----------------------------------------------------------------------------
// updateCacheStatus(message)
//
// CO: Aktualizuje informační text o stavu kurzů v nastavení (#cacheStatus).
//
// PROČ: Element existuje jen na nastaveni.html, ale tato funkce se volá i z api.js
//       při offline/fallback situacích. Bezpečná kontrola zabrání JS chybě.
// -----------------------------------------------------------------------------
function updateCacheStatus(message) {
    const cacheStatus = document.getElementById('cacheStatus');
    if (cacheStatus) {
        cacheStatus.textContent = message;
    }
}

// -----------------------------------------------------------------------------
// setDemoRates()
//
// CO: Nastaví pevně zakódované přibližné kurzy jako nouzový fallback.
//
// PROČ: Pokud uživatel spustí aplikaci poprvé bez internetu a nemá žádné
//       uložené kurzy, aplikace by bez toho vůbec nefungovala. Demo kurzy
//       jsou přibližné (nejsou aktuální), ale umožní základní funkčnost.
//       Uživatel to pozná podle statusu "Demo kurzy" v nastavení.
//
// Všechny kurzy jsou relativní k USD (1 USD = X dané měny) – stejná struktura
// jako vrací API, takže converter.js s nimi pracuje identicky.
// -----------------------------------------------------------------------------
function setDemoRates() {
    exchangeRates = {
        'USD': 1, 'EUR': 0.92, 'CZK': 22.5, 'GBP': 0.79, 'JPY': 148.5,
        'CAD': 1.35, 'AUD': 1.52, 'CHF': 0.88, 'CNY': 7.18, 'PLN': 3.98,
        'HUF': 361.5, 'NOK': 10.65, 'SEK': 10.48, 'DKK': 6.89, 'RUB': 91.5,
        'TRY': 32.15, 'BRL': 5.02, 'INR': 83.5, 'KRW': 1335, 'MXN': 16.85
    };
    lastUpdateTime = new Date();
    updateCacheStatus('Demo kurzy');
}

// -----------------------------------------------------------------------------
// exportData()
//
// CO: Stáhne kompletní zálohu dat aplikace jako JSON soubor.
//
// JAK: Sestaví objekt se všemi daty, převede ho na JSON string, vytvoří
//      dočasnou URL pomocí Blob API, programaticky klikne na odkaz ke stažení
//      a pak URL uvolní z paměti.
//
// PROČ Blob API: Je to standardní způsob jak v prohlížeči "stáhnout" data,
//      která existují jen v paměti (ne na serveru). URL.createObjectURL()
//      vytvoří dočasnou adresu typu blob:// odkazující na data v RAM.
// -----------------------------------------------------------------------------
function exportData() {
    const data = {
        history: conversionHistory,
        settings: {
            theme: localStorage.getItem('theme'),
            offline_mode: localStorage.getItem('offline_mode'),
            default_from: localStorage.getItem('default_from_currency'),
            default_to: localStorage.getItem('default_to_currency')
        }
    };

    // null, 2 = hezky odsazený JSON, čitelnější pokud si uživatel soubor otevře
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Vytvoříme neviditelný odkaz, klikneme na něj a hned ho smažeme
    const a = document.createElement('a');
    a.href = url;
    a.download = `currency_converter_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    // Uvolníme paměť – Blob by jinak zůstal do zavření stránky
    URL.revokeObjectURL(url);
}

// -----------------------------------------------------------------------------
// importData(event)
//
// CO: Načte zálohu z JSON souboru a obnoví data aplikace.
//
// JAK: FileReader API asynchronně přečte soubor jako text, zparsuje JSON
//      a přepíše aktuální data v paměti i localStorage. Pak reloaduje stránku,
//      aby se nové hodnoty projevily v celém UI.
//
// PROČ reload: Po importu jsou data v paměti i localStorage aktuální,
//      ale různé části UI (selecty, toggley) stále zobrazují staré hodnoty.
//      Reload je nejjednodušší způsob jak vše synchronizovat najednou.
//
// @param {Event} event – change event z <input type="file">
// -----------------------------------------------------------------------------
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Importujeme jen data, která v souboru skutečně jsou
            // (ochrana před neúplnými nebo jinak formátovanými zálohy)
            if (data.history) {
                conversionHistory = data.history;
                localStorage.setItem('conversion_history', JSON.stringify(conversionHistory));
            }
            if (data.settings) {
                if (data.settings.theme) localStorage.setItem('theme', data.settings.theme);
                if (data.settings.offline_mode) localStorage.setItem('offline_mode', data.settings.offline_mode);
                if (data.settings.default_from) localStorage.setItem('default_from_currency', data.settings.default_from);
                if (data.settings.default_to) localStorage.setItem('default_to_currency', data.settings.default_to);
            }
            alert('Data byla úspěšně importována');
            window.location.reload();
        } catch (error) {
            // JSON.parse selže při poškozeném nebo nesprávně formátovaném souboru
            alert('Chyba při importu dat');
        }
    };
    reader.readAsText(file); // spustí asynchronní čtení, výsledek přijde do onload
}

// -----------------------------------------------------------------------------
// resetAll()
//
// CO: Kompletně smaže veškerá data aplikace a vrátí ji do výchozího stavu.
//
// PROČ confirm(): Tato akce je absolutně nevratná – smažeme localStorage,
//      paměť i všechny preference. Uživatel musí záměr potvrdit.
//
// localStorage.clear() smaže VŠE uložené pro tuto doménu – kurzy, historii,
// nastavení i téma. Po reloadu se aplikace chová jako při prvním spuštění.
// -----------------------------------------------------------------------------
function resetAll() {
    if (confirm('Opravdu chcete resetovat všechna data? Tuto akci nelze vrátit zpět.')) {
        localStorage.clear();

        // Resetujeme i globální proměnné v paměti, pro případ že by někdo
        // zavolal nějakou funkci ještě před reloadem stránky
        conversionHistory = [];
        exchangeRates = null;
        offlineMode = false;

        alert('Všechna data byla resetována');
        window.location.reload();
    }
}