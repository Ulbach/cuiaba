
import React, { useState, useEffect } from 'react';
import { AppView, Trip, ReferenceData } from './types';
import { sheetsService } from './services/sheetsService';
import TripForm from './components/TripForm';
import ActiveTrips from './components/ActiveTrips';
import History from './components/History';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refs, setRefs] = useState<ReferenceData>({ veiculos: [], motoristas: [], segurancas: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [tripsData, refData] = await Promise.all([
        sheetsService.getTrips(),
        sheetsService.getReferenceData()
      ]);
      setTrips(tripsData);
      setRefs(refData);
    } catch (err) {
      console.error("Erro ao carregar dados da planilha:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTrip = async (data: any) => {
    setIsActionLoading(true);
    try {
      await sheetsService.saveTrip(data);
      await fetchData();
      setCurrentView(AppView.DASHBOARD);
    } catch (err) {
      alert("Erro ao salvar saída na planilha.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFinishTrip = async (id: string, kmRetorno: number, updatedData?: Partial<Trip>) => {
    setIsActionLoading(true);
    try {
      // O serviço recebe o KM e dados extras se houver edição manual
      await sheetsService.finishTrip(id, kmRetorno, updatedData);
      await fetchData();
      setCurrentView(AppView.DASHBOARD);
    } catch (err) {
      alert("Erro ao finalizar viagem na planilha.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Conectando Planilha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-[#334155] max-w-md mx-auto shadow-2xl overflow-x-hidden">
      {/* Dashboard View */}
      {currentView === AppView.DASHBOARD && (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
          <div className="relative h-72 w-full shrink-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000")' }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            <div className="relative z-10 flex justify-between p-6">
              <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">ONLINE</span>
              </div>
              <div className="flex space-x-3">
                <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 text-white active:scale-90 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full -mt-10">
              <h1 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-xl uppercase">FROTA PRO</h1>
              <div className="mt-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-1 rounded-full border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">{refs.veiculos.length} VEÍCULOS NO SISTEMA</span>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#F8F9FB] rounded-t-[40px]"></div>
          </div>

          <div className="flex-1 px-6 pb-24 space-y-8 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setCurrentView(AppView.CHECK_OUT)}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4 hover:shadow-md transition-all group active:scale-95"
              >
                <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 group-hover:rotate-6 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Registrar Saída</span>
              </button>

              <button 
                onClick={() => setCurrentView(AppView.ACTIVE_TRIPS)}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4 hover:shadow-md transition-all group active:scale-95"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 group-hover:-rotate-6 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Registrar Entrada</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Movimentação Recente</h3>
                </div>
                <button onClick={() => fetchData()} className="text-gray-300 hover:text-blue-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>

              <div className="space-y-3">
                {trips.length > 0 ? trips.slice(-5).reverse().map(trip => (
                  <div key={trip.id} className="bg-white p-4 rounded-[28px] shadow-sm border border-gray-100 flex items-center justify-between animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${trip.status === 'Em Viagem' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-700 uppercase tracking-tight">{trip.veiculo}</div>
                        <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{trip.motorista}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${trip.status === 'Em Viagem' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {trip.status === 'Em Viagem' ? 'Em Viagem' : 'Disponível'}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-white rounded-[32px] border border-dashed border-gray-200">
                    <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest">Aguardando registros...</p>
                  </div>
                )}
              </div>
            </div>

            <footer className="pt-6 pb-2 text-center">
               <span className="text-[10px] font-black text-gray-200 uppercase tracking-[0.4em]">BY ULBACH</span>
            </footer>
          </div>
        </div>
      )}

      {/* Internal Views */}
      {currentView !== AppView.DASHBOARD && (
        <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center space-x-4">
              <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                {currentView === AppView.CHECK_OUT ? 'Novo Registro' : 
                 currentView === AppView.ACTIVE_TRIPS ? 'Veículos Ativos' : 'Histórico'}
              </h2>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            {currentView === AppView.CHECK_OUT && (
              <TripForm refs={refs} trips={trips} onSubmit={handleCreateTrip} isLoading={isActionLoading} />
            )}
            {currentView === AppView.ACTIVE_TRIPS && (
              <ActiveTrips trips={trips} refs={refs} onFinish={handleFinishTrip} isLoading={isActionLoading} />
            )}
            {currentView === AppView.HISTORY && (
              <History trips={trips} />
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {currentView === AppView.DASHBOARD && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
           <button 
             onClick={() => setCurrentView(AppView.HISTORY)}
             className="bg-white/90 backdrop-blur-xl border border-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-all active:scale-95"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span className="text-[10px] font-black uppercase tracking-widest">Histórico</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;
