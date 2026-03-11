// Utilidades de chamada à API (com CORS + appToken via query)
function api(route, params = {}) {
  const u = new URL(API_BASE);
  u.searchParams.set('route', String(route || '').toLowerCase());
  u.searchParams.set('appToken', API_TOKEN);
  for (const [k,v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

async function getJson(route, params = {}) {
  const url = api(route, params);
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`GET ${route} falhou: ${res.status}`);
  return await res.json();
}

async function postJson(route, data = {}) {
  const url = api(route);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`POST ${route} falhou: ${res.status}`);
  return await res.json();
}

function byId(id){ return document.getElementById(id); }
function setBadgeOnline(isOnline){
  const el = byId('statusBadge');
  if(!el) return;
  el.textContent = isOnline ? 'ONLINE' : 'OFFLINE';
  el.className = isOnline ? 'badge online' : 'badge offline';
}
