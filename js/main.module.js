import { CarHubCart } from './cart.module.js';
import { showToast } from './toast.module.js';
import { openModal, closeModal } from './modal.module.js';

// Wire up cart badge and restore state on load
document.addEventListener('DOMContentLoaded', () => {
  function updateCartUI(items) {
    const badge = document.getElementById('cartBadge');
    const count = document.getElementById('cartBadgeCount');
    const c = (items && items.length) || 0;
    if (badge) badge.style.display = 'inline-flex';
    if (count) count.textContent = String(c);
  }

  const items = CarHubCart.getItems();
  updateCartUI(items);

  window.addEventListener('cartChanged', (e) => updateCartUI(e.detail || CarHubCart.getItems()));

  // Expose a simple API for other scripts
  window.CarHub = window.CarHub || {};
  window.CarHub.showToast = showToast;
  window.CarHub.openModal = openModal;
  window.CarHub.closeModal = closeModal;
});

export default {};
