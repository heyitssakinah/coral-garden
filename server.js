const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database setup ---
const db = new Database(path.join(__dirname, 'corals.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS corals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_data TEXT NOT NULL,
    author_name TEXT NOT NULL DEFAULT 'Anonymous',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// --- Middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      scriptSrc: ["'self'"],
    },
  },
}));
app.use(express.json({ limit: '500kb' }));
app.use(express.static(path.join(__dirname, 'client', 'dist')));

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions. Please wait a minute.' },
});

// --- Routes ---

// Get all corals (paginated)
app.get('/api/corals', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const corals = db.prepare(
    'SELECT id, image_data, author_name, created_at FROM corals ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM corals').get().count;

  res.json({ corals, total, page, totalPages: Math.ceil(total / limit) });
});

// Submit a new coral
app.post('/api/corals', submitLimiter, (req, res) => {
  const { image_data, author_name } = req.body;

  // Validate image_data is a valid PNG data URL
  if (!image_data || typeof image_data !== 'string') {
    return res.status(400).json({ error: 'Missing coral image data.' });
  }
  if (!image_data.startsWith('data:image/png;base64,')) {
    return res.status(400).json({ error: 'Invalid image format. PNG required.' });
  }
  // ~375KB base64 limit (roughly 280KB image)
  if (image_data.length > 500000) {
    return res.status(400).json({ error: 'Image too large.' });
  }

  // Sanitize author name
  const safeName = (typeof author_name === 'string' ? author_name : '')
    .trim()
    .slice(0, 30)
    .replace(/[<>"'&]/g, '') || 'Anonymous';

  const result = db.prepare(
    'INSERT INTO corals (image_data, author_name) VALUES (?, ?)'
  ).run(image_data, safeName);

  const coral = db.prepare('SELECT * FROM corals WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(coral);
});

// SPA catch-all: serve index.html for non-API routes in production
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Coral Garden is live at http://localhost:${PORT}`);
});
