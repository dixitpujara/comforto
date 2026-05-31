// GET  /api/users  → full staff list incl. passwords (Staff/admin only — used by
//                    the Admin > Users tab for editing)
// PUT  /api/users  → replace the staff list (Staff/admin only)
//
// Public visitors never call this. Credential checks happen in /api/auth/login,
// so passwords are never shipped to anonymous clients.
import { getUsers, setUsers } from './_lib/store.js';
import { requireAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    if (req.method === 'GET') {
      const users = await getUsers();
      return res.status(200).json(users);
    }

    if (req.method === 'PUT') {
      const body = req.body;
      if (!Array.isArray(body)) {
        return res.status(400).json({ error: 'Expected an array of users.' });
      }
      // Never allow the list to drop its last admin — keeps the owner from
      // locking everyone out of the Staff area.
      if (!body.some(u => u.role === 'admin')) {
        return res.status(400).json({ error: 'At least one Staff (admin) user is required.' });
      }
      const saved = await setUsers(body);
      return res.status(200).json(saved);
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Server error.' });
  }
}
