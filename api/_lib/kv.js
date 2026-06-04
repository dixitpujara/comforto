// Configured KV/Redis client.
//
// Vercel's storage integrations expose their REST credentials under different
// env var names depending on which provider you connect:
//   - Legacy "Vercel KV":        KV_REST_API_URL        / KV_REST_API_TOKEN
//   - Upstash (Marketplace):     UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
//   - "Redis for Vercel":        REDIS_URL (+ a REST URL/token pair)
//
// We accept any of them so the app works regardless of which store you create.
import { createClient } from '@vercel/kv';

const url =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.REDIS_REST_API_URL;

const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.REDIS_REST_API_TOKEN;

if (!url || !token) {
  // Surfaces clearly in the function logs if the store isn't connected yet.
  console.warn(
    '[comforto] No KV/Redis REST credentials found. Connect a store in the ' +
    'Vercel dashboard (Storage tab) and redeploy. Looked for KV_REST_API_* / ' +
    'UPSTASH_REDIS_REST_* env vars.'
  );
}

export const kv = createClient({ url, token });
