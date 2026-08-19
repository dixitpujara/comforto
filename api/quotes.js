// Shared quotation history — so a quote saved on one staff member's phone can
// be reopened and updated from any other device.
//
//   GET    /api/quotes          → the index: a light summary per saved quote
//   GET    /api/quotes?id=…     → one full quote (items, photos, customer, totals)
//   POST   /api/quotes          → insert or update a quote, keeping the newest MAX
//   DELETE /api/quotes?id=…     → remove a quote
//
// Full records carry inline photos and can run to a few hundred KB each, so the
// list is served from a separate small index rather than by reading every
// record. Requires a KV store connected on Vercel; gated behind a signed-in
// staff session, the same as /api/upload-quote.
import { kv } from './_lib/kv.js';
import { getSession } from './_lib/auth.js';

const QUOTES_KEY = 'comforto:quotes';         // hash: id → full record
const INDEX_KEY  = 'comforto:quotes:index';   // array of summaries, newest first

// Authoritative cap. Keep in step with MAX_QUOTES in src/api/quoteHistory.js,
// which the page uses for its "last N" label and for the offline fallback.
const MAX_QUOTES = 25;

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } },
};

const summarize = (q) => ({
  id: q.id,
  quoteNo: q.quoteNo,
  revision: Number(q.revision) || 1,
  printedNo: q.printedNo || q.quoteNo,
  savedAt: q.savedAt,
  grandTotal: Number(q.grandTotal) || 0,
  customerName: q.customer?.name || '',
  projectName: q.customer?.projectName || '',
  itemCount: Array.isArray(q.items) ? q.items.length : 0,
});

const readIndex = async () => {
  const stored = await kv.get(INDEX_KEY);
  return Array.isArray(stored) ? stored : [];
};

const parse = (raw) => {
  if (!raw) return null;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
};

export default async function handler(req, res) {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: 'Please sign in again.' });

    const id = typeof req.query?.id === 'string' ? req.query.id : '';

    if (req.method === 'GET') {
      if (!id) return res.status(200).json(await readIndex());
      const record = parse(await kv.hget(QUOTES_KEY, id));
      if (!record) return res.status(404).json({ error: 'Quote not found.' });
      return res.status(200).json(record);
    }

    if (req.method === 'POST') {
      const record = req.body;
      if (!record || !record.id) {
        return res.status(400).json({ error: 'Invalid quote payload.' });
      }

      const index = await readIndex();
      const next = [summarize(record), ...index.filter(q => q.id !== record.id)];
      const kept = next.slice(0, MAX_QUOTES);

      // Drop the records that fell off the end so the hash can't grow forever.
      const evicted = next.slice(MAX_QUOTES).map(q => q.id);

      await kv.hset(QUOTES_KEY, { [record.id]: JSON.stringify(record) });
      if (evicted.length) await kv.hdel(QUOTES_KEY, ...evicted);
      await kv.set(INDEX_KEY, kept);

      return res.status(200).json(kept);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'No quote id provided.' });
      const kept = (await readIndex()).filter(q => q.id !== id);
      await kv.hdel(QUOTES_KEY, id);
      await kv.set(INDEX_KEY, kept);
      return res.status(200).json(kept);
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Server error.' });
  }
}
