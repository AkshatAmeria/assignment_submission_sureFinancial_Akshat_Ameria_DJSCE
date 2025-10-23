# Credit Card Statement Parser & Insights Tool

# Test the application with the pdf uploaded on github in uploaded folder

# Deployed Backend API's on render:
https://assignment-submission-surefinancial.onrender.com/api/v1/single , 
https://assignment-submission-surefinancial.onrender.com/api/v1/multiple

# Deployed application on netlify:
https://68fa72fe2da1ef3964c007c9--ubiquitous-mochi-68d84e.netlify.app/

[![Node.js](https://img.shields.io/badge/Node.js-v20.0-green)]()
[![React](https://img.shields.io/badge/React-v19.2-blue)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

---

## Overview

This project allows users to upload **single or multiple bank/credit card PDF statements** and automatically parses them to extract key financial data. Extracted data is analyzed using a **Large Language Model (LLM)** to generate:

- Insights and summaries
- Quantitative metrics
- Personalized recommendations
- Spending categorization
- Unusual charge detection

Visualizations are provided using **Recharts** for an interactive dashboard experience.

---

## Key Features

### 1. PDF Parsing
- Supports **single or multiple PDF statements**
- Extracts key information including:
  - Cardholder name
  - Statement date & due date
  - Total amount due & minimum payment due
  - Complete transaction history with:
    - Date
    - Description
    - Amount
    - Type (DEBIT/CREDIT)
    - Balance

### 2. AI-Powered Analysis & Insights
- Generates **spending summary** for the billing period
- Calculates **quantitative metrics** (average transaction size, highest spending category)
- Provides **personalized recommendations** for financial management
- Detects **unusual charges** and alerts
- Automatically **categorizes transactions** (Shopping, Food, Healthcare, Groceries, Others)

### 3. Interactive Visualization
- Uses **Recharts** to display:
  - Category-wise spending breakdown
  - Spending trends over time
  - Key financial metrics
  - Visual summaries

### 4. RESTful API
- `/api/v1/single` → Upload and parse a **single PDF**
- `/api/v1/multiple` → Upload and parse **multiple PDFs** in one request

---

## API Documentation

### 1. Single PDF Parser

**Endpoint:**  
```
POST /api/v1/single
```

**Request:**  
- Content-Type: `multipart/form-data`  
- Body parameter: `pdfFile` (PDF file)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/single \
  -F 'pdfFile=@/path/to/statement.pdf'
```

**Response Example:**
```json
{
  "success": true,
  "bank": "KOTAK",
  "extracted": {
    "cardholder": "Akshat Ameria",
    "statementDate": "30-Sep-2025",
    "dueDate": "15-Oct-2025",
    "totalDue": "15818.73",
    "minDue": "790.94",
    "transactions": [
      {
        "date": "02-Sep-2025",
        "description": "Grocery Store",
        "amount": "6992.06",
        "type": "DEBIT",
        "balance": "53994.50"
      },
      {
        "date": "04-Sep-2025",
        "description": "Pharmacy",
        "amount": "1731.20",
        "type": "DEBIT",
        "balance": "48268.80"
      }
    ]
  },
  "insights": {
    "summary": "This credit card statement, issued on 30-Sep-2025, reflects a billing period of 29 days...",
    "quantitative_summary_metrics": {
      "averageTransactionSize": "7202.59",
      "highestSpendingCategory": {
        "name": "Others",
        "amount": "37678.04"
      }
    },
    "recommendations": "To avoid accumulating interest, pay more than the minimum due...",
    "unusual_charges": "no unusual charges found",
    "category_breakdown": {
      "Shopping": "11219.45",
      "Food": "0.00",
      "Healthcare": "1731.20",
      "Groceries": "6992.06",
      "Others": "37678.04"
    }
  }
}
```

---

### 2. Multiple PDF Parser

**Endpoint:**  
```
POST /api/v1/multiple
```

**Description:**  
Upload and parse **multiple PDF statements** in a single request. Each PDF is processed individually, and results are returned in a **JSON array**.

**Request:**  
- Content-Type: `multipart/form-data`  
- Body parameter: `pdfFile` (array of PDF files)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/multiple \
  -F 'pdfFile=@/path/to/statement1.pdf' \
  -F 'pdfFile=@/path/to/statement2.pdf' \
  -F 'pdfFile=@/path/to/statement3.pdf'
```

**Response Example:**
```json
[
  {
    "success": true,
    "bank": "KOTAK",
    "extracted": {
      "cardholder": "Akshat Ameria",
      "statementDate": "30-Sep-2025",
      "dueDate": "15-Oct-2025",
      "totalDue": "15818.73",
      "minDue": "790.94",
      "transactions": [
        {
          "date": "02-Sep-2025",
          "description": "Grocery Store",
          "amount": "6992.06",
          "type": "DEBIT",
          "balance": "53994.50"
        }
      ]
    },
    "insights": {
      "summary": "This credit card statement, issued on 30-Sep-2025...",
      "quantitative_summary_metrics": {
        "averageTransactionSize": "7202.59",
        "highestSpendingCategory": {
          "name": "Others",
          "amount": "37678.04"
        }
      },
      "recommendations": "To avoid accumulating interest...",
      "unusual_charges": "no unusual charges found",
      "category_breakdown": {
        "Shopping": "11219.45",
        "Food": "0.00",
        "Healthcare": "1731.20",
        "Groceries": "6992.06",
        "Others": "37678.04"
      }
    }
  },
  {
    "success": true,
    "bank": "HDFC",
    "extracted": {
      "cardholder": "Akshat Ameria",
      "statementDate": "28-Sep-2025",
      "dueDate": "13-Oct-2025",
      "totalDue": "12000.50",
      "minDue": "600.25",
      "transactions": [
        {
          "date": "01-Sep-2025",
          "description": "Electronics Store",
          "amount": "4500.00",
          "type": "DEBIT",
          "balance": "30500.50"
        }
      ]
    },
    "insights": {
      "summary": "This HDFC statement reflects 27 days of transactions...",
      "quantitative_summary_metrics": {
        "averageTransactionSize": "4500.00",
        "highestSpendingCategory": {
          "name": "Electronics",
          "amount": "4500.00"
        }
      },
      "recommendations": "Pay off balance promptly to avoid interest.",
      "unusual_charges": "none",
      "category_breakdown": {
        "Shopping": "4500.00",
        "Food": "0.00",
        "Healthcare": "0.00",
        "Groceries": "0.00",
        "Others": "0.00"
      }
    }
  }
]
```

**Notes:**
- Each array element corresponds to a **single PDF** uploaded
- The JSON structure is **identical to the single PDF parser** response
- Useful for batch processing multiple statements at once

---

## Data Flow

1. User uploads PDF(s) via `/api/v1/single` or `/api/v1/multiple`
2. Backend parses PDF using **pdf-parse**
3. JSON is structured with:
   - Transactions
   - Cardholder info
   - Statement info
4. JSON is passed to **LLM** for:
   - Summary generation
   - Quantitative metrics calculation
   - Recommendations
   - Categorization
5. Enhanced JSON returned to frontend
6. **Recharts** renders visual insights interactively

---

## JSON Structure Reference

### Extracted Transaction Fields

| Field | Description |
|-------|-------------|
| `date` | Transaction date |
| `description` | Merchant or transaction description |
| `amount` | Transaction amount |
| `type` | `DEBIT` or `CREDIT` |
| `balance` | Account balance after transaction |

### LLM Insights Fields

| Field | Description |
|-------|-------------|
| `summary` | Text summary of the statement |
| `quantitative_summary_metrics` | Metrics like average transaction size and highest spending category |
| `recommendations` | Suggestions for better financial management |
| `unusual_charges` | Alerts on unexpected or unusual spending |
| `category_breakdown` | Spending totals per category |

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **PDF Parsing:** pdf-parse
- **AI Insights:** Large Language Model (LLM)
- **Frontend:** React.js
- **Visualization:** Recharts
- **Styling:** Tailwind CSS, Shadcn UI

---

## Project Setup

1. **Clone the repository:**
```bash
git clone https://github.com/AkshatAmeria/assignment_submission_sureFinancial_Akshat_Ameria_DJSCE.git
cd backendParser
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the backend server:**
```bash
npm start
http://localhost:5000
```

4. **Run the frontend:**
```bash
cd frontendParser
npm install
npm start
```

5. **Open in browser:**
```
http://localhost:3000
```

---

## License

MIT License

---


## Support

For issues or questions, please open an issue on GitHub or reach out at 120104.akshat@gmail.com.
