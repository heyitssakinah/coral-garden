import { getDb, initDb } from './_db.js';

let initialized = false;

async function ensureInit() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
}

export default async function handler(req, res) {
  await ensureInit();

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  const db = getDb();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const corals = await db.execute({
    sql: 'SELECT id, image_data, author_name, created_at FROM corals ORDER BY created_at DESC LIMIT ? OFFSET ?',
    args: [limit, offset],
  });

  const totalResult = await db.execute('SELECT COUNT(*) as count FROM corals');
  const total = Number(totalResult.rows[0].count);

  return res.status(200).json({
    corals: corals.rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

async function handlePost(req, res) {
  const db = getDb();
  const { image_data, author_name } = req.body;

  // Validate image_data is a valid PNG data URL
  if (!image_data || typeof image_data !== 'string') {
    return res.status(400).json({ error: 'Missing coral image data.' });
  }
  if (!image_data.startsWith('data:image/png;base64,')) {
    return res.status(400).json({ error: 'Invalid image format. PNG required.' });
  }
  if (image_data.length > 500000) {
    return res.status(400).json({ error: 'Image too large.' });
  }

  // Sanitize author name
  const safeName =
    (typeof author_name === 'string' ? author_name : '')
      .trim()
      .slice(0, 30)
      .replace(/[<>"'&]/g, '') || 'Anonymous';

  const result = await db.execute({
    sql: 'INSERT INTO corals (image_data, author_name) VALUES (?, ?)',
    args: [image_data, safeName],
  });

  const coral = await db.execute({
    sql: 'SELECT * FROM corals WHERE id = ?',
    args: [Number(result.lastInsertRowid)],
  });

  return res.status(201).json(coral.rows[0]);
}
