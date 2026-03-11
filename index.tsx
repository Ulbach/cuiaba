
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- CONFIGURAÇÃO ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwE8F061OhUN5lTom2nZ0W_Vm5LX2wAWhPE4rtd6umbaxcIdmjaAzEtlf-wOHVpgDl-4g/exec';

// --- TYPES ---
type Status = 'Em Viagem' | 'Concluído';

interface Trip {
  id: string;
  veiculo: string;
  motorista: string;
  seguranca: string;
  kmSaida: number;
  destino: string;
  dataSaida: string;
  status: Status;
  kmRetorno?: number;
  kmRodado?: number;
  dataRetorno?: string;
}

interface ReferenceData {
  veiculos: string[];
  motoristas: string[];
  segurancas: string[];
}

// --- SERVIÇOS ---
const sheetsService = {
  async getRefs(): Promise<ReferenceData> {
    try {
      const r = await fetch(`${SCRIPT_URL}?action=getRefs`);
      return await r.json();
    } catch {
      return { veiculos: [], motoristas: [], segurancas: [] };
    }
  },
  async getTrips(): Promise<Trip[]> {
    try {
      const r = await fetch(`${SCRIPT_URL}?action=getTrips`);
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  },
  async saveTrip(data: any) {
    return await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: 'saveTrip', ...data, dataSaida: new Date().toISOString() })
    });
  },
  async finishTrip(id: string, km: number, extras: any) {
    return await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: 'finishTrip', id, kmRetorno: km, ...extras, dataRetorno: new Date().toISOString() })
    });
  }
};

const geminiService = {
  async getTip(driver: string, dest: string) {
    try {
      const apiKey = (window as any).process?.env?.API_KEY || '';
      if (!apiKey) return null;
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Gere uma dica de segurança curta (máximo 12 palavras) para o motorista ${driver} saindo para ${dest}. Use português do Brasil.`
      });
      return res.text;
    } catch { return null; }
  }
};

// --- COMPONENTES ---

const TripForm = ({ refs, trips, onSave }: any) => {
  const [f, setF] = useState({ veiculo: '', motorista: '', kmSaida: '', destino: '', seguranca: '' });
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState<string | null>(null);

  const lastKm = useMemo(() => {
    const vTrips = trips.filter((t: any) => t.veiculo === f.veiculo);
    return Math.max(0, ...vTrips.map((t: any) => t.kmRetorno || t.kmSaida || 0));
  }, [f.veiculo, trips]);

  useEffect(() => {
    if (f.motorista && f.destino) {
      const t = setTimeout(async () => {
        const d = await geminiService.getTip(f.motorista, f.destino);
        setTip(d);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [f.motorista, f.destino]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-rose-600 p-6 rounded-[32px] text-white text-center shadow-lg">
        <h2 className="font-black italic text-xl uppercase italic">Registrar Saída</h2>
        <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-0.5">Check-out Operacional</p>
      </div>
      
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-slate-800 space-y-4 shadow-xl">
        <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Veículo</label>
            <select value={f.veiculo} onChange={e => setF({...f, veiculo: e.target.value})} className="w-full p-4 bg-slate-800 rounded-2xl border-none font-bold text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none appearance-none">
                <option value="">Selecione...</option>
                {refs.veiculos.map((v:string) => <option key={v} value={v}>{v}</option>)}
            </select>
        </div>
        
        <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Motorista</label>
            <select value={f.motorista} onChange={e => setF({...f, motorista: e.target.value})} className="w-full p-4 bg-slate-800 rounded-2xl border-none font-bold text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none appearance-none">
                <option value="">Selecione...</option>
                {refs.motoristas.map((m:string) => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">KM Saída</label>
                <input type="number" value={f.kmSaida} onChange={e => setF({...f, kmSaida: e.target.value})} className="w-full p-4 bg-slate-800 rounded-2xl border-none font-bold text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none" />
            </div>
            <div className="space-y-1 text-right">
                <label className="text-[9px] font-black text-rose-400/50 uppercase tracking-widest mr-1">Anterior</label>
                <div className="w-full p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 font-black text-sm text-rose-400 text-center">{lastKm}</div>
            </div>
        </div>

        <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Destino</label>
            <input type="text" value={f.destino} onChange={e => setF({...f, destino: e.target.value})} className="w-full p-4 bg-slate-800 rounded-2xl border-none font-bold text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none" placeholder="Ex: Unidade Industrial" />
        </div>

        <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Segurança</label>
            <select value={f.seguranca} onChange={e => setF({...f, seguranca: e.target.value})} className="w-full p-4 bg-slate-800 rounded-2xl border-none font-bold text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none appearance-none">
                <option value="">Selecione...</option>
                {refs.segurancas.map((s:string) => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        {tip && <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-[10px] font-bold text-amber-400/80 italic">💡 {tip}</div>}

        <button 
          disabled={loading || !f.veiculo || !f.kmSaida}
          onClick={async () => {
            setLoading(true);
            await onSave(f);
            setLoading(false);
          }}
          className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-30 mt-2"
        >
          {loading ? "Salvando..." : "Confirmar Saída"}
        </button>
      </div>
    </div>
  );
};

const ActiveTrips = ({ trips, onFinish }: any) => {
  const active = trips.filter((t: any) => t.status === 'Em Viagem');
  const [selected, setSelected] = useState<string|null>(null);
  const [km, setKm] = useState('');
  const [loading, setLoading] = useState(false);

  if(active.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 opacity-30 italic">
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Pátio Limpo</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in">
      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Em Rota ({active.length})</h2>
      {active.map((t: any) => (
        <div key={t.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-[28px] shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-black italic text-lg text-white tracking-tighter uppercase">{t.veiculo}</h3>
            <span className="text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase italic border border-emerald-400/20">Em Rota</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 truncate">{t.motorista} → {t.destino}</p>
          
          {selected === t.id ? (
            <div className="space-y-3 pt-2 animate-in slide-in-from-top-2">
              <input type="number" placeholder="KM de Chegada" value={km} onChange={e => setKm(e.target.value)} className="w-full p-4 bg-slate-800 rounded-xl border-none font-bold text-sm text-white focus:ring-1 focus:ring-emerald-500" />
              <div className="flex space-x-2">
                <button 
                    disabled={loading || !km}
                    onClick={async () => {
                        setLoading(true);
                        await onFinish(t.id, Number(km));
                        setLoading(false);
                    }} 
                    className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest"
                >
                    {loading ? "..." : "Confirmar"}
                </button>
                <button onClick={() => setSelected(null)} className="px-5 py-4 bg-slate-800 text-slate-500 rounded-xl font-black">X</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setSelected(t.id)} className="w-full py-3 border border-emerald-500/30 text-emerald-400 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-emerald-500/5 transition-all">Registrar Entrada</button>
          )}
        </div>
      ))}
    </div>
  );
};

// --- APP PRINCIPAL ---

const App = () => {
  const [view, setView] = useState('DASH');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refs, setRefs] = useState<ReferenceData>({ veiculos: [], motoristas: [], segurancas: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [t, r] = await Promise.all([sheetsService.getTrips(), sheetsService.getRefs()]);
      setTrips(t); 
      setRefs(r);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
      const init = async () => {
          setLoading(true);
          await load();
          setLoading(false);
      };
      init();
  }, []);

  const refreshAfterAction = async () => {
      // Pequeno delay para dar tempo do GAS processar antes do GET
      setTimeout(async () => {
          await load();
      }, 800);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-600 uppercase tracking-[0.4em] text-[9px] italic">Frota Pro II</p>
    </div>
  );

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#020617] flex flex-col shadow-2xl relative overflow-x-hidden">
      {view === 'DASH' ? (
        <div className="flex-1 flex flex-col animate-in fade-in duration-500 overflow-y-auto hide-scrollbar">
          
          <div className="relative h-64 w-full shrink-0">
            <img 
                src="https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?q=80&w=1000&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-30"
                alt="Fleet header"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center pt-8">
                <div className="bg-rose-500/10 backdrop-blur-md px-3 py-1 rounded-full border border-rose-500/20 mb-3">
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Painel Operacional</span>
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter text-white leading-none">FROTA<br/><span className="text-rose-500 drop-shadow-lg">PRO II</span></h1>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-5 italic">Gestão Integrada</p>
            </div>
          </div>

          <div className="px-8 pb-32 space-y-5 -mt-6 relative z-20">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setView('OUT')} className="aspect-square glass rounded-[40px] flex flex-col items-center justify-center p-5 btn-active transition-all group overflow-hidden relative">
                <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-3 border border-rose-500/10">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saída</span>
              </button>
              
              <button onClick={() => setView('IN')} className="aspect-square glass rounded-[40px] flex flex-col items-center justify-center p-5 btn-active transition-all group overflow-hidden relative">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-3 border border-emerald-500/10">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrada</span>
              </button>
            </div>

            <button onClick={() => setView('HISTORY')} className="w-full p-6 glass rounded-[32px] flex items-center justify-between group btn-active transition-all relative">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Histórico Completo</span>
              </div>
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7" /></svg>
            </button>
            
            <footer className="text-center pt-8 opacity-20"><span className="text-[8px] font-black text-slate-400 uppercase tracking-[1em] italic">ULBACH OPERATIONAL</span></footer>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
          <nav className="p-6 flex items-center space-x-5 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
            <button onClick={() => setView('DASH')} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-200 italic">{view === 'OUT' ? 'Saída' : view === 'IN' ? 'Entrada' : 'Histórico'}</h2>
          </nav>
          
          <div className="flex-1 p-6 overflow-y-auto hide-scrollbar">
            {view === 'OUT' && <TripForm refs={refs} trips={trips} onSave={async (d:any)=>{ 
                await sheetsService.saveTrip(d); 
                await refreshAfterAction();
                setView('DASH'); 
            }} />}
            
            {view === 'IN' && <ActiveTrips trips={trips} onFinish={async (id:string, km:number)=>{ 
                await sheetsService.finishTrip(id, km, {}); 
                await refreshAfterAction();
                setView('DASH'); 
            }} />}
            
            {view === 'HISTORY' && (
              <div className="space-y-3 animate-in fade-in pb-10">
                <div className="flex justify-between items-center mb-5 px-1">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Registros de Movimentação</h3>
                    <button onClick={load} className="text-rose-500 font-black text-[8px] uppercase tracking-widest">Sincronizar</button>
                </div>
                {trips
                    .filter(t => t.status === 'Concluído')
                    .sort((a, b) => new Date(b.dataRetorno || 0).getTime() - new Date(a.dataRetorno || 0).getTime())
                    .map(t => (
                  <div key={t.id} className="bg-slate-900/30 border border-slate-800/50 p-5 rounded-[24px] flex justify-between items-center shadow-md">
                    <div className="space-y-0.5">
                      <p className="font-black italic text-white text-sm uppercase tracking-tighter">{t.veiculo}</p>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t.motorista} • {t.kmRodado}km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-rose-500 uppercase italic leading-none">{new Date(t.dataRetorno!).toLocaleDateString()}</p>
                      <p className="text-[7px] font-bold text-slate-600 uppercase mt-1">{new Date(t.dataRetorno!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
