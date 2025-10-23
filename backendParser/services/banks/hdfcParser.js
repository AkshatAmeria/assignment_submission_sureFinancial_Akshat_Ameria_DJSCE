// services/parsers/hdfcParser.js

function parseHDFCStatement(rawText) {
  const text = rawText.replace(/\s+/g, ' ').trim();
  const result = {};

  // 🔹 Cardholder Name
  const cardholderMatch = text.match(/Cardholder([A-Za-z\s]+?)Card/i);
  result.cardholder = cardholderMatch ? cardholderMatch[1].trim() : null;

  // 🔹 Statement Date
  const statementDateMatch = text.match(/Statement Date([0-9]{1,2}-[A-Za-z]{3}-[0-9]{4})/i);
  result.statementDate = statementDateMatch ? statementDateMatch[1] : null;

  // 🔹 Total Due
  const totalDueMatch = text.match(/Total DueINR\s*([\d,]+\.\d{2})/i);
  result.totalDue = totalDueMatch ? totalDueMatch[1] : null;

  // 🔹 Minimum Due
  const minDueMatch = text.match(/Minimum DueINR\s*([\d,]+\.\d{2})/i);
  result.minDue = minDueMatch ? minDueMatch[1] : null;

  // 🔹 Transactions
  const transactionPattern =
    /(\d{2}-[A-Za-z]{3}-\d{4})([A-Za-z\s]+)INR\s*([\d,]+\.\d{2})(DEBIT|CREDIT)INR\s*([\d,]+\.\d{2})/g;

  const transactions = [];
  let match;

  while ((match = transactionPattern.exec(text)) !== null) {
    transactions.push({
      date: match[1].trim(),
      description: match[2].trim(),
      amount: match[3],
      type: match[4],
      balance: match[5],
    });
  }

  result.transactions = transactions;
  return result;
}

module.exports = parseHDFCStatement;
