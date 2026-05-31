// POST /api/auth/logout  → invalidates the caller's session token.
import { destroySession } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed.' });
    }
    await destroySession(req);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Server error.' });
  }
}
