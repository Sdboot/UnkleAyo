export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
]

export const currencyPrices = {
  USD: 50,
  EUR: 45,
  GBP: 40,
  CAD: 68,
  AUD: 75,
  JPY: 5500,
  INR: 4150,
  NGN: 22000,
  ZAR: 920,
  MXN: 850
}

export const bankDetails = {
  USD: {
    symbol: '$',
    accountName: 'UnkleAyo',
    accountNumber: '1234567890',
    bankName: 'Chase Bank',
    swiftCode: 'CHASUS33',
    routingNumber: '021000021'
  },
  EUR: {
    symbol: '€',
    accountName: 'UnkleAyo',
    accountNumber: 'DE89370400440532013000',
    bankName: 'Deutsche Bank',
    swiftCode: 'DEUTDE',
    iban: 'DE89370400440532013000'
  },
  GBP: {
    symbol: '£',
    accountName: 'UnkleAyo',
    accountNumber: '41926819',
    bankName: 'Barclays Bank UK',
    swiftCode: 'BARCGB22',
    sortCode: '20-26-97'
  },
  CAD: {
    symbol: '$',
    accountName: 'UnkleAyo',
    accountNumber: '0062123456789',
    bankName: 'Royal Bank of Canada',
    swiftCode: 'ROYCCA2S',
    routingNumber: '000026009'
  },
  AUD: {
    symbol: '$',
    accountName: 'UnkleAyo',
    accountNumber: '123456789',
    bankName: 'Commonwealth Bank',
    swiftCode: 'CTBKAU2S',
    bsb: '062-126'
  },
  JPY: {
    symbol: '¥',
    accountName: 'UnkleAyo',
    accountNumber: '1234567',
    bankName: 'Tokyo Bank',
    swiftCode: 'TOKYJ',
    branchCode: '100'
  },
  INR: {
    symbol: '₹',
    accountName: 'UnkleAyo',
    accountNumber: '0123456789012345',
    bankName: 'HDFC Bank',
    swiftCode: 'HDFCINBB',
    ifscCode: 'HDFC0000001'
  },
  NGN: {
    symbol: '₦',
    accountName: 'UnkleAyo',
    accountNumber: '1234567890',
    bankName: 'First Bank Nigeria',
    swiftCode: 'FBNGNG',
    bankCode: '011'
  },
  ZAR: {
    symbol: 'R',
    accountName: 'UnkleAyo',
    accountNumber: '123456789',
    bankName: 'Standard Bank',
    swiftCode: 'SBZAZAJJ',
    branchCode: '051001'
  },
  MXN: {
    symbol: '$',
    accountName: 'UnkleAyo',
    accountNumber: '0123456789',
    bankName: 'Banco Azteca',
    swiftCode: 'AZTAMXMX',
    bankCode: '127'
  }
}
