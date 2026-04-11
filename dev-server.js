require('dotenv').config({ path: '.env.local' });
const express = require('express');
const coralsHandler = require('./api/corals.js');

const app = express();
app.use(express.json({ limit: '1mb' }));

app.all('/api/corals', (req, res) => {
  req.query = req.query || {};
  return coralsHandler(req, res);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API dev server running on http://localhost:${PORT}`);
});
