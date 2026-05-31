# Shared admin data (Vercel KV)

Admin edits to **products, categories, materials, room types, and users** are
saved to a shared **Vercel KV** store via serverless API routes under `/api`.
Once configured, any edit a Staff/admin makes is visible to **every visitor on
every device** — no more per-browser `localStorage` and no manual `export →
commit → redeploy` step.

## How it works

| Endpoint            | Method | Who        | Purpose                                  |
|---------------------|--------|------------|------------------------------------------|
| `/api/catalog`      | GET    | public     | Live catalog every visitor reads         |
| `/api/catalog`      | PUT    | admin only | Save products / categories / materials / room types |
| `/api/users`        | GET    | admin only | Staff list for the Users tab             |
| `/api/users`        | PUT    | admin only | Save the staff list                      |
| `/api/auth/login`   | POST   | public     | Verify credentials, return a session token |
| `/api/auth/logout`  | POST   | any        | Invalidate the session token             |

- Data lives in KV under the keys `comforto:catalog` and `comforto:users`.
  The first read seeds them from `src/data/products.js` and `src/data/staff.js`.
- Login is verified **server-side**; passwords are never sent to anonymous
  visitors. A random session token is stored in the browser and sent as a
  `Bearer` token on write requests. Write routes require the `admin` role.

## One-time setup on Vercel

1. Open the project in the **Vercel dashboard → Storage**.
2. **Create / connect a KV (Redis) store** and link it to this project.
   (Vercel provisions this through the Marketplace — Upstash Redis — and
   exposes it as KV.)
3. Vercel automatically injects these environment variables into the project:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - (`KV_REST_API_READ_ONLY_TOKEN`, `KV_URL` may also be added)
4. **Redeploy** so the API routes pick up the variables.

That's it — no schema, no migrations. The store seeds itself on first use.

## Local development

`vite dev` does **not** run the `/api` functions, so the app automatically
falls back to its original per-browser behaviour (seed data + `localStorage`).
Login falls back to checking credentials against the seed list. This means you
can keep developing locally without KV; sharing only kicks in on Vercel.

To exercise the real API locally, run `vercel dev` (Vercel CLI) with the KV
environment variables pulled via `vercel env pull`.

## Notes / limitations

- This is a light gate suited to an internal staff tool — it stops anonymous
  visitors from writing to the shared store, but it is not hardened auth. Don't
  store payment or other sensitive data.
- The old **Admin → Export** buttons still work and now serve as a manual
  backup of the live data.
