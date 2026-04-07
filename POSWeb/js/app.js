// ═══════════════════════════════════════════
// app.js — Main Event Handler
// ALL addEventListener() calls live here
// This is the core of Event-Driven Programming
// Events: Click, Input(KeyPress), Change, Hover
// ═══════════════════════════════════════════

// ── App State ──
let selectedProductId  = null; // currently selected product
let selectedCartIndex  = null; // currently selected cart item
let selectedMgmtId     = null; // selected product in management

// ═══════════════════════════════════════════
// INITIALIZATION — runs when page loads
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // Initialize database
  dbInitialize();

  // Set today's date in sidebar
  document.getElementById('sidebarDate').textContent =
    new Date().toLocaleDateString('en-PH', {
      month: 'short', day: '2-digit', year: 'numeric'
    });

  // Load initial product list
  renderProductList(getAllProducts());

  // Register ALL event listeners
  registerNavigationEvents();
  registerCashierEvents();
  registerProductMgmtEvents();
  registerDashboardEvents();
  registerReceiptEvents();

  setStatus('✅ Ready — BlossomPOS Beauty & Skincare loaded');
});

// ═══════════════════════════════════════════
// NAVIGATION EVENTS
// ═══════════════════════════════════════════
function registerNavigationEvents() {

  // Click event — switch to Cashier screen
  document.getElementById('btnNavCashier')
    .addEventListener('click', function() {
      showScreen('screenCashier');
      setActiveNav(this);
      renderProductList(getAllProducts());
      setStatus('🛍 Cashier screen — ready for new order');
    });

  // Click event — switch to Products screen
  document.getElementById('btnNavProducts')
    .addEventListener('click', function() {
      showScreen('screenProducts');
      setActiveNav(this);
      renderProductsTable();
      setStatus('📦 Product Management — select a product to edit');
    });

  // Click event — switch to Dashboard screen
  document.getElementById('btnNavDashboard')
    .addEventListener('click', function() {
      showScreen('screenDashboard');
      setActiveNav(this);
      renderDashboard();
      setStatus('📊 Dashboard — showing sales reports and predictions');
    });
}

// ═══════════════════════════════════════════
// CASHIER SCREEN EVENTS
// ═══════════════════════════════════════════
function registerCashierEvents() {

  // Input event (KeyPress) — search as you type
  // Fires on EVERY keystroke — live filtering
  document.getElementById('txtSearch')
    .addEventListener('input', function() {
      const keyword  = this.value.trim();
      const category = document.getElementById('cmbCategory').value;

      let results = keyword
        ? searchProducts(keyword)
        : getAllProducts();

      // Also apply category filter if not "All"
      if (category !== 'All') {
        results = results.filter(p => p.category === category);
      }

      renderProductList(results);
      setStatus(`🔍 Found ${results.length} product(s)`);
    });

  // Change event — filter by category dropdown
  document.getElementById('cmbCategory')
    .addEventListener('change', function() {
      const category = this.value;
      const keyword  = document.getElementById('txtSearch').value.trim();

      let results = filterByCategory(category);

      if (keyword) {
        results = results.filter(p =>
          p.name.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      renderProductList(results);
      setStatus(`📂 Showing ${results.length} products in '${category}'`);
    });

  // Click event — Add to Cart button
  document.getElementById('btnAddToCart')
    .addEventListener('click', function() {
      handleAddToCart();
    });

  // Click event — Remove selected item from cart
  document.getElementById('btnRemoveItem')
    .addEventListener('click', function() {
      handleRemoveFromCart();
    });

  // Click event — Clear entire cart
  document.getElementById('btnClearCart')
    .addEventListener('click', function() {
      handleClearCart();
    });

  // Input event — discount field recalculates total live
  document.getElementById('txtDiscount')
    .addEventListener('input', function() {
      refreshTotals();
    });

  // Click event — Process Payment
  document.getElementById('btnPayment')
    .addEventListener('click', function() {
      handlePayment();
    });

  // Hover events — button visual feedback
  // (CSS handles :hover, JS adds extra status feedback)
  document.getElementById('btnAddToCart')
    .addEventListener('mouseover', function() {
      if (selectedProductId) {
        setStatus('➕ Click to add selected product to cart');
      }
    });

  document.getElementById('btnPayment')
    .addEventListener('mouseover', function() {
      if (!isCartEmpty()) {
        setStatus('💳 Click to complete sale and print receipt');
      }
    });
}

// ═══════════════════════════════════════════
// PRODUCT MANAGEMENT EVENTS
// ═══════════════════════════════════════════
function registerProductMgmtEvents() {

  // Click event — Add Product button
  document.getElementById('btnAddProduct')
    .addEventListener('click', function() {
      handleAddProduct();
    });

  // Click event — Update Product button
  document.getElementById('btnUpdateProduct')
    .addEventListener('click', function() {
      handleUpdateProduct();
    });

  // Click event — Delete Product button
  document.getElementById('btnDeleteProduct')
    .addEventListener('click', function() {
      handleDeleteProduct();
    });

  // Click event — Clear form fields
  document.getElementById('btnClearForm')
    .addEventListener('click', function() {
      clearProductForm();
      setStatus('🔄 Form cleared');
    });
}

// ═══════════════════════════════════════════
// DASHBOARD EVENTS
// ═══════════════════════════════════════════
function registerDashboardEvents() {

  // Click event — Refresh dashboard
  document.getElementById('btnRefresh')
    .addEventListener('click', function() {
      renderDashboard();
      setStatus('🔄 Dashboard refreshed');
    });
}

// ═══════════════════════════════════════════
// RECEIPT EVENTS
// ═══════════════════════════════════════════
function registerReceiptEvents() {

  // Click event — Print Receipt
  document.getElementById('btnPrintReceipt')
    .addEventListener('click', function() {
      printReceipt();
      setStatus('🖨 Sending to printer...');
    });

  // Click event — Close receipt / New Transaction
  document.getElementById('btnCloseReceipt')
    .addEventListener('click', function() {
      closeReceipt();
    });
}

// ═══════════════════════════════════════════
// CASHIER HANDLER FUNCTIONS
// ═══════════════════════════════════════════

// Handle adding product to cart
function handleAddToCart() {
  if (!selectedProductId) {
    alert('Please select a product from the list first.\n\nTip: You can also double-click a product to add it!');
    return;
  }

  const products = getAllProducts();
  const product  = products.find(p => p.id === selectedProductId);

  if (!product) return;

  // Validation — out of stock
  if (product.stock <= 0) {
    alert(`Sorry! "${product.name}" is out of stock.\n\nPlease choose a different product.`);
    setStatus(`⚠ "${product.name}" is out of stock`);
    return;
  }

  const qtyInput = document.getElementById('nudQuantity');
  const quantity = parseInt(qtyInput.value);

  // Validation — invalid quantity
  if (isNaN(quantity) || quantity <= 0) {
    alert('Please enter a valid quantity (minimum 1).');
    qtyInput.focus();
    return;
  }

  // Validation — exceeds stock
  if (quantity > product.stock) {
    alert(`Not enough stock!\n\nRequested: ${quantity} units\nAvailable: ${product.stock} units`);
    return;
  }

  addToCart(product, quantity);
  renderCartList();
  refreshTotals();

  // Reset quantity to 1
  qtyInput.value = 1;

  setStatus(`✅ Added ${quantity}x "${product.name}" — ₱${(product.price * quantity).toFixed(2)}`);
}

// Handle removing item from cart
function handleRemoveFromCart() {
  if (selectedCartIndex === null) {
    alert('Please click an item in the cart first, then click Remove.');
    return;
  }

  const items    = getCartItems();
  const item     = items[selectedCartIndex];
  const name     = item.product.name;

  removeFromCart(item.product.id);
  selectedCartIndex = null;
  renderCartList();
  refreshTotals();
  setStatus(`🗑 Removed "${name}" from cart`);
}

// Handle clearing the cart
function handleClearCart() {
  if (isCartEmpty()) {
    setStatus('⚠ Cart is already empty');
    return;
  }

  if (confirm('Are you sure you want to clear all items?')) {
    clearCart();
    selectedCartIndex = null;
    renderCartList();
    refreshTotals();
    setStatus('🗑 Cart cleared — ready for new order');
  }
}

// Handle payment processing
function handlePayment() {
  // Validation — empty cart
  if (isCartEmpty()) {
    alert('Your cart is empty!\n\nPlease add at least one product before processing payment.');
    setStatus('⚠ Cannot process — cart is empty');
    return;
  }

  // Validation — discount amount
  const discountInput = document.getElementById('txtDiscount');
  const discount      = parseFloat(discountInput.value) || 0;

  // NaN check
  if (isNaN(parseFloat(discountInput.value))) {
    alert('Please enter a valid discount amount.');
    discountInput.focus();
    setStatus('⚠ Invalid discount amount');
    return;
  }

  // Negative discount check
  if (discount < 0) {
    alert('Discount cannot be negative.');
    discountInput.focus();
    return;
  }

  const subtotal = getSubtotal();
  const tax      = getTaxAmount();
  const total    = getTotal(discount);

  // Discount exceeds subtotal check
  if (discount > subtotal) {
    alert('Discount cannot exceed the subtotal amount.');
    return;
  }

  const items = getCartItems();

  // Save transaction to localStorage
  const txnId = dbSaveTransaction(items, total, tax, discount);

  // Show success message
  alert(
    `✅ Transaction #${String(txnId).padStart(4,'0')} Complete!\n\n` +
    `Items Sold:  ${items.length}\n` +
    `Subtotal:    ₱${subtotal.toFixed(2)}\n` +
    `Tax (12%):  ₱${tax.toFixed(2)}\n` +
    `Discount:   -₱${discount.toFixed(2)}\n` +
    `────────────────────\n` +
    `TOTAL:       ₱${total.toFixed(2)}\n\n` +
    'Proceeding to receipt...'
  );

  // Show receipt modal
  showReceipt(items, total, tax, discount, txnId);

  // Reset for next customer
  clearCart();
  selectedCartIndex = null;
  renderCartList();
  refreshTotals();
  renderProductList(getAllProducts()); // refresh stock
  document.getElementById('nudQuantity').value = 1;
  document.getElementById('txtDiscount').value  = 0;

  setStatus(`✅ Transaction #${String(txnId).padStart(4,'0')} saved — Total: ₱${total.toFixed(2)} — Ready for next customer`);
}

// ═══════════════════════════════════════════
// PRODUCT MANAGEMENT HANDLER FUNCTIONS
// ═══════════════════════════════════════════

function handleAddProduct() {
  const result = addProduct(
    document.getElementById('fldName').value,
    document.getElementById('fldPrice').value,
    document.getElementById('fldStock').value,
    document.getElementById('fldCategory').value
  );

  if (!result.success) {
    alert(result.message);
    return;
  }

  renderProductsTable();
  clearProductForm();
  setStatus(`✅ Product "${result.product.name}" added successfully`);
  alert('Product added successfully!');
}

function handleUpdateProduct() {
  if (!selectedMgmtId) {
    alert('Please select a product from the table to update.');
    return;
  }

  const result = updateProduct(
    selectedMgmtId,
    document.getElementById('fldName').value,
    document.getElementById('fldPrice').value,
    document.getElementById('fldStock').value,
    document.getElementById('fldCategory').value
  );

  if (!result.success) {
    alert(result.message);
    return;
  }

  renderProductsTable();
  clearProductForm();
  setStatus('✅ Product updated successfully');
  alert('Product updated!');
}

function handleDeleteProduct() {
  if (!selectedMgmtId) {
    alert('Please select a product from the table to delete.');
    return;
  }

  const name = document.getElementById('fldName').value;

  if (!confirm(`Delete "${name}"?\n\nThis cannot be undone.`)) return;

  const result = deleteProduct(selectedMgmtId);

  if (!result.success) {
    alert(result.message);
    return;
  }

  renderProductsTable();
  clearProductForm();
  setStatus(`🗑 Product "${name}" deleted`);
}

// ═══════════════════════════════════════════
// RENDER FUNCTIONS — update the UI
// ═══════════════════════════════════════════

// Render product list on cashier screen
function renderProductList(products) {
  const list = document.getElementById('productList');
  list.innerHTML = '';

  if (products.length === 0) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:#C9005A;">No products found</div>';
    return;
  }

  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product-item' +
      (product.id === selectedProductId ? ' selected' : '') +
      (product.stock <= 5 ? ' low-stock' : '');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'product-name';
    nameSpan.textContent = product.name;

    // Low stock badge
    if (product.stock <= 10) {
      const badge = document.createElement('span');
      badge.className = 'low-stock-badge';
      badge.textContent = `⚠ ${product.stock} left`;
      nameSpan.appendChild(badge);
    }

    const priceSpan = document.createElement('span');
    priceSpan.className = 'product-price';
    priceSpan.textContent = `₱${product.price.toFixed(2)}`;

    div.appendChild(nameSpan);
    div.appendChild(priceSpan);

    // Click event — select product
    div.addEventListener('click', function() {
      selectedProductId = product.id;
      renderProductList(products); // re-render to show selection
      setStatus(`Selected: ${product.name} — ₱${product.price.toFixed(2)} (${product.stock} in stock)`);
    });

    // Double-click event — add directly to cart
    div.addEventListener('dblclick', function() {
      selectedProductId = product.id;
      handleAddToCart();
    });

    // Mouseover event — show product info in status
    div.addEventListener('mouseover', function() {
      setStatus(`${product.name} — ₱${product.price.toFixed(2)} | Stock: ${product.stock} | ${product.category}`);
    });

    list.appendChild(div);
  });
}

// Render cart items
function renderCartList() {
  const list  = document.getElementById('cartList');
  const items = getCartItems();
  list.innerHTML = '';

  // Update cart header count
  const count  = items.length;
  document.getElementById('cartHeaderLabel').textContent =
    count === 0
      ? '🛒 Current Order (empty)'
      : `🛒 Current Order (${count} item${count > 1 ? 's' : ''})`;

  items.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item' +
      (index === selectedCartIndex ? ' selected' : '');

    div.innerHTML = `
      <div class="cart-item-name">${item.product.name}</div>
      <div class="cart-item-detail">
        <span>x${item.quantity} @ ₱${item.product.price.toFixed(2)}</span>
        <span>₱${(item.product.price * item.quantity).toFixed(2)}</span>
      </div>
    `;

    // Click event — select cart item
    div.addEventListener('click', function() {
      selectedCartIndex = index;
      renderCartList();
    });

    list.appendChild(div);
  });
}

// Refresh totals display
function refreshTotals() {
  const discountInput = document.getElementById('txtDiscount');
  const discount      = parseFloat(discountInput.value) || 0;
  const safeDiscount  = isNaN(discount) || discount < 0 ? 0 : discount;

  document.getElementById('lblSubtotal').textContent =
    formatCurrency(getSubtotal());
  document.getElementById('lblTax').textContent =
    formatCurrency(getTaxAmount());
  document.getElementById('lblTotal').textContent =
    formatCurrency(getTotal(safeDiscount));
}

// Render products management table
function renderProductsTable() {
  const tbody    = document.getElementById('productsTableBody');
  const products = getAllProducts();
  tbody.innerHTML = '';

  products.forEach(product => {
    const tr = document.createElement('tr');

    if (product.stock === 0) {
      tr.className = 'out-of-stock';
    }
    if (product.id === selectedMgmtId) {
      tr.className += ' selected';
    }

    tr.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>₱${product.price.toFixed(2)}</td>
      <td>${product.stock}</td>
      <td>${product.category}</td>
    `;

    // Click event — select row and fill form
    tr.addEventListener('click', function() {
      selectedMgmtId = product.id;
      document.getElementById('fldName').value     = product.name;
      document.getElementById('fldPrice').value    = product.price;
      document.getElementById('fldStock').value    = product.stock;
      document.getElementById('fldCategory').value = product.category;
      renderProductsTable();
      setStatus(`Selected: ${product.name}`);
    });

    tbody.appendChild(tr);
  });
}

// Render dashboard
function renderDashboard() {
  // Today's sales
  document.getElementById('lblTodaySales').textContent =
    formatCurrency(dbGetTodaysSales());

  // Total transactions
  const txns = dbGetAllTransactions();
  document.getElementById('lblTotalTxns').textContent =
    txns.length;

  // Total products
  document.getElementById('lblTotalProducts').textContent =
    getAllProducts().length;

  // Recent transactions table
  const txnBody = document.getElementById('txnTableBody');
  txnBody.innerHTML = '';

  const recent = [...txns].reverse().slice(0, 50);
  recent.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${String(t.id).padStart(4,'0')}</td>
      <td>₱${t.total.toFixed(2)}</td>
      <td>₱${t.tax.toFixed(2)}</td>
      <td>${new Date(t.createdAt).toLocaleString('en-PH')}</td>
    `;
    txnBody.appendChild(tr);
  });

  // Predictions table
  const predBody = document.getElementById('predTableBody');
  predBody.innerHTML = '';

  const predictions = getPredictions();
  predictions.forEach(p => {
    const tr = document.createElement('tr');
    if (p.needsRestock) tr.className = 'pred-needs-restock';

    const status = p.needsRestock
      ? `⚠ Reorder ${p.suggestedReorder} units`
      : '✅ Stock OK';

    tr.innerHTML = `
      <td>${p.productName}</td>
      <td>${p.avgDailySales}</td>
      <td>${p.predictedWeekly}</td>
      <td>${p.currentStock}</td>
      <td>${status}</td>
    `;
    predBody.appendChild(tr);
  });
}

// Show receipt modal
function showReceipt(items, total, tax, discount, txnId) {
  const content  = buildReceipt(items, total, tax, discount, txnId);
  document.getElementById('receiptContent').textContent = content;
  document.getElementById('receiptModal').classList.remove('hidden');
}

// Close receipt modal
function closeReceipt() {
  document.getElementById('receiptModal').classList.add('hidden');
}

// ═══════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════

// Show a screen — hide all others
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
}

// Set active nav button
function setActiveNav(btn) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.remove('active');
  });
  btn.classList.add('active');
}

// Update status bar message
function setStatus(message) {
  document.getElementById('statusBar').textContent = message;
}

// Clear product management form
function clearProductForm() {
  document.getElementById('fldName').value     = '';
  document.getElementById('fldPrice').value    = '';
  document.getElementById('fldStock').value    = '';
  document.getElementById('fldCategory').value = 'Skincare';
  selectedMgmtId = null;

  // Deselect table rows
  document.querySelectorAll('#productsTableBody tr')
    .forEach(tr => tr.classList.remove('selected'));
}