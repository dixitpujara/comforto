// Internal staff allowlist.
//
// NOTE: This is a soft client-side gate, not real security. Anyone who
// downloads the JS bundle can read these credentials. Acceptable for a
// staff-only catalog tool with no payment data; replace with a real backend
// (Supabase / Firebase / your own API) before exposing anything sensitive.

export const staff = [
  { id: 'admin',    name: 'Admin',           email: 'admin@comforto.in',    password: 'comforto@2024', role: 'admin' },
  { id: 'designer', name: 'Interior Lead',   email: 'designer@comforto.in', password: 'design@123',    role: 'designer' },
  { id: 'sales',    name: 'Sales Associate', email: 'sales@comforto.in',    password: 'sales@123',     role: 'sales' }
];
