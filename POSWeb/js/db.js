// ═══════════════════════════════════════════
// db.js — Data Layer
// Handles all localStorage read/write operations
// This replaces SQLite from the WinForms version
// ═══════════════════════════════════════════

// ── Storage Keys ──
const KEYS = {
  PRODUCTS:     'blossom_products',
  TRANSACTIONS: 'blossom_transactions',
  HISTORY:      'blossom_saleshistory'
};

// ── Default 30 Beauty Products ──
const DEFAULT_PRODUCTS = [
  // Skincare
  { id:1,  name:'Cetaphil Gentle Cleanser 250ml', price:399.00, stock:45,  category:'Skincare'  },
  { id:2,  name:"Pond's White Beauty Cream 50g",  price:189.00, stock:80,  category:'Skincare'  },
  { id:3,  name:'Kojic Acid Soap',                price:89.00,  stock:120, category:'Skincare'  },
  { id:4,  name:'Sunscreen SPF50 Cream 60ml',     price:350.00, stock:55,  category:'Skincare'  },
  { id:5,  name:'Vitamin C Serum 30ml',           price:499.00, stock:40,  category:'Skincare'  },
  { id:6,  name:'Aloe Vera Gel 100ml',            price:149.00, stock:65,  category:'Skincare'  },
  { id:7,  name:'Retinol Night Cream 50ml',       price:599.00, stock:30,  category:'Skincare'  },
  { id:8,  name:'Toner Pad Refill 70pcs',         price:299.00, stock:50,  category:'Skincare'  },
  // Makeup
  { id:9,  name:'Maybelline Fit Me Foundation',   price:399.00, stock:35,  category:'Makeup'    },
  { id:10, name:'NYX Matte Lip Cream',            price:349.00, stock:60,  category:'Makeup'    },
  { id:11, name:'Ever Bilena Blush On',           price:149.00, stock:75,  category:'Makeup'    },
  { id:12, name:'BYS Eyeshadow Palette 12pan',    price:299.00, stock:40,  category:'Makeup'    },
  { id:13, name:'Maybelline Sky High Mascara',    price:499.00, stock:45,  category:'Makeup'    },
  { id:14, name:'Eyeliner Pen Black',             price:129.00, stock:90,  category:'Makeup'    },
  { id:15, name:'Loose Setting Powder',           price:249.00, stock:55,  category:'Makeup'    },
  { id:16, name:'BB Cream SPF30 30ml',            price:299.00, stock:50,  category:'Makeup'    },
  // Hair Care
  { id:17, name:'Pantene Shampoo 400ml',          price:249.00, stock:70,  category:'Hair Care' },
  { id:18, name:'TRESemme Conditioner 340ml',     price:279.00, stock:65,  category:'Hair Care' },
  { id:19, name:'Argan Oil Hair Serum 50ml',      price:349.00, stock:40,  category:'Hair Care' },
  { id:20, name:'Hair Mask Treatment 200ml',      price:299.00, stock:35,  category:'Hair Care' },
  { id:21, name:'Dry Shampoo Spray 150ml',        price:379.00, stock:30,  category:'Hair Care' },
  { id:22, name:'Hair Vitamin Sachet',            price:25.00,  stock:200, category:'Hair Care' },
  // Body Care
  { id:23, name:'Vaseline Lotion 400ml',          price:189.00, stock:90,  category:'Body Care' },
  { id:24, name:'Dove Body Wash 400ml',           price:279.00, stock:75,  category:'Body Care' },
  { id:25, name:'St. Ives Scrub 170g',            price:299.00, stock:50,  category:'Body Care' },
  { id:26, name:'Nivea Deodorant Roll-on 50ml',   price:149.00, stock:100, category:'Body Care' },
  { id:27, name:'Bath Salt Soak 500g',            price:249.00, stock:40,  category:'Body Care' },
  // Tools
  { id:28, name:'Makeup Brush Set 12pcs',         price:349.00, stock:25,  category:'Tools'     },
  { id:29, name:'Facial Roller Jade',             price:299.00, stock:20,  category:'Tools'     },
  { id:30, name:'Beauty Blender Sponge',          price:199.00, stock:60,  category:'Tools'     }
];

// ═══════════════════════════════════════════
// INITIALIZE — seeds products if empty
// Called once on app startup
// ═══════════════════════════════════════════
function dbInitialize() {
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(
      KEYS.PRODUCTS,
      JSON.stringify(DEFAULT_PRODUCTS)
    );
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.HISTORY)) {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify([]));
  }
}

// ═══════════════════════════════════════════
// PRODUCTS — CRUD operations
// ═══════════════════════════════════════════

// GET all products
function dbGetAllProducts() {
  return JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || [];
}

// GET products by search keyword
function dbSearchProducts(keyword) {
  const all = dbGetAllProducts();
  const kw  = keyword.toLowerCase();
  return all.filter(p => p.name.toLowerCase().includes(kw));
}

// GET products by category
function dbGetByCategory(category) {
  if (category === 'All') return dbGetAllProducts();
  return dbGetAllProducts().filter(p => p.category === category);
}

// ADD a new product
function dbAddProduct(product) {
  const products = dbGetAllProducts();
  // Auto-generate next ID
  const maxId = products.length > 0
    ? Math.max(...products.map(p => p.id))
    : 0;
  product.id = maxId + 1;
  products.push(product);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  return product;
}

// UPDATE an existing product
function dbUpdateProduct(updated) {
  const products = dbGetAllProducts().map(p =>
    p.id === updated.id ? updated : p
  );
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

// DELETE a product
function dbDeleteProduct(id) {
  const products = dbGetAllProducts().filter(p => p.id !== id);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

// DEDUCT stock after sale
function dbDeductStock(productId, quantity) {
  const products = dbGetAllProducts().map(p => {
    if (p.id === productId) {
      return { ...p, stock: p.stock - quantity };
    }
    return p;
  });
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

// ═══════════════════════════════════════════
// TRANSACTIONS — save and retrieve
// ═══════════════════════════════════════════

// SAVE a completed transaction
function dbSaveTransaction(items, total, tax, discount) {
  const transactions = dbGetAllTransactions();
  const newId = transactions.length > 0
    ? Math.max(...transactions.map(t => t.id)) + 1
    : 1;

  const transaction = {
    id:        newId,
    total:     total,
    tax:       tax,
    discount:  discount,
    items:     items,
    createdAt: new Date().toISOString()
  };

  transactions.push(transaction);
  localStorage.setItem(
    KEYS.TRANSACTIONS,
    JSON.stringify(transactions)
  );

  // Deduct stock and record sales history
  items.forEach(item => {
    dbDeductStock(item.product.id, item.quantity);
    dbRecordSaleHistory(item.product.id, item.product.name, item.quantity);
  });

  return newId;
}

// GET all transactions
function dbGetAllTransactions() {
  return JSON.parse(
    localStorage.getItem(KEYS.TRANSACTIONS)
  ) || [];
}

// GET today's total sales
function dbGetTodaysSales() {
  const today  = new Date().toDateString();
  const txns   = dbGetAllTransactions();
  const todays = txns.filter(t =>
    new Date(t.createdAt).toDateString() === today
  );
  return todays.reduce((sum, t) => sum + t.total, 0);
}

// ═══════════════════════════════════════════
// SALES HISTORY — used by prediction engine
// ═══════════════════════════════════════════

// RECORD a sale in history
function dbRecordSaleHistory(productId, productName, quantity) {
  const history = dbGetSalesHistory();
  history.push({
    productId:   productId,
    productName: productName,
    quantity:    quantity,
    saleDate:    new Date().toISOString()
  });
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

// GET all sales history
function dbGetSalesHistory() {
  return JSON.parse(
    localStorage.getItem(KEYS.HISTORY)
  ) || [];
}

// GET sales history for last N days
function dbGetRecentHistory(days) {
  const history  = dbGetSalesHistory();
  const cutoff   = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return history.filter(h =>
    new Date(h.saleDate) >= cutoff
  );
}

// CLEAR all data — useful for testing
function dbClearAll() {
  localStorage.removeItem(KEYS.PRODUCTS);
  localStorage.removeItem(KEYS.TRANSACTIONS);
  localStorage.removeItem(KEYS.HISTORY);
  dbInitialize();
}