// ═══════════════════════════════════════════
// receipt.js — Receipt Service
// Builds receipt text and handles printing
// Uses window.print() for thermal printer
// ═══════════════════════════════════════════

// BUILD receipt text
function buildReceipt(items, total, tax, discount, txnId) {
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('en-PH', {
    month: '2-digit', day: '2-digit', year: 'numeric'
  });
  const timeStr  = now.toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit'
  });

  let lines = [];
  lines.push('================================');
  lines.push('        BLOSSOM POS            ');
  lines.push('    Beauty & Skincare Shop     ');
  lines.push('================================');
  lines.push(` Date : ${dateStr} ${timeStr}`);
  lines.push(` TXN# : ${String(txnId).padStart(6, '0')}`);
  lines.push('--------------------------------');
  lines.push(' ITEM                     PRICE');
  lines.push('--------------------------------');

  items.forEach(item => {
    const name = item.product.name.length > 16
      ? item.product.name.substring(0, 16)
      : item.product.name.padEnd(16);
    lines.push(` ${name}  x${item.quantity}`);
    lines.push(
      ` @ P${item.product.price.toFixed(2)}`.padEnd(20) +
      `P${(item.product.price * item.quantity).toFixed(2)}`
    );
  });

  lines.push('--------------------------------');
  const subtotal = total - tax + discount;
  lines.push(` Subtotal:`.padEnd(20) + `P${subtotal.toFixed(2)}`);
  lines.push(` Tax (12%):`.padEnd(20) + `P${tax.toFixed(2)}`);

  if (discount > 0) {
    lines.push(` Discount:`.padEnd(20) + `-P${discount.toFixed(2)}`);
  }

  lines.push('================================');
  lines.push(` TOTAL:`.padEnd(20) + `P${total.toFixed(2)}`);
  lines.push('================================');
  lines.push('   Thank you for shopping!    ');
  lines.push('    Please come again! :)     ');
  lines.push('');

  return lines.join('\n');
}

// PRINT receipt using browser print dialog
function printReceipt() {
  window.print();
}