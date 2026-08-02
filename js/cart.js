/**
 * CarHub Cart Module
 * Works in two modes like auth:
 *  1. Backend mode - syncs with Express `/api/users/cart*` when logged in via backend
 *  2. Local mode (fallback) - stores cart in localStorage so it works without a server
 */
const CarHubCart = {
  _items: null,

  /**
   * Get cart items from localStorage
   * Each item: { id: carId, quantity: n }
   */
  getItems() {
    if (this._items) return this._items;
    try {
      this._items = JSON.parse(localStorage.getItem('carhub_cart') || '[]');
    } catch {
      this._items = [];
    }
    return this._items;
  },

  _save(items) {
    this._items = items;
    localStorage.setItem('carhub_cart', JSON.stringify(items));
    this.updateBadge();
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: items }));
  },

  /**
   * Add a car to the cart
   * @param {string} carId
   * @param {Object} opts - { silent }
   */
  async addItem(carId, opts = {}) {
    // Try backend first if logged in via backend
    if (CarHubAuth && CarHubAuth.isLoggedIn() && CarHubAuth._usingBackend) {
      try {
        const resp = await fetch(`/api/users/cart/${carId}`, {
          method: 'POST',
          headers: CarHubAuth._headers()
        });
        const data = await resp.json();
        if (data.success) {
          this.syncFromBackendCart(data.cart);
          return data;
        }
      } catch (err) { /* fall back to local */ }
    }

    // Local fallback
    const items = this.getItems();
    const existing = items.find(i => i.id === carId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + 1, 10);
    } else {
      items.push({ id: carId, quantity: 1 });
    }
    this._save(items);
    return { success: true, cart: items };
  },

  /**
   * Update quantity of a cart item
   */
  async updateQuantity(carId, quantity) {
    const qty = Math.max(1, Math.min(parseInt(quantity, 10) || 1, 10));

    if (CarHubAuth && CarHubAuth.isLoggedIn() && CarHubAuth._usingBackend) {
      try {
        const resp = await fetch(`/api/users/cart/${carId}`, {
          method: 'PATCH',
          headers: CarHubAuth._headers(),
          body: JSON.stringify({ quantity: qty })
        });
        const data = await resp.json();
        if (data.success) {
          this.syncFromBackendCart(data.cart);
          return data;
        }
      } catch (err) { /* fall back to local */ }
    }

    const items = this.getItems();
    const item = items.find(i => i.id === carId);
    if (item) {
      item.quantity = qty;
      this._save(items);
    }
    return { success: true, cart: items };
  },

  /**
   * Remove an item from the cart
   */
  async removeItem(carId) {
    if (CarHubAuth && CarHubAuth.isLoggedIn() && CarHubAuth._usingBackend) {
      try {
        const resp = await fetch(`/api/users/cart/${carId}`, {
          method: 'DELETE',
          headers: CarHubAuth._headers()
        });
        const data = await resp.json();
        if (data.success) {
          this.syncFromBackendCart(data.cart);
          return data;
        }
      } catch (err) { /* fall back to local */ }
    }

    const items = this.getItems().filter(i => i.id !== carId);
    this._save(items);
    return { success: true, cart: items };
  },

  /**
   * Clear the entire cart
   */
  async clearCart() {
    if (CarHubAuth && CarHubAuth.isLoggedIn() && CarHubAuth._usingBackend) {
      try {
        const resp = await fetch('/api/users/cart', {
          method: 'DELETE',
          headers: CarHubAuth._headers()
        });
        const data = await resp.json();
        if (data.success) {
          this._save([]);
          return data;
        }
      } catch (err) { /* fall back to local */ }
    }

    this._save([]);
    return { success: true, cart: [] };
  },

  /**
   * Convert backend cart array (with populated car) to local items
   */
  syncFromBackendCart(backendCart) {
    const items = (backendCart || []).map(item => ({
      id: item.car && item.car._id ? item.car._id : (item.car || item.carId),
      quantity: item.quantity || 1
    }));
    this._save(items);
  },

  /**
   * Get total quantity of items in cart
   */
  getCount() {
    const items = this.getItems();
    return items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  },

  /**
   * Check if a car is in the cart
   */
  inCart(carId) {
    return this.getItems().some(i => i.id === carId);
  },

  /**
   * Get full cart details merged with car data from CarHubData
   */
  async getDetailedCart() {
    const items = this.getItems();
    if (items.length === 0) return [];
    const allCars = await CarHubData.getAllCars();
    return items
      .map(item => {
        const car = allCars.find(c => c.id === item.id) || allCars.find(c => c._id === item.id);
        return car ? { ...car, quantity: item.quantity || 1 } : null;
      })
      .filter(Boolean);
  },

  /**
   * Get cart total price
   */
  async getTotal() {
    const detailed = await this.getDetailedCart();
    return detailed.reduce((sum, c) => sum + (Number(c.price) || 0) * c.quantity, 0);
  },

  /**
   * Update cart badge in header (all pages)
   */
  updateBadge() {
    const count = this.getCount();
    const badge = document.getElementById('cartBadgeCount');
    const cartIcon = document.getElementById('cartBadge');
    if (badge) badge.textContent = count;
    if (cartIcon) cartIcon.style.display = count > 0 ? 'inline-flex' : '';
  },

  /**
   * Init cart badge events + click handler
   */
  init() {
    this.updateBadge();
    const cartBtn = document.getElementById('cartBadge');
    if (cartBtn) {
      cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = 'cart.html';
      });
    }
    window.addEventListener('cartChanged', () => this.updateBadge());
    window.addEventListener('authChanged', () => this.updateBadge());
  }
};
