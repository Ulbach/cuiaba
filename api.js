/**
 * API.JS - Motor de Comunicação Central (Frota Pro)
 * Este arquivo conecta o Frontend (GitHub) ao Backend (Google Apps Script).
 */

(function (global) {
  // CONFIGURAÇÃO DA URL DA API (Sempre use a URL da implementação MAIS RECENTE)
  const API_URL = "https://script.google.com/macros/s/AKfycbyrhIsHgV1sQj2yMaFcb1SOl1FydAC0oay23djmAUnERwVjph6pTi3GQif9JNjf_tRCpw/exec";

  /**
   * Função interna para realizar chamadas JSONP.
   * Resolve problemas de CORS e limpa vestígios após a execução.
   */
  async function call(route, params = {}) {
    return new Promise((resolve, reject) => {
      // Cria um nome de callback único para evitar colisões
      const callbackName = "cb_" + Math.floor(Math.random() * 1000000);
      const script = document.createElement("script");
      
      // Timeout de 20 segundos para evitar que a interface trave se a API falhar
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("O servidor do Google demorou muito a responder (Timeout)."));
      }, 20000);

      function cleanup() {
        clearTimeout(timeout);
        if (script.parentNode) script.parentNode.removeChild(script);
        delete window[callbackName];
      }

      // Função de retorno que o Google Apps Script executará
      window[callbackName] = (data) => {
        cleanup();
        if (data && data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data);
        }
      };

      // Parâmetros da query string
      // _nc = No Cache (força o navegador a buscar dados novos da planilha)
      const queryParams = new URLSearchParams({
        route: route,
        callback: callbackName,
        _nc: Date.now(),
        ...params
      });

      script.src = `${API_URL}?${queryParams.toString()}`;
      script.onerror = () => {
        cleanup();
        reject(new Error("Erro de rede ao conectar com a API do Google."));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Objeto Global Api
   * Métodos prontos para serem usados em qualquer parte do sistema.
   */
  global.Api = {
    // Busca dados para o Dashboard (Total de veículos e últimas 10-15 viagens)
    getHome: () => call("home"),

    // Busca as listas (Veículos, Motoristas, Seguranças) para os selects/comboboxes
    getListas: () => call("listas"),

    // Busca o KM de retorno mais recente de um veículo específico
    getKmAtual: (veiculoNome) => call("kmAtual", { veiculo: veiculoNome }),

    // Registra uma nova saída de veículo
    registrarSaida: (dados) => call("saida", {
      veiculo: dados.veiculo,
      motorista: dados.motorista,
      seguranca: dados.seguranca,
      km: dados.km,
      destino: dados.destino
    }),

    // --- MÓDULO DE VISITANTES ---
    
    // Busca lista de visitantes ativos e histórico
    getVisitantes: () => call("getVisitantesData"),

    // Salva entrada ou atualiza saída de visitante
    salvarVisitante: (dadosObj) => call("salvarVisitante", { 
      data: JSON.stringify(dadosObj) 
    })
  };

  console.log("✅ Api.js carregada com sucesso.");

})(window);
