// POST /api/upload-quote  { data: <base64 pdf>, fileName }  → { url }
//
// Uploads a generated quotation PDF to Vercel Blob (public) and returns its
// shareable URL. The Collection page puts that URL inside the WhatsApp / email
// message so the customer gets the message AND the PDF together, with the app
// opening directly (no share-sheet app picker).
//
// Requires a Blob store connected on Vercel (provides BLOB_READ_WRITE_TOKEN).
// Gated behind a signed-in staff session so the store can't be abused.
import { put } from '@vercel/blob';
import { getSession } from './_lib/auth.js';

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } },
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: 'Please sign in again.' });

    const { data, fileName } = req.body || {};
    if (!data) return res.status(400).json({ error: 'No file data provided.' });

    const buffer = Buffer.from(data, 'base64');
    const safeName = (fileName || `quote-${Date.now()}.pdf`).replace(/[^a-z0-9.\-]+/gi, '-');

    const blob = await put(`quotes/${safeName}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: true,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Upload failed.' });
  }
}
