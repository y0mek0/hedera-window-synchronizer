const params = new URLSearchParams(location.search);
const title = params.get('label') || 'Custom window';
document.title = title;
document.getElementById('window-title').textContent = title;
document.getElementById('window-role').textContent = (params.get('role') || 'custom').toUpperCase();
const events = document.getElementById('child-events');
window.hws.onEvent((event) => {
  const row = document.createElement('div');
  row.className = 'activity-row';
  row.innerHTML = `<strong>${String(event.type || '').replace(/[&<>]/g, '')}</strong><span>${String(event.stage || event.scenario || event.error || event.record?.sequence || '').replace(/[&<>]/g, '')}</span>`;
  events.prepend(row);
  document.getElementById('child-status').textContent = `${event.type} · ${event.at || ''}`;
  while (events.children.length > 24) events.lastElementChild.remove();
});
