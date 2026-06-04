import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Collection / quotation builder state.
 *
 * items:    [{ id, productId, name, category, subtitle, image, qty, rate, remarks }]
 * customer: { name, mobile, email, address, projectName, projectType, deliveryDate, deliveryAddress }
 * notes:    { customer, internal, terms }
 *
 * Persisted to localStorage so staff don't lose work between sessions.
 */

const CollectionContext = createContext();
export const useCollection = () => useContext(CollectionContext);

const STORAGE_KEY = 'comforto_collection_v1';

const emptyCustomer = {
  name: '', mobile: '', email: '',
  address: '',
  projectName: '', projectType: '',
  interior: '',
  deliveryDate: '', deliveryAddress: ''
};
const emptyNotes = { customer: '', internal: '', terms: 'Quotation valid for 15 days. 50% advance to confirm order. Prices inclusive of GST.' };

const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], customer: emptyCustomer, notes: emptyNotes };
    const parsed = JSON.parse(raw);
    return {
      items: parsed.items || [],
      customer: { ...emptyCustomer, ...(parsed.customer || {}) },
      notes:    { ...emptyNotes, ...(parsed.notes || {}) }
    };
  } catch {
    return { items: [], customer: emptyCustomer, notes: emptyNotes };
  }
};

export const CollectionProvider = ({ children }) => {
  const [state, setState] = useState(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  const subtotal = state.items.reduce((sum, i) => sum + (Number(i.rate) || 0) * (Number(i.qty) || 0), 0);

  return (
    <CollectionContext.Provider value={{
      items:    state.items,
      customer: state.customer,
      notes:    state.notes,
      subtotal,
      count:    state.items.length,
      addItem, addCustomItem, updateItem, removeItem, isInCollection,
      updateCustomer, updateNotes, clearCollection
    }}>
      {children}
    </CollectionContext.Provider>
  );
};
