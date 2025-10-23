

function parseAmexStatement(rawText) {
  const text = rawText.replace(/\s+/g, ' ').trim();
  const result = {};

  // Cardholder
  const cardholderMatch = text.match(/Account holder:\s*([A-Za-z\s\.]+)(?=\sCustomer)/i);
  result.cardholder = cardholderMatch ? cardholderMatch[1].trim() : null;

  // Statement Date
  const statementDateMatch = text.match(/Statement date:\s*([A-Za-z]{3}\s\d{2},\s\d{4})/i);
  result.statementDate = statementDateMatch ? statementDateMatch[1] : null;

  // Total Due (New balance)
  const totalDueMatch = text.match(/New balance:\s*\$([\d,]+\.\d{2})/i);
  result.totalDue = totalDueMatch ? totalDueMatch[1] : null;

 
  const minDueMatch = text.match(/Minimum due:\s*\$([\d,]+\.\d{2})/i);
  result.minDue = minDueMatch ? minDueMatch[1] : null;

  
  const transactionPattern = /(\d{2}\/\d{2}\/\d{4})([A-Za-z0-9\s\.,]+?)\$([\d,]+\.\d{2})/g;

  const transactions = [];
  let match;

  while ((match = transactionPattern.exec(text)) !== null) {
    const rawAmount = match[3];
    const amountNum = parseFloat(rawAmount.replace(/,/g, ''));

   
    const type = amountNum < 0 ? 'CREDIT' : 'DEBIT';

    transactions.push({
      date: match[1].trim(),
      description: match[2].trim(),
      amount: Math.abs(amountNum).toFixed(2),
      type,
      balance: null 
    });
  }

  result.transactions = transactions;
  return result;
}

module.exports = parseAmexStatement;
