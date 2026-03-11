# FrotaPro — Pacote de Correção (sem CORS)

Este pacote contém:

- **Code.gs** (Apps Script): backend em modo público, com **JSONP** nas rotas **GET** e rotas de escrita temporárias `saidaGet` / `entradaGet`.
- **index.html**: Portal consumindo `home` via **JSONP**.
- **veiculos.html**: Tela de veículos com **JSONP** nos GETs e escrita via `saidaGet`/`entradaGet` (JSONP).

## Passo a passo
1. Cole `Code.gs` no Apps Script. **Salvar**.
2. **Implantar → Aplicativo da Web → Nova implantação**
   - **Executar como:** Você (Fabricio)
   - **Quem pode acessar:** Qualquer pessoa
3. Substitua `index.html` e `veiculos.html` no GitHub Pages.
4. Testes:
   - Anônimo: `SUA_URL/exec?route=home&callback=cb` → deve exibir `cb({ ... })`.
   - Portal e Veículos devem carregar sem CORS.
