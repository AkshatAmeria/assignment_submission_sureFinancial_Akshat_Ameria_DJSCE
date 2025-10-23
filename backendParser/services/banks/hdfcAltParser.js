// services/parsers/hdfcAltParser.js

function parseHDFCAltStatement(rawText) {
  // Normalize whitespace
  const text = rawText.replace(/\s+/g, ' ').trim();
  const result = {};

  // 🔹 Cardholder / Account Holder
// Correct Cardholder regex
const cardholderMatch = text.match(/Account Holder:\s*([A-Za-z\s]+?)(?=\s+Credit Card Number)/i);
result.cardholder = cardholderMatch ? cardholderMatch[1].trim() : null;


  // 🔹 Statement Date
  const statementDateMatch = text.match(/Statement Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  result.statementDate = statementDateMatch ? statementDateMatch[1] : null;

  // 🔹 Total Due
  const totalDueMatch = text.match(/Total Balance Due\s*([\d,]+\.\d{2})/i);
  result.totalDue = totalDueMatch ? totalDueMatch[1] : null;

  // 🔹 Minimum Due
  const minDueMatch = text.match(/Minimum Payment Due\s*([\d,]+\.\d{2})/i);
  result.minDue = minDueMatch ? minDueMatch[1] : null;

  // 🔹 Transactions
  const transactionPattern = /(\d{4}-\d{2}-\d{2})([A-Za-z\s]+)(-?[\d,]+\.\d{2})/g;

  const transactions = [];
  let match;
  while ((match = transactionPattern.exec(text)) !== null) {
    const rawAmount = match[3];
    const type = rawAmount.startsWith('-') ? 'DEBIT' : 'CREDIT';

    transactions.push({
      date: match[1].trim(),
      description: match[2].trim(),
      amount: rawAmount.replace('-', ''), // remove negative sign
      type,
      balance: null, // no balance column in this layout
    });
  }

  result.transactions = transactions;
  return result;
}

module.exports = parseHDFCAltStatement;
