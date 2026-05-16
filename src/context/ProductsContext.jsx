import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { productsData as seedData } from '../data/products';
import { useAuth } from './AuthContext';

const ProductsContext = createContext();
export const useProducts = () => useContext(ProductsContext);

// Versioned: bump when the seed catalog changes shape so stale browser drafts
// don't show as "unexported changes" against the new seed. Legacy keys below
// are cleaned up on load.
const STORAGE_KEY = 'comforto_catalog_v2';
const LEGACY_KEYS = ['comforto_catalog_v1'];

// Returns a deep clone so callers can't mutate the seed.
const clone = (v) => JSON.parse(JSON.stringify(v));

const loadDraft = () => {
  try {
    // Drop older versions silently — their shape may not match the new seed.
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const newId = () => `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const newVariantId = (productId) => `${productId}-v-${Math.random().toString(36).slice(2, 6)}`;

export const ProductsProvider = ({ children }) => {
  const { isAuthed } = useAuth();

  // The "draft" is the admin's editable working copy. It's loaded from
  // localStorage and any change is persisted immediately. Customers (not
  // signed in) read straight from the seed; signed-in admins read from the
  // draft so they can preview their pending edits.
  const [draft, setDraft] = useState(() => loadDraft() || clone(seedData));

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  // What every consumer reads. Public visitors always see the seed. Admins see
  // the draft (which is the seed plus their unexported edits).
  const live = isAuthed ? draft : seedData;

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
    setDraft(d => ({ ...d, products: [...d.products, next] }));
    return id;
  };

  const updateProduct = (id, patch) => {
    setDraft(d => ({
      ...d,
      products: d.products.map(p => p.id === id ? { ...p, ...patch } : p)
    }));
  };

  const deleteProduct = (id) => {
    setDraft(d => ({ ...d, products: d.products.filter(p => p.id !== id) }));
  };

  // -- Taxonomy CRUD (categories / materials / roomTypes) --
  // `kind` is one of: 'categories', 'materials', 'roomTypes'
  const addTaxonomyValue = (kind, value) => {
    const v = (value || '').trim();
    if (!v) return false;
    setDraft(d => {
      const existing = d[kind] || [];
      if (existing.includes(v)) return d;
      return { ...d, [kind]: [...existing, v] };
    });
    return true;
  };

  const renameTaxonomyValue = (kind, oldValue, newValue) => {
    const v = (newValue || '').trim();
    if (!v || v === oldValue) return;
    const productField = kind === 'categories' ? 'category'
                      : kind === 'materials'  ? 'material'
                      : 'roomType';
    setDraft(d => ({
      ...d,
      [kind]: (d[kind] || []).map(x => x === oldValue ? v : x),
      products: d.products.map(p => p[productField] === oldValue ? { ...p, [productField]: v } : p)
    }));
  };

  const deleteTaxonomyValue = (kind, value) => {
    const productField = kind === 'categories' ? 'category'
                      : kind === 'materials'  ? 'material'
                      : 'roomType';
    setDraft(d => {
      const inUse = d.products.filter(p => p[productField] === value).length;
      if (inUse > 0) {
        // Caller is expected to confirm — but we still refuse to leave
        // orphaned references. Returning early so the UI can warn.
        return d;
      }
      return { ...d, [kind]: (d[kind] || []).filter(x => x !== value) };
    });
  };

  const taxonomyUsageCount = (kind, value) => {
    const productField = kind === 'categories' ? 'category'
                      : kind === 'materials'  ? 'material'
                      : 'roomType';
    return draft.products.filter(p => p[productField] === value).length;
  };

  // -- Draft management --
  const resetDraftToSeed = () => setDraft(clone(seedData));

  const importDraft = (json) => {
    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      if (!parsed || !Array.isArray(parsed.products)) throw new Error('Invalid file');
      setDraft({
        categories:     parsed.categories     || seedData.categories,
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

    // admin-only operations (UI gates access; functions don't check)
    draft,
    hasUnexportedChanges,
    addProduct, updateProduct, deleteProduct,
    addTaxonomyValue, renameTaxonomyValue, deleteTaxonomyValue, taxonomyUsageCount,
    resetDraftToSeed, importDraft, exportProductsJs,
    newVariantId
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
