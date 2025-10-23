// services/parsers/kotakParser.js

function parseKotakStatement(rawText) {
  const text = rawText.replace(/\s+/g, ' ').trim();
  const result = {};

  // Cardholder
const cardholderMatch = text.match(/Cardholder\s*([A-Za-z\s]+?)(?=Card\s*\()/i);
  result.cardholder = cardholderMatch ? cardholderMatch[1].trim() : null;

  // Statement Date
  const statementDateMatch = text.match(/Statement\s+Date[:\s]+(\d{1,2}-[A-Za-z]{3}-\d{4})/i);
  result.statementDate = statementDateMatch ? statementDateMatch[1] : null;

  // Payment Due Date
  const dueDateMatch = text.match(/Payment\s+Due\s+Date[:\s]+(\d{1,2}-[A-Za-z]{3}-\d{4})/i);
  result.dueDate = dueDateMatch ? dueDateMatch[1] : null;

  // Total Due
  const totalDueMatch = text.match(/Total\s+DueINR\s*([\d,]+\.\d{2})/i);
  result.totalDue = totalDueMatch ? totalDueMatch[1].replace(/,/g, '') : null;

  // Minimum Due
  const minDueMatch = text.match(/Minimum\s+DueINR\s*([\d,]+\.\d{2})/i);
  result.minDue = minDueMatch ? minDueMatch[1].replace(/,/g, '') : null;

  // Transactions
  // Format: DD-MMM-YYYY Description INR Amount Type INR Balance
  const transactionPattern = /(\d{2}-[A-Za-z]{3}-\d{4})([A-Za-z0-9\s]+?)INR\s*([\d,]+\.\d{2})(DEBIT|CREDIT)INR\s*([\d,]+\.\d{2})/g;

  const transactions = [];
  let match;
  while ((match = transactionPattern.exec(text)) !== null) {
    transactions.push({
      date: match[1].trim(),
      description: match[2].trim(),
      amount: match[3].replace(/,/g, ''),
      type: match[4].trim(),
      balance: match[5].replace(/,/g, '')
    });
  }

  result.transactions = transactions;
  return result;
}

module.exports = parseKotakStatement;
