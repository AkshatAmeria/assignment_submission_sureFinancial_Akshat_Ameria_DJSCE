// utils/bankDetector.js

const detectBank = (text) => {
  const normalized = text.toUpperCase();

  if (normalized.includes('ICICI BANK')) return 'ICICI';
  if (normalized.includes('HDFC BANK')) return 'HDFC';
  if (normalized.includes('AMERICAN EXPRESS' || 'AMEX')) return 'AMERICAN EXPRESS';
  if (normalized.includes('KOTAK MAHINDRA BANK')) return 'KOTAK';
  if (normalized.includes('SBI')) return 'SBI CARD';

  return 'UNKNOWN';
};

module.exports = detectBank;
