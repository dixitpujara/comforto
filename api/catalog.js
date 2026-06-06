// GET  /api/catalog  → the live shared catalog (public; every visitor reads it)
// PUT  /api/catalog  → replace the catalog (Staff/admin only)
import { getCatalog, setCatalog } from './_lib/store.js';
import { requireAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const catalog = await getCatalog();
      return res.status(200).json(catalog);
    }

    if (req.method === 'PUT') {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      const body = req.body;
      if (!body || !Array.isArray(body.products)) {
        return res.status(400).json({ error: 'Invalid catalog payload.' });
      }
      const saved = await setCatalog({
        categories: body.categories || [],
        subcategories: body.subcategories || {},
        materials: body.materials || [],
        roomTypes: body.roomTypes || [],
        tags: body.tags || [],
        availabilities: body.availabilities || [],
        products: body.products,
      });
      return res.status(200).json(saved);
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Server error.' });
  }
}
