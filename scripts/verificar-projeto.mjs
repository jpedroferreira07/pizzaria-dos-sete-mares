/**
 * ARQUIVO   : scripts/verificar-projeto.mjs
 * DESCRIÇÃO : Verificações do projeto que as outras ferramentas não cobrem.
 *             É executado pelo CI (npm run verificar:projeto).
 *
 * ERROS (fazem o CI falhar)
 *   - arquivo local referenciado no HTML/CSS que não existe (imagem, script...)
 *   - páginas sem <title>, descrição, canonical ou um único <h1>
 *   - robots.txt, sitemap.xml ou 404.html ausentes
 *   - páginas do site que não estão no sitemap.xml
 *
 * AVISOS (aparecem no CI, mas não bloqueiam)
 *   - marcador SEU-USUARIO ainda no código (endereço provisório)
 *   - número de WhatsApp de exemplo (5500000000000)
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const paginas = ["index.html", "servicos.html", "contato.html"];
const erros = [];
const avisos = [];

const ler = (arquivo) => readFileSync(arquivo, "utf8");
const erro = (mensagem) => erros.push(mensagem);

// ---- 1. Arquivos obrigatórios -------------------------------------------
for (const obrigatorio of ["robots.txt", "sitemap.xml", "404.html"]) {
  if (!existsSync(obrigatorio)) erro(`Arquivo obrigatório ausente: ${obrigatorio}`);
}

// ---- 2. Referências locais (src, href e url() do CSS) -------------------
/**
 * Confere se um caminho citado no código existe no disco.
 * @param {string} origem - arquivo que citou o caminho.
 * @param {string} caminho - valor de src/href/url().
 */
function conferirCaminho(origem, caminho) {
  // Ignora links externos, âncoras (inclusive "%23", que é "#" dentro de SVG embutido),
  // e-mail, telefone e dados embutidos.
  if (/^(https?:|mailto:|tel:|data:|#|%23|\/\/)/.test(caminho)) return;
  const semParametros = caminho.split("#")[0].split("?")[0];
  if (!semParametros) return;
  const destino = join(dirname(origem), semParametros);
  if (!existsSync(destino)) erro(`${origem}: caminho inexistente -> ${caminho}`);
}

for (const arquivo of [...paginas, "404.html", "style.css"].filter(existsSync)) {
  const texto = ler(arquivo);
  for (const m of texto.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) conferirCaminho(arquivo, m[1]);
  for (const m of texto.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) conferirCaminho(arquivo, m[1]);
}

// ---- 3. SEO básico em cada página ---------------------------------------
for (const pagina of paginas) {
  const html = ler(pagina);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) erro(`${pagina}: <title> ausente ou curto demais`);
  if (!/<meta\s+name="description"/.test(html)) erro(`${pagina}: meta description ausente`);
  if (!/rel="canonical"/.test(html)) erro(`${pagina}: link canonical ausente`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) erro(`${pagina}: deve ter exatamente 1 <h1> (encontrado: ${h1})`);
}

// ---- 4. Sitemap lista todas as páginas ----------------------------------
if (existsSync("sitemap.xml")) {
  const mapa = ler("sitemap.xml");
  for (const pagina of paginas) {
    // A página inicial aparece como a raiz do site (".../pizzaria-dos-sete-mares/").
    const esperado = pagina === "index.html" ? "/pizzaria-dos-sete-mares/</loc>" : pagina;
    if (!mapa.includes(esperado)) erro(`sitemap.xml não lista ${pagina}`);
  }
}

// ---- 5. Avisos (não bloqueiam) ------------------------------------------
for (const arquivo of [...paginas, "404.html", "sitemap.xml", "robots.txt"].filter(existsSync)) {
  const texto = ler(arquivo);
  if (texto.includes("SEU-USUARIO")) avisos.push(`${arquivo}: endereço provisório (rode: npm run url -- seu-usuario)`);
  if (texto.includes("5500000000000")) avisos.push(`${arquivo}: número de WhatsApp de exemplo (5500000000000)`);
}

// ---- 6. Preços da home iguais aos do cardápio ----------------------------
// Os cards "mais pedidas" da home repetem preços do cardápio (servicos.html).
// Se alguém mudar um e esquecer o outro, o CI avisa.
{
  const cardapio = ler("servicos.html");
  const precosDoCardapio = new Map();
  for (const card of cardapio.match(/<article class="cartao pizza"[\s\S]*?<\/article>/g) || []) {
    const nome = /<h3>(.*?)<\/h3>/.exec(card)?.[1];
    const valores = /data-precos="([^"]+)"/.exec(card)?.[1].split(",").map(Number);
    if (nome && valores) precosDoCardapio.set(nome, valores);
  }
  const formatar = (n) => "R$ " + n.toFixed(2).replace(".", ",");
  for (const card of ler("index.html").match(/<article class="destaque[\s\S]*?<\/article>/g) || []) {
    const nome = /<h3>(.*?)<\/h3>/.exec(card)?.[1];
    const esperados = precosDoCardapio.get(nome);
    if (!esperados) { erro(`index.html: "${nome}" não existe no cardápio`); continue; }
    const mostrados = [...card.matchAll(/<strong>(R\$ [\d,]+)<\/strong>/g)].map((m) => m[1]);
    if (mostrados.join("|") !== esperados.map(formatar).join("|")) {
      erro(`index.html: preços de "${nome}" diferentes do cardápio (${mostrados.join(", ")})`);
    }
  }
}

// ---- Resultado ----------------------------------------------------------
for (const a of avisos) console.log(`::warning::${a}`);
for (const e of erros) console.log(`::error::${e}`);
if (erros.length) {
  console.error(`\n${erros.length} erro(s) encontrado(s).`);
  process.exit(1);
}
console.log(`Projeto OK (${avisos.length} aviso(s)).`);
