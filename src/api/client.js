// Thin client for the Vercel serverless API.
//
// In production (Vercel) these endpoints are backed by Vercel KV, so all edits
// are shared across every visitor. During local `vite dev` there is no API, so
// callers catch ApiUnavailable and fall back to localStorage + seed data — the
// app's original per-browser behaviour — which keeps local development working.

const TOKEN_KEY = 'comforto_token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
};

export const setToken = (t) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
};

// Thrown when the request never reached a working JSON API (network error, or
// the dev server returned the SPA's index.html instead of JSON).
export class ApiUnavailable extends Error {}

// Thrown when the API responded with a non-2xx status. `.status` carries the code.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const parseJson = async (res) => {
  const type = res.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    // Dev server (or a misconfigured host) served HTML — treat as "no API".
    throw new ApiUnavailable('API did not return JSON');
  }
  return res.json();
};

const request = async (path, { method = 'GET', body } = {}) => {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders(),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiUnavailable('Network request failed');
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await parseJson(res);
      if (data?.error) message = data.error;
    } catch { /* keep default */ }
    throw new ApiError(res.status, message);
  }

  return parseJson(res);
};

export const apiGet = (path) => request(path);
export const apiPut = (path, body) => request(path, { method: 'PUT', body });
export const apiPost = (path, body) => request(path, { method: 'POST', body });
