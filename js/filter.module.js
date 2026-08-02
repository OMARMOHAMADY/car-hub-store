// Small helper module for debounced input and filter utilities
export function debounce(fn, delay = 300) {
  let t;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), delay); };
}

export function serializeFilters(formEl) {
  const data = {};
  if (!formEl) return data;
  const inputs = formEl.querySelectorAll('select,input');
  inputs.forEach(i => { if (i.name && i.value) data[i.name] = i.value; });
  return data;
}

export default { debounce, serializeFilters };
