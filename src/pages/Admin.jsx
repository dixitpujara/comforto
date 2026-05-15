import React, { useState, useMemo, useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Download, Upload, RotateCcw, AlertCircle, Eye, Users as UsersIcon, Eye as EyeIcon, EyeOff } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useUsers } from '../context/UsersContext';
import { useAuth } from '../context/AuthContext';
import SafeImage from '../components/SafeImage';
import '../assets/css/Admin.css';

const ALL_TABS = [
  { id: 'products',   label: 'Products',     adminOnly: false },
  { id: 'categories', label: 'Categories',   adminOnly: false },
  { id: 'materials',  label: 'Materials',    adminOnly: false },
  { id: 'roomTypes',  label: 'Room Types',   adminOnly: false },
  { id: 'users',      label: 'Users',        adminOnly: true  },
  { id: 'export',     label: 'Export / Import', adminOnly: false }
];

const Admin = () => {
  const [tab, setTab] = useState('products');
  const { hasUnexportedChanges } = useProducts();
  const { hasUnexportedChanges: hasUserChanges } = useUsers();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const tabs = ALL_TABS.filter(t => !t.adminOnly || isAdmin);
  const hasAnyUnexported = hasUnexportedChanges || (isAdmin && hasUserChanges);

  return (
    <div className="admin container animate-fade-in">
      <header className="admin-head">
        <div>
          <span className="eyebrow">Staff Tools</span>
          <h1 className="section-title">Catalog Admin</h1>
          <p>
            Manage products, categories, materials and room types. Changes are saved
            in this browser as you work — when you're ready to publish, use{' '}
            <button className="link-btn" onClick={() => setTab('export')}>Export</button>{' '}
            to download an updated <code>products.js</code> file, then redeploy.
          </p>
        </div>
        {hasAnyUnexported && (
          <div className="admin-flag">
            <AlertCircle size={16} />
            <span>You have unexported changes</span>
          </div>
        )}
      </header>

      <nav className="admin-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="admin-body">
        {tab === 'products'   && <ProductsAdmin />}
        {tab === 'categories' && <TaxonomyAdmin kind="categories" singular="category" label="Categories" />}
        {tab === 'materials'  && <TaxonomyAdmin kind="materials"  singular="material" label="Materials" />}
        {tab === 'roomTypes'  && <TaxonomyAdmin kind="roomTypes"  singular="room type" label="Room Types" />}
        {tab === 'users'      && isAdmin && <UsersAdmin />}
        {tab === 'export'     && <ExportAdmin isAdmin={isAdmin} />}
      </div>
    </div>
  );
};

/* ────────────────────────── Products Admin ────────────────────────── */

const blankProduct = (draft) => ({
  id: '',
  name: '',
  category:     draft.categories[0] || '',
  subtitle:     '',
  tag:          draft.tags[0] || '',
  material:     draft.materials[0] || '',
  roomType:     draft.roomTypes[0] || '',
  availability: draft.availabilities[0] || 'In Stock',
  image:        '',
  gallery:      [],
  description:  '',
  features:     [],
  variants:     []
});

const ProductsAdmin = () => {
  const { products, draft, addProduct, updateProduct, deleteProduct } = useProducts();
  const [editingId, setEditingId] = useState(null);
  const [draftItem, setDraftItem] = useState(null);
  const [filter, setFilter] = useState('');

  const startNew = () => {
    setDraftItem(blankProduct(draft));
    setEditingId('__new__');
  };

  const startEdit = (p) => {
    setDraftItem(JSON.parse(JSON.stringify(p)));
    setEditingId(p.id);
  };

  const cancel = () => {
    setDraftItem(null);
    setEditingId(null);
  };

  const save = () => {
    if (!draftItem.name.trim()) {
      alert('Name is required.');
      return;
    }
    if (editingId === '__new__') {
      addProduct(draftItem);
    } else {
      updateProduct(editingId, draftItem);
    }
    cancel();
  };

  const confirmDelete = (p) => {
    if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      deleteProduct(p.id);
    }
  };

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.subtitle || '').toLowerCase().includes(q)
    );
  }, [products, filter]);

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search products..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="admin-input admin-input-search"
        />
        <button className="btn btn-primary" onClick={startNew} disabled={!!editingId}>
          <Plus size={16} /> Add product
        </button>
      </div>

      {editingId && draftItem && (
        <ProductForm
          value={draftItem}
          onChange={setDraftItem}
          onSave={save}
          onCancel={cancel}
          isNew={editingId === '__new__'}
        />
      )}

      <div className="admin-products">
        {filtered.length === 0 ? (
          <div className="admin-empty">No products match.</div>
        ) : filtered.map(p => (
          <article key={p.id} className="admin-product-row">
            <SafeImage src={p.image} alt={p.name} className="admin-product-img" />
            <div className="admin-product-info">
              <h3>{p.name}</h3>
              <span className="muted">{p.category} · {p.material} · {p.roomType}</span>
              <span className="muted small">{p.variants.length} variant{p.variants.length === 1 ? '' : 's'}</span>
            </div>
            <div className="admin-product-actions">
              <a href={`#/p/${p.id}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-small" title="Preview">
                <Eye size={14} />
              </a>
              <button className="btn btn-ghost btn-small" onClick={() => startEdit(p)} disabled={!!editingId}>
                <Edit2 size={14} /> Edit
              </button>
              <button className="btn btn-danger btn-small" onClick={() => confirmDelete(p)} disabled={!!editingId}>
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

/* ────────────────────────── Product Form ────────────────────────── */

const ProductForm = ({ value, onChange, onSave, onCancel, isNew }) => {
  const { draft } = useProducts();

  const patch = (p) => onChange({ ...value, ...p });

  const setVariant = (idx, p) => {
    const next = value.variants.slice();
    next[idx] = { ...next[idx], ...p };
    onChange({ ...value, variants: next });
  };
  const addVariant = () => {
    const idx = value.variants.length + 1;
    onChange({
      ...value,
      variants: [...value.variants, {
        id: `${value.id || 'new'}-v${idx}`,
        colorName: '',
        colorHex: '#cccccc',
        image: value.image || ''
      }]
    });
  };
  const removeVariant = (idx) => {
    onChange({ ...value, variants: value.variants.filter((_, i) => i !== idx) });
  };

  const setGalleryAt = (idx, url) => {
    const next = value.gallery.slice();
    next[idx] = url;
    onChange({ ...value, gallery: next });
  };
  const addGallerySlot = () => onChange({ ...value, gallery: [...value.gallery, ''] });
  const removeGalleryAt = (idx) => onChange({ ...value, gallery: value.gallery.filter((_, i) => i !== idx) });

  const setFeatureAt = (idx, txt) => {
    const next = value.features.slice();
    next[idx] = txt;
    onChange({ ...value, features: next });
  };
  const addFeature = () => onChange({ ...value, features: [...value.features, ''] });
  const removeFeatureAt = (idx) => onChange({ ...value, features: value.features.filter((_, i) => i !== idx) });

  return (
    <div className="admin-form">
      <header className="admin-form-head">
        <h2>{isNew ? 'New product' : `Edit · ${value.name || 'Untitled'}`}</h2>
        <div className="admin-form-head-actions">
          <button className="btn btn-ghost" onClick={onCancel}><X size={14} /> Cancel</button>
          <button className="btn btn-primary" onClick={onSave}><Save size={14} /> Save</button>
        </div>
      </header>

      <div className="admin-form-grid">
        <Field label="Name">
          <input className="admin-input" value={value.name} onChange={e => patch({ name: e.target.value })} />
        </Field>

        <Field label="Subtitle">
          <input className="admin-input" value={value.subtitle} onChange={e => patch({ subtitle: e.target.value })} placeholder="e.g. Solid White Oak" />
        </Field>

        <Field label="Category">
          <select className="admin-input" value={value.category} onChange={e => patch({ category: e.target.value })}>
            {draft.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Material">
          <select className="admin-input" value={value.material} onChange={e => patch({ material: e.target.value })}>
            {draft.materials.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Room type">
          <select className="admin-input" value={value.roomType} onChange={e => patch({ roomType: e.target.value })}>
            {draft.roomTypes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Availability">
          <select className="admin-input" value={value.availability} onChange={e => patch({ availability: e.target.value })}>
            {draft.availabilities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Tag">
          <select className="admin-input" value={value.tag} onChange={e => patch({ tag: e.target.value })}>
            <option value="">(none)</option>
            {draft.tags.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Main image URL" wide>
          <input className="admin-input" value={value.image} onChange={e => patch({ image: e.target.value })} placeholder="https://..." />
        </Field>

        <Field label="Description" wide>
          <textarea className="admin-input" rows={3} value={value.description} onChange={e => patch({ description: e.target.value })} />
        </Field>
      </div>

      {/* Gallery */}
      <section className="admin-subsection">
        <header className="admin-subsection-head">
          <h3>Gallery images</h3>
          <button className="btn btn-ghost btn-small" onClick={addGallerySlot}><Plus size={14} /> Add</button>
        </header>
        {value.gallery.length === 0 && <p className="muted small">No gallery images. The main image will be used.</p>}
        {value.gallery.map((g, i) => (
          <div key={i} className="admin-inline-row">
            <input className="admin-input" value={g} placeholder="https://..." onChange={e => setGalleryAt(i, e.target.value)} />
            <button className="btn btn-ghost btn-small" onClick={() => removeGalleryAt(i)}><Trash2 size={14} /></button>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="admin-subsection">
        <header className="admin-subsection-head">
          <h3>Key features</h3>
          <button className="btn btn-ghost btn-small" onClick={addFeature}><Plus size={14} /> Add</button>
        </header>
        {value.features.length === 0 && <p className="muted small">No features listed.</p>}
        {value.features.map((f, i) => (
          <div key={i} className="admin-inline-row">
            <input className="admin-input" value={f} placeholder="e.g. Hand-finished" onChange={e => setFeatureAt(i, e.target.value)} />
            <button className="btn btn-ghost btn-small" onClick={() => removeFeatureAt(i)}><Trash2 size={14} /></button>
          </div>
        ))}
      </section>

      {/* Variants */}
      <section className="admin-subsection">
        <header className="admin-subsection-head">
          <h3>Color variants</h3>
          <button className="btn btn-ghost btn-small" onClick={addVariant}><Plus size={14} /> Add variant</button>
        </header>
        {value.variants.length === 0 && <p className="muted small">No variants. Add at least one for swatches to appear.</p>}
        {value.variants.map((v, i) => (
          <div key={i} className="admin-variant-row">
            <input
              type="color"
              value={v.colorHex || '#cccccc'}
              onChange={e => setVariant(i, { colorHex: e.target.value })}
              className="admin-color"
              title="Swatch color"
            />
            <input
              className="admin-input"
              value={v.colorName}
              placeholder="Color name"
              onChange={e => setVariant(i, { colorName: e.target.value })}
            />
            <input
              className="admin-input"
              value={v.image}
              placeholder="Image URL (shown when this swatch is selected)"
              onChange={e => setVariant(i, { image: e.target.value })}
            />
            <button className="btn btn-ghost btn-small" onClick={() => removeVariant(i)}><Trash2 size={14} /></button>
          </div>
        ))}
      </section>
    </div>
  );
};

const Field = ({ label, children, wide }) => (
  <label className={`admin-field ${wide ? 'wide' : ''}`}>
    <span className="admin-field-label">{label}</span>
    {children}
  </label>
);

/* ────────────────────────── Taxonomy Admin ────────────────────────── */

const TaxonomyAdmin = ({ kind, singular, label }) => {
  const { draft, addTaxonomyValue, renameTaxonomyValue, deleteTaxonomyValue, taxonomyUsageCount } = useProducts();
  const values = draft[kind] || [];
  const [newValue, setNewValue] = useState('');
  const [renameMap, setRenameMap] = useState({}); // { oldValue: editingNewValue }

  const startRename = (v) => setRenameMap({ ...renameMap, [v]: v });
  const cancelRename = (v) => {
    const { [v]: _, ...rest } = renameMap;
    setRenameMap(rest);
  };
  const commitRename = (v) => {
    renameTaxonomyValue(kind, v, renameMap[v]);
    cancelRename(v);
  };

  const tryDelete = (v) => {
    const count = taxonomyUsageCount(kind, v);
    if (count > 0) {
      alert(`Cannot delete "${v}" — it is used by ${count} product${count === 1 ? '' : 's'}. Reassign those products first.`);
      return;
    }
    if (confirm(`Delete ${singular} "${v}"?`)) {
      deleteTaxonomyValue(kind, v);
    }
  };

  const tryAdd = () => {
    if (addTaxonomyValue(kind, newValue)) {
      setNewValue('');
    }
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">{label}</h2>
      <p className="muted">Renaming a {singular} also updates every product that uses it.</p>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          placeholder={`New ${singular}...`}
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryAdd()}
        />
        <button className="btn btn-primary" onClick={tryAdd}><Plus size={16} /> Add</button>
      </div>

      <ul className="admin-tax-list">
        {values.map(v => {
          const count = taxonomyUsageCount(kind, v);
          const renaming = renameMap[v] !== undefined;
          return (
            <li key={v} className="admin-tax-row">
              {renaming ? (
                <>
                  <input
                    className="admin-input"
                    value={renameMap[v]}
                    onChange={e => setRenameMap({ ...renameMap, [v]: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && commitRename(v)}
                    autoFocus
                  />
                  <button className="btn btn-primary btn-small" onClick={() => commitRename(v)}><Save size={14} /></button>
                  <button className="btn btn-ghost btn-small" onClick={() => cancelRename(v)}><X size={14} /></button>
                </>
              ) : (
                <>
                  <span className="admin-tax-name">{v}</span>
                  <span className="admin-tax-count">{count} product{count === 1 ? '' : 's'}</span>
                  <button className="btn btn-ghost btn-small" onClick={() => startRename(v)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-small" onClick={() => tryDelete(v)} disabled={count > 0} title={count > 0 ? 'In use' : 'Delete'}>
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </li>
          );
        })}
        {values.length === 0 && <li className="admin-empty">No entries yet.</li>}
      </ul>
    </div>
  );
};

/* ────────────────────────── Users Admin (admin-only) ────────────────────────── */

const blankUser = () => ({ id: '', name: '', email: '', password: '', role: 'designer' });

const UsersAdmin = () => {
  const { users, addUser, updateUser, deleteUser, roles } = useUsers();
  const { user: currentUser } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [draftUser, setDraftUser] = useState(null);
  const [error, setError] = useState('');

  const startNew = () => {
    setDraftUser(blankUser());
    setEditingId('__new__');
    setError('');
  };
  const startEdit = (u) => {
    setDraftUser({ ...u });
    setEditingId(u.id);
    setError('');
  };
  const cancel = () => {
    setDraftUser(null);
    setEditingId(null);
    setError('');
  };

  const save = () => {
    setError('');
    if (!draftUser.name.trim()) return setError('Name is required.');
    const action = editingId === '__new__'
      ? addUser(draftUser)
      : updateUser(editingId, draftUser);
    if (!action.ok) return setError(action.error || 'Could not save user.');
    cancel();
  };

  const onDelete = (u) => {
    if (u.id === currentUser.id) {
      alert('You cannot delete your own account while signed in.');
      return;
    }
    if (!confirm(`Delete user "${u.name || u.email}"? This cannot be undone.`)) return;
    const res = deleteUser(u.id);
    if (!res.ok) alert(res.error);
  };

  const RoleSelect = ({ value, onChange }) => (
    <select className="admin-input" value={value} onChange={e => onChange(e.target.value)}>
      {Object.values(roles).map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
    </select>
  );

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <h2 className="admin-section-title" style={{ marginRight: 'auto', marginBottom: 0 }}>Users</h2>
        <button className="btn btn-primary" onClick={startNew} disabled={!!editingId}>
          <Plus size={16} /> Add user
        </button>
      </div>
      <p className="muted">Both roles can manage products and categories. Only Staff can manage other users.</p>

      {editingId && draftUser && (
        <div className="admin-form">
          <header className="admin-form-head">
            <h2>{editingId === '__new__' ? 'New user' : `Edit · ${draftUser.name || draftUser.email}`}</h2>
            <div className="admin-form-head-actions">
              <button className="btn btn-ghost" onClick={cancel}><X size={14} /> Cancel</button>
              <button className="btn btn-primary" onClick={save}><Save size={14} /> Save</button>
            </div>
          </header>
          {error && <p className="admin-error"><AlertCircle size={14} /> {error}</p>}
          <div className="admin-form-grid">
            <Field label="Full name">
              <input
                className="admin-input"
                value={draftUser.name}
                onChange={e => setDraftUser({ ...draftUser, name: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                className="admin-input"
                type="email"
                value={draftUser.email}
                onChange={e => setDraftUser({ ...draftUser, email: e.target.value })}
              />
            </Field>
            <Field label={editingId === '__new__' ? 'Password' : 'Password (leave to keep current)'}>
              <PasswordInput
                value={draftUser.password}
                onChange={(v) => setDraftUser({ ...draftUser, password: v })}
                placeholder={editingId === '__new__' ? '' : '••••••'}
              />
            </Field>
            <Field label="Role">
              <RoleSelect value={draftUser.role} onChange={r => setDraftUser({ ...draftUser, role: r })} />
            </Field>
          </div>
        </div>
      )}

      <ul className="admin-tax-list">
        {users.map(u => (
          <li key={u.id} className="admin-user-row">
            <div className="admin-user-info">
              <strong>{u.name}</strong>
              <span className="muted small">{u.email}</span>
            </div>
            <span className={`admin-role-pill role-${u.role}`}>{roles[u.role]?.label || u.role}</span>
            <div className="admin-user-actions">
              <button className="btn btn-ghost btn-small" onClick={() => startEdit(u)} disabled={!!editingId}>
                <Edit2 size={14} /> Edit
              </button>
              <button
                className="btn btn-danger btn-small"
                onClick={() => onDelete(u)}
                disabled={!!editingId || u.id === currentUser.id}
                title={u.id === currentUser.id ? 'You cannot delete yourself' : 'Delete user'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
        {users.length === 0 && <li className="admin-empty">No users yet.</li>}
      </ul>
    </div>
  );
};

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="admin-pw-wrap">
      <input
        className="admin-input"
        type={show ? 'text' : 'password'}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
      <button
        type="button"
        className="admin-pw-toggle"
        onClick={() => setShow(s => !s)}
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={14} /> : <EyeIcon size={14} />}
      </button>
    </div>
  );
};

/* ────────────────────────── Export / Import ────────────────────────── */

const ExportAdmin = ({ isAdmin }) => {
  const { exportProductsJs, resetDraftToSeed, importDraft, hasUnexportedChanges } = useProducts();
  const { exportStaffJs, resetToSeed: resetUsersToSeed, hasUnexportedChanges: hasUserChanges } = useUsers();
  const fileRef = useRef(null);

  const downloadText = (text, filename, mime = 'text/javascript;charset=utf-8') => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onExportProducts = () => downloadText(exportProductsJs(), 'products.js');
  const onExportStaff    = () => downloadText(exportStaffJs(),    'staff.js');

  const onImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Accept either raw JSON, or a products.js where productsData is the structure we want.
      const text = String(reader.result);
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        // try to extract `productsData = { ... };` from a JS file
        const match = text.match(/productsData\s*=\s*(\{[\s\S]*\})\s*;/);
        if (match) {
          try { json = JSON.parse(match[1]); } catch { json = null; }
        }
      }
      if (!json) {
        alert('Could not parse this file. Please import a JSON file or an exported products.js.');
        return;
      }
      if (importDraft(json)) {
        alert('Imported.');
      } else {
        alert('Import failed — file did not have the expected shape.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const onResetProducts = () => {
    if (confirm('Discard all unexported product changes and reset to the seed catalog? This cannot be undone.')) {
      resetDraftToSeed();
    }
  };
  const onResetUsers = () => {
    if (confirm('Discard all unexported user changes and reset to the seed user list? This cannot be undone.')) {
      resetUsersToSeed();
    }
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Publish changes</h2>
      <ol className="admin-publish-steps">
        <li>Click <strong>Export</strong> below — files will download.</li>
        <li>Replace the matching file in <code>src/data/</code> in the repository.</li>
        <li>Run <code>npm run deploy</code> (or push to <code>main</code>) to publish.</li>
        <li>The live site will reflect your changes within a minute.</li>
      </ol>

      <h3 className="admin-publish-section">Catalog</h3>
      <div className="admin-publish-actions">
        <button className="btn btn-primary" onClick={onExportProducts}>
          <Download size={16} /> Export products.js
        </button>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          <Upload size={16} /> Import a catalog file
        </button>
        <input ref={fileRef} type="file" accept=".json,.js,application/json,text/javascript" onChange={onImport} hidden />
        <button className="btn btn-danger" onClick={onResetProducts} disabled={!hasUnexportedChanges}>
          <RotateCcw size={16} /> Reset catalog
        </button>
      </div>

      {isAdmin && (
        <>
          <h3 className="admin-publish-section">Users</h3>
          <div className="admin-publish-actions">
            <button className="btn btn-primary" onClick={onExportStaff}>
              <Download size={16} /> Export staff.js
            </button>
            <button className="btn btn-danger" onClick={onResetUsers} disabled={!hasUserChanges}>
              <RotateCcw size={16} /> Reset users
            </button>
          </div>
        </>
      )}

      <p className="muted small mt-4">
        Your edits are auto-saved in this browser only. The deployed site will continue
        to use the seed files until you complete the publish steps above.
      </p>
    </div>
  );
};

export default Admin;
