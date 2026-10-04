import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transform } from "esbuild";

async function importTypeScript(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { code } = await transform(source, { loader: "ts", format: "esm" });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
}

const patterns = ["straight", "curve", "waves", "zigzag", "fork", "color-order", "precision", "branched"];
const geometryModule = await importTypeScript("../client/src/game/sandTracks.ts");
const geometries = patterns.map((pattern, index) => geometryModule.buildSandTrackGeometry(pattern, index === 0 ? 5 : 8));

assert.equal(new Set(geometries.map(({ route }) => JSON.stringify(route))).size, 8, "As oito variações precisam ter rotas geometricamente distintas");
for (const [index, geometry] of geometries.entries()) {
  assert.equal(geometry.route.length, index === 0 ? 5 : 8, `A variação ${index + 1} precisa respeitar a quantidade de marcas configurada`);
  assert.ok(geometry.route.every(({ x, y }) => x >= 0 && x <= 900 && y >= 0 && y <= 330), "Todos os checkpoints devem permanecer dentro da área interativa");
  assert.equal(geometry.checkpointColors.length, geometry.route.length, "Cada checkpoint precisa possuir uma cor");
}
assert.equal(geometries[4].decoyRoutes.length, 1, "A quinta variação deve mostrar um caminho alternativo");
assert.equal(geometries[7].decoyRoutes.length, 2, "O desafio final deve mostrar dois desvios");
assert.ok(geometries[6].hitRadius < geometries[0].hitRadius, "A tolerância deve diminuir gradualmente no desafio de precisão");
assert.ok(new Set(geometries[5].checkpointColors).size >= 3, "A variação por cores deve apresentar as três cores da sequência");
assert.deepEqual(geometryModule.buildSandTrackGeometry("straight", 1).route.length, 2, "Alvos inválidos devem ser limitados a pelo menos dois pontos");

const contentModule = await importTypeScript("../client/src/game/content.ts");
const questions = contentModule.getQuestionBank(0, 2);
assert.equal(questions.length, 8, "A Fase 3 deve continuar expondo oito perguntas ao painel de desenvolvedor");
assert.ok(questions.every((question) => question.kind === "sand-tracks" && question.activity === "pegadas-areia"), "As oito versões devem continuar ligadas à atividade jogável e ao catálogo do painel");
assert.deepEqual(questions.map((question) => question.sandPattern), patterns, "O banco deve conectar uma configuração diferente a cada variação");
assert.ok(questions.every((question) => question.prompt && question.hint), "Cada variação deve explicar sua regra e oferecer uma dica");
const finalChallenge = contentModule.getQuestionBank(0, 7).find((question) => question.id === "desafio-final-garat-03-pegadas");
assert.equal(finalChallenge?.sandPattern, "branched", "O desafio final da jornada deve reaproveitar a rota com ramificações");

console.log("OK: oito rotas distintas, progressão de precisão, desvios, cores e integração com o painel de desenvolvedor validados.");
