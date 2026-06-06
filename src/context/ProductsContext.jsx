import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { productsData as seedData } from '../data/products';
import { useAuth } from './AuthContext';
import { apiGet, apiPut, ApiUnavailable } from '../api/client';

const ProductsContext = createContext();
export const useProducts = () => useContext(ProductsContext);

const STORAGE_KEY = 'comforto_catalog_v1';

// Returns a deep clone so callers can't mutate the seed.
const clone = (v) => JSON.parse(JSON.stringify(v));

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.products)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveDraft = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
};

const newId = () => `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const newVariantId = (productId) => `${productId}-v-${Math.random().toString(36).slice(2, 6)}`;

export const ProductsProvider = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // The shared catalog. On Vercel this is hydrated from KV (so every visitor
  // sees the same live data); offline/dev it falls back to localStorage + seed.
  const [draft, setDraft] = useState(() => loadDraft() || clone(seedData));

  // Whether the serverless API is reachable. Flipped off on the first
  // ApiUnavailable so we stop trying to PUT and behave like the old per-browser
  // build during local development.
  const apiAvailable = useRef(true);
  const isAdminRef = useRef(isAdmin);
  useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);

  // Hydrate from the shared store once on mount.
  useEffect(() => {
    let cancelled = false;
    apiGet('/api/catalog')
      .then(data => {
        if (cancelled || !data || !Array.isArray(data.products)) return;
        setDraft(data);
        saveDraft(data);
      })
      .catch(err => {
        if (err instanceof ApiUnavailable) apiAvailable.current = false;
        // Other errors (e.g. transient 500): keep the local copy we already have.
      });
    return () => { cancelled = true; };
  }, []);

  // Persist a new catalog state everywhere: local cache always, and the shared
  // store when an admin is signed in and the API is reachable.
  const persist = (data) => {
    saveDraft(data);
    if (apiAvailable.current && isAdminRef.current) {
      apiPut('/api/catalog', data).catch(err => {
        if (err instanceof ApiUnavailable) apiAvailable.current = false;
        // Surfaced failures (401/403/500) are swallowed here; the optimistic
        // local state still reflects the change for this session.
      });
    }
  };

  // Apply a pure update to the catalog and persist the result.
  const commit = (next) => {
    setDraft(next);
    persist(next);
    return next;
  };

  // Everyone — visitors and staff — reads the shared catalog.
  const live = draft;

  const hasUnexportedChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(seedData),
    [draft]
  );

  // -- Product CRUD --
  const addProduct = (product) => {
    const id = product.id || newId();
    const safeVariants = (product.variants || []).map((v, i) => ({
      id: v.id || `${id}-v${i + 1}`,
      colorName: v.colorName || '',
      colorHex:  v.colorHex  || '#cccccc',
      image:     v.image     || product.image || ''
    }));
    const next = {
      id,
      name:         product.name || 'Untitled',
      category:     product.category || draft.categories[0] || '',
      subcategory:  product.subcategory || '',
      subtitle:     product.subtitle || '',
      tag:          product.tag || (draft.tags?.[0] ?? ''),
      material:     product.material || draft.materials[0] || '',
      roomType:     product.roomType || draft.roomTypes[0] || '',
      availability: product.availability || draft.availabilities[0] || 'In Stock',
      image:        product.image || '',
      gallery:      product.gallery && product.gallery.length ? product.gallery : (product.image ? [product.image] : []),
      description:  product.description || '',
      features:     product.features || [],
      variants:     safeVariants
    };
    commit({ ...draft, products: [...draft.products, next] });
    return id;
  };

  const updateProduct = (id, patch) => {
    commit({
      ...draft,
      products: draft.products.map(p => p.id === id ? { ...p, ...patch } : p)
    });
  };

  const deleteProduct = (id) => {
    commit({ ...draft, products: draft.products.filter(p => p.id !== id) });
  };

  // Swap an array entry with its neighbour. `dir` is -1 (up) or +1 (down).
  const moveInArray = (arr, index, dir) => {
    const target = index + dir;
    if (index < 0 || target < 0 || target >= arr.length) return arr;
    const next = arr.slice();
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  };

  const moveProduct = (id, dir) => {
    const index = draft.products.findIndex(p => p.id === id);
    if (index === -1) return;
    commit({ ...draft, products: moveInArray(draft.products, index, dir) });
  };

  // -- Taxonomy CRUD (categories / materials / roomTypes) --
  // `kind` is one of: 'categories', 'materials', 'roomTypes'
  const addTaxonomyValue = (kind, value) => {
    const v = (value || '').trim();
    if (!v) return false;
    const existing = draft[kind] || [];
    if (existing.includes(v)) return false;
    commit({ ...draft, [kind]: [...existing, v] });
    return true;
  };

  const renameTaxonomyValue = (kind, oldValue, newValue) => {
    const v = (newValue || '').trim();
    if (!v || v === oldValue) return;
    const productField = kind === 'categories' ? 'category'
                      : kind === 'materials'  ? 'material'
                      : 'roomType';
    const next = {
      ...draft,
      [kind]: (draft[kind] || []).map(x => x === oldValue ? v : x),
      products: draft.products.map(p => p[productField] === oldValue ? { ...p, [productField]: v } : p)
    };
    // Carry the category's subcategory list over to the new name.
    if (kind === 'categories' && draft.subcategories) {
      const { [oldValue]: moved, ...rest } = draft.subcategories;
      if (moved !== undefined) next.subcategories = { ...rest, [v]: moved };
    }
    commit(next);
  };

  const deleteTaxonomyValue = (kind, value) => {
    const productField = kind === 'categories' ? 'category'
                      : kind === 'materials'  ? 'material'
                      : 'roomType';
    const inUse = draft.products.filter(p => p[productField] === value).length;
    if (inUse > 0) {
      // Refuse to leave orphaned references — UI is expected to warn first.
      return;
    }
    const next = { ...draft, [kind]: (draft[kind] || []).filter(x => x !== value) };
    if (kind === 'categories' && draft.subcategories) {
      const { [value]: _removed, ...rest } = draft.subcategories;
      next.subcategories = rest;
    }
    commit(next);
  };

  const taxonomyUsageCount = (kind, value) => {
    const productField = kind === 'categories' ? 'category'
                      : kind === 'materials'  ? 'material'
                      : 'roomType';
    return draft.products.filter(p => p[productField] === value).length;
  };

  const moveTaxonomyValue = (kind, value, dir) => {
    const arr = draft[kind] || [];
    const index = arr.indexOf(value);
    if (index === -1) return;
    commit({ ...draft, [kind]: moveInArray(arr, index, dir) });
  };

  // -- Subcategory CRUD (nested one level under a category) --
  const addSubcategory = (category, value) => {
    const v = (value || '').trim();
    if (!v) return false;
    const map = draft.subcategories || {};
    const list = map[category] || [];
    if (list.includes(v)) return false;
    commit({ ...draft, subcategories: { ...map, [category]: [...list, v] } });
    return true;
  };

  const renameSubcategory = (category, oldValue, newValue) => {
    const v = (newValue || '').trim();
    if (!v || v === oldValue) return;
    const map = draft.subcategories || {};
    const list = map[category] || [];
    commit({
      ...draft,
      subcategories: { ...map, [category]: list.map(x => x === oldValue ? v : x) },
      products: draft.products.map(p =>
        p.category === category && p.subcategory === oldValue ? { ...p, subcategory: v } : p)
    });
  };

  const deleteSubcategory = (category, value) => {
    const map = draft.subcategories || {};
    const list = map[category] || [];
    const inUse = draft.products.filter(p => p.category === category && p.subcategory === value).length;
    if (inUse > 0) return;
    commit({ ...draft, subcategories: { ...map, [category]: list.filter(x => x !== value) } });
  };

  const moveSubcategory = (category, value, dir) => {
    const map = draft.subcategories || {};
    const list = map[category] || [];
    const index = list.indexOf(value);
    if (index === -1) return;
    commit({ ...draft, subcategories: { ...map, [category]: moveInArray(list, index, dir) } });
  };

  const subcategoryUsageCount = (category, value) =>
    draft.products.filter(p => p.category === category && p.subcategory === value).length;

  // -- Draft management --
  const resetDraftToSeed = () => commit(clone(seedData));

  const importDraft = (json) => {
    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      if (!parsed || !Array.isArray(parsed.products)) throw new Error('Invalid file');
      commit({
        categories:     parsed.categories     || seedData.categories,
        subcategories:  parsed.subcategories  || seedData.subcategories || {},
        materials:      parsed.materials      || seedData.materials,
        roomTypes:      parsed.roomTypes      || seedData.roomTypes,
        tags:           parsed.tags           || seedData.tags,
        availabilities: parsed.availabilities || seedData.availabilities,
        products:       parsed.products
      });
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  // Generate the products.js file text that the admin can drop into the repo.
  const exportProductsJs = () => {
    const body = JSON.stringify(draft, null, 2);
    return `// Catalog seed data.
// Generated from Admin > Export on ${new Date().toISOString()}.
// Replace src/data/products.js with this file, then redeploy to publish.

export const categoryIcon = ${JSON.stringify({
      Sofas: 'Sofa',
      Tables: 'Table',
      Lighting: 'Lamp',
      Bedroom: 'Bed',
      Lounge: 'Armchair',
      Storage: 'Package'
    }, null, 2)};

export const productsData = ${body};

export const products       = productsData.products;
export const subcategories  = productsData.subcategories || {};
export const categories     = ['All', ...productsData.categories];
export const materials      = ['All', ...productsData.materials];
export const roomTypes      = ['All', ...productsData.roomTypes];
export const tags           = ['All', ...productsData.tags];
export const availabilities = ['All', ...productsData.availabilities];
`;
  };

  // Adds default "All" prefix used by filter UI.
  const withAll = (arr) => ['All', ...(arr || [])];

  const value = {
    // live data the rest of the app consumes
    products:       live.products,
    categories:     withAll(live.categories),
    materials:      withAll(live.materials),
    roomTypes:      withAll(live.roomTypes),
    tags:           withAll(live.tags),
    availabilities: withAll(live.availabilities),
    rawCategories:  live.categories,
    rawMaterials:   live.materials,
    rawRoomTypes:   live.roomTypes,
    subcategories:  live.subcategories || {},

    // admin-only operations (UI gates access; functions don't check)
    draft,
    hasUnexportedChanges,
    addProduct, updateProduct, deleteProduct, moveProduct,
    addTaxonomyValue, renameTaxonomyValue, deleteTaxonomyValue, taxonomyUsageCount, moveTaxonomyValue,
    addSubcategory, renameSubcategory, deleteSubcategory, moveSubcategory, subcategoryUsageCount,
    resetDraftToSeed, importDraft, exportProductsJs,
    newVariantId
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
