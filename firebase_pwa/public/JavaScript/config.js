// =============================================================================
// config.js – Centrální konfigurace celé aplikace
// Tento soubor se načítá jako první, protože ostatní soubory z něj čerpají
// konstanty a globální proměnné. Nikdy sem nedávej logiku, jen data.
// =============================================================================

// -----------------------------------------------------------------------------
// API PŘIHLAŠOVACÍ ÚDAJE
// Používáme službu ExchangeRate-API (https://www.exchangerate-api.com/)
// API_KEY je unikátní klíč pro náš účet – bez něj API odmítne požadavek
// API_URL je základní adresa, za kterou se doplňuje klíč a měna (viz api.js)
// -----------------------------------------------------------------------------
const API_KEY = 'a36cac110388680d63fada39';
const API_URL = 'https://v6.exchangerate-api.com/v6/';

// -----------------------------------------------------------------------------
// SEZNAM PODPOROVANÝCH MĚN
// Pole určuje, které měny se zobrazí v selectech na stránce převodníku.
// Pořadí zde = pořadí v dropdown menu. Pokud chceš přidat měnu, přidej ji
// sem i do CURRENCY_NAMES níže, jinak se zobrazí bez názvu.
// -----------------------------------------------------------------------------
const CURRENCIES = [
    'USD', 'EUR', 'CZK', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'PLN',
    'HUF', 'NOK', 'SEK', 'DKK', 'RUB', 'TRY', 'BRL', 'INR', 'KRW', 'MXN'
];

// -----------------------------------------------------------------------------
// PŘEKLADY NÁZVŮ MĚN
// Objekt mapuje třípísmenný kód ISO 4217 na český název měny.
// Používá se v ui.js při vyplňování dropdown selectů, aby uživatel viděl
// "EUR - Euro" místo pouhého "EUR".
// -----------------------------------------------------------------------------
const CURRENCY_NAMES = {
    'USD': 'Americký dolar', 'EUR': 'Euro', 'CZK': 'Česká koruna',
    'GBP': 'Britská libra', 'JPY': 'Japonský jen', 'CAD': 'Kanadský dolar',
    'AUD': 'Australský dolar', 'CHF': 'Švýcarský frank', 'CNY': 'Čínský jüan',
    'PLN': 'Polský zlotý', 'HUF': 'Maďarský forint', 'NOK': 'Norská koruna',
    'SEK': 'Švédská koruna', 'DKK': 'Dánská koruna', 'RUB': 'Ruský rubl',
    'TRY': 'Turecká lira', 'BRL': 'Brazilský real', 'INR': 'Indická rupie',
    'KRW': 'Jihokorejský won', 'MXN': 'Mexické peso'
};

// -----------------------------------------------------------------------------
// GLOBÁLNÍ STAV APLIKACE
// Tyto proměnné jsou sdílené napříč všemi JS soubory (jsou v globálním scope).
// Používáme `let` protože se jejich hodnota během běhu aplikace mění.
//
// exchangeRates  – objekt s kurzy z API, např. { USD: 1, EUR: 0.92, CZK: 22.5 }
//                  null = kurzy ještě nebyly načteny
// lastUpdateTime – Date objekt s časem posledního úspěšného načtení kurzů
//                  zobrazuje se uživateli jako "Poslední aktualizace: 12:34"
// conversionHistory – pole objektů s historií převodů (max 50 položek, viz storage.js)
// offlineMode    – pokud true, aplikace přeskočí volání API a použije uložené kurzy
// -----------------------------------------------------------------------------
let exchangeRates = null;
let lastUpdateTime = null;
let conversionHistory = [];
let offlineMode = false;