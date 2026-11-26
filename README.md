# Pizzaria dos Sete Mares

Site de uma pizzaria temática de piratas, feito com **HTML, CSS e JavaScript puros** (sem frameworks). Nasceu como trabalho da AP1 de Desenvolvimento Web e foi evoluído depois com animações autorais, cardápio interativo, acessibilidade e um pipeline de qualidade.

## Publicação
- Link do site publicado: https://jpedroferreira07.github.io/pizzaria-dos-sete-mares/

## O que tem no site

**Início**
- Hero animado: galeão balançando em mar revolto, com chuva e raios (SVG + CSS)
- História da casa, diferenciais, pizzas mais pedidas e passo a passo "rota do tesouro"
- Seção "O salão": panorama da taverna com lampiões que piscam
- Depoimentos e chamada final

**Cardápio & Serviços**
- 12 sabores com **filtro por categoria** e **seletor de tamanho** (P/M/G) que atualiza os preços
- Botão "Pedir" que abre o WhatsApp já com o sabor e o tamanho escolhidos
- Área de entrega, pacotes de festa e perguntas frequentes

**Contato**
- Formulário com máscara de telefone e validação por campo
- Ao enviar, a folha **dobra, vira um pergaminho, entra numa garrafa e a rolha veda**; a água sobe, a garrafa boia, **mergulha entre bolhas e raios de luz até o fundo de areia do mar** e vira o ícone de sucesso (cerca de 5 s)
- Selo **"Aberto agora / Fechado"** calculado pelo horário do visitante

**Em todas as páginas**
- **Transição entre páginas:** o navio segue a ordem do menu (Início → Cardápio → Contato navega da esquerda para a direita; voltar inverte), para no meio da tela e sai pelo outro lado já na página nova
- Barra de rolagem com um barquinho, onda de água ao clicar e **bússola** que balança quando aparece (para indicar que volta ao topo)
- Menu hambúrguer acessível, link "pular para o conteúdo" e botão **"Pausar animações"** no rodapé
- Página 404 temática

## Tecnologias

- HTML5 semântico 
- CSS3 (variáveis, grid, flexbox, animações) 
- JavaScript puro (Web Animations API, IntersectionObserver) 
- SVG inline 
- Google Fonts (Cinzel Decorative, Cinzel, Alegreya e Nunito).

## Como rodar

Para ver o site só é preciso um navegador e um servidor estático:

```bash
npm install
npm run servir
```

Depois acesse http://localhost:8080. (Sem Node, `python -m http.server 8080` também funciona.)

## Qualidade (CI)

Tudo roda localmente e no GitHub Actions (`.github/workflows/ci.yml`, a cada push e pull request). O pipeline **falha** se algo estiver errado.

```bash
npm run verificar            # HTML + CSS + JS + verificações do projeto + acessibilidade
npm run lint:html            # html-validate
npm run lint:css             # stylelint
npm run lint:js              # eslint (inclui a regra no-var)
npm run verificar:projeto    # links/arquivos locais, SEO básico, sitemap
npm run teste:a11y           # pa11y + axe (WCAG 2 AA)
npm run teste:lighthouse     # Lighthouse: acessibilidade, SEO e boas práticas >= 90
```

## Segurança

- **CSP** via `<meta>`: scripts só do próprio site, imagens do próprio site, CSS e fontes apenas do Google Fonts, sem plugins e sem troca de `<base>`. Por isso não há scripts inline (o `entrada.js` roda no `<head>`).
- Sem bibliotecas de terceiros além das fontes: os ícones são SVG inline.
- Dados do visitante entram na página sempre com `textContent` (nunca `innerHTML`) e o valor lido do `sessionStorage` é validado antes de usar.
- Links externos usam `rel="noopener noreferrer"`; `Referrer-Policy` limita o que sai do site.
- O envio do formulário é **simulado**: nada sai do navegador. Para receber mensagens de verdade é preciso ligar um serviço (Formspree, Netlify Forms) e tratar proteção contra spam.

## Acessibilidade

Verificada com pa11y/axe e Lighthouse (nota 100). Inclui contraste mínimo de 4,5:1, anel de foco visível em fundo claro e escuro, navegação completa por teclado, rótulos únicos nos botões "Pedir", aviso "abre em nova aba", resumo `aria-live` dos erros do formulário e respeito a `prefers-reduced-motion` e ao botão "Pausar animações".

## Estrutura

```
├── index.html, servicos.html, contato.html, 404.html
├── style.css          # variáveis → base → componentes → páginas → responsivo → animações
├── script.js          # menu, cardápio, formulário (garrafa), horário, transição, bússola
├── entrada.js         # roda no <head>: chegada da transição e preferência de animações
├── robots.txt, sitemap.xml
├── imagens/           # fotos (WebP) e ilustrações SVG
├── scripts/           # definir-url.mjs e verificar-projeto.mjs
└── .github/           # workflows (ci.yml, pages.yml) e dependabot.yml
```

## Observações

- A página 404 usa caminhos relativos; em endereços muito aninhados o CSS pode não carregar (limitação do GitHub Pages).
- Os dados estruturados (JSON-LD) não incluem endereço nem telefone justamente por serem fictícios. Se preferir que os buscadores não indexem o site, troque a política em `robots.txt` e adicione `<meta name="robots" content="noindex">`.

## Créditos

Desenvolvido por João Pedro Ferreira, com apoio do Claude no código e na revisão.
