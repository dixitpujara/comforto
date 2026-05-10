import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Download, MessageCircle, Mail, FileText, Plus, Minus } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { downloadQuotationPdf, quotationPdfBlob } from '../utils/quotationPdf';
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

  const args = useMemo(() => ({
    items, customer, notes,
    totals: { discount: Number(discount) || 0, taxPercent: Number(taxPercent) || 0 }
  }), [items, customer, notes, discount, taxPercent]);

  const canGenerate = items.length > 0 && customer.name.trim().length > 0;

  const onDownload = async () => {
    const quoteNo = await downloadQuotationPdf(args);
    setGeneratedQuote(quoteNo);
  };

  const onWhatsApp = async () => {
    // Open the WhatsApp tab synchronously to keep the user-gesture context;
    // we'll redirect it once the PDF (async image preload) is ready.
    const win = window.open('about:blank', '_blank');
    const quoteNo = await downloadQuotationPdf(args);
    setGeneratedQuote(quoteNo);
    const phone = (customer.mobile || '').replace(/\D/g, '');
    const text = `Hello ${customer.name || ''},\n\nThank you for visiting Comforto Furniture.\nPlease find attached your quotation ${quoteNo} for ${customer.projectName || 'your project'} (Total: ${formatINR(grandTotal)}).\n\nThe PDF has been downloaded — please attach it to this chat.\n\n— Comforto Furniture, Bopal`;
    const url = phone
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (win) win.location.href = url;
    else window.open(url, '_blank');
  };

  const onEmail = async () => {
    const quoteNo = await downloadQuotationPdf(args);
    setGeneratedQuote(quoteNo);
    const subject = `Quotation ${quoteNo} from Comforto Furniture`;
    const body = `Dear ${customer.name || 'Customer'},\n\nPlease find attached the quotation ${quoteNo} for ${customer.projectName || 'your project'}.\n\nTotal: ${formatINR(grandTotal)}\nValid for 15 days.\n\nThe PDF has been downloaded — please attach it before sending.\n\nWarm regards,\nComforto Furniture\nBopal, Ahmedabad\n+91 99099 48203`;
    window.location.href = `mailto:${customer.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

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
                            <input type="number" min={1} value={it.qty}
                              onChange={(e) => updateItem(it.id, { qty: Math.max(1, Number(e.target.value) || 1) })} />
                            <button onClick={() => adjustQty(it.id, +1)}><Plus size={12} /></button>
                          </div>
                        </td>
                        <td>
                          <input type="number" min={0} value={it.rate}
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
                  <input type="number" min={0} value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))} />
                </label>
                <label>
                  <span>GST (%)</span>
                  <input type="number" min={0} max={28} value={taxPercent}
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
