// =====================================================================
// config.js – Konfigurace aplikace
// Obsahuje API klíč, seznam měn a globální proměnné sdílené napříč soubory
// =====================================================================

// API klíč pro přístup ke službě ExchangeRate-API
// Každý uživatel má vlastní klíč, který ho identifikuje vůči serveru
const API_KEY = 'a36cac110388680d63fada39';

// Základní URL adresa API endpointu
// Za URL se za běhu doplní klíč a kód měny, např.: .../a36cac.../latest/USD
const API_URL = 'https://v6.exchangerate-api.com/v6/';

// Pole kódů měn, které aplikace podporuje a zobrazuje v selectboxech
// Jsou uspořádány od nejpoužívanějších k méně běžným
const CURRENCIES = [
    'USD', 'EUR', 'CZK', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'PLN',
    'HUF', 'NOK', 'SEK', 'DKK', 'RUB', 'TRY', 'BRL', 'INR', 'KRW', 'MXN'
];

// Slovník (objekt) mapující třípísmenný kód měny na její celý název v češtině
// Klíč je kód (např. 'USD'), hodnota je název (např. 'Americký dolar')
// Používá se při plnění <select> prvků, aby uživatel viděl srozumitelný název
const CURRENCY_NAMES = {
    'USD': 'Americký dolar', 'EUR': 'Euro', 'CZK': 'Česká koruna',
    'GBP': 'Britská libra', 'JPY': 'Japonský jen', 'CAD': 'Kanadský dolar',
    'AUD': 'Australský dolar', 'CHF': 'Švýcarský frank', 'CNY': 'Čínský jüan',
    'PLN': 'Polský zlotý', 'HUF': 'Maďarský forint', 'NOK': 'Norská koruna',
    'SEK': 'Švédská koruna', 'DKK': 'Dánská koruna', 'RUB': 'Ruský rubl',
    'TRY': 'Turecká lira', 'BRL': 'Brazilský real', 'INR': 'Indická rupie',
    'KRW': 'Jihokorejský won', 'MXN': 'Mexické peso'
};

// Globální proměnná pro uložení aktuálních kurzů z API
// Začíná jako null – dokud se kurzy nenačtou, je prázdná
// Po načtení obsahuje objekt { 'USD': 1, 'EUR': 0.92, ... }
let exchangeRates = null;

// Globální proměnná uchovávající čas poslední úspěšné aktualizace kurzů
// Slouží k zobrazení informace „Poslední aktualizace: HH:MM:SS" v UI
let lastUpdateTime = null;

// Globální pole pro historii provedených převodů
// Každý záznam je objekt s částkou, měnami, výsledkem, kurzem a časovým razítkem
// Při startu aplikace se pole naplní z localStorage (viz storage.js)
let conversionHistory = [];

// Globální příznak offline režimu
// Pokud je true, aplikace neposílá požadavky na API a používá naposledy uložené kurzy
// Uživatel jej přepíná přepínačem na stránce Nastavení
let offlineMode = false;
