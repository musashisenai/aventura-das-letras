import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";

async function importTypeScript(path) {
  const { outputFiles } = await build({
    entryPoints: [new URL(path, import.meta.url).pathname],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`);
}

const content = await importTypeScript("../client/src/game/content.ts");
const voice = await importTypeScript("../client/src/game/voicepacks.ts");
const syllableMarks = await importTypeScript("../client/src/game/syllableMarks.ts");
const syllabic = content.getQuestionBank(3, 0);
const spelling = content.getQuestionBank(5, 0);
const orthography = content.getQuestionBank(6, 0);
const learnerUI = await readFile(new URL("../client/src/components/GameUI.tsx", import.meta.url), "utf8");
const expectedWords = ["SOL", "PATO", "BOLA", "CASA", "JANELA", "MACACO", "ELEFANTE", "BORBOLETA"];
const expectedOrthographicWords = ["CHUVA", "PEIXE", "CASA", "ZEBRA", "CHUCHU", "MOCHILA", "XÍCARA", "ROSA"];
const world2Questions = Array.from({ length: 8 }, (_, phase) => content.getQuestionBank(2, phase)).flat();
assert.ok(world2Questions.some((question) => question.prompt === "Qual item é uma letra? Escolha a letra para continuar."), "O Mundo 2 deve usar a instrução revisada de identificação de letras");
assert.ok(world2Questions.every((question) => !question.prompt.includes("deve entrar no ") && !question.prompt.includes("deve entrar na ")), "As instruções do Mundo 2 não devem conter destinos com artigo/preposição incompatíveis");

assert.equal(spelling.length, 8, "A Fase 1 do Mundo Alfabético deve apresentar oito variações");
assert.ok(spelling.every((question) => question.kind === "jet-writer" && question.activity === "maquina-escrever"), "As oito variações alfabéticas devem usar a matriz jogável Máquina de Escrever a Jato");
assert.deepEqual(spelling.map((question) => question.targetWord), expectedWords, "A progressão alfabética deve aumentar gradualmente o tamanho das palavras");
assert.ok(spelling.every((question, index) => question.answer === question.targetWord && question.activityIndex === index && question.writerSeconds >= 40), "Cada desafio de escrita precisa validar a palavra e oferecer tempo adequado");
assert.ok(spelling.every((question) => !`${question.prompt} ${question.displayPrompt}`.toLocaleLowerCase("pt-BR").includes(question.targetWord.toLocaleLowerCase("pt-BR"))), "A palavra-alvo não pode aparecer escrita no enunciado visual da atividade de escrita");
assert.ok(new Set(spelling.map((question) => question.id)).size === 8, "Os IDs da Máquina de Escrever devem ser únicos");
assert.equal(content.getActivityDefinition(5, spelling[0].activity)?.title, "A Máquina de Escrever a Jato", "O mapa deve resolver o título da matriz Alfabética");

assert.equal(orthography.length, 8, "A Fase 1 do Mundo Ortográfico deve apresentar oito variações");
assert.ok(orthography.every((question) => question.kind === "digraph-filter" && question.activity === "filtro-digrafos"), "As oito variações ortográficas devem usar a matriz de válvulas");
assert.deepEqual(orthography.map((question) => question.targetWord), expectedOrthographicWords, "O filtro precisa cobrir os alvos ortográficos planejados");
assert.ok(orthography.every((question) => question.options.includes(question.answer) && new Set(question.options).size === question.options.length), "Cada palavra precisa ter uma válvula correta e opções sem duplicatas");
assert.ok(orthography.every((question) => question.options.length === 4 && ["CH", "X", "S", "Z"].every((valve) => question.options.includes(valve))), "Cada variação deve manter as quatro válvulas da matriz, CH, X, S e Z");
assert.ok(orthography.every((question) => !`${question.prompt} ${question.displayPrompt}`.toLocaleLowerCase("pt-BR").includes(question.targetWord.toLocaleLowerCase("pt-BR"))), "A palavra completa não pode aparecer no enunciado da atividade ortográfica");
assert.ok(orthography.every((question) => question.orthographicPattern.replace("□", question.answer) === question.targetWord), "Cada válvula correta deve completar exatamente a palavra-alvo");
assert.deepEqual(orthography.map((question) => question.answer), ["CH", "X", "S", "Z", "CH", "CH", "X", "S"], "As respostas devem variar entre CH, X, S e Z");
assert.equal(content.getActivityDefinition(6, orthography[0].activity)?.title, "O Filtro de Água dos Dígrafos", "O mapa deve resolver o título da matriz Ortográfica");
assert.ok(learnerUI.includes("phase-activity-name") && learnerUI.includes("phaseOneActivity"), "O mapa do aluno deve exibir a atividade específica na página da Fase 1");

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
const audioPaths = new Set();
const metadata = JSON.parse(await readFile(new URL("../database/sections/audio/metadata.json", import.meta.url), "utf8"));
const metadataByPublicPath = new Map(metadata.assets.filter((asset) => asset.voice === "Leda").map((asset) => [asset.publicPath, asset]));
for (let worldId = 0; worldId < 7; worldId++) {
  for (let phase = 0; phase < 8; phase++) {
    const key = `world-${worldId}-phase-${phase}`;
    const pack = manifest.packs[key];
    assert.ok(pack, `O pacote Leda ${key} deve estar registrado`);
    assert.equal(pack.worldId, worldId, `O pacote ${key} deve identificar o mundo`);
    assert.equal(pack.phase, phase + 1, `O pacote ${key} deve identificar a fase humana`);
    assert.equal(pack.segments, 8, `O pacote ${key} deve representar oito variações`);
    assert.ok(manifest.feedback[key], `O pacote ${key} deve mapear o feedback Leda`);
    const bank = content.getQuestionBank(worldId, phase);
    assert.equal(bank.length, 8, `A fase ${key} deve conter oito perguntas`);
    for (const [index, question] of bank.entries()) {
      const kinds = ["hint"];
      if (worldId <= 4) kinds.push("prompt");
      if (question.targetWord || question.audioText) kinds.push("word");
      for (const kind of kinds) {
        const relPath = pack[`${kind}Segments`]?.[index];
        assert.ok(relPath, `A faixa ${kind} da variação ${index + 1} em ${key} deve estar no manifesto`);
        const expectedPath = `/assets/${relPath}`;
        assert.equal(voice.voicePackPath(worldId, phase, (index + 3) % 8, kind, question.id), expectedPath, `O ID estável deve localizar a faixa certa mesmo após embaralhamento: ${key}/${kind}/${index + 1}`);
        audioPaths.add(relPath);
      }
      if (worldId >= 5) assert.equal(voice.voicePackPath(worldId, phase, index, "prompt", question.id), undefined, "Os mundos Alfabético e Ortográfico não devem narrar o enunciado inteiro");
    }
  }
}
assert.equal(Object.keys(manifest.packs).length, 56, "O manifesto deve cobrir exatamente 7 mundos por 8 fases");
assert.equal(voice.feedbackVoicePath(undefined, undefined, "success"), "/assets/voicepacks/feedback/success.wav", "A faixa Leda de sucesso deve ser global");
assert.equal(voice.feedbackVoicePath(undefined, undefined, "continue"), "/assets/voicepacks/feedback/encouragement.wav", "O incentivo Leda deve ser global");
assert.ok(learnerUI.includes("feedback.tone === \"continue\" && Boolean(hintPath)"), "A segunda tentativa deve reproduzir a dica específica em todos os mundos");

for (const audioPath of audioPaths) {
  const audio = await readFile(new URL(`../client/public/assets/${audioPath}`, import.meta.url));
  const mirroredAudio = await readFile(new URL(`../database/sections/audio/${audioPath}`, import.meta.url));
  assert.ok(audio.equals(mirroredAudio), `${audioPath} deve ser idêntico entre assets e catálogo do banco`);
  const extension = audioPath.split(".").at(-1);
  if (extension === "wav") {
    assert.equal(audio.subarray(0, 4).toString(), "RIFF", `${audioPath} deve ser WAV válido`);
    assert.equal(audio.subarray(8, 12).toString(), "WAVE", `${audioPath} deve conter cabeçalho WAVE`);
  } else {
    assert.ok(audio.subarray(0, 3).toString() === "ID3" || (audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0), `${audioPath} deve conter quadros MP3`);
  }
  const asset = metadataByPublicPath.get(`client/public/assets/${audioPath}`);
  assert.ok(asset, `${audioPath} deve possuir metadados Leda`);
  assert.equal(asset.voice, "Leda");
  assert.equal(asset.language, "pt-BR");
  assert.ok(asset.durationSeconds > 0, `${audioPath} deve ter duração positiva nos metadados`);
}
assert.ok(metadataByPublicPath.has("client/public/assets/voicepacks/feedback/success.wav"), "O feedback de sucesso Leda deve continuar registrado");
assert.ok(metadataByPublicPath.has("client/public/assets/voicepacks/feedback/encouragement.wav"), "O feedback de encorajamento Leda deve continuar registrado");

console.log(`OK: oito variações nas 56 fases, ${audioPaths.size} segmentos Leda resolvidos, espelhados e com metadados; matrizes pedagógicas e regras de narração validadas.`);
