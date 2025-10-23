const express = require('express');
const extractRoute = require('./routes/extractRoute');
const cors = require("cors");
const app = express();
const port = 5000;
app.use(cors());

app.use('/api/v1', extractRoute);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'PDF Extractor API running. POST a PDF to /extract',
  });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
