// Shared cart module using localStorage
const CART_KEY = 'carhub_cart';
const LEGACY_CART_KEY = 'carhub_cart_v1';

function normalizeCart(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === 'string') return { id: item, quantity: 1 };
      if (item && typeof item === 'object') {
        const id = item.id || item.carId || item._id || item.car || '';
        if (!id) return null;
        return { id, quantity: Number(item.quantity) || 1 };
      }
      return null;
    })
    .filter(Boolean);
}

function migrateLegacyCart() {
  const current = localStorage.getItem(CART_KEY);
  const legacy = localStorage.getItem(LEGACY_CART_KEY);
  if (!current && legacy) {
    localStorage.setItem(CART_KEY, legacy);
  }
}

function loadCart() {
  try {
    migrateLegacyCart();
    return normalizeCart(JSON.parse(localStorage.getItem(CART_KEY) || '[]'));
  } catch {
    return [];
  }
}

function saveCart(items) {
  const normalized = normalizeCart(items);
  localStorage.setItem(CART_KEY, JSON.stringify(normalized));
  return normalized;
}

export const CarHubCart = {
  getItems() { return loadCart(); },
  getCount() { return loadCart().reduce((sum, item) => sum + (Number(item.quantity) || 1), 0); },
  addItem(itemId) {
    return new Promise((resolve) => {
      const items = loadCart();
      const existing = items.find((item) => item.id === itemId);
      if (existing) {
        existing.quantity = Math.min((Number(existing.quantity) || 1) + 1, 10);
      } else {
        items.push({ id: itemId, quantity: 1 });
      }
      const saved = saveCart(items);
      window.dispatchEvent(new CustomEvent('cartChanged', { detail: saved }));
      if (window.showToast) window.showToast('Added to cart', 'success');
      resolve(saved);
    });
  },
  removeItem(itemId) {
    const items = loadCart().filter((item) => item.id !== itemId);
    const saved = saveCart(items);
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: saved }));
    if (window.showToast) window.showToast('Removed from cart', 'info');
    return saved;
  },
  clear() {
    const saved = saveCart([]);
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: saved }));
    return saved;
  }
};

// expose to non-module scripts
window.CarHubCart = CarHubCart;

export default CarHubCart;
