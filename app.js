// app.js — Core Frontend (GitHub Pages)
// ------------------------------------------------------------
// Defina a URL do seu Apps Script Web App (termina com /exec)
export const API_URL = 'https://script.google.com/macros/s/AKfycby5uc_kNB_oGOO7ydctorkaWfsEljjXFZM3zq8MW6rYPW4mSthLfPoIPrOKGZ6E6rJBmw/exec';

// Util: monta querystring com encode correto
function toQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) usp.append(k, String(params[k]));
  });
  return usp.toString();
}

// JSONP GET — evita CORS em GitHub Pages
export function apiGetJSONP(route, params = {}, { timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const cb = 'cb_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Tempo esgotado na chamada JSONP'));
    }, timeoutMs);

    function cleanup(){
      clearTimeout(timer);
      try { delete window[cb]; } catch {}
      if (script && script.parentNode) script.parentNode.removeChild(script);
    }

    window[cb] = (data) => { cleanup(); resolve(data); };
    const qs = toQuery({ ...params, route, callback: cb, t: Date.now() });
    script.src = `${API_URL}?${qs}`;
    script.onerror = (e) => { cleanup(); reject(new Error('Erro de rede JSONP')); };
    document.head.appendChild(script);
  });
}

// JSON (fetch) — use quando o Web App permitir CORS (opcional)
export async function apiGet(route, params = {}) {
  const qs = toQuery({ ...params, route, t: Date.now() });
  const res = await fetch(`${API_URL}?${qs}`, { method: 'GET' });
  if (!res.ok) throw new Error('Falha HTTP');
  // Algumas rotas retornam objeto direto (home/listas), outras envoltas
  // Em todos os casos, o corpo é JSON válido
  return res.json();
}

export async function apiPost(route, body = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, ...body })
  });
  if (!res.ok) throw new Error('Falha HTTP');
  return res.json();
}

// Helpers específicos do app (usando JSONP por padrão)
export const Api = {
  // Dashboard/Home
  home: () => apiGetJSONP('home'),
  // Listas de veículos disponíveis (e demais listas)
  listasDisponiveis: () => apiGetJSONP('listsAvail'),
  // Registrar saída via GET + JSONP (compatível com o backend atual)
  registrarSaida: (dados) => apiGetJSONP('saidaGet', {
    veiculo: dados.veiculo,
    motorista: dados.motorista,
    seguranca: dados.seguranca,
    kmSaida: dados.kmSaida,
    destino: dados.destino
  }),
  // Registrar entrada (se precisar na UI)
  registrarEntrada: (dados) => apiGetJSONP('entradaGet', {
    veiculo: dados.veiculo,
    motorista: dados.motorista,
    seguranca: dados.seguranca,
    kmRetorno: dados.kmRetorno
  })
};
