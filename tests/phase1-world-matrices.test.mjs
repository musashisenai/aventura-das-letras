import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transform } from "esbuild";

async function importTypeScript(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { code } = await transform(source, { loader: "ts", format: "esm" });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
}

const content = await importTypeScript("../client/src/game/content.ts");
const voice = await importTypeScript("../client/src/game/voicepacks.ts");
const syllableMarks = await importTypeScript("../client/src/game/syllableMarks.ts");
const syllabic = content.getQuestionBank(3, 0);
const spelling = content.getQuestionBank(5, 0);
const orthography = content.getQuestionBank(6, 0);
const expectedWords = ["SOL", "PATO", "BOLA", "CASA", "JANELA", "MACACO", "ELEFANTE", "BORBOLETA"];
const expectedOrthographicWords = ["CHUVA", "PEIXE", "CASA", "ZEBRA", "CHUCHU", "MOCHILA", "XÍCARA", "ROSA"];

assert.equal(spelling.length, 8, "A Fase 1 do Mundo Alfabético deve apresentar oito variações");
assert.ok(spelling.every((question) => question.kind === "jet-writer" && question.activity === "maquina-escrever"), "As oito variações alfabéticas devem usar a matriz jogável Máquina de Escrever a Jato");
assert.deepEqual(spelling.map((question) => question.targetWord), expectedWords, "A progressão alfabética deve aumentar gradualmente o tamanho das palavras");
assert.ok(spelling.every((question, index) => question.answer === question.targetWord && question.activityIndex === index && question.writerSeconds >= 40), "Cada desafio de escrita precisa validar a palavra e oferecer tempo adequado");
assert.ok(spelling.every((question) => !`${question.prompt} ${question.displayPrompt}`.toLocaleLowerCase("pt-BR").includes(question.targetWord.toLocaleLowerCase("pt-BR"))), "A palavra-alvo não pode aparecer escrita no enunciado visual da atividade de escrita");
assert.ok(new Set(spelling.map((question) => question.id)).size === 8, "Os IDs da Máquina de Escrever devem ser únicos");

assert.equal(orthography.length, 8, "A Fase 1 do Mundo Ortográfico deve apresentar oito variações");
assert.ok(orthography.every((question) => question.kind === "digraph-filter" && question.activity === "filtro-digrafos"), "As oito variações ortográficas devem usar a matriz de válvulas");
assert.deepEqual(orthography.map((question) => question.targetWord), expectedOrthographicWords, "O filtro precisa cobrir os alvos ortográficos planejados");
assert.ok(orthography.every((question) => question.options.includes(question.answer) && new Set(question.options).size === question.options.length), "Cada palavra precisa ter uma válvula correta e opções sem duplicatas");
assert.ok(orthography.every((question) => question.options.length === 4 && ["CH", "X", "S", "Z"].every((valve) => question.options.includes(valve))), "Cada variação deve manter as quatro válvulas da matriz, CH, X, S e Z");
assert.ok(orthography.every((question) => !`${question.prompt} ${question.displayPrompt}`.toLocaleLowerCase("pt-BR").includes(question.targetWord.toLocaleLowerCase("pt-BR"))), "A palavra completa não pode aparecer no enunciado da atividade ortográfica");
assert.ok(orthography.every((question) => question.orthographicPattern.replace("□", question.answer) === question.targetWord), "Cada válvula correta deve completar exatamente a palavra-alvo");
assert.deepEqual(orthography.map((question) => question.answer), ["CH", "X", "S", "Z", "CH", "CH", "X", "S"], "As respostas devem variar entre CH, X, S e Z");

assert.equal(syllabic.length, 8, "A Fase 1 do Mundo Silábico deve ter oito variações");
assert.ok(syllabic.every((question) => question.kind === "syllable-hammer" && question.activity === "martelo-pedacos"), "As oito variações silábicas devem abrir o Martelo dos Pedaços");
assert.deepEqual(syllabic.map((question) => question.syllableParts.length), [1, 2, 3, 3, 4, 4, 4, 4], "A progressão do martelo deve contar uma batida por parte falada");
assert.ok(syllabic.every((question, index) => question.activityIndex === index && question.syllableParts.length > 0), "Cada variação silábica deve ter índice e partes correspondentes");
assert.equal(syllableMarks.randomSyllableMark(() => 0), "A", "O sorteio de letra genérica deve ser reproduzível nos testes");
assert.equal(syllableMarks.randomSyllableMark(() => 0.999999), "Z", "O sorteio deve cobrir todo o alfabeto");
assert.match(syllableMarks.randomSyllableMark(() => 0.5), /^[A-Z]$/, "Cada batida deve gerar uma letra maiúscula genérica");

const manifest = JSON.parse(await readFile(new URL("../client/public/assets/voicepacks-manifest.json", import.meta.url), "utf8"));
assert.equal(manifest.voice, "Leda", "O pacote deve identificar a voz Leda");
assert.equal(manifest.language, "pt-BR", "O pacote deve identificar português brasileiro");
const syllabicPack = manifest.packs["world-3-phase-0"];
assert.ok(syllabicPack, "O pacote Leda da Fase 1 Silábica deve estar registrado");
assert.equal(syllabicPack.activity, "martelo-pedacos", "A voz Leda silábica deve apontar para o Martelo dos Pedaços");
assert.equal(syllabicPack.promptSegments.length, 8, "A matriz silábica deve ter oito faixas de enunciado Leda");
assert.equal(syllabicPack.hintSegments.length, 8, "A matriz silábica deve ter oito faixas de dica Leda");
for (const [index, question] of syllabic.entries()) {
  assert.equal(voice.voicePackPath(3, 0, index, "prompt", question.id), `/assets/${syllabicPack.promptSegments[index]}`, `A descoberta silábica ${index + 1} deve resolver seu enunciado Leda`);
  assert.equal(voice.voicePackPath(3, 0, index, "hint", question.id), `/assets/${syllabicPack.hintSegments[index]}`, `A descoberta silábica ${index + 1} deve resolver sua dica Leda`);
}
for (const audioPath of [...syllabicPack.promptSegments, ...syllabicPack.hintSegments]) {
  const audio = await readFile(new URL(`../client/public/assets/${audioPath}`, import.meta.url));
  const mirroredAudio = await readFile(new URL(`../database/sections/audio/${audioPath}`, import.meta.url));
  assert.ok(audio.equals(mirroredAudio), `${audioPath} deve permanecer idêntico entre os assets públicos e o catálogo do banco`);
  assert.equal(audio.subarray(0, 4).toString(), "RIFF", `${audioPath} deve ser WAV válido`);
}
for (const [worldId, activity] of [[5, "maquina-escrever"], [6, "filtro-digrafos"]]) {
  const key = `world-${worldId}-phase-0`;
  const pack = manifest.packs[key];
  assert.ok(pack, `O pacote de voz ${key} deve estar registrado`);
  assert.equal(pack.activity, activity, `O pacote ${key} deve apontar para a atividade correta`);
  assert.equal(pack.segments, 8, `O pacote ${key} deve ter oito segmentos`);
  assert.equal(pack.wordSegments.length, 8, `O pacote ${key} deve ter oito faixas de palavra-alvo`);
  assert.equal(pack.hintSegments.length, 8, `O pacote ${key} deve ter oito faixas de dica`);
  assert.ok(pack.wordPack && pack.hintPack, `O pacote ${key} deve incluir as faixas concatenadas`);
  for (const audioPath of [...pack.wordSegments, ...pack.hintSegments, pack.wordPack, pack.hintPack]) {
    const audio = await readFile(new URL(`../client/public/assets/${audioPath}`, import.meta.url));
    const mirroredAudio = await readFile(new URL(`../database/sections/audio/${audioPath}`, import.meta.url));
    assert.ok(audio.equals(mirroredAudio), `${audioPath} deve ser idêntico entre os assets públicos e o catálogo do banco`);
    assert.equal(audio.subarray(0, 4).toString(), "RIFF", `${audioPath} deve ser WAV válido`);
    assert.equal(audio.subarray(8, 12).toString(), "WAVE", `${audioPath} deve conter cabeçalho WAVE`);
  }
  const bank = worldId === 5 ? spelling : orthography;
  for (const [index, question] of bank.entries()) {
    assert.equal(voice.voicePackPath(worldId, 0, index, "word", question.id), `/assets/${pack.wordSegments[index]}`, `A descoberta ${index + 1} do mundo ${worldId} deve resolver sua própria palavra Leda`);
    assert.equal(voice.voicePackPath(worldId, 0, index, "hint", question.id), `/assets/${pack.hintSegments[index]}`, `A descoberta ${index + 1} do mundo ${worldId} deve resolver sua própria dica Leda`);
    assert.equal(voice.voicePackPath(worldId, 0, index, "prompt", question.id), undefined, "Os mundos Alfabético e Ortográfico não devem narrar o enunciado inteiro");
  }
  assert.equal(voice.feedbackVoicePath(worldId, 0, "success"), "/assets/voicepacks/feedback/success.wav", "O acerto deve usar a faixa Leda compartilhada");
  assert.equal(voice.feedbackVoicePath(worldId, 0, "continue"), "/assets/voicepacks/feedback/encouragement.wav", "O incentivo deve usar a faixa Leda compartilhada");
}
assert.ok(manifest.feedback["world-5-phase-0"] && manifest.feedback["world-6-phase-0"], "As duas matrizes devem apontar para as faixas Leda de sucesso e encorajamento");

console.log("OK: oito variações no Martelo Silábico e nas matrizes Alfabética/Ortográfica; sorteio de letras, progressão, opções e áudio Leda validados.");
