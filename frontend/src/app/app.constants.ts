export const mempoolFeeColors = [ // MEWCbrand: mempool block colours
  '0BAF6E', // green
  '20C572',
  '40C884',
  '2BCF74',
  '36DA76',
  '36DA76',
  '41E578',
  '4CEF7A',
  '57FA7C',
  '62FF7E',
  '6DFF7F',
  '79FF7E',
  '84FF7D',
  '8FFF7C',
  '9AFF7A',
  'FFEBA1', // yellow
  'ffe68a',
  'FFDF6C',
  'FFD53E',
  'ffd333',
  'fdc500',
  'FDB963',
  'C9A5FF',
  'be8aff', // purple
  'B071FF',
  'A35AFF',
  '9447f6',
  '8423FF',
  '9447f6',
  'A54DC3', // transition reds
  'D57AA5',
  'E6A29C',
  'ff8e8e', // red
  'ff6464',
  'ff4b4b',
  'ff3232',
  'f62626',
  'ff0000'
];

export const chartColors = [
  '#D81B60',
  '#8E24AA',
  '#5E35B1',
  '#3949AB',
  '#1E88E5',
  '#039BE5',
  '#00ACC1',
  '#00897B',
  '#43A047',
  '#7CB342',
  '#C0CA33',
  '#FDD835',
  '#FFB300',
  '#FB8C00',
  '#F4511E',
  '#6D4C41',
  '#757575',
  '#546E7A',
  '#b71c1c',
  '#880E4F',
  '#4A148C',
  '#311B92',
  '#1A237E',
  '#0D47A1',
  '#01579B',
  '#006064',
  '#004D40',
  '#1B5E20',
  '#33691E',
  '#827717',
  '#F57F17',
  '#FF6F00',
  '#E65100',
  '#BF360C',
  '#3E2723',
  '#212121',
  '#263238',
  '#801313',
];

export const poolsColor = {
  'unknown': '#FDD835',        // MeowPow Unknown (poolId: 0)
  'unknown-scrypt': '#67a1cb', // Scrypt Unknown (poolId: -1) - Litecoin blue
};

export const feeLevels = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200,
  250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000];

export interface Language {
  code: string;
  name: string;
}

export const languages: Language[] = [
   { code: 'ar', name: 'العربية' },         // Arabic
// { code: 'bg', name: 'Български' },       // Bulgarian
// { code: 'bs', name: 'Bosanski' },        // Bosnian
// { code: 'ca', name: 'Català' },          // Catalan
   { code: 'cs', name: 'Čeština' },         // Czech
   { code: 'da', name: 'Dansk' },           // Danish
   { code: 'de', name: 'Deutsch' },         // German
// { code: 'et', name: 'Eesti' },           // Estonian
// { code: 'el', name: 'Ελληνικά' },        // Greek
   { code: 'en', name: 'English' },         // English
   { code: 'es', name: 'Español' },         // Spanish
// { code: 'eo', name: 'Esperanto' },       // Esperanto
// { code: 'eu', name: 'Euskara' },         // Basque
   { code: 'fa', name: 'فارسی' },           // Persian
   { code: 'fr', name: 'Français' },        // French
// { code: 'gl', name: 'Galego' },          // Galician
   { code: 'ko', name: '한국어' },          // Korean
// { code: 'hr', name: 'Hrvatski' },        // Croatian
// { code: 'id', name: 'Bahasa Indonesia' },// Indonesian
   { code: 'hi', name: 'हिन्दी' },             // Hindi
   { code: 'ne', name: 'नेपाली' },            // Nepalese
   { code: 'it', name: 'Italiano' },        // Italian
   { code: 'he', name: 'עברית' },           // Hebrew
   { code: 'ka', name: 'ქართული' },         // Georgian
// { code: 'lv', name: 'Latviešu' },        // Latvian
   { code: 'lt', name: 'Lietuvių' },        // Lithuanian
   { code: 'hu', name: 'Magyar' },          // Hungarian
   { code: 'mk', name: 'Македонски' },      // Macedonian
// { code: 'ms', name: 'Bahasa Melayu' },   // Malay
   { code: 'nl', name: 'Nederlands' },      // Dutch
   { code: 'ja', name: '日本語' },          // Japanese
   { code: 'nb', name: 'Norsk' },           // Norwegian Bokmål
// { code: 'nn', name: 'Norsk Nynorsk' },   // Norwegian Nynorsk
   { code: 'pl', name: 'Polski' },          // Polish
   { code: 'pt', name: 'Português' },       // Portuguese
// { code: 'pt-BR', name: 'Português (Brazil)' }, // Portuguese (Brazil)
   { code: 'ro', name: 'Română' },          // Romanian
   { code: 'ru', name: 'Русский' },         // Russian
// { code: 'sk', name: 'Slovenčina' },      // Slovak
   { code: 'sl', name: 'Slovenščina' },     // Slovenian
// { code: 'sr', name: 'Српски / srpski' }, // Serbian
// { code: 'sh', name: 'Srpskohrvatski / српскохрватски' },// Serbo-Croatian
   { code: 'fi', name: 'Suomi' },           // Finnish
   { code: 'sv', name: 'Svenska' },         // Swedish
   { code: 'th', name: 'ไทย' },             // Thai
   { code: 'tr', name: 'Türkçe' },          // Turkish
   { code: 'uk', name: 'Українська' },      // Ukrainian
   { code: 'vi', name: 'Tiếng Việt' },      // Vietnamese
   { code: 'zh', name: '中文' },            // Chinese
];

export const specialBlocks = {
  '0': {
    labelEvent: 'Genesis',
    labelEventCompleted: 'The Genesis of Meowcoin',
    networks: ['mainnet', 'testnet'],
  },
  '2100000': {
    labelEvent: 'Meowcoin\'s 1st Halving',
    labelEventCompleted: 'Block Subsidy has halved to 2500 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '2940000': {
    labelEvent: 'Meowcoin\'s 2nd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 1250 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '3780000': {
    labelEvent: 'Meowcoin\'s 3rd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 625 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '4620000': {
    labelEvent: 'Meowcoin\'s 4th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 312.5 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '5460000': {
    labelEvent: 'Meowcoin\'s 5th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 156.25 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '6300000': {
    labelEvent: 'Meowcoin\'s 6th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 78.125 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '7140000': {
    labelEvent: 'Meowcoin\'s 7th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 39.0625 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '7980000': {
    labelEvent: 'Meowcoin\'s 8th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 19.53125 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '8820000': {
    labelEvent: 'Meowcoin\'s 9th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 9.765625 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '9660000': {
    labelEvent: 'Meowcoin\'s 10th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 4.8828125 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '10500000': {
    labelEvent: 'Meowcoin\'s 11th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 2.44140625 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '11340000': {
    labelEvent: 'Meowcoin\'s 12th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 1.220703125 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '12180000': {
    labelEvent: 'Meowcoin\'s 13th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.6103515625 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '13020000': {
    labelEvent: 'Meowcoin\'s 14th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.30517578125 MEWC per block',
    networks: ['mainnet', 'testnet'],
  },
  '13860000': {
    labelEvent: 'Meowcoin\'s 15th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.152587890625 MEWC per block',
    networks: ['mainnet', 'testnet'],
  }
};

export const fiatCurrencies = {
  AUD: {
    name: 'Australian Dollar',
    code: 'AUD',
    indexed: true,
  },
  EUR: {
    name: 'Euro',
    code: 'EUR',
    indexed: true,
  },
  GBP: {
    name: 'Pound Sterling',
    code: 'GBP',
    indexed: true,
  },
  JPY: {
    name: 'Japanese Yen',
    code: 'JPY',
    indexed: true,
  },
  USD: {
    name: 'US Dollar',
    code: 'USD',
    indexed: true,
  },
};
