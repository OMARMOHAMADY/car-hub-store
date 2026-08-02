// Lightweight modal for car details and booking
export function createModal() {
  let modal = document.getElementById('carhub-modal-root');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'carhub-modal-root';
  modal.className = 'carhub-modal';
  modal.innerHTML = `
    <div class="carhub-modal-backdrop"></div>
    <div class="carhub-modal-panel" role="dialog" aria-modal="true">
      <button class="carhub-modal-close" aria-label="Close">×</button>
      <div class="carhub-modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.carhub-modal-close').addEventListener('click', () => closeModal());
  modal.querySelector('.carhub-modal-backdrop').addEventListener('click', () => closeModal());
  return modal;
}

export function openModal(html) {
  const modal = createModal();
  modal.querySelector('.carhub-modal-body').innerHTML = html;
  modal.classList.add('open');
}

export function closeModal() {
  const modal = document.getElementById('carhub-modal-root');
  if (!modal) return;
  modal.classList.remove('open');
}

// basic styles injected for modal (if not present in CSS)
if (!document.getElementById('carhub-modal-styles')) {
  const s = document.createElement('style');
  s.id = 'carhub-modal-styles';
  s.textContent = `
    .carhub-modal { position:fixed; inset:0; display:none; }
    .carhub-modal.open { display:block; }
    .carhub-modal-backdrop { position:absolute; inset:0; background:rgba(2,6,23,0.6); }
    .carhub-modal-panel { position:relative; max-width:900px; margin:6vh auto; background:var(--surface); border-radius:14px; padding:18px; box-shadow:var(--shadow); z-index:3000; }
    .carhub-modal-close { position:absolute; right:12px; top:12px; border:0; background:transparent; font-size:22px; cursor:pointer; }
  `;
  document.head.appendChild(s);
}
