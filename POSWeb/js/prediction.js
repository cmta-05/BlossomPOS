// ═══════════════════════════════════════════
// prediction.js — Prediction Service
// Simple Moving Average trend analysis
// Reads last 30 days of sales history
// Same algorithm as PredictionService.cs
// ═══════════════════════════════════════════

// GET predictions for all products
function getPredictions() {
  const products    = dbGetAllProducts();
  const predictions = products.map(p => predictForProduct(p));

  // Sort — needs restock first
  predictions.sort((a, b) =>
    b.needsRestock - a.needsRestock
  );

  return predictions;
}

// PREDICT for one product using moving average
function predictForProduct(product) {
  // Get last 30 days of history for this product
  const history = dbGetRecentHistory(30).filter(
    h => h.productId === product.id
  );

  // Sum total units sold in last 30 days
  const totalSold = history.reduce(
    (sum, h) => sum + h.quantity,
    0
  );

  // Moving average formula:
  // Average daily = total sold ÷ 30 days
  // Predicted weekly = avg daily × 7
  const avgDailySales    = totalSold / 30;
  const predictedWeekly  = Math.round(avgDailySales * 7);

  // If no history yet — use 1 as baseline
  const displayAvg = totalSold > 0
    ? avgDailySales.toFixed(2)
    : '1.00';

  const displayWeekly = totalSold > 0
    ? predictedWeekly
    : 7;

  const needsRestock = product.stock < (totalSold > 0
    ? predictedWeekly
    : 7);

  const suggestedReorder = needsRestock
    ? (totalSold > 0 ? predictedWeekly : 7) - product.stock
    : 0;

  return {
    productId:        product.id,
    productName:      product.name,
    avgDailySales:    displayAvg,
    predictedWeekly:  displayWeekly,
    currentStock:     product.stock,
    needsRestock:     needsRestock,
    suggestedReorder: suggestedReorder
  };
}