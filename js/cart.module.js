// Simple cart module using localStorage
const CART_KEY = 'carhub_cart_v1';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}

function saveCart(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }

export const CarHubCart = {
  getItems() { return loadCart(); },
  getCount() { return loadCart().reduce((s) => s + 1, 0); },
  addItem(itemId) {
    return new Promise((resolve) => {
      const items = loadCart();
      if (!items.includes(itemId)) items.push(itemId);
      saveCart(items);
      window.dispatchEvent(new CustomEvent('cartChanged', { detail: items }));
      if (window.showToast) window.showToast('Added to cart', 'success');
      resolve(items);
    });
  },
  removeItem(itemId) {
    const items = loadCart().filter(i => i !== itemId);
    saveCart(items);
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: items }));
    if (window.showToast) window.showToast('Removed from cart', 'info');
    return items;
  },
  clear() { saveCart([]); window.dispatchEvent(new CustomEvent('cartChanged', { detail: [] })); }
};

// expose to non-module scripts
window.CarHubCart = CarHubCart;

export default CarHubCart;
