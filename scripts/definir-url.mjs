/**
 * ARQUIVO   : scripts/definir-url.mjs
 * DESCRIÇÃO : Troca o usuário do GitHub Pages em TODOS os arquivos do site
 *             (canonical, og:url, og:image, sitemap, robots, dados
 *             estruturados e README) com um único comando.
 *
 * USO       : npm run url -- meu-usuario
 *             (ou: node scripts/definir-url.mjs meu-usuario)
 *
 * Funciona tanto com o marcador SEU-USUARIO quanto com um usuário que já
 * tenha sido definido antes, então pode ser rodado de novo sem problemas.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const usuario = process.argv[2];

// O usuário do GitHub só pode ter letras, números e hífen (sem hífen nas pontas).
if (!usuario || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(usuario)) {
  console.error("Uso: npm run url -- <usuario-do-github>");
  console.error("O usuário deve ter só letras, números e hífen.");
  process.exit(1);
}

const REPOSITORIO = "pizzaria-dos-sete-mares";
const arquivos = [
  "index.html", "servicos.html", "contato.html", "404.html",
  "sitemap.xml", "robots.txt", "README.md",
];

// Casa "https://QUALQUER-COISA.github.io/pizzaria-dos-sete-mares".
const padrao = new RegExp(`https://[A-Za-z0-9-]+\\.github\\.io/${REPOSITORIO}`, "g");
const novaBase = `https://${usuario.toLowerCase()}.github.io/${REPOSITORIO}`;

let alterados = 0;
for (const arquivo of arquivos) {
  if (!existsSync(arquivo)) continue;
  const antes = readFileSync(arquivo, "utf8");
  const depois = antes.replace(padrao, novaBase).replaceAll("SEU-USUARIO", usuario.toLowerCase());
  if (depois !== antes) {
    writeFileSync(arquivo, depois);
    alterados++;
    console.log(`atualizado: ${arquivo}`);
  }
}
console.log(`\nPronto: ${alterados} arquivo(s) atualizado(s). Endereço base: ${novaBase}/`);
