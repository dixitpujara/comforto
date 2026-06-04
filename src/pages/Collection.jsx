import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Download, MessageCircle, Mail, FileText, Plus, Minus } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { downloadQuotationPdf, quotationPdfFile } from '../utils/quotationPdf';
import { apiPost } from '../api/client';
import SafeImage from '../components/SafeImage';
import '../assets/css/Collection.css';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const Collection = () => {
  const {
    items, customer, notes, subtotal,
    updateItem, removeItem, updateCustomer, updateNotes, clearCollection
  } = useCollection();

  const [discount, setDiscount]       = useState(0);
  const [taxPercent, setTaxPercent]   = useState(18);
  const [generatedQuote, setGeneratedQuote] = useState(null);

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
      preparedRef.current = { key: argsKey, promise: quotationPdfFile(args).catch(() => null) };
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

  // Generate the PDF, upload it for a shareable link, then open WhatsApp / email
  // DIRECTLY (wa.me / mailto) with the message + PDF link — no share sheet. If
  // the upload isn't available, download the PDF and note it in the message.
  const shareQuote = async (channel, targetWin) => {
    // Reuse the file prepared in the background if it matches the current quote.
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
    const { blob, fileName, quoteNo } = pdf;
    setGeneratedQuote(quoteNo);

    const pdfUrl = await uploadPdf(blob, fileName);
    if (!pdfUrl) triggerDownload(blob, fileName); // no link → at least hand over the file

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
    // Pre-open the WhatsApp tab synchronously (popup blockers); we redirect it to
    // wa.me once the PDF has uploaded.
    const win = window.open('about:blank', '_blank');
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
        {items.length > 0 && (
          <button className="btn btn-ghost" onClick={() => { if (confirm('Clear collection and customer info?')) clearCollection(); }}>
            <Trash2 size={16} /> Clear all
          </button>
        )}
      </div>

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
                <input type="date" value={customer.deliveryDate} onChange={(e) => updateCustomer({ deliveryDate: e.target.value })} />
              </Field>
              <Field label="Delivery address" full>
                <textarea rows={2} value={customer.deliveryAddress} onChange={(e) => updateCustomer({ deliveryAddress: e.target.value })} placeholder="Site address (if different from billing)" />
              </Field>
            </div>
          </section>

          {/* NOTES */}
          <section className="cs-section">
            <header className="cs-section-head">
              <span className="eyebrow">Step 04</span>
              <h2 className="cs-section-title">Notes &amp; terms</h2>
            </header>
            <div className="form-grid">
              <Field label="Customer notes & special instructions" full>
                <textarea rows={3} value={notes.customer} onChange={(e) => updateNotes({ customer: e.target.value })} placeholder="What the customer should see on the PDF..." />
              </Field>
              <Field label="Internal comments (not on PDF)" full>
                <textarea rows={2} value={notes.internal} onChange={(e) => updateNotes({ internal: e.target.value })} placeholder="Internal-only notes for the sales team..." />
              </Field>
              <Field label="Terms & conditions (printed)" full>
                <textarea rows={2} value={notes.terms} onChange={(e) => updateNotes({ terms: e.target.value })} />
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
