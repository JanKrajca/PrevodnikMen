// =====================================================================
// utils.js – Pomocné (utility) funkce sdílené napříč celou aplikací
// Obsahuje: aktualizaci UI, demo kurzy, export/import dat, reset aplikace
// =====================================================================

// Zobrazí čas poslední aktualizace kurzů v prvku #lastUpdate na stránce převodníku
// Volá se po každém úspěšném stažení kurzů z API nebo načtení z localStorage
function updateLastUpdateDisplay() {
    // Najde DOM element s id="lastUpdate" (na stránce index.html)
    const lastUpdateSpan = document.getElementById('lastUpdate');

    // Aktualizace textu jen pokud čas existuje A element je na aktuální stránce
    // (na jiných stránkách element neexistuje a pokus o zápis by způsobil chybu)
    if (lastUpdateTime && lastUpdateSpan) {
        // Formátuje čas do lokálního formátu HH:MM:SS dle nastavení prohlížeče (cs-CZ)
        lastUpdateSpan.textContent = `Poslední aktualizace: ${lastUpdateTime.toLocaleTimeString('cs-CZ')}`;
    }
}

// Zobrazí libovolný textový stav do prvku #cacheStatus na stránce nastavení
// Parametr message je řetězec, např. 'Offline režim', 'Používám uložené kurzy' apod.
function updateCacheStatus(message) {
    // Najde DOM element s id="cacheStatus" (na stránce nastaveni.html)
    const cacheStatus = document.getElementById('cacheStatus');

    // Zapíše zprávu jen pokud element existuje (na jiných stránkách není)
    if (cacheStatus) {
        cacheStatus.textContent = message; // Přepíše text uvnitř elementu
    }
}

// Nastaví pevně zakódované (hardcoded) demo kurzy jako záložní hodnoty
// Volá se z api.js, když se nepodaří stáhnout kurzy A ani žádné nejsou v cache
// Hodnoty jsou přibližné a slouží jen k ukázce funkčnosti, nejsou aktuální
function setDemoRates() {
    // Objekt s kurzy všech podporovaných měn vztažených k USD (1 USD = X měna)
    exchangeRates = {
        'USD': 1, 'EUR': 0.92, 'CZK': 22.5, 'GBP': 0.79, 'JPY': 148.5,
        'CAD': 1.35, 'AUD': 1.52, 'CHF': 0.88, 'CNY': 7.18, 'PLN': 3.98,
        'HUF': 361.5, 'NOK': 10.65, 'SEK': 10.48, 'DKK': 6.89, 'RUB': 91.5,
        'TRY': 32.15, 'BRL': 5.02, 'INR': 83.5, 'KRW': 1335, 'MXN': 16.85
    };

    // Nastaví čas „aktualizace" na teď – i když jde jen o demo data
    lastUpdateTime = new Date();

    // Informuje uživatele v UI nastavení, že nejde o živé kurzy
    updateCacheStatus('Demo kurzy');
}

// Exportuje historii převodů a nastavení do JSON souboru, který si uživatel stáhne
// Slouží k zálohování dat nebo přenosu mezi zařízeními
function exportData() {
    // Sestaví objekt se všemi daty, která chceme exportovat
    const data = {
        history: conversionHistory, // Pole historických převodů z globální proměnné

        // Nastavení čteme přímo z localStorage, kde jsou uložena jako řetězce
        settings: {
            theme: localStorage.getItem('theme'),                       // 'dark' nebo 'light'
            offline_mode: localStorage.getItem('offline_mode'),         // 'true' nebo null
            default_from: localStorage.getItem('default_from_currency'), // Výchozí zdrojová měna
            default_to: localStorage.getItem('default_to_currency')     // Výchozí cílová měna
        }
    };

    // Převede JavaScriptový objekt na formátovaný JSON řetězec (odsazení 2 mezery pro čitelnost)
    const dataStr = JSON.stringify(data, null, 2);

    // Vytvoří binární Blob objekt z JSON řetězce – nutné pro vytvoření stahovacího odkazu
    const blob = new Blob([dataStr], { type: 'application/json' });

    // Vytvoří dočasnou URL adresu odkazující na Blob v paměti prohlížeče
    const url = URL.createObjectURL(blob);

    // Vytvoří dočasný odkaz <a> v DOM (není ho potřeba přidávat do stránky)
    const a = document.createElement('a');
    a.href = url; // Nastaví href na Blob URL

    // Nastaví název souboru ke stažení – obsahuje aktuální datum ve formátu YYYY-MM-DD
    a.download = `currency_converter_backup_${new Date().toISOString().split('T')[0]}.json`;

    // Simuluje kliknutí na odkaz – prohlížeč zahájí stahování souboru
    a.click();

    // Uvolní Blob URL z paměti – dobrá praxe, předchází únikům paměti
    URL.revokeObjectURL(url);
}

// Importuje dříve exportovaná data ze souboru JSON
// Volá se jako event handler na input[type="file"] (viz settings.js)
// Parametr event je objekt události změny vstupního prvku pro soubory
function importData(event) {
    // Přístup k prvnímu vybranému souboru (uživatel mohl vybrat jen jeden díky accept=".json")
    const file = event.target.files[0];

    // Pokud žádný soubor vybrán nebyl (uživatel dialog zrušil), funkce se ukončí
    if (!file) return;

    // FileReader umí číst obsah souboru z disku uživatele asynchronně
    const reader = new FileReader();

    // Callback se zavolá po dokončení čtení souboru (onload = hotovo)
    reader.onload = (e) => {
        try {
            // Parsuje načtený JSON text zpět na JavaScriptový objekt
            const data = JSON.parse(e.target.result);

            // Pokud exportovaná data obsahují historii, přepíše aktuální historii
            if (data.history) {
                conversionHistory = data.history; // Aktualizuje globální proměnnou
                localStorage.setItem('conversion_history', JSON.stringify(conversionHistory)); // Uloží do localStorage
            }

            // Pokud data obsahují nastavení, obnoví je do localStorage
            if (data.settings) {
                if (data.settings.theme) localStorage.setItem('theme', data.settings.theme);
                if (data.settings.offline_mode) localStorage.setItem('offline_mode', data.settings.offline_mode);
                if (data.settings.default_from) localStorage.setItem('default_from_currency', data.settings.default_from);
                if (data.settings.default_to) localStorage.setItem('default_to_currency', data.settings.default_to);
            }

            // Uživateli oznámí úspěch nativním dialógem prohlížeče
            alert('Data byla úspěšně importována');

            // Znovu načte stránku, aby se všechny importované hodnoty projevily v UI
            window.location.reload();
        } catch (error) {
            // Pokud JSON není validní nebo soubor má jiný formát, informuje uživatele
            alert('Chyba při importu dat');
        }
    };

    // Spustí čtení souboru jako prostý text (UTF-8) – výsledek se předá do reader.onload
    reader.readAsText(file);
}

// Kompletní reset aplikace – smaže veškerá uložená data a vrátí aplikaci do výchozího stavu
// Před provedením zobrazí potvrzovací dialog, aby uživatel nemohl resetovat omylem
function resetAll() {
    // Zobrazí confirm dialog – pokud uživatel klikne „Zrušit", funkce se ukončí
    if (confirm('Opravdu chcete resetovat všechna data? Tuto akci nelze vrátit zpět.')) {
        // Smaže všechna data z localStorage (kurzy, historii, nastavení, téma...)
        localStorage.clear();

        // Vyprázdní globální pole s historií převodů v paměti
        conversionHistory = [];

        // Resetuje globální kurzy – aplikace je znovu stáhne při příštím použití
        exchangeRates = null;

        // Vypne offline režim – aplikace se vrátí do online stavu
        offlineMode = false;

        // Informuje uživatele, že reset proběhl úspěšně
        alert('Všechna data byla resetována');

        // Znovu načte stránku – UI se zobrazí v čistém výchozím stavu
        window.location.reload();
    }
}
