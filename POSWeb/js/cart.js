// ═══════════════════════════════════════════
// cart.js — Cart Service
// All cart operations and calculations
// Same logic as CartService.cs in WinForms
// ═══════════════════════════════════════════

const TAX_RATE = 0.12; // 12% VAT

// Cart state — array of { product, quantity }
let cartItems = [];

// ── ADD to cart ──
// If product exists, increase quantity
function addToCart(product, quantity) {
  quantity = parseInt(quantity) || 1;

  const existing = cartItems.find(
    i => i.product.id === product.id
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({ product, quantity });
  }
}

// ── REMOVE from cart ──
function removeFromCart(productId) {
  cartItems = cartItems.filter(
    i => i.product.id !== productId
  );
}

// ── CLEAR entire cart ──
function clearCart() {
  cartItems = [];
}

// ── GET all cart items ──
function getCartItems() {
  return cartItems;
}

// ── IS EMPTY check ──
function isCartEmpty() {
  return cartItems.length === 0;
}

// ── CALCULATIONS ──

// Subtotal = sum of all item subtotals
function getSubtotal() {
  return cartItems.reduce(
    (sum, i) => sum + (i.product.price * i.quantity),
    0
  );
}

// Tax = subtotal × 12%
function getTaxAmount() {
  return getSubtotal() * TAX_RATE;
}

// Total = subtotal + tax - discount
function getTotal(discount) {
  discount = parseFloat(discount) || 0;
  if (discount < 0) discount = 0;
  return getSubtotal() + getTaxAmount() - discount;
}

// Format currency helper
// Prevents NaN from showing — always returns a number
function formatCurrency(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₱0.00';
  return '₱' + num.toFixed(2);
}