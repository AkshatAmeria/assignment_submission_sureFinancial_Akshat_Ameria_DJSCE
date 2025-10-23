const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse'); 

const app = express();
const port = 5000;


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/hdfc', upload.single('pdfFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Uploaded file is not a PDF.' });
    }

    try {
        const data = await pdf(req.file.buffer);
        
        
        res.json({ text: data.text });

    } catch (error) {
        console.error('Error parsing PDF:', error);
        res.status(500).json({ error: 'Failed to extract text from PDF.' });
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'PDF Extractor API is running. POST a PDF to /extract.' });
});

app.listen(port, () => {
    console.log(`PDF Extractor API server running at http://localhost:${port}`);
    console.log(`Send POST requests with a PDF file to http://localhost:${port}/extract`);
});