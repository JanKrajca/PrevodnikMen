// API klíč
const API_KEY = 'a36cac110388680d63fada39';
const API_URL = 'https://v6.exchangerate-api.com/v6/';

// Seznam měn
const CURRENCIES = [
    'USD', 'EUR', 'CZK', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'PLN',
    'HUF', 'NOK', 'SEK', 'DKK', 'RUB', 'TRY', 'BRL', 'INR', 'KRW', 'MXN'
];

const CURRENCY_NAMES = {
    'USD': 'Americký dolar', 'EUR': 'Euro', 'CZK': 'Česká koruna',
    'GBP': 'Britská libra', 'JPY': 'Japonský jen', 'CAD': 'Kanadský dolar',
    'AUD': 'Australský dolar', 'CHF': 'Švýcarský frank', 'CNY': 'Čínský jüan',
    'PLN': 'Polský zlotý', 'HUF': 'Maďarský forint', 'NOK': 'Norská koruna',
    'SEK': 'Švédská koruna', 'DKK': 'Dánská koruna', 'RUB': 'Ruský rubl',
    'TRY': 'Turecká lira', 'BRL': 'Brazilský real', 'INR': 'Indická rupie',
    'KRW': 'Jihokorejský won', 'MXN': 'Mexické peso'
};

// Globální stav
let exchangeRates = null;
let lastUpdateTime = null;
let conversionHistory = [];
let offlineMode = false;