# Apresentação Koinz Capital para Empresas (HTML/CSS)

Abra `index.html` no navegador (Chrome recomendado). As imagens ficam em `public/assets`, dentro desta pasta.

Conteúdo: segue a apresentação Koinz Capital (13 slides), complementada com elementos da página /companies (visão, globo de cidades, logos das empresas e escolas dos membros, depoimentos).
Design: linguagem da página /companies — Inter fina nos títulos, DM Sans no texto, papel frio + navy, azul #2e7dff, painéis com divisórias finas, constelação, globo girando e tickers de logos.

## Comandos
- `→` / espaço / clique na metade direita: próximo slide
- `←` / clique na metade esquerda: slide anterior
- `F`: tela cheia · `G`: visão geral de todos os slides (clique em um para abrir) · `Esc`: sair da visão geral
- `Home` / `End`: primeiro / último slide
- O número do slide fica na URL (`index.html#7` abre direto no slide 7)

## Exportar em PDF
Chrome → Imprimir (Cmd+P) → Salvar como PDF, com "Gráficos de plano de fundo" ligado e margens "Nenhuma". Sai um slide por página, com as animações no estado final.

## Arquivos
- `index.html`: os 17 slides (cada um é um `<section class="slide">`, com comentário numerado)
- `styles.css`: cores e fontes no topo (`:root`), depois um bloco por slide
- `app.js`: navegação, escala para qualquer tela, globo de cidades, palavras da visão, números subindo
- `assets/ikitech.png`: logo da IKI Tech (recortado da apresentação, já que não estava na pasta)
