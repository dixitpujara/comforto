import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Download, MessageCircle, Mail, FileText, Plus, Minus, ImagePlus } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { downloadQuotationPdf, quotationPdfFile } from '../utils/quotationPdf';
import { apiPost } from '../api/client';
import SafeImage from '../components/SafeImage';
import '../assets/css/Collection.css';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// A photo straight off a phone is 3–8 MB as a data URL, which blows past the
// ~5 MB localStorage quota the collection is persisted to. Downscale it to a
// thumbnail that's big enough for the quotation PDF but small enough to store.
const MAX_PHOTO_DIM = 1200;
const readPhotoAsDataUrl = (file, maxDim = MAX_PHOTO_DIM) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(reader.error || new Error('Could not read the file.'));
  reader.onload = () => {
    const raw = String(reader.result);
    const img = new Image();
    img.onerror = () => resolve(raw);      // not decodable here — store as-is
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      try {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const out = canvas.toDataURL('image/jpeg', 0.72);
        resolve(out.length < raw.length ? out : raw);
      } catch { resolve(raw); }
    };
    img.src = raw;
  };
  reader.readAsDataURL(file);
});

const Collection = () => {
  const {
    items, customer, notes, subtotal,
    addCustomItem, updateItem, removeItem, updateCustomer, updateNotes, clearCollection
  } = useCollection();

  const [discount, setDiscount]       = useState(0);
  const [taxPercent, setTaxPercent]   = useState(18);
  const [generatedQuote, setGeneratedQuote] = useState(null);

  // ── Custom item (photo from gallery + name + price) ──────────────
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState({ name: '', rate: '', image: '' });
  const customFileRef = useRef(null);

  const onCustomPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
    try {
      const image = await readPhotoAsDataUrl(file);
      setCustom(c => ({ ...c, image }));
    } catch {
      alert('Could not read that photo. Please try another one.');
    }
  };

  // ── Material swatch (per line item) ──────────────────────────────
  // One hidden file input shared by every row; materialTargetRef remembers
  // which line the staff member tapped. Swatches are small on the page and in
  // the PDF, so 700px is plenty and keeps the stored quote light.
  const materialFileRef   = useRef(null);
  const materialTargetRef = useRef(null);

  const pickMaterial = (itemId) => {
    materialTargetRef.current = itemId;
    materialFileRef.current?.click();
  };

  const onMaterialPhoto = async (e) => {
    const file = e.target.files?.[0];
    const itemId = materialTargetRef.current;
    e.target.value = '';
    materialTargetRef.current = null;
    if (!file || !itemId) return;
    if (!file.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
    try {
      const materialImage = await readPhotoAsDataUrl(file, 700);
      updateItem(itemId, { materialImage });
    } catch {
      alert('Could not read that photo. Please try another one.');
    }
  };

  // Delivery is always ahead of the quote — the picker starts at tomorrow, and
  // the guard catches dates typed straight into the field.
  const minDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const onDeliveryDate = (e) => {
    const value = e.target.value;
    if (value && value < minDeliveryDate) {
      alert('Please choose a future delivery date.');
      return;
    }
    updateCustomer({ deliveryDate: value });
  };

  const submitCustom = () => {
    if (!custom.name.trim()) { alert('Please enter an item name.'); return; }
    addCustomItem({ name: custom.name, rate: custom.rate, image: custom.image, qty: 1 });
    setCustom({ name: '', rate: '', image: '' });
    setCustomOpen(false);
  };

  const taxable    = Math.max(subtotal - Number(discount || 0), 0);
  const taxAmount  = taxable * (Number(taxPercent || 0) / 100);
  const grandTotal = taxable + taxAmount;

  // Show an empty field (not a stuck "0") so typing starts fresh; select the
  // current value on focus so a keystroke overwrites it instead of prepending.
  const showNum = (n) => (Number(n) === 0 ? '' : n);
  const selectAll = (e) => e.target.select();

  const args = useMemo(() => ({
    items, customer, notes,
    totals: { discount: Number(discount) || 0, taxPercent: Number(taxPercent) || 0 }
  }), [items, customer, notes, discount, taxPercent]);

  const canGenerate = items.length > 0 && customer.name.trim().length > 0;

  // A stable signature of the current quote so we can tell whether a
  // previously prepared PDF is still up to date.
  const argsKey = useMemo(() => JSON.stringify(args), [args]);

  // Pre-build the PDF in the background whenever the quote is valid. Embedding
  // product thumbnails is slow (each image is fetched), and the browser only
  // permits navigator.share() for a few seconds after a tap. By having the file
  // ready in advance, the WhatsApp/Email tap can share it instantly — within
  // that activation window — so the PDF actually attaches instead of falling
  // back to "attach manually".
  const preparedRef = useRef(null);
  useEffect(() => {
    if (!canGenerate) { preparedRef.current = null; return; }
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      const entry = { key: argsKey, file: null, promise: null };
      entry.promise = quotationPdfFile(args)
        .then(r => { if (!cancelled) entry.file = r?.file || null; return r; })
        .catch(() => null);
      preparedRef.current = entry;
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [argsKey, canGenerate, args]);

  const onDownload = async () => {
    const quoteNo = await downloadQuotationPdf(args);
    setGeneratedQuote(quoteNo);
  };

  // Force-download a generated blob (fallback when the device can't share files).
  const triggerDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Build the customer message. When the PDF is hosted (uploaded to Blob) the
  // message carries a tap-to-download link, so WhatsApp/email open directly with
  // the message AND the PDF together — no app-picker share sheet.
  const buildMessage = (quoteNo, pdfUrl, downloaded) => {
    const lines = [
      `Hello ${customer.name || ''},`,
      ``,
      `Thank you for choosing Comforto Furniture. Here is your quotation ${quoteNo} for ${customer.projectName || 'your project'}.`,
      `Total: ${formatINR(grandTotal)}  ·  Valid for 15 days.`,
    ];
    if (pdfUrl) {
      lines.push(``, `Download your quotation PDF:`, pdfUrl);
    } else if (downloaded) {
      lines.push(``, `(The PDF has been downloaded to this device — please attach it.)`);
    }
    lines.push(``, `Warm regards,`, `Comforto Furniture · Bopal, Ahmedabad`, `+91 94299 18571`);
    return lines.join('\n');
  };

  // Upload the PDF and return a public URL, or null if upload isn't available
  // (local dev without the API, or no Blob store connected on Vercel).
  const uploadPdf = async (blob, fileName) => {
    try {
      const base64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(',')[1] || '');
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
      const resp = await apiPost('/api/upload-quote', { data: base64, fileName });
      return resp?.url || null;
    } catch {
      return null;
    }
  };

  // True when this device can share the prepared PDF file natively (iPad,
  // iPhone, Android, Safari/modern Chrome). Checked synchronously in the click
  // handler so we only pre-open a fallback tab when we'll actually need one
  // (avoids a blank tab flashing on iPad/phones where the share sheet handles it).
  const canFileShareNow = () => {
    const p = preparedRef.current;
    return !!(
      p && p.key === argsKey && p.file &&
      typeof navigator !== 'undefined' && navigator.canShare &&
      navigator.canShare({ files: [p.file] })
    );
  };

  // Share the quote. Primary path: the native share sheet with the REAL PDF
  // attached plus the message — this is how iPad/iPhone/Android send the PDF to
  // WhatsApp/Mail, and it needs no server. Fallback (older desktop browsers):
  // upload for a download link and open wa.me / mailto directly, or download.
  const shareQuote = async (channel, targetWin) => {
    let pdf = null;
    try {
      const prepared = preparedRef.current;
      pdf = (prepared && prepared.key === argsKey)
        ? await prepared.promise
        : await quotationPdfFile(args);
    } catch {
      pdf = null;
    }
    if (!pdf) {
      if (targetWin) targetWin.close();
      alert('Could not generate the PDF. Please try again.');
      return;
    }
    const { file, blob, fileName, quoteNo } = pdf;
    setGeneratedQuote(quoteNo);

    // Primary: native share with the actual PDF file + message.
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Quotation ${quoteNo} · Comforto Furniture`,
          text: buildMessage(quoteNo, null, false),
        });
        if (targetWin) targetWin.close();
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') { if (targetWin) targetWin.close(); return; }
        // Otherwise fall through to the link / download path.
      }
    }

    // Fallback: upload for a shareable link (needs Blob), else download.
    const pdfUrl = await uploadPdf(blob, fileName);
    if (!pdfUrl) triggerDownload(blob, fileName);
    const message = buildMessage(quoteNo, pdfUrl, !pdfUrl);

    if (channel === 'whatsapp') {
      const phone = (customer.mobile || '').replace(/\D/g, '');
      const url = phone
        ? `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;
      if (targetWin) targetWin.location.href = url;
      else window.open(url, '_blank');
    } else {
      if (targetWin) targetWin.close();
      const subject = `Quotation ${quoteNo} from Comforto Furniture`;
      window.location.href = `mailto:${customer.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }
  };

  const onWhatsApp = () => {
    // Only pre-open a tab if we'll fall back to wa.me (desktop). On iPad/phones
    // the native share sheet is used, so no blank tab is opened.
    const win = canFileShareNow() ? null : window.open('about:blank', '_blank');
    shareQuote('whatsapp', win);
  };

  const onEmail = () => shareQuote('email');

  const adjustQty = (id, delta) => {
    const it = items.find(i => i.id === id);
    if (!it) return;
    const next = Math.max(1, (Number(it.qty) || 0) + delta);
    updateItem(id, { qty: next });
  };

  return (
    <div className="collection container animate-fade-in">
      <div className="collection-head">
        <div>
          <span className="eyebrow">Quotation Builder</span>
          <h1 className="section-title">Create Collection</h1>
          <p>Curate products and generate a branded quotation PDF for your customer.</p>
        </div>
        <div className="collection-head-actions">
          <button className="btn btn-primary" onClick={() => setCustomOpen(true)}>
            <Plus size={16} /> Add custom item
          </button>
          {items.length > 0 && (
            <button className="btn btn-ghost" onClick={() => { if (confirm('Clear collection and customer info?')) clearCollection(); }}>
              <Trash2 size={16} /> Clear all
            </button>
          )}
        </div>
      </div>

      {customOpen && (
        <div className="ci-modal-backdrop" onClick={() => setCustomOpen(false)}>
          <div className="ci-modal" onClick={e => e.stopPropagation()}>
            <h3 className="ci-modal-title">Add custom item</h3>
            <div className="ci-photo">
              {custom.image
                ? <img src={custom.image} alt="Selected" className="ci-photo-preview" />
                : <div className="ci-photo-empty"><ImagePlus size={26} /></div>}
              <button type="button" className="btn btn-ghost btn-small" onClick={() => customFileRef.current?.click()}>
                <ImagePlus size={14} /> {custom.image ? 'Change photo' : 'Select photo from gallery'}
              </button>
              <input ref={customFileRef} type="file" accept="image/*" hidden onChange={onCustomPhoto} />
            </div>
            <label className="ci-field">
              <span>Name</span>
              <input type="text" value={custom.name} autoFocus
                onChange={e => setCustom(c => ({ ...c, name: e.target.value }))}
                placeholder="e.g. Custom Wardrobe" />
            </label>
            <label className="ci-field">
              <span>Price (₹)</span>
              <input type="number" min={0} value={custom.rate} onFocus={selectAll}
                onChange={e => setCustom(c => ({ ...c, rate: e.target.value }))}
                placeholder="0" />
            </label>
            <div className="ci-actions">
              <button className="btn btn-ghost" onClick={() => setCustomOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitCustom}>Add to collection</button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state empty-state-rich">
          <div className="empty-state-icon">
            <FileText size={28} />
          </div>
          <h3>Your collection is empty</h3>
          <p>Browse the catalog and use <strong>Add to Collection</strong> on any product to begin building a quote.</p>
          <Link to="/catalog" className="btn btn-primary mt-4">Open Catalog</Link>
        </div>
      ) : (
        <>
          {/* ITEMS TABLE */}
          <section className="cs-section">
            <header className="cs-section-head">
              <span className="eyebrow">Step 01</span>
              <h2 className="cs-section-title">Selected pieces <span className="muted">· {items.length}</span></h2>
            </header>
            <div className="ctable-wrap">
              <table className="ctable">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th style={{ width: 70 }}></th>
                    <th style={{ width: 92 }}>Material</th>
                    <th>Product</th>
                    <th style={{ width: 120 }}>Qty</th>
                    <th style={{ width: 140 }}>Rate (₹)</th>
                    <th style={{ width: 220 }}>Remarks</th>
                    <th style={{ width: 120 }} className="text-right">Amount</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const amount = (Number(it.rate) || 0) * (Number(it.qty) || 0);
                    return (
                      <tr key={it.id}>
                        <td><span className="ctable-num">{String(idx + 1).padStart(2, '0')}</span></td>
                        <td><SafeImage src={it.image} alt={it.name} className="ctable-img compact" /></td>
                        <td>
                          {it.materialImage ? (
                            <div className="mat-cell">
                              <img src={it.materialImage} alt={`${it.name} material`} className="mat-swatch"
                                onClick={() => pickMaterial(it.id)} title="Change material photo" />
                              <button type="button" className="mat-clear"
                                onClick={() => updateItem(it.id, { materialImage: '' })} title="Remove material photo">
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button type="button" className="mat-add" onClick={() => pickMaterial(it.id)}>
                              <ImagePlus size={14} />
                              <span>Add</span>
                            </button>
                          )}
                        </td>
                        <td>
                          <div className="ctable-name">{it.name}</div>
                          <div className="ctable-sub">{it.category}{it.subtitle ? ` · ${it.subtitle}` : ''}</div>
                        </td>
                        <td>
                          <div className="qty-stepper">
                            <button onClick={() => adjustQty(it.id, -1)}><Minus size={12} /></button>
                            <input type="number" min={1} value={it.qty} onFocus={selectAll}
                              onChange={(e) => updateItem(it.id, { qty: Math.max(1, Number(e.target.value) || 1) })} />
                            <button onClick={() => adjustQty(it.id, +1)}><Plus size={12} /></button>
                          </div>
                        </td>
                        <td>
                          <input type="number" min={0} value={showNum(it.rate)} placeholder="0" onFocus={selectAll}
                            onChange={(e) => updateItem(it.id, { rate: Math.max(0, Number(e.target.value) || 0) })}
                            className="ctable-input" />
                        </td>
                        <td>
                          <input type="text" placeholder="Notes for this item..."
                            value={it.remarks}
                            onChange={(e) => updateItem(it.id, { remarks: e.target.value })}
                            className="ctable-input" />
                        </td>
                        <td className="text-right amount-cell">{formatINR(amount)}</td>
                        <td>
                          <button className="row-remove" onClick={() => removeItem(it.id)} title="Remove">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <input ref={materialFileRef} type="file" accept="image/*" hidden onChange={onMaterialPhoto} />
          </section>

          {/* TOTALS + ADJUSTMENTS */}
          <section className="cs-section">
            <header className="cs-section-head">
              <span className="eyebrow">Step 02</span>
              <h2 className="cs-section-title">Pricing summary</h2>
            </header>
            <div className="totals-grid">
              <div className="totals-adjust">
                <label>
                  <span>Discount (₹)</span>
                  <input type="number" min={0} value={showNum(discount)} placeholder="0" onFocus={selectAll}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))} />
                </label>
                <label>
                  <span>GST (%)</span>
                  <input type="number" min={0} max={28} value={showNum(taxPercent)} placeholder="0" onFocus={selectAll}
                    onChange={(e) => setTaxPercent(Math.max(0, Math.min(50, Number(e.target.value) || 0)))} />
                </label>
              </div>
              <div className="totals-card">
                <div className="totals-line"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                {discount > 0 && <div className="totals-line"><span>Discount</span><span>− {formatINR(discount)}</span></div>}
                {taxPercent > 0 && <div className="totals-line"><span>GST ({taxPercent}%)</span><span>{formatINR(taxAmount)}</span></div>}
                <div className="totals-grand-band">
                  <span>Amount Payable</span>
                  <span>{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* CUSTOMER + DELIVERY */}
          <section className="cs-section">
            <header className="cs-section-head">
              <span className="eyebrow">Step 03</span>
              <h2 className="cs-section-title">Customer details</h2>
            </header>
            <div className="form-grid">
              <Field label="Customer name *">
                <input type="text" value={customer.name} onChange={(e) => updateCustomer({ name: e.target.value })} placeholder="Full name" />
              </Field>
              <Field label="Mobile number">
                <input type="tel" value={customer.mobile} onChange={(e) => updateCustomer({ mobile: e.target.value })} placeholder="98xxxxxxxx" />
              </Field>
              <Field label="Email">
                <input type="email" value={customer.email} onChange={(e) => updateCustomer({ email: e.target.value })} placeholder="customer@example.com" />
              </Field>
              <Field label="Address" full>
                <textarea rows={2} value={customer.address} onChange={(e) => updateCustomer({ address: e.target.value })} placeholder="Billing / residence address" />
              </Field>
              <Field label="Project name">
                <input type="text" value={customer.projectName} onChange={(e) => updateCustomer({ projectName: e.target.value })} placeholder="e.g. Sharma Residence – Living Room" />
              </Field>
              <Field label="Project type">
                <input type="text" value={customer.projectType} onChange={(e) => updateCustomer({ projectType: e.target.value })} placeholder="Residential / Commercial / Hotel" />
              </Field>
              <Field label="Interior name">
                <input type="text" value={customer.interior} onChange={(e) => updateCustomer({ interior: e.target.value })} placeholder="Interior designer / firm name" />
              </Field>
              <Field label="Expected delivery">
                <input type="date" value={customer.deliveryDate} min={minDeliveryDate} onChange={onDeliveryDate} />
              </Field>
              <Field label="Delivery address" full>
                <textarea rows={2} value={customer.deliveryAddress} onChange={(e) => updateCustomer({ deliveryAddress: e.target.value })} placeholder="Site address (if different from billing)" />
              </Field>
              <Field label="Customer notes & special instructions" full>
                <textarea rows={3} value={notes.customer} onChange={(e) => updateNotes({ customer: e.target.value })} placeholder="What the customer should see on the PDF..." />
              </Field>
            </div>
          </section>

          {/* ACTION BAR */}
          <div className="action-bar">
            <div className="action-bar-info">
              <span className="action-bar-total">{formatINR(grandTotal)}</span>
              <span className="action-bar-meta">{items.length} items · for {customer.name || '—'}</span>
              {generatedQuote && <span className="action-bar-quote">Generated: {generatedQuote}</span>}
            </div>
            <div className="action-bar-buttons">
              {!canGenerate && (
                <span className="action-bar-warn">
                  {items.length === 0 ? 'Add items to continue' : 'Customer name required'}
                </span>
              )}
              <button className="btn btn-ghost" disabled={!canGenerate} onClick={onDownload}>
                <Download size={16} /> Download PDF
              </button>
              <button className="btn btn-ghost" disabled={!canGenerate} onClick={onEmail}>
                <Mail size={16} /> Email
              </button>
              <button className="btn btn-whatsapp" disabled={!canGenerate} onClick={onWhatsApp}>
                <MessageCircle size={16} /> Generate &amp; WhatsApp
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Field = ({ label, children, full }) => (
  <label className={`form-field ${full ? 'full' : ''}`}>
    <span className="form-label">{label}</span>
    {children}
  </label>
);

export default Collection;
