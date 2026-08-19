// Recent-quote history — the most recent quotations a staff member generated,
// so a quote can be reopened and updated days later instead of rebuilt from
// scratch. MAX_QUOTES is the only knob; the write below sheds the oldest
// records if the browser's storage fills before that limit is reached.
//
// Backed by localStorage on the device that created the quote. Every function
// is async and addresses records by id, so this module can later be swapped for
// a `/api/quotes` client (Vercel KV, the way the catalog and users already
// work) without changing a single call site.

const STORAGE_KEY = 'comforto_quotes_v1';

export const MAX_QUOTES = 25;

// Display form of a quote number: revision 1 prints bare, later revisions carry
// an -R suffix so the customer can tell which PDF is the newest.
export const formatQuoteNo = (quoteNo, revision) =>
  Number(revision) > 1 ? `${quoteNo}-R${revision}` : quoteNo;

const read = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const stripPhotos = (record) => ({
  ...record,
  items: (record.items || []).map(i => ({
    ...i,
    image:         String(i.image || '').startsWith('data:')         ? '' : i.image,
    materialImage: String(i.materialImage || '').startsWith('data:') ? '' : i.materialImage
  }))
});

// Photo-heavy quotes can push the browser past its storage quota. Shed the
// oldest records first, then inline photos, rather than letting the write throw
// — losing an old quote beats losing the whole history.
const write = (list) => {
  const attempt = (candidate) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
    return candidate;
  };

  try { return attempt(list); } catch { /* over quota — start shedding */ }

  const trimmed = [...list];
  while (trimmed.length > 1) {
    trimmed.pop();                                    // drop the oldest
    try { return attempt(trimmed); } catch { /* keep shedding */ }
  }

  try { return attempt(list.map(stripPhotos)); } catch { /* give up quietly */ }
  return list;
};

/** Saved quotes, newest first. */
export async function listQuotes() {
  return read();
}

export async function getQuote(id) {
  return read().find(q => q.id === id) || null;
}

/**
 * Insert or update a quote and keep only the newest MAX_QUOTES.
 * Records are matched by id, so re-sending a reopened quote updates it in place
 * rather than filling the list with revisions of the same job.
 */
export async function saveQuote(record) {
  const rest = read().filter(q => q.id !== record.id);
  return write([record, ...rest].slice(0, MAX_QUOTES));
}

export async function deleteQuote(id) {
  return write(read().filter(q => q.id !== id));
}
