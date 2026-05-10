import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// jsPDF's built-in Helvetica is WinAnsi-encoded and doesn't include ₹ (U+20B9),
// so we use "Rs." which renders cleanly and is standard on Indian printed bills.
const formatINR = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const COMPANY = {
  name: 'Comforto Furniture',
  tagline: 'Crafted for enduring quality',
  address: 'Bopal, Ahmedabad, Gujarat, India',
  hours: 'Mon–Sun · 10:30 AM to 8:30 PM',
  phone: '+91 99099 48203',
  email: 'hello@comforto.in',
  gst: '24XXXXXXXXXXXXX'
};

// Palette
const ACCENT      = [201, 166, 107]; // gold
const ACCENT_DARK = [167, 134, 80];
const DARK        = [26, 26, 26];
const TEXT        = [50, 45, 40];
const MUTED       = [120, 110, 100];
const SOFT        = [228, 215, 188];
const PAPER       = [250, 246, 239];
const WHITE       = [255, 255, 255];
const HEADER_DIM  = [180, 170, 155];

// Load a remote image URL into a square JPEG data URL via canvas (cover-crop).
// Returns null on failure (CORS, network, etc.) so the PDF falls back gracefully.
function urlToThumbDataURL(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const SIZE = 160;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width  - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generate a branded quotation PDF.
 * Async because product thumbnails are fetched and embedded.
 */
export async function buildQuotationPdf({ items, customer, notes, totals = {} }) {
  const doc    = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const margin = 40;

  const thumbs = await Promise.all(items.map(it => urlToThumbDataURL(it.image)));

  const quoteNo  = `CMF-${Date.now().toString().slice(-8)}`;
  const today    = new Date();
  const fmtDate  = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const dateStr  = fmtDate(today);
  const validity = fmtDate(new Date(today.getTime() + 15 * 86400000));

  // ─── HEADER BAND ───────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 110, 'F');

  // Double gold stripe (thick + thin with a thin gap)
  doc.setFillColor(...ACCENT);
  doc.rect(0, 110, pageW, 3, 'F');
  doc.setFillColor(...ACCENT);
  doc.rect(0, 116, pageW, 0.7, 'F');

  // Monogram: thin gold ring around a solid gold disc
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.7);
  doc.circle(margin + 22, 54, 25, 'S');
  doc.setFillColor(...ACCENT);
  doc.circle(margin + 22, 54, 21, 'F');
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('C', margin + 15, 62);

  // Brand block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text(COMPANY.name, margin + 60, 50);
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text(COMPANY.tagline.toUpperCase(), margin + 60, 64);
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_DIM);
  doc.text(`${COMPANY.address}  ·  ${COMPANY.phone}  ·  ${COMPANY.email}`, margin + 60, 82);

  // Quotation meta block (right) — gold-bullet rows
  const rightX = pageW - margin;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(...ACCENT);
  doc.text('QUOTATION', rightX, 36, { align: 'right' });

  const metaRow = (label, value, ly) => {
    doc.setFillColor(...ACCENT);
    doc.circle(rightX - 118, ly - 2.5, 1.3, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...HEADER_DIM);
    doc.text(label.toUpperCase(), rightX - 110, ly);
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(value, rightX, ly, { align: 'right' });
  };
  metaRow('Quote No.',  quoteNo,  56);
  metaRow('Issued',     dateStr,  72);
  metaRow('Valid Till', validity, 88);

  let y = 142;

  // ─── CARD HELPERS ─────────────────────────────────────────────
  // A paper-toned panel with a gold left-edge stripe.
  const drawCard = (x, ly, w, h) => {
    doc.setFillColor(...PAPER);
    doc.roundedRect(x, ly, w, h, 5, 5, 'F');
    doc.setFillColor(...ACCENT);
    doc.rect(x, ly, 3, h, 'F');
  };

  // Render an info card (label, big title, detail lines). Returns final y after card.
  const drawInfoCard = (x, ly, w, label, titleText, detailLines) => {
    const innerPad   = 14;
    const innerWidth = w - innerPad - 6; // account for left stripe + right pad

    // Pre-wrap title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const titleWrapped = doc.splitTextToSize(titleText || '-', innerWidth);

    // Pre-wrap details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const wrappedDetails = [];
    detailLines.filter(Boolean).forEach(line => {
      doc.splitTextToSize(line, innerWidth).forEach(s => wrappedDetails.push(s));
    });

    const labelH    = 14;
    const titleLH   = 15;
    const detailLH  = 13;
    const cardH = 12 + labelH + 4 + titleWrapped.length * titleLH
                + (wrappedDetails.length ? 6 + wrappedDetails.length * detailLH : 0)
                + 12;

    // Card panel
    drawCard(x, ly, w, cardH);

    // Eyebrow label inside
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...ACCENT_DARK);
    doc.text(label.toUpperCase(), x + innerPad, ly + 18);

    // Title
    let cy = ly + 18 + 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...DARK);
    titleWrapped.forEach(line => { doc.text(line, x + innerPad, cy); cy += titleLH; });

    // Details
    if (wrappedDetails.length) {
      cy += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT);
      wrappedDetails.forEach(line => { doc.text(line, x + innerPad, cy); cy += detailLH; });
    }

    return ly + cardH;
  };

  // ─── CUSTOMER + PROJECT CARDS ─────────────────────────────────
  const colW  = (pageW - margin * 2 - 16) / 2;
  const projX = margin + colW + 16;

  const custEnd = drawInfoCard(margin, y, colW, 'Prepared For', customer.name, [
    customer.mobile  && `Mobile   ${customer.mobile}`,
    customer.email   && `Email    ${customer.email}`,
    customer.address && customer.address
  ]);

  const projEnd = drawInfoCard(projX, y, colW, 'Project & Delivery', customer.projectName, [
    customer.projectType     && `Type        ${customer.projectType}`,
    customer.interior        && `Interior    ${customer.interior}`,
    customer.deliveryDate    && `Delivery    ${customer.deliveryDate}`,
    customer.deliveryAddress && customer.deliveryAddress
  ]);

  y = Math.max(custEnd, projEnd) + 18;

  // ─── ITEMS TABLE ──────────────────────────────────────────────
  // Eyebrow label above the table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...ACCENT_DARK);
  doc.text('SELECTED PIECES', margin, y);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1.2);
  doc.line(margin, y + 4, margin + 26, y + 4);
  y += 12;

  const head = [['#', '', 'Item', 'Qty', 'Rate', 'Amount']];
  const body = items.map((it, idx) => {
    const amount = (Number(it.rate) || 0) * (Number(it.qty) || 0);
    const itemCell = [
      it.name || '',
      it.subtitle || '',
      it.category || '',
      it.remarks ? `Remarks: ${it.remarks}` : ''
    ].filter(Boolean).join('\n');
    return [
      String(idx + 1).padStart(2, '0'),
      '', // image cell — drawn via didDrawCell
      itemCell,
      String(it.qty || 0),
      formatINR(it.rate),
      formatINR(amount)
    ];
  });

  autoTable(doc, {
    startY: y,
    head, body,
    margin: { left: margin, right: margin },
    theme: 'striped',
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      cellPadding: { top: 10, right: 8, bottom: 10, left: 8 },
      textColor: TEXT,
      lineColor: SOFT,
      lineWidth: 0,
      valign: 'middle'
    },
    headStyles: {
      fillColor: DARK,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: { top: 11, bottom: 11, left: 8, right: 8 },
      lineWidth: 0
    },
    bodyStyles: { minCellHeight: 64 },
    alternateRowStyles: { fillColor: PAPER },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center', textColor: WHITE, fontSize: 9, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'center' },
      2: { valign: 'top', textColor: DARK },
      3: { cellWidth: 40, halign: 'center' },
      4: { cellWidth: 76, halign: 'right' },
      5: { cellWidth: 92, halign: 'right', fontStyle: 'bold', textColor: DARK }
    },
    willDrawCell: (data) => {
      // Gold circular badge behind the row number — drawn before text so the
      // white "01" / "02" / ... renders on top of the disc.
      if (data.section === 'body' && data.column.index === 0) {
        const cx = data.cell.x + data.cell.width / 2;
        const cy = data.cell.y + data.cell.height / 2;
        doc.setFillColor(...ACCENT);
        doc.circle(cx, cy, 10.5, 'F');
      }
    },
    didDrawCell: (data) => {
      // Gold accent line under header row (drawn once, when last header cell renders)
      if (data.section === 'head' && data.column.index === data.table.columns.length - 1) {
        doc.setDrawColor(...ACCENT);
        doc.setLineWidth(1.2);
        const tableLeft = data.table.settings.margin.left;
        const tableRight = pageW - data.table.settings.margin.right;
        const lineY = data.cell.y + data.cell.height;
        doc.line(tableLeft, lineY, tableRight, lineY);
      }

      if (data.section !== 'body') return;
      // Product thumbnail
      if (data.column.index === 1) {
        const thumb = thumbs[data.row.index];
        if (thumb) {
          const pad = 4;
          const size = Math.min(data.cell.height, data.cell.width) - pad * 2;
          const ix = data.cell.x + (data.cell.width  - size) / 2;
          const iy = data.cell.y + (data.cell.height - size) / 2;
          try {
            doc.addImage(thumb, 'JPEG', ix, iy, size, size);
            // subtle gold frame around thumbnail
            doc.setDrawColor(...ACCENT);
            doc.setLineWidth(0.4);
            doc.rect(ix, iy, size, size, 'S');
          } catch { /* ignore */ }
        }
      }
    }
  });

  y = doc.lastAutoTable.finalY + 22;

  // ─── PAGE-BREAK GUARD ─────────────────────────────────────────
  const ensureSpace = (need) => {
    if (y + need > pageH - 70) { doc.addPage(); y = margin + 20; }
  };

  // ─── TOTALS CARD ──────────────────────────────────────────────
  const subtotal   = items.reduce((s, i) => s + (Number(i.rate) || 0) * (Number(i.qty) || 0), 0);
  const discount   = Number(totals.discount) || 0;
  const taxable    = Math.max(subtotal - discount, 0);
  const taxPercent = Number(totals.taxPercent) || 0;
  const taxAmount  = taxable * (taxPercent / 100);
  const grandTotal = taxable + taxAmount;

  const cardW    = 250;
  const cardX    = pageW - margin - cardW;
  const rowCount = 1 + (discount > 0 ? 1 : 0) + (taxPercent > 0 ? 1 : 0);
  const cardH    = 28 + rowCount * 18 + 14 + 40 + 10;

  ensureSpace(cardH + 10);

  // Card outer with hairline border
  doc.setFillColor(...PAPER);
  doc.roundedRect(cardX, y, cardW, cardH, 5, 5, 'F');
  doc.setDrawColor(...SOFT);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX, y, cardW, cardH, 5, 5, 'S');
  // Top accent stripe
  doc.setFillColor(...ACCENT);
  doc.rect(cardX, y, cardW, 3, 'F');

  let ty = y + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...ACCENT_DARK);
  doc.text('PRICING SUMMARY', cardX + 16, ty);
  ty += 16;

  const summaryRow = (label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(label, cardX + 16, ty);
    doc.setTextColor(...DARK);
    doc.text(value, cardX + cardW - 16, ty, { align: 'right' });
    ty += 18;
  };

  summaryRow('Subtotal', formatINR(subtotal));
  if (discount)   summaryRow('Discount',                `- ${formatINR(discount)}`);
  if (taxPercent) summaryRow(`GST (${taxPercent}%)`,    formatINR(taxAmount));

  // Divider
  doc.setDrawColor(...SOFT);
  doc.setLineWidth(0.5);
  doc.line(cardX + 16, ty - 6, cardX + cardW - 16, ty - 6);
  ty += 4;

  // Grand total inset band — dark with gold label
  const bandPadX = 8;
  const bandX = cardX + bandPadX;
  const bandW = cardW - bandPadX * 2;
  const bandH = 36;
  doc.setFillColor(...DARK);
  doc.roundedRect(bandX, ty, bandW, bandH, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text('TOTAL DUE', bandX + 14, ty + 15);
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  doc.text(formatINR(grandTotal), bandX + bandW - 14, ty + 22, { align: 'right' });

  y = y + cardH + 22;

  // ─── NOTES (paper card style) ────────────────────────────────
  const drawNoteCard = (title, text) => {
    if (!text) return;
    const innerPad = 14;
    const innerW = pageW - margin * 2 - innerPad - 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const wrapped = doc.splitTextToSize(text, innerW);
    const cardHeight = 12 + 14 + 6 + wrapped.length * 13 + 12;

    ensureSpace(cardHeight + 8);

    drawCard(margin, y, pageW - margin * 2, cardHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...ACCENT_DARK);
    doc.text(title.toUpperCase(), margin + innerPad, y + 18);

    let ny = y + 18 + 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT);
    wrapped.forEach(line => { doc.text(line, margin + innerPad, ny); ny += 13; });

    y += cardHeight + 12;
  };

  drawNoteCard('Customer Notes',     notes.customer);
  drawNoteCard('Terms & Conditions', notes.terms);

  // ─── SIGNATURE BLOCK ─────────────────────────────────────────
  ensureSpace(70);
  y += 18;
  const sigGap  = 40;
  const sigColW = (pageW - margin * 2 - sigGap) / 2;
  const drawSig = (x, label, sub) => {
    doc.setDrawColor(...DARK);
    doc.setLineWidth(0.5);
    doc.line(x, y, x + sigColW, y);
    doc.setFillColor(...ACCENT);
    doc.circle(x, y, 1.3, 'F');
    doc.circle(x + sigColW, y, 1.3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(label, x, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(sub, x, y + 23);
  };
  drawSig(margin,                    'For Comforto Furniture',   'Authorised Signatory');
  drawSig(margin + sigColW + sigGap, 'Customer Acknowledgement', 'Signature & Date');
  y += 32;

  // ─── DECORATIVE DIVIDER + CLOSING ────────────────────────────
  ensureSpace(70);
  // Five gold dots (centered, middle one larger)
  const dotsY = y + 6;
  const cx = pageW / 2;
  doc.setFillColor(...ACCENT);
  [-16, -8, 0, 8, 16].forEach((dx, i) => {
    const r = i === 2 ? 1.8 : 1.2;
    doc.circle(cx + dx, dotsY, r, 'F');
  });
  y = dotsY + 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...ACCENT_DARK);
  doc.text('Thank you for choosing Comforto Furniture', cx, y, { align: 'center' });
  y += 14;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('We look forward to creating something timeless together.', cx, y, { align: 'center' });

  // ─── FOOTER (every page) ──────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  const cxPage = pageW / 2;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = pageH - 38;

    // Hairline divider, split around a center gold diamond ornament
    doc.setDrawColor(...SOFT);
    doc.setLineWidth(0.5);
    doc.line(margin, fy - 14, cxPage - 8, fy - 14);
    doc.line(cxPage + 8, fy - 14, pageW - margin, fy - 14);
    doc.setFillColor(...ACCENT);
    doc.triangle(cxPage, fy - 17, cxPage + 3, fy - 14, cxPage, fy - 11, 'F');
    doc.triangle(cxPage, fy - 17, cxPage - 3, fy - 14, cxPage, fy - 11, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(COMPANY.name, margin, fy - 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(COMPANY.address, margin, fy + 10);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(COMPANY.phone, pageW - margin, fy - 2, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(`${COMPANY.email}  ·  GSTIN ${COMPANY.gst}`, pageW - margin, fy + 10, { align: 'right' });

    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(`Page ${p} of ${totalPages}`, cxPage, pageH - 18, { align: 'center' });
  }

  return { doc, quoteNo, grandTotal };
}

export async function downloadQuotationPdf(args) {
  const { doc, quoteNo } = await buildQuotationPdf(args);
  const safeName = (args.customer.name || 'customer').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  doc.save(`Comforto-Quote-${safeName}-${quoteNo}.pdf`);
  return quoteNo;
}

export async function quotationPdfBlob(args) {
  const { doc, quoteNo, grandTotal } = await buildQuotationPdf(args);
  const blob = doc.output('blob');
  return { blob, quoteNo, grandTotal };
}
