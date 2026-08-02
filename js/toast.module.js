// Toast module - creates a toast container and exposes showToast
const toastContainerId = 'carhub-toast-container';
function ensureToastContainer() {
  let c = document.getElementById(toastContainerId);
  if (!c) {
    c = document.createElement('div');
    c.id = toastContainerId;
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

export function showToast(message, type = 'info', timeout = 3000) {
  const container = ensureToastContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="dot"></div><div class="toast-content">${message}</div>`;
  container.appendChild(el);
  setTimeout(() => el.classList.add('hide'), timeout - 200);
  setTimeout(() => el.remove(), timeout);
}

// expose globally for non-module scripts
window.showToast = showToast;

export default { showToast };
