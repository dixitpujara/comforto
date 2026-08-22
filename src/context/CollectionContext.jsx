import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { idbGet, idbPut, STORE_KV } from '../lib/idb';

/**
 * Collection / quotation builder state.
 *
 * items:    [{ id, productId, name, category, subtitle, image, materialImage, qty, rate, remarks }]
 *           materialImage is an optional fabric/finish swatch photo the staff
 *           member attaches per line; it prints beside the product thumbnail.
 * customer: { name, mobile, email, address, projectName, projectType, deliveryDate, deliveryAddress }
 * notes:    { customer }  — the only free-text note; terms are fixed in the PDF
 *
 * Persisted to IndexedDB so staff don't lose work between sessions. It holds the
 * draft's inline photos comfortably, which localStorage's ~5MB string budget did
 * not — an over-quota write there used to throw during commit and unmount the
 * whole app. Anything saved by the old version is imported once on first load.
 */

const CollectionContext = createContext();
export const useCollection = () => useContext(CollectionContext);

const STORAGE_KEY = 'comforto_collection_v1';   // legacy localStorage key
const DRAFT_KEY   = 'collectionDraft';          // key inside the IndexedDB kv store

const emptyCustomer = {
  name: '', mobile: '', email: '',
  address: '',
  projectName: '', projectType: '',
  interior: '',
  deliveryDate: '', deliveryAddress: ''
};
// Terms & conditions are fixed company policy printed by the PDF itself
// (see STANDARD_TERMS in utils/quotationPdf.js) — staff don't edit them here.
const emptyNotes = { customer: '' };

const emptyState = () => ({ items: [], customer: emptyCustomer, notes: emptyNotes });

const normalise = (parsed) => ({
  items: Array.isArray(parsed?.items) ? parsed.items : [],
  customer: { ...emptyCustomer, ...(parsed?.customer || {}) },
  // Drop any terms / internal comments left over from older saved quotes
  notes: { customer: parsed?.notes?.customer || '' }
});

// The draft used to live in localStorage; import it once, then let IndexedDB own it.
const readLegacyDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    localStorage.removeItem(STORAGE_KEY);
    return normalise(parsed);
  } catch {
    return null;
  }
};

export const CollectionProvider = ({ children }) => {
  const [state, setState] = useState(emptyState);

  // Reading IndexedDB is async, so the first render is empty. Until the stored
  // draft has been read back, persisting would write that empty state over real
  // work — so the save effect waits for this flag.
  const hydrated = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      let draft = null;
      try { draft = (await idbGet(STORE_KV, DRAFT_KEY))?.value || null; } catch { /* fall through */ }
      if (!draft) draft = readLegacyDraft();
      if (alive && draft) setState(normalise(draft));
      if (alive) hydrated.current = true;
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    idbPut(STORE_KV, { key: DRAFT_KEY, value: state }).catch(() => { /* keep going in memory */ });
  }, [state]);

  const addItem = (product) => {
    setState(s => {
      // If already added, increment qty instead of duplicating
      const existing = s.items.find(i => i.productId === product.id);
      if (existing) {
        return {
          ...s,
          items: s.items.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i)
        };
      }
      const newItem = {
        id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: product.id,
        name: product.name,
        category: product.category,
        subtitle: product.subtitle || '',
        image: product.image,
        materialImage: '',
        qty: 1,
        rate: 0,
        remarks: ''
      };
      return { ...s, items: [...s.items, newItem] };
    });
  };

  // Add a one-off custom line (photo from the device gallery + name + price)
  // that isn't tied to a catalog product. Always added as a new row.
  const addCustomItem = ({ name, rate, image, qty } = {}) => {
    setState(s => {
      const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newItem = {
        id: `cu-${stamp}`,
        productId: `custom-${stamp}`,
        name: (name || 'Custom item').trim() || 'Custom item',
        category: 'Custom',
        subtitle: '',
        image: image || '',
        materialImage: '',
        qty: Math.max(1, Number(qty) || 1),
        rate: Math.max(0, Number(rate) || 0),
        remarks: ''
      };
      return { ...s, items: [...s.items, newItem] };
    });
  };

  const updateItem = (id, patch) => {
    setState(s => ({
      ...s,
      items: s.items.map(i => i.id === id ? { ...i, ...patch } : i)
    }));
  };

  const removeItem = (id) => {
    setState(s => ({ ...s, items: s.items.filter(i => i.id !== id) }));
  };

  const isInCollection = (productId) => state.items.some(i => i.productId === productId);

  const updateCustomer = (patch) => setState(s => ({ ...s, customer: { ...s.customer, ...patch } }));
  const updateNotes    = (patch) => setState(s => ({ ...s, notes:    { ...s.notes,    ...patch } }));

  const clearCollection = () => setState({ items: [], customer: emptyCustomer, notes: emptyNotes });

  // Replace the whole builder with a previously saved quote, so staff can
  // reopen and update it days after the PDF went out.
  const loadCollection = ({ items = [], customer = {}, notes = {} } = {}) => setState({
    items:    Array.isArray(items) ? items : [],
    customer: { ...emptyCustomer, ...customer },
    notes:    { customer: notes.customer || '' }
  });

  const subtotal = state.items.reduce((sum, i) => sum + (Number(i.rate) || 0) * (Number(i.qty) || 0), 0);

  return (
    <CollectionContext.Provider value={{
      items:    state.items,
      customer: state.customer,
      notes:    state.notes,
      subtotal,
      count:    state.items.length,
      addItem, addCustomItem, updateItem, removeItem, isInCollection,
      updateCustomer, updateNotes, clearCollection, loadCollection
    }}>
      {children}
    </CollectionContext.Provider>
  );
};
