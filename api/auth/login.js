// POST /api/auth/login  { email, password }  → { token, user } | 401
//
// Verifies credentials against the shared user list and mints a session token.
// Passwords stay on the server; only a safe user object is returned.
import { getUsers } from '../_lib/store.js';
import { createSession } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { email, password } = req.body || {};
    const e = (email || '').trim().toLowerCase();
    if (!e || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await getUsers();
    const found = users.find(u => (u.email || '').toLowerCase() === e && u.password === password);
    if (!found) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { token, user } = await createSession(found);
    return res.status(200).json({ token, user });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error.' });
  }
}
