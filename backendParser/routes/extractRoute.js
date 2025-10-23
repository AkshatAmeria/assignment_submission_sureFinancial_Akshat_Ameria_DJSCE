

const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const detectBank = require('../utils/bankDetector');
const parseICICIStatement = require('../services/banks/iciciParser');
const parseHDFCStatement = require('../services/banks/hdfcParser'); 
const parseHDFCAltStatement = require('../services/banks/hdfcAltParser');
const parseAmexStatement = require('../services/banks/amexParser');
const parseKotakStatement = require('../services/banks/kotakParser');
const parseSBIStatement = require('../services/banks/sbiParser');

const genaiModule = require('@google/genai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const HarmCategory = genaiModule.HarmCategory;
const HarmBlockThreshold = genaiModule.HarmBlockThreshold;


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


async function safeParsePdf(buffer, retries = 2) {
  try {
    return await pdf(buffer);
  } catch (err) {
  
    const isRetriable =
      (err.message.includes('bad XRef entry') ||
        err.status === 500 ||
        err.error === 'Internal Server Error') &&
      retries > 0;
      
    if (isRetriable && retries > 0) {
      console.warn('⚠️ Retrying PDF parse...');
      await new Promise((res) => setTimeout(res, 10000)); // 10s retry
      return safeParsePdf(buffer, retries - 1);
    }
    throw err;
  }
}


const apiKey =  "AIzaSyA27slhT01TG7rP031LZEe1qYS20ArKBzI";
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  responseMimeType: 'application/json',
  temperature: 0.5,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig,
  safetySettings,
});

router.post('/single', upload.single('pdfFile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  if (req.file.mimetype !== 'application/pdf')
    return res.status(400).json({ error: 'Uploaded file is not a PDF.' });

  let extracted = {};
  let insights = {};
  let insightError = null;
  let bankName = 'UNKNOWN';

  try {
    const data = await safeParsePdf(req.file.buffer);
    const text = data.text;

    bankName = detectBank(text);

    
    switch (bankName) {
      case 'ICICI':
        extracted = parseICICIStatement(text);
        break;
      case 'HDFC':
        extracted = parseHDFCAltStatement(text);
        break;
      case 'AMERICAN EXPRESS':
      case 'AMEX': 
        extracted = parseAmexStatement(text);
        break;
      case 'KOTAK':
      case 'KOTAK MAHINDRA BANK': 
        extracted = parseKotakStatement(text);
        break;
      case 'SBI CARD':
      case 'STATE BANK OF INDIA':
      case 'SBI':
        extracted = parseSBIStatement(text);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported bank format or could not detect bank.',
        });
    }

  
    if (Object.keys(extracted).length > 0) {
      console.log('Generating insights with Gemini...');
      
    

const insightPrompt = `
You are an expert financial analyst. Analyze the following credit card statement JSON and categorize each transaction.

⚠️ Important: Respond *only* with a JSON object with this exact structure:

{
  "insights": {
    "summary": "You are an expert financial analyst. Analyze the provided credit card statement and produce **one output**:

1. **Natural summary paragraph** – Provide a clear and concise overview of the overall financial activity. Include key details such as:
    - Statement date  
    - Total amount due  
    - Minimum payment  
    - Total value of listed transactions  
    - Any noticeable trends (e.g., high spending categories, payment patterns, balance carryover)  

    Additionally, include the following **quantitative insights naturally** in the narrative:
    - Billing period in days (from statement period or from earliest and latest transaction dates)  
    - Total number of transactions  
    - Total debits and total credits  
    - Net spend (debits minus credits)  
    - Average transaction size  

    Comment analytically on trends, categories with higher spending, and patterns in payments.

Respond **only** with the summary paragraph for this key. No extra text.
",
    "quantitative_summary_metrics": {
      "averageTransactionSize": "<computed numeric string>",
      "highestSpendingCategory": {
        "name": "<category name>",
        "amount": "<total amount as string>"
      }
    },
    "recommendations": "One or two actionable tips to save money or avoid interest.",
    "unusual_charges": "Either a string 'no usual charges found' or list unusual transactions as a string.",
    "category_breakdown": {
      "Shopping": "numeric string",
      "Food": "numeric string",
      "Healthcare": "numeric string",
      "Groceries": "numeric string",
      "Others": "numeric string"
    }
  }
}

⚠️ Requirements:
- Respond ONLY in this exact JSON format. No extra text or commentary.
- All keys under "insights" must exist.
- \`averageTransactionSize\` in \`quantitative_summary_metrics\` → average of **debit** transactions.
- \`highestSpendingCategory\` in \`quantitative_summary_metrics\` → the category with the largest total spend.
- "unusual_charges" must be 'no usual charges found' if none exist.
- All numbers in "category_breakdown" must be strings.
- Each transaction amount must be counted in exactly one category:
  - "Shopping" → retail, online stores, apparel, accessories, electronics, etc.
  - "Food" → restaurants, cafes, food delivery, fast food, etc.
  - "Healthcare" → pharmacies, medical, health services.
  - "Groceries" → supermarkets, grocery stores, food markets.
  - Anything not matching the above categories must go into "Others".
- Sum the transaction amounts in each category to populate "category_breakdown".
- Ignore transactions with amount zero for the category breakdown sum.

Here is the statement data:
${JSON.stringify(extracted, null, 2)}

Respond ONLY with the JSON as specified above.
`;



      try {
        const genResult = await model.generateContent(insightPrompt);
        const response = genResult.response;
        const insightsText = response.text().trim();

        if (insightsText) {
          insights = JSON.parse(insightsText);
          console.log('Insights generated successfully.');
        } else {
          throw new Error('Gemini returned an empty response.');
        }
      } catch (e) {
        console.error('Error generating or parsing Gemini insights:', e.message);
        insightError = 'Failed to generate insights. The raw data is still available.';
        insights = {};
      }
    } else {
      console.warn('Extracted data is empty, skipping Gemini insights.');
      insightError = 'No data was extracted from the PDF, so insights could not be generated.';
    }

    // --- Final Response (includes insights) ---
    res.json({
      success: true,
      bank: bankName,
      extracted,
      insights,
      ...(insightError && { insightError }), // Conditionally add error
    });

  } catch (error) {
    console.error('Error extracting PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});


//   if (!req.files || req.files.length === 0)
//     return res.status(400).json({ error: 'No files uploaded.' });

//   const results = [];

//   for (const file of req.files) {
//     if (file.mimetype !== 'application/pdf') {
//       results.push({ success: false, error: 'Not a PDF', filename: file.originalname });
//       continue;
//     }

//     // Per-file retry handling
//     let parsed = null;
//     let retries = 2; // adjust if needed
//     while (retries >= 0) {
//       try {
//         parsed = await safeParsePdf(file.buffer);
//         break; 
//       } catch (err) {
//         const isXRefError = err.message.includes('bad XRef entry');
//         const isServerError = err.status === 500 || err.message.includes('Internal Server Error');

//         if ((isXRefError || isServerError) && retries > 0) {
//           console.warn(`⚠️ Retrying PDF parse for ${file.originalname} due to XRef/Server error...`);
//           await new Promise((res) => setTimeout(res, 1000));
//           retries--;
//         } else {
//           parsed = { error: err.message || 'Failed to parse PDF' };
//           break;
//         }
//       }
//     }

//     if (!parsed || parsed.error) {
//       results.push({ success: false, filename: file.originalname, error: parsed?.error || 'Unknown error' });
//       continue;
//     }

//     const text = parsed.text || '';
//     const bankName = detectBank(text);
//     let extracted = {};

//     try {
//       switch (bankName) {
//         case 'ICICI':
//           extracted = parseICICIStatement(text);
//           break;
//         case 'HDFC':
//           extracted = parseHDFCAltStatement(text);
//           break;
//         case 'AMERICAN EXPRESS':
//         case 'AMEX':
//           extracted = parseAmexStatement(text);
//           break;

//         case 'KOTAK' || 'KOTAK MAHINDRA BANK':
//         extracted = parseKotakStatement(text);
//         break;
        
//         case 'SBI CARD':
//         case 'STATE BANK OF INDIA':
//         case 'SBI':
//           extracted = parseSBIStatement(text);
//           break;
//         default:
//           extracted = { error: 'Unsupported bank or undetectable', bankName };
//       }

//       results.push({
//         success: true,
//         filename: file.originalname,
//         bank: bankName,
//         extracted,
//       });
//     } catch (err) {
//       results.push({
//         success: false,
//         filename: file.originalname,
//         error: err.message || 'Error extracting fields',
//       });
//     }
//   }

//   res.json({ results });
// });

router.post('/multiple', upload.array('pdfFile', 10), async (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: 'No files uploaded.' });

  const results = [];

  for (const file of req.files) {
    console.log(`🧾 Processing file: ${file.originalname}`);

    if (file.mimetype !== 'application/pdf') {
      results.push({
        success: false,
        error: 'Not a PDF',
        filename: file.originalname,
      });
      continue;
    }

    // --- Retryable PDF parse ---
    let parsed = null;
    let retries = 2;
    while (retries >= 0) {
      try {
        parsed = await safeParsePdf(file.buffer);
        break;
      } catch (err) {
        const isRetriable =
          err.message.includes('bad XRef entry') ||
          err.status === 500 ||
          err.message.includes('Internal Server Error');

        if (isRetriable && retries > 0) {
          console.warn(`⚠️ Retrying parse for ${file.originalname}...`);
          await new Promise((res) => setTimeout(res, 10000));
          retries--;
        } else {
          parsed = { error: err.message || 'Failed to parse PDF' };
          break;
        }
      }
    }

    if (!parsed || parsed.error) {
      results.push({
        success: false,
        filename: file.originalname,
        error: parsed?.error || 'Unknown parse error',
      });
      continue;
    }

    const text = parsed.text || '';
    const bankName = detectBank(text);
    let extracted = {};
    let insights = {};
    let insightError = null;

    try {
      
      switch (bankName) {
        case 'ICICI':
          extracted = parseICICIStatement(text);
          break;
        case 'HDFC':
          extracted = parseHDFCAltStatement(text);
          break;
        case 'AMERICAN EXPRESS':
        case 'AMEX':
          extracted = parseAmexStatement(text);
          break;
        case 'KOTAK':
        case 'KOTAK MAHINDRA BANK':
          extracted = parseKotakStatement(text);
          break;
        case 'SBI CARD':
        case 'STATE BANK OF INDIA':
        case 'SBI':
          extracted = parseSBIStatement(text);
          break;
        default:
          extracted = { error: 'Unsupported bank format', bankName };
      }

     
      if (Object.keys(extracted).length > 0 && !extracted.error) {
        console.log(` Generating Gemini insights for ${file.originalname}`);

const insightPrompt = `
You are an expert financial analyst. Analyze the following credit card statement JSON and categorize each transaction.

⚠️ Important: Respond *only* with a JSON object with this exact structure:

{
  "insights": {
    "summary": "You are an expert financial analyst. Analyze the provided credit card statement and produce **one output**:

1. **Natural summary paragraph** – Provide a clear and concise overview of the overall financial activity. Include key details such as:
    - Statement date  
    - Total amount due  
    - Minimum payment  
    - Total value of listed transactions  
    - Any noticeable trends (e.g., high spending categories, payment patterns, balance carryover)  

    Additionally, include the following **quantitative insights naturally** in the narrative:
    - Billing period in days (from statement period or from earliest and latest transaction dates)  
    - Total number of transactions  
    - Total debits and total credits  
    - Net spend (debits minus credits)  
    - Average transaction size  

    Comment analytically on trends, categories with higher spending, and patterns in payments.

Respond **only** with the summary paragraph for this key. No extra text.
",
    "quantitative_summary_metrics": {
      "averageTransactionSize": "<computed numeric string>",
      "highestSpendingCategory": {
        "name": "<category name>",
        "amount": "<total amount as string>"
      }
    },
    "recommendations": "One or two actionable tips to save money or avoid interest.",
    "unusual_charges": "Either a string 'no usual charges found' or list unusual transactions as a string.",
    "category_breakdown": {
      "Shopping": "numeric string",
      "Food": "numeric string",
      "Healthcare": "numeric string",
      "Groceries": "numeric string",
      "Others": "numeric string"
    }
  }
}

⚠️ Requirements:
- Respond ONLY in this exact JSON format. No extra text or commentary.
- All keys under "insights" must exist.
- \`averageTransactionSize\` in \`quantitative_summary_metrics\` → average of **debit** transactions.
- \`highestSpendingCategory\` in \`quantitative_summary_metrics\` → the category with the largest total spend.
- "unusual_charges" must be 'no usual charges found' if none exist.
- All numbers in "category_breakdown" must be strings.
- Each transaction amount must be counted in exactly one category:
  - "Shopping" → retail, online stores, apparel, accessories, electronics, etc.
  - "Food" → restaurants, cafes, food delivery, fast food, etc.
  - "Healthcare" → pharmacies, medical, health services.
  - "Groceries" → supermarkets, grocery stores, food markets.
  - Anything not matching the above categories must go into "Others".
- Sum the transaction amounts in each category to populate "category_breakdown".
- Ignore transactions with amount zero for the category breakdown sum.

Here is the statement data:
${JSON.stringify(extracted, null, 2)}

Respond ONLY with the JSON as specified above.
`;

        try {
          const genResult = await model.generateContent(insightPrompt);
          const response = genResult.response;
          const insightsText = response.text().trim();

          if (insightsText) {
            insights = JSON.parse(insightsText);
            console.log(`✅ Gemini insights generated for ${file.originalname}`);
          } else {
            throw new Error('Gemini returned an empty response.');
          }
        } catch (e) {
          console.error(`Gemini error for ${file.originalname}:`, e.message);
          insightError =
            'Failed to generate insights. The raw data is still available.';
        }
      } else {
        insightError = 'No extracted data available for this file.';
      }

      results.push({
        success: true,
        filename: file.originalname,
        bank: bankName,
        extracted,
        insights,
        ...(insightError && { insightError }),
      });
    } catch (err) {
      console.error(`Error processing ${file.originalname}:`, err.message);
      results.push({
        success: false,
        filename: file.originalname,
        error: err.message || 'Unknown processing error',
      });
    }
  }

 
  res.json({ success: true, results });
});



module.exports = router;


