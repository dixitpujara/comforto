// Shared persistence layer backed by Vercel KV.
//
// All admin edits (products, categories, materials, room types, users) are
// stored here so every visitor — on any device — sees the same live data.
// The very first read seeds KV from the bundled seed files in src/data.
import { kv } from './kv.js';
import { productsData } from '../../src/data/products.js';
import { staff } from '../../src/data/staff.js';

const CATALOG_KEY = 'comforto:catalog';
const USERS_KEY = 'comforto:users';

const clone = (v) => JSON.parse(JSON.stringify(v));

const seedCatalog = () => ({
  categories: productsData.categories,
  materials: productsData.materials,
  roomTypes: productsData.roomTypes,
  tags: productsData.tags,
  availabilities: productsData.availabilities,
  products: productsData.products,
});

export async function getCatalog() {
  const stored = await kv.get(CATALOG_KEY);
  if (stored && Array.isArray(stored.products)) return stored;
  const seed = seedCatalog();
  await kv.set(CATALOG_KEY, seed);
  return seed;
}

export async function setCatalog(catalog) {
  await kv.set(CATALOG_KEY, catalog);
  return catalog;
}

export async function getUsers() {
  const stored = await kv.get(USERS_KEY);
  if (Array.isArray(stored)) return stored;
  const seed = clone(staff);
  await kv.set(USERS_KEY, seed);
  return seed;
}

export async function setUsers(users) {
  await kv.set(USERS_KEY, users);
  return users;
}
