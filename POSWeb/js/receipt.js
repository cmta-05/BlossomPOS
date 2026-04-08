// ═══════════════════════════════════════════
// receipt.js — Receipt Service
// Builds receipt text and handles printing
// Uses window.print() for thermal printer
// ═══════════════════════════════════════════

// ── Thermal paper config ──
// 58mm roll / 56mm printable width
// At 9pt Courier New ≈ 32 chars per line
// Using 30 chars — safe fit for 56mm printable at 9pt Courier New
// Gives ~1-2mm breathing room so nothing gets clipped on the right
const RECEIPT_WIDTH = 30;

function rpad(str, len) {
  return String(str).substring(0, len).padEnd(len);
}
function lpad(str, len) {
  return String(str).substring(0, len).padStart(len);
}
function center(str, len) {
  const s   = String(str).substring(0, len);
  const pad = Math.max(0, Math.floor((len - s.length) / 2));
  return ' '.repeat(pad) + s;
}

// BUILD receipt text
function buildReceipt(items, total, tax, discount, txnId) {
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('en-PH', {
    month: '2-digit', day: '2-digit', year: 'numeric'
  });
  const timeStr  = now.toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit'
  });

  const DIV  = '='.repeat(RECEIPT_WIDTH);   // ================================
  const LINE = '-'.repeat(RECEIPT_WIDTH);   // --------------------------------

  let lines = [];
  lines.push(DIV);
  lines.push(center('BLOSSOM POS',          RECEIPT_WIDTH));
  lines.push(center('Beauty & Skincare',    RECEIPT_WIDTH));
  lines.push(DIV);
  lines.push(` Date: ${dateStr} ${timeStr}`);
  lines.push(` TXN#: ${String(txnId).padStart(6, '0')}`);
  lines.push(LINE);
  lines.push(rpad(' ITEM', 22) + lpad('AMOUNT', 8.5));
  lines.push(LINE);

  items.forEach(item => {
    // Line 1: product name (max 30 chars, leaving 2 for left margin)
    const maxName = RECEIPT_WIDTH - 2;
    const name = item.product.name.length > maxName
      ? item.product.name.substring(0, maxName)
      : item.product.name;
    lines.push(` ${name}`);

    // Line 2: qty @ unit price  →  item total (right-aligned)
    const qtyPrice = `  x${item.quantity} @ P${item.product.price.toFixed(2)}`;
    const itemTotal = `P${(item.product.price * item.quantity).toFixed(2)}`;
    const spacer    = RECEIPT_WIDTH - qtyPrice.length - itemTotal.length;
    lines.push(qtyPrice + ' '.repeat(Math.max(1, spacer)) + itemTotal);
  });

  lines.push(LINE);
  const subtotal   = total - tax + (discount || 0);
  const labelWidth = 20;
  const valWidth   = RECEIPT_WIDTH - labelWidth;

  lines.push(
    rpad(' Subtotal:', labelWidth) +
    lpad(`P${subtotal.toFixed(2)}`, valWidth)
  );
  lines.push(
    rpad(' Tax (12%):', labelWidth) +
    lpad(`P${tax.toFixed(2)}`, valWidth)
  );

  if (discount > 0) {
    lines.push(
      rpad(' Discount:', labelWidth) +
      lpad(`-P${discount.toFixed(2)}`, valWidth)
    );
  }

  lines.push(DIV);
  lines.push(
    rpad(' TOTAL:', labelWidth) +
    lpad(`P${total.toFixed(2)}`, valWidth)
  );
  lines.push(DIV);
  lines.push(center('Thank you for shopping!', RECEIPT_WIDTH));
  lines.push(center('Please come again! :)',   RECEIPT_WIDTH));
  lines.push('');

  return lines.join('\n');
}

// PRINT receipt using browser print dialog
function printReceipt() {
  window.print();
}