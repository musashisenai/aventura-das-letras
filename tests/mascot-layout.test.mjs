import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../client/src/components/GameUI.tsx", import.meta.url), "utf8");
const mascotBlock = source.match(/function Mascot[\s\S]*?\n}\n/);

assert.ok(mascotBlock, "O componente Mascot deve existir");
assert.doesNotMatch(
  mascotBlock[0],
  /<img\b[^>]*className=["']mascot-image["']/,
  "O mascote não deve renderizar a camada PNG sobreposta"
);
assert.match(mascotBlock[0], /fox-ear fox-ear-left/, "A ilustração CSS do mascote deve continuar presente");
assert.match(mascotBlock[0], /fox-head/, "A cabeça do mascote deve continuar presente");

const brandBlock = source.match(/function BrandMark[\s\S]*?\n}\n/);

assert.ok(brandBlock, "O componente BrandMark deve existir");
assert.doesNotMatch(
  brandBlock[0],
  /<img\b[^>]*className=["']brand-mark-image["']/,
  "O logotipo não deve renderizar a camada PNG sobreposta"
);
assert.match(brandBlock[0], /className=["']brand-emblem["']/, "A marca CSS deve continuar presente");

console.log("OK: teste do layout do mascote e do logotipo aprovado; nenhuma camada PNG é renderizada nesses componentes.");
