# FrotaPro — Pacote de Correção (sem CORS)

Este pacote foi preparado para corrigir o funcionamento do sistema usando **Google Apps Script + GitHub Pages**, evitando problemas de **CORS**.

## Conteúdo do pacote

### `Code.gs`
Backend do Apps Script em modo público, com:

- suporte a **JSONP** nas rotas `GET`
- rotas temporárias de escrita:
  - `saidaGet`
  - `entradaGet`

### `index.html`
Portal principal consumindo a rota `home` via **JSONP**.

### `veiculos.html`
Tela de veículos com:

- leitura via **JSONP** nas rotas `GET`
- gravação usando:
  - `saidaGet`
  - `entradaGet`

---

## Objetivo

Permitir que o sistema funcione corretamente no **GitHub Pages**, sem bloqueios de **CORS** ao acessar o backend do **Apps Script**.

---

## Passo a passo

### 1. Atualizar o Apps Script
Cole o conteúdo do arquivo `Code.gs` no seu projeto do **Google Apps Script**.

Depois:
- clique em **Salvar**

### 2. Fazer nova implantação
No Apps Script:

- vá em **Implantar**
- escolha **Aplicativo da Web**
- clique em **Nova implantação**

Use estas configurações:

- **Executar como:** Você (Fabricio)
- **Quem pode acessar:** Qualquer pessoa

### 3. Atualizar os arquivos do site
Substitua no repositório do **GitHub Pages** os arquivos:

- `index.html`
- `veiculos.html`

### 4. Publicar no GitHub
Após substituir os arquivos:

- faça **commit**
- faça **push**

---

## Testes

### Teste 1 — resposta anônima do backend
Abra no navegador:

```text
SUA_URL/exec?route=home&callback=cb
