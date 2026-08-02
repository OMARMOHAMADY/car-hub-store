// Helper to respond to loginSuccess events
window.addEventListener('loginSuccess', () => {
  try {
    if (window.showToast) window.showToast('Welcome back!', 'success');
  } catch (e) {}
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 550);
});
