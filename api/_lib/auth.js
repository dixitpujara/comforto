// Minimal server-side session handling for the admin/staff area.
//
// On login we mint a random token and store the (password-stripped) user
// behind it in a KV hash. Write endpoints require a valid token; catalog and
// user edits additionally require the 'admin' role. This is a light gate that
// matches the app's internal-tool threat model — it stops anonymous visitors
// from POSTing to the shared store, which is the important part now that edits
// are global.
import { kv } from './kv.js';
import { randomUUID } from 'crypto';

const SESSION_KEY = 'comforto:sessions';

const tokenFrom = (req) => {
  const header = req.headers['authorization'] || req.headers['Authorization'] || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
};

export async function createSession(user) {
  const { password, ...safe } = user;
  const token = randomUUID();
  await kv.hset(SESSION_KEY, { [token]: JSON.stringify(safe) });
  return { token, user: safe };
}

export async function getSession(req) {
  const token = tokenFrom(req);
  if (!token) return null;
  const raw = await kv.hget(SESSION_KEY, token);
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function destroySession(req) {
  const token = tokenFrom(req);
  if (token) await kv.hdel(SESSION_KEY, token);
}

// Resolves to the session user, or sends the appropriate error and returns null.
export async function requireAdmin(req, res) {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Please sign in again.' });
    return null;
  }
  if (session.role !== 'admin') {
    res.status(403).json({ error: 'This action is restricted to Staff (admin) users.' });
    return null;
  }
  return session;
}
