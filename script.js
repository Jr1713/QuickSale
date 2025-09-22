// DOM Elements
const addProductBtn = document.getElementById('add-product');
const addToCartBtn = document.getElementById('add-to-cart');
const inventoryBody = document.querySelector('#inventory tbody');
const cartBody = document.querySelector('#cart tbody');
const subtotalAmount = document.getElementById('subtotal-amount');
const totalAmount = document.getElementById('total-amount');
const changeAmount = document.getElementById('change-amount');
const discountInput = document.getElementById('discount');
const taxInput = document.getElementById('tax');
const paidInput = document.getElementById('paid');
const checkoutBtn = document.getElementById('checkout');
const salesHistoryList = document.getElementById('sales-history');
const clearHistoryBtn = document.getElementById('clear-history');

let inventory = [];
let cart = [];

// Load sales history from localStorage
let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
updateSalesHistory();

// Add product to inventory
addProductBtn.addEventListener('click', () => {
  const name = document.getElementById('product-name').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const stock = parseInt(document.getElementById('product-stock').value);

  if(name && price > 0 && stock > 0) {
    const existing = inventory.find(item => item.name === name);
    if(existing) {
      existing.stock += stock;
    } else {
      inventory.push({ name, price, stock });
    }
    updateInventoryTable();
    clearProductForm();
  } else {
    alert('Enter valid product details.');
  }
});

// Add product to cart
addToCartBtn.addEventListener('click', () => {
  const name = document.getElementById('cart-product-name').value;
  const quantity = parseInt(document.getElementById('cart-product-quantity').value);

  const product = inventory.find(item => item.name === name);
  if(!product) return alert('Product not in inventory');
  if(quantity > product.stock) return alert('Not enough stock');

  const cartItem = cart.find(item => item.name === name);
  if(cartItem) {
    cartItem.quantity += quantity;
    cartItem.total = cartItem.quantity * cartItem.price;
  } else {
    cart.push({ name, price: product.price, quantity, total: product.price * quantity });
  }
  updateCart();
  clearCartForm();
});

// Update inventory table
function updateInventoryTable() {
  inventoryBody.innerHTML = '';
  inventory.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item.name}</td><td>$${item.price.toFixed(2)}</td><td>${item.stock}</td>`;
    inventoryBody.appendChild(row);
  });
}

// Update cart table and totals
function updateCart() {
  cartBody.innerHTML = '';
  let subtotal = 0;
  cart.forEach((item, index) => {
    subtotal += item.total;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>$${item.total.toFixed(2)}</td>
      <td><button class="remove-btn" onclick="removeCartItem(${index})">Remove</button></td>
    `;
    cartBody.appendChild(row);
  });
  subtotalAmount.textContent = subtotal.toFixed(2);
  calculateTotal();
}

// Remove item from cart
function removeCartItem(index) {
  cart.splice(index, 1);
  updateCart();
}

// Calculate total and change
function calculateTotal() {
  const subtotal = parseFloat(subtotalAmount.textContent);
  const discount = parseFloat(discountInput.value) || 0;
  const tax = parseFloat(taxInput.value) || 0;

  let total = subtotal - discount + (subtotal - discount) * (tax / 100);
  totalAmount.textContent = total.toFixed(2);

  const paid = parseFloat(paidInput.value) || 0;
  changeAmount.textContent = (paid - total >= 0 ? (paid - total).toFixed(2) : '0.00');
}

discountInput.addEventListener('input', calculateTotal);
taxInput.addEventListener('input', calculateTotal);
paidInput.addEventListener('input', calculateTotal);

// Checkout
checkoutBtn.addEventListener('click', () => {
  if(cart.length === 0) return alert('Cart is empty!');

  const subtotal = parseFloat(subtotalAmount.textContent);
  const discount = parseFloat(discountInput.value) || 0;
  const tax = parseFloat(taxInput.value) || 0;
  const paid = parseFloat(paidInput.value) || 0;
  const total = parseFloat(totalAmount.textContent);

  if(paid < total) return alert('Amount paid is less than total!');

  // Reduce stock in inventory
  cart.forEach(item => {
    const invItem = inventory.find(p => p.name === item.name);
    invItem.stock -= item.quantity;
  });
  updateInventoryTable();

  // Save sale to history
  const sale = {
    date: new Date().toLocaleString(),
    items: [...cart],
    subtotal,
    discount,
    tax,
    total,
    paid,
    change: paid - total
  };
  salesHistory.push(sale);
  localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
  updateSalesHistory();

  // Clear cart and inputs
  cart = [];
  updateCart();
  paidInput.value = 0;
  discountInput.value = 0;
  taxInput.value = 0;

  alert('Transaction completed!');
});

// Update sales history list
function updateSalesHistory() {
  salesHistoryList.innerHTML = '';
  salesHistory.forEach((sale, index) => {
    const li = document.createElement('li');
    li.textContent = `${sale.date} - Total: $${sale.total.toFixed(2)}`;
    salesHistoryList.appendChild(li);
  });
}

// Clear sales history
clearHistoryBtn.addEventListener('click', () => {
  if(confirm('Are you sure you want to clear all sales history?')) {
    salesHistory = [];
    localStorage.removeItem('salesHistory');
    updateSalesHistory();
    alert('Sales history cleared!');
  }
});

// Clear input forms
function clearProductForm() {
  document.getElementById('product-name').value = '';
  document.getElementById('product-price').value = '';
  document.getElementById('product-stock').value = '';
}

function clearCartForm() {
  document.getElementById('cart-product-name').value = '';
  document.getElementById('cart-product-quantity').value = '';
}
