// services/parsers/sbiParser.js

function parseSBIStatement(rawText) {
    // Normalize whitespace
    const text = rawText.replace(/\s+/g, ' ').trim();
    const result = {};

    // Cardholder
const cardholderMatch = text.match(/Cardholder:\s*([A-Za-z\s\.]+)(?=\s*Card No:)/i);
result.cardholder = cardholderMatch ? cardholderMatch[1].trim() : null;


    // Statement Date
    const statementDateMatch = text.match(/Stmt Date:\s*([\d]{1,2} [A-Za-z]{3} [\d]{4})/i);
    result.statementDate = statementDateMatch ? statementDateMatch[1] : null;

    // Due Date
    const dueDateMatch = text.match(/Due Date:\s*([\d]{1,2} [A-Za-z]{3} [\d]{4})/i);
    result.dueDate = dueDateMatch ? dueDateMatch[1] : null;

    // Total Due
    const totalDueMatch = text.match(/TOTAL AMOUNT DUE:\s*₹([\d,]+)/i);
    result.totalDue = totalDueMatch ? totalDueMatch[1].replace(/,/g, '') : null;

    // Minimum Due
    const minDueMatch = text.match(/MIN AMOUNT DUE:\s*₹([\d,]+)/i);
    result.minDue = minDueMatch ? minDueMatch[1].replace(/,/g, '') : null;

    // Transactions
    // Pattern: DD MMMDescriptionRefNoAmount
    const transactionPattern = /(\d{2} [A-Za-z]{3})([A-Za-z0-9 @#'&\-\.\s]+?)(\d{10,}|\w+\/\d+)(-?[\d,]+)/g;
    const transactions = [];
    let match;

    while ((match = transactionPattern.exec(text)) !== null) {
        const date = match[1] + "-2025"; // Add year
        const description = match[2].trim();
        const amountRaw = match[4].replace(/,/g, '');
        const amountNum = parseFloat(amountRaw);

        // Determine type
        const type = amountNum < 0 ? 'CREDIT' : 'DEBIT';

        transactions.push({
            date: date,
            description: description,
            amount: Math.abs(amountNum).toString(),
            type,
            balance: null // No running balance in this statement
        });
    }

    result.transactions = transactions;

    return result;
}

module.exports = parseSBIStatement;
