// ═══════════════════════════════════════════
// products.js — Product Service
// All product-related business logic
// Calls db.js for data — never touches UI
// ═══════════════════════════════════════════

// GET all products
function getAllProducts() {
  return dbGetAllProducts();
}

// SEARCH products by keyword
function searchProducts(keyword) {
  if (!keyword || keyword.trim() === '') {
    return dbGetAllProducts();
  }
  return dbSearchProducts(keyword.trim());
}

// FILTER by category
function filterByCategory(category) {
  return dbGetByCategory(category);
}

// ADD product with validation
function addProduct(name, price, stock, category) {
  // Validation
  if (!name || name.trim() === '') {
    return { success: false, message: 'Product name is required.' };
  }
  if (isNaN(price) || price <= 0) {
    return { success: false, message: 'Please enter a valid price.' };
  }
  if (isNaN(stock) || stock < 0) {
    return { success: false, message: 'Please enter a valid stock quantity.' };
  }
  if (!category) {
    return { success: false, message: 'Category is required.' };
  }

  const product = dbAddProduct({
    name:     name.trim(),
    price:    parseFloat(price),
    stock:    parseInt(stock),
    category: category
  });

  return { success: true, product };
}

// UPDATE product with validation
function updateProduct(id, name, price, stock, category) {
  if (!id) {
    return { success: false, message: 'Please select a product to update.' };
  }
  if (!name || name.trim() === '') {
    return { success: false, message: 'Product name is required.' };
  }
  if (isNaN(price) || price <= 0) {
    return { success: false, message: 'Please enter a valid price.' };
  }
  if (isNaN(stock) || stock < 0) {
    return { success: false, message: 'Please enter a valid stock quantity.' };
  }

  dbUpdateProduct({
    id:       parseInt(id),
    name:     name.trim(),
    price:    parseFloat(price),
    stock:    parseInt(stock),
    category: category
  });

  return { success: true };
}

// DELETE product
function deleteProduct(id) {
  if (!id) {
    return { success: false, message: 'Please select a product to delete.' };
  }
  dbDeleteProduct(parseInt(id));
  return { success: true };
}