/**
 * Conteúdo pedagógico do Aventura das Letras.
 *
 * Matriz: 7 mundos, 10 formas de atividade por mundo e 8 variações por
 * forma (80 desafios exclusivos por mundo). Cada fase recebe um bloco
 * exclusivo de 8 perguntas; o controlador só embaralha esse bloco.
 */
export const ASSETS = {
  forest: "/manus-storage/floresta-livro-fundo_13d81f22.png",
  mascot: "/manus-storage/mascote-lumi_8d8abb75.png",
  logo: "/manus-storage/logo-aventura-simbolo_5ffaf790.png",
  rewards: "/manus-storage/recompensas-aventura_7af48267.png",
} as const;

export type QuestionKind = "choice" | "order" | "draw" | "seed-rain" | "lantern" | "sand-tracks" | "mosquito-sweep" | "magnet-paint" | "ice-melt" | "paint-roller" | "bee-flight" | "cookie-mold" | "shield-magic" | "syllable-hammer";
export type GameQuestion = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  displayPrompt?: string;
  targetWord?: string;
  options?: string[];
  answer: string;
  hint: string;
  visual?: string;
  sceneAsset?: string;
  audioText?: string;
  activity?: string;
  activityIndex?: number;
  seedTarget?: number;
  lanternTarget?: number;
  sandTarget?: number;
  mosquitoTarget?: number;
  magnetTarget?: number;
  revealAsset?: string;
  revealLabel?: string;
  revealRegion?: { x: number; y: number; width: number; height: number; coordinateSpace: "900x330" };
  rollerRows?: number;
  rollerColumns?: number;
  rollerOrdered?: boolean;
  rollerDirection?: "left" | "right" | "alternate";
  rollerPattern?: "straight" | "zigzag";
  rollerColor?: string;
  beeTarget?: number;
  cookieTarget?: string;
  cookieOptions?: string[];
  cookieCase?: "upper" | "lower" | "mixed";
  cookieLayout?: "row" | "arc" | "grid";
  cookieChallenge?: "direct" | "near" | "mirror" | "mixed";
  shieldItems?: string[];
  shieldTarget?: number;
  shieldLayout?: "row" | "scatter" | "grid";
  shieldMotion?: "still" | "float" | "orbit";
  syllableParts?: string[];
  hammerStyle?: "single" | "steady" | "alternating" | "sequence";
  hammerTempo?: "calm" | "normal" | "challenge";
};
export type World = { id: number; name: string; shortName: string; theme: string; color: string; accent: string; icon: string };

export const WORLDS: World[] = [
  { id: 0, name: "Mundo da Garatuja", shortName: "Garatuja", theme: "Ateliê das primeiras marcas", color: "#70B9E8", accent: "#EEF9FF", icon: "✎" },
  { id: 1, name: "Mundo do Alfabeto", shortName: "Alfabeto", theme: "Jardim das 26 chaves", color: "#2FAF88", accent: "#E7FFF6", icon: "ABC" },
  { id: 2, name: "Mundo Pré-Silábico", shortName: "Pré-Silábico", theme: "Cidade das letras curiosas", color: "#F1A83B", accent: "#FFF5D8", icon: "A" },
  { id: 3, name: "Mundo Silábico", shortName: "Silábico", theme: "Ilhas que cantam sílabas", color: "#E86E73", accent: "#FFF0F1", icon: "SA" },
  { id: 4, name: "Mundo Silábico-Alfabético", shortName: "Sílaba + Letra", theme: "Montanha das palavras", color: "#9673D3", accent: "#F4F0FF", icon: "PA" },
  { id: 5, name: "Mundo Alfabético", shortName: "Alfabético", theme: "Céu das frases leitoras", color: "#35A281", accent: "#E9FFF7", icon: "LÊ" },
  { id: 6, name: "Mundo Ortográfico", shortName: "Ortográfico", theme: "Biblioteca dos sons especiais", color: "#416DCE", accent: "#EDF3FF", icon: "CH" },
];

export type ActivityDefinition = { id: string; title: string; focus: string };
type ActivitySeed = [string, string, string];
export const ACTIVITY_CATALOG: Record<number, ActivitySeed[]> = {
  0: [
    ["chuva-sementes", "Chuva de Sementes", "traçado livre e causa e efeito"], ["dedos-lanterna", "Dedos de Lanterna", "rastreamento visual"], ["pegadas-areia", "Pegadas na Areia", "pressão e direção do toque"], ["espanta-mosquitos", "Espanta-Mosquitos", "flicks e movimentos rápidos"], ["pintura-ima", "Pintura de Ímã", "linhas fluidas e formas"], ["descongelando-tela", "Descongelando a Tela", "repetição no mesmo ponto"], ["rolo-pintura", "Rolo de Pintura Gigante", "varredura horizontal"], ["voo-abelha", "Voo da Abelha", "seguir caminhos"], ["esticador-elastico", "Esticador de Elástico", "puxar e soltar"], ["limpador-janela", "Limpador de Janela", "movimento vertical"],
  ],
  1: [
    ["molde-biscoito", "Molde de Biscoito", "pareamento de forma"], ["salto-canguru", "O Salto do Canguru", "nome e reconhecimento de letra"], ["canhao-tinta", "Canhão de Tinta", "ordem do traçado"], ["quebra-cabeca-neon", "Quebra-Cabeça de Neon", "composição gráfica"], ["letras-gemeas", "Detector de Letras Gêmeas", "maiúscula e minúscula"], ["carga-trem", "Estação de Carga do Trem", "discriminação visual"], ["caverna-ecos", "A Caverna dos Ecos", "som e letra"], ["escultura-argila", "Escultura de Argila", "pontos que formam letras"], ["pescaria-alfabetica", "Pescaria Alfabética por Tempo", "localização rápida"], ["sombras-sotao", "Sombras no Sótão", "contorno de letra"],
  ],
  2: [
    ["escudo-magico", "O Escudo Mágico", "letra versus símbolo"], ["baloes-peso", "Balões de Peso", "tamanho da palavra"], ["pintura-codigo", "Pintura por Código", "texto versus número"], ["robo-literario", "Alimentando o Robô Literário", "seleção de letras"], ["cartas-postais", "Classificador de Cartas Postais", "escrita versus desenho"], ["carimbos", "Linha de Montagem de Carimbos", "texto legível"], ["cofre-letras", "Cofre das Letras", "sequência de letras"], ["mapa-tesouro", "Caça ao Tesouro no Mapa", "marcas com palavras"], ["arqueologia", "Arqueologia Egípcia", "alfabeto moderno"], ["fronteira-simbolos", "A Fronteira dos Símbolos", "classificação"],
  ],
  3: [
    ["martelo-pedacos", "O Martelo dos Pedaços", "uma marca por sílaba"], ["maquina-chicletes", "A Máquina de Chicletes", "contagem silábica"], ["pistas-skate", "Pistas de Skate", "segmentação em partes"], ["lancador-foguetes", "Lançador de Foguetes", "estágios da palavra"], ["carimbador-passaportes", "O Carimbador de Passaportes", "quantidade de sílabas"], ["degraus-musicais", "Degraus Musicais", "ritmo da fala"], ["alvo-flechas", "Alvo de Flechas Cegas", "uma ação por pedaço"], ["maestro-tambores", "O Maestro dos Tambores", "sequência de batidas"], ["balanco-macacos", "Balanço dos Macacos", "segmentação oral"], ["pipocas-quantidade", "Estoura-Pipocas de Quantidade", "ritmo e contagem"],
  ],
  4: [
    ["colheita-vogais", "A Colheita das Vogais", "vogais proeminentes"], ["teclado-vogais", "Teclado das Vogais Mágicas", "sequência sonora"], ["bolhas-som", "O Atirador de Bolhas de Som", "som e grafia"], ["trem-fonemas", "O Trem dos Fonemas", "completar espaços"], ["pinguim-faminto", "Alimentando o Pinguim Faminto", "vogais das sílabas"], ["codigo-elevador", "O Código do Elevador", "sons em ordem"], ["pescaria-consoantes", "Pescaria de Consoantes Fortes", "consoantes estruturais"], ["degraus-eco", "Os Degraus do Eco Fonético", "letra possível para o som"], ["detetive-som", "Detetive do Som Escondido", "letras ausentes"], ["tijolos-sonoros", "O Encaixe dos Tijolos Sonoros", "construção sonora"],
  ],
  5: [
    ["maquina-escrever", "A Máquina de Escrever a Jato", "digitação de palavras"], ["ponte-textos", "O Construtor de Pontes de Textos", "escrita autônoma"], ["batalha-rimas", "Batalha de Rimas Alfabéticas", "rimas escritas"], ["mensageiro-reino", "O Mensageiro do Reino", "frase ditada"], ["decodificador-diarios", "Decodificador de Diários", "ordem das letras"], ["garimpeiro-letras", "O Garimpeiro de Letras", "ordem ortográfica"], ["baloes-rpg", "Balões de Diálogo de RPG", "transcrição"], ["labirinto-escrito", "O Enigma do Labirinto Escrito", "autonomia plena"], ["sopa-letrinhas", "O Chef da Sopa de Letrinhas", "seleção e ordem"], ["corrida-digitacao", "Corrida de Obstáculos de Digitação", "escrita sob desafio"],
  ],
  6: [
    ["filtro-digrafos", "O Filtro de Água dos Dígrafos", "CH, X, S e Z"], ["escudo-ss", "O Escudo das Letras Gêmeas", "S e SS"], ["balanca-prefixos", "A Balança dos Prefixos", "M antes de P/B"], ["cacador-acento", "O Caçador do Acento Perdido", "acentuação"], ["inspetor-erros", "O Inspetor de Alfândega", "caça-erros"], ["labirinto-homofonos", "O Labirinto dos Homófonos", "sentido e grafia"], ["enigma-porques", "O Enigma dos Porquês", "por que, porque, por quê e porquê"], ["atirador-gj", "O Atirador de Elite do G e J", "G e J"], ["plurais-complexos", "O Construtor de Plurais Complexos", "plural"], ["forca-dicionario", "A Forca do Dicionário Sagrado", "palavras difíceis"],
  ],
};

const catalog = (worldId: number): ActivityDefinition[] => ACTIVITY_CATALOG[worldId].map(([id, title, focus]) => ({ id, title, focus }));
export function getActivityDefinition(worldId: number, activityId?: string) {
  return activityId ? catalog(worldId).find((activity) => activity.id === activityId) : undefined;
}
const choice = (id: string, prompt: string, options: string[], answer: string, hint: string, visual?: string, activity?: string, activityIndex?: number): GameQuestion => ({ id, kind: "choice", prompt, options, answer, hint, visual, activity, activityIndex });
const order = (id: string, prompt: string, options: string[], answer: string, hint: string, visual?: string, audioText?: string, activity?: string, activityIndex?: number): GameQuestion => ({ id, kind: "order", prompt, options, answer, hint, visual, audioText, activity, activityIndex });
const draw = (id: string, prompt: string, hint: string, visual?: string, activity?: string, activityIndex?: number): GameQuestion => ({ id, kind: "draw", prompt, answer: "__drawing__", hint, visual, activity, activityIndex });
const seedRain = (variant: number, prompt: string, hint: string, seedTarget: number): GameQuestion => ({ id: `fase-1-g-chuva-sementes-${variant + 1}`, kind: "seed-rain", prompt, answer: `CHUVA COMPLETA ${variant + 1}`, hint, activity: "chuva-sementes", activityIndex: variant, seedTarget });
const lantern = (variant: number, prompt: string, hint: string, lanternTarget: number): GameQuestion => ({ id: `fase-2-g-dedos-lanterna-${variant + 1}`, kind: "lantern", prompt, answer: `LUZ COMPLETA ${variant + 1}`, hint, activity: "dedos-lanterna", activityIndex: variant, lanternTarget });
const sandTracks = (variant: number, prompt: string, hint: string, sandTarget: number): GameQuestion => ({ id: `fase-3-g-pegadas-areia-${variant + 1}`, kind: "sand-tracks", prompt, answer: `PEGADAS COMPLETAS ${variant + 1}`, hint, activity: "pegadas-areia", activityIndex: variant, sandTarget, sceneAsset: "pegadas-coqueiro" });
const mosquitoSweep = (variant: number, prompt: string, hint: string, mosquitoTarget: number): GameQuestion => ({ id: `fase-4-g-espanta-mosquitos-${variant + 1}`, kind: "mosquito-sweep", prompt, answer: `POMAR LIMPO ${variant + 1}`, hint, activity: "espanta-mosquitos", activityIndex: variant, mosquitoTarget });
const magnetPaint = (variant: number, prompt: string, hint: string, magnetTarget: number): GameQuestion => ({ id: `fase-5-g-pintura-ima-${variant + 1}`, kind: "magnet-paint", prompt, answer: `FORMA MAGNÉTICA ${variant + 1}`, hint, activity: "pintura-ima", activityIndex: variant, magnetTarget });
const iceMelt = (variant: number, prompt: string, hint: string, revealAsset: string, revealLabel: string): GameQuestion => ({ id: `fase-6-g-descongelando-tela-${variant + 1}`, kind: "ice-melt", prompt, answer: `IMAGEM REVELADA ${variant + 1}`, hint, activity: "descongelando-tela", activityIndex: variant, revealAsset, revealLabel, revealRegion: { x: 315, y: 38, width: 270, height: 252, coordinateSpace: "900x330" } });
const paintRoller = (variant: number, prompt: string, hint: string, config: Pick<GameQuestion, "rollerRows" | "rollerColumns" | "rollerOrdered" | "rollerDirection" | "rollerPattern" | "rollerColor">): GameQuestion => ({ id: `fase-7-g-rolo-pintura-${variant + 1}`, kind: "paint-roller", prompt, answer: `PINTURA COMPLETA ${variant + 1}`, hint, activity: "rolo-pintura", activityIndex: variant, ...config });
const beeFlight = (variant: number, prompt: string, hint: string, beeTarget: number): GameQuestion => ({ id: `desafio-final-g-voo-abelha-${variant + 1}`, kind: "bee-flight", prompt, answer: `VOO COMPLETO ${variant + 1}`, hint, activity: "voo-abelha", activityIndex: variant, beeTarget });
const cookieMold = (variant: number, prompt: string, hint: string, target: string, options: string[], config: Pick<GameQuestion, "cookieCase" | "cookieLayout" | "cookieChallenge">): GameQuestion => ({ id: `fase-1-abc-molde-biscoito-${variant + 1}`, kind: "cookie-mold", prompt, answer: target, hint, activity: "molde-biscoito", activityIndex: variant, cookieTarget: target, cookieOptions: options, ...config });
const shieldMagic = (variant: number, prompt: string, hint: string, items: string[], config: Pick<GameQuestion, "shieldLayout" | "shieldMotion">): GameQuestion => ({ id: `fase-1-p-escudo-magico-${variant + 1}`, kind: "shield-magic", prompt, answer: `ESCUDO PROTEGE ${variant + 1}`, hint, activity: "escudo-magico", activityIndex: variant, shieldItems: items, shieldTarget: items.filter((item) => /^[A-ZÁÉÍÓÚÀÃÕÇ]$/i.test(item)).length, ...config });
const syllableHammer = (variant: number, prompt: string, hint: string, parts: string[], config: Pick<GameQuestion, "hammerStyle" | "hammerTempo">): GameQuestion => ({ id: `fase-1-s-martelo-pedacos-${variant + 1}`, kind: "syllable-hammer", prompt, answer: `BATIDAS COMPLETAS ${variant + 1}`, hint, activity: "martelo-pedacos", activityIndex: variant, syllableParts: parts, ...config });
const letters = [["A", "M", "O"], ["B", "D", "P"], ["C", "G", "Q"], ["E", "F", "L"], ["I", "L", "T"], ["J", "G", "L"], ["M", "N", "W"], ["O", "Q", "X"]];
const visuals = ["☀️", "🐟", "🌼", "🚗", "🏠", "🐝", "🍎", "⭐"];
const words = [["BOLA", "MALA", "PATO"], ["GATO", "RATO", "DADO"], ["CASA", "MESA", "LUA"], ["SAPO", "SACO", "SINO"], ["FADA", "FACA", "FITA"], ["VACA", "VOTO", "VIDA"], ["LATA", "LAGO", "LIMA"], ["BOLO", "BOTA", "BICO"]];
const syllables = ["CA-SA", "BO-LA", "SA-PA-TO", "JA-CA-RÉ", "MA-CA-CO", "E-LE-FAN-TE", "GE-LEI-A", "BI-CI-CLE-TA"];

const ALFABETO_PHASE_ONE: GameQuestion[] = [
  cookieMold(0, "ESCOLHA A FÔRMA IGUAL À LETRA A.", "Observe o contorno: a fôrma certa tem o mesmo desenho da letra A.", "A", ["A", "M", "O"], { cookieCase: "upper", cookieLayout: "row", cookieChallenge: "direct" }),
  cookieMold(1, "ENCONTRE A FÔRMA IGUAL À LETRA B.", "Compare as duas barrigas da letra B com cada fôrma.", "B", ["D", "B", "P"], { cookieCase: "upper", cookieLayout: "arc", cookieChallenge: "near" }),
  cookieMold(2, "A LETRA C QUER VIRAR BISCOITO. QUAL FÔRMA COMBINA?", "A letra C é aberta de um lado; não escolha o O fechado.", "C", ["O", "C", "G"], { cookieCase: "upper", cookieLayout: "row", cookieChallenge: "near" }),
  cookieMold(3, "ESCOLHA A FÔRMA DA LETRA M.", "M e W parecem parentes, mas observe para onde apontam as pontas.", "M", ["N", "W", "M"], { cookieCase: "upper", cookieLayout: "grid", cookieChallenge: "mirror" }),
  cookieMold(4, "QUAL FÔRMA TEM O MESMO DESENHO DA LETRA E?", "Procure as três barrinhas que saem do lado esquerdo.", "E", ["F", "E", "L"], { cookieCase: "upper", cookieLayout: "arc", cookieChallenge: "near" }),
  cookieMold(5, "AGORA A LETRA APARECE PEQUENINA: ENCONTRE A FÔRMA DE a.", "A fôrma deve ser minúscula também. Compare o desenho, não o tamanho do cartão.", "a", ["o", "a", "e"], { cookieCase: "lower", cookieLayout: "row", cookieChallenge: "mixed" }),
  cookieMold(6, "A COZINHA MISTUROU LETRAS GRANDES E PEQUENAS. ACHE A FÔRMA DE R.", "Escolha a única fôrma que repete exatamente a letra R mostrada.", "R", ["r", "P", "R", "K"], { cookieCase: "mixed", cookieLayout: "grid", cookieChallenge: "mixed" }),
  cookieMold(7, "DESAFIO FINAL: MOLDE A LETRA S SEM SE DEIXAR ENGANAR.", "Compare curvas, tamanho e direção. A fôrma correta é a cópia do S.", "S", ["Z", "s", "S", "C"], { cookieCase: "mixed", cookieLayout: "arc", cookieChallenge: "mirror" }),
];

const PRE_SILABICO_PHASE_ONE: GameQuestion[] = [
  shieldMagic(0, "PROTEJA A LETRA M COM O ESCUDO.", "Toque apenas no caractere que pode entrar em uma palavra; o número e o símbolo são distrações.", ["M", "7", "◇"], { shieldLayout: "row", shieldMotion: "still" }),
  shieldMagic(1, "LEVANTE O ESCUDO PARA AS LETRAS B E A.", "Letras formam palavras. Ignore o número e o símbolo e proteja as duas letras.", ["B", "4", "A", "☀"], { shieldLayout: "scatter", shieldMotion: "still" }),
  shieldMagic(2, "A CIDADE MISTUROU LETRAS E NÚMEROS. PROTEJA AS LETRAS.", "Procure M e O; os números não são letras e não precisam do escudo.", ["3", "M", "8", "O", "△"], { shieldLayout: "scatter", shieldMotion: "float" }),
  shieldMagic(3, "DEFENDA AS TRÊS LETRAS DO PORTÃO.", "Proteja L, I e A. Observe cada cartão antes de tocar para não escolher os símbolos.", ["L", "@", "I", "5", "A", "□"], { shieldLayout: "grid", shieldMotion: "float" }),
  shieldMagic(4, "O ESCUDO PRECISA SEPARAR ESCRITA DE DESENHO.", "Toque somente em S, O e L. As formas e o número não formam uma palavra.", ["★", "S", "2", "O", "☀", "L", "◇"], { shieldLayout: "grid", shieldMotion: "float" }),
  shieldMagic(5, "PROTEJA AS LETRAS DA PALAVRA BOLA.", "Encontre B, O, L e A, mesmo com os distratores espalhados pela cidade.", ["B", "#", "O", "7", "L", "○", "A", "△"], { shieldLayout: "scatter", shieldMotion: "orbit" }),
  shieldMagic(6, "O PORTÃO ESTÁ MAIS CHEIO: PROTEJA TODAS AS LETRAS.", "As letras C, A, S e A são as únicas escritas. Toque nelas uma vez; ignore números e símbolos.", ["C", "4", "A", "✦", "S", "9", "A", "□", "∞"], { shieldLayout: "grid", shieldMotion: "orbit" }),
  shieldMagic(7, "DESAFIO FINAL: ABRA A CIDADE PROTEGENDO CADA LETRA.", "Encontre P, A, T, O e L. O escudo só abre quando todas as letras forem protegidas.", ["P", "3", "A", "◇", "T", "8", "O", "★", "L", "☀"], { shieldLayout: "grid", shieldMotion: "orbit" }),
];

const SILABICO_PHASE_ONE: GameQuestion[] = [
  syllableHammer(0, "BATA UMA VEZ PARA CADA PARTE DE SOL.", "Diga SOL devagar. É uma parte falada, então o martelo bate uma vez.", ["SOL"], { hammerStyle: "single", hammerTempo: "calm" }),
  syllableHammer(1, "MARQUE AS DUAS PARTES DE BO-LA.", "Fale BO-LA e acompanhe as duas batidas: BO / LA.", ["BO", "LA"], { hammerStyle: "steady", hammerTempo: "calm" }),
  syllableHammer(2, "AJUDE O SAPO BATENDO AS PARTES DE SA-PA-TO.", "Separe a palavra em três pedaços falados: SA / PA / TO.", ["SA", "PA", "TO"], { hammerStyle: "steady", hammerTempo: "normal" }),
  syllableHammer(3, "O JACARÉ PRECISA DE UMA BATIDA PARA CADA PEDAÇO.", "Diga JA-CA-RÉ sem correr. Cada pedaço recebe uma batida do martelo.", ["JA", "CA", "RÉ"], { hammerStyle: "alternating", hammerTempo: "normal" }),
  syllableHammer(4, "CONTE OS QUATRO PEDAÇOS DE E-LE-FAN-TE.", "Bata no ritmo da fala: E / LE / FAN / TE. Não junte os pedaços.", ["E", "LE", "FAN", "TE"], { hammerStyle: "alternating", hammerTempo: "normal" }),
  syllableHammer(5, "FAÇA O TREM ANDAR COM BI-CI-CLE-TA.", "Cada vagão representa uma parte falada. Marque BI, CI, CLE e TA.", ["BI", "CI", "CLE", "TA"], { hammerStyle: "sequence", hammerTempo: "normal" }),
  syllableHammer(6, "MARQUE TODAS AS PARTES DE BOR-BO-LE-TA.", "Pronuncie devagar: BOR / BO / LE / TA. O martelo precisa acompanhar quatro batidas.", ["BOR", "BO", "LE", "TA"], { hammerStyle: "sequence", hammerTempo: "challenge" }),
  syllableHammer(7, "DESAFIO FINAL: COMPLETE A PALAVRA A-BA-CA-XI.", "Ouça seu próprio ritmo e bata uma vez em cada parte, sem apertar a mesma marca duas vezes.", ["A", "BA", "CA", "XI"], { hammerStyle: "sequence", hammerTempo: "challenge" }),
];

function addActivity(question: GameQuestion, activity: ActivityDefinition, worldId: number, variant: number): GameQuestion {
  const withAudio = question.audioText ? { ...question, targetWord: question.audioText, displayPrompt: question.prompt } : question;
  return { ...withAudio, id: `w${worldId}-${activity.id}-${variant + 1}`, activity: activity.id, activityIndex: variant };
}

function buildWorldBank(worldId: number): GameQuestion[] {
  const activities = catalog(worldId);
  const result: GameQuestion[] = [];
  activities.forEach((activity, activityIndex) => {
    for (let variant = 0; variant < 8; variant += 1) {
      const id = `w${worldId}-${activity.id}-${variant + 1}`;
      const visual = visuals[(variant + activityIndex) % visuals.length];
      let question: GameQuestion;
      if (worldId === 0) {
        const prompts = ["Faça um traço que leve a semente até a terra.", "Ilumine o objeto escondido fazendo um caminho contínuo.", "Deixe uma pegada seguindo a trilha pontilhada.", "Afaste os insetos com um movimento rápido para fora da tela.", "Puxe as partículas para formar uma linha comprida.", "Esfregue o gelo até revelar o desenho.", "Cubra a faixa com o rolo, indo de um lado ao outro.", "Leve a abelha até a flor sem sair do caminho.", "Puxe o elástico até a marca colorida.", "Leve a água para baixo com um movimento vertical."];
        question = variant % 3 === 0 ? draw(id, prompts[activityIndex], "Experimente devagar e observe o que acontece.", visual) : choice(id, `${prompts[activityIndex]} Qual gesto combina melhor?`, ["Um traço contínuo", "Ficar parado", "Tocar só uma vez"], "Um traço contínuo", "Faça o movimento pedido com calma.", visual);
      } else if (worldId === 1) {
        const options = letters[variant]; const answer = options[(activityIndex + variant) % 3];
        question = activityIndex % 3 === 2 ? choice(id, `Qual cartão representa a letra ${answer} na ordem pedida?`, [answer, "X", "Y"], answer, "Comece pelo cartão que mostra a letra pedida.", visual) : choice(id, `Qual cartão combina com a letra ${answer}?`, options, answer, `Procure o desenho da letra ${answer}.`, visual);
        if ([1, 6].includes(activityIndex)) question.audioText = answer;
      } else if (worldId === 2) {
        const options = letters[(variant + 2) % letters.length]; const answer = options[(activityIndex + 1) % 3];
        question = choice(id, activityIndex % 2 === 0 ? `Qual item é uma letra e deve entrar no ${activity.title.toLowerCase()}?` : "Qual grupo representa uma escrita?", [answer, "7", "◇"], answer, "Letras formam palavras; números e símbolos têm outras funções.", visual);
        if (activityIndex === 1) question = choice(id, "Qual palavra é mais comprida para o objeto mostrado?", ["PÉ", "SOL", "BORBOLETA"], "BORBOLETA", "Compare quantas letras aparecem.", visual);
        if (activityIndex === 4) question = choice(id, "Qual cartão possui escrita?", ["DESENHO", "LUA", "RABISCO"], "LUA", "Procure o cartão formado por letras.", visual);
      } else if (worldId === 3) {
        const target = syllables[(variant + activityIndex) % syllables.length]; const count = target.split("-").length;
        question = choice(id, `Quantas partes faladas tem ${target}?`, [String(Math.max(1, count - 1)), String(count), String(count + 1)], String(count), "Fale a palavra devagar e bata uma palma para cada parte.", visual);
        if (activityIndex % 3 === 0) { const marks = Array.from({ length: count }, (_, i) => String.fromCharCode(88 + ((i + variant) % 3))); question = order(id, `Marque uma letra em cada pedaço de ${target}.`, marks, marks.join(""), "Uma marca representa cada sílaba, mesmo sem copiar o som.", visual, target); }
      } else if (worldId === 4) {
        const target = words[(variant + activityIndex) % words.length][0]; const vowels = target.split("").filter((letter) => "AEIOU".includes(letter)); const answer = vowels[activityIndex % vowels.length] ?? "A";
        question = choice(id, `Qual letra ajuda a completar o som de ${target}?`, [answer, "X", "U"].filter((value, index, array) => array.indexOf(value) === index), answer, "Fale cada sílaba e perceba a vogal mais forte.", visual);
        if ([2, 6].includes(activityIndex)) question = choice(id, `Qual letra aparece no trecho sonoro destacado de ${target}?`, [answer, "B", "T"], answer, "Ouça o som e escolha a letra que o representa.", visual);
        if (activityIndex === 8) question = order(id, `Complete e organize a palavra ouvida: ${target}.`, target.split("").reverse(), target, "Arraste as letras e confira o som completo da palavra.", visual, target);
      } else if (worldId === 5) {
        const set = words[(variant + activityIndex) % words.length]; const target = set[0];
        if (activityIndex === 2) question = choice(id, `Qual palavra rima com ${target}?`, [set[1], "JANELA", "PÉ"], set[1], "Compare o som do final das duas palavras.", visual);
        else if ([3, 6].includes(activityIndex)) question = order(id, `Escreva a palavra que a Lumi ditou: ${target}.`, target.split("").reverse(), target, "Ouça, pense nos sons e organize todas as letras.", visual, target);
        else question = order(id, `Monte a palavra ${target} antes que a aventura avance.`, target.split("").reverse(), target, "Comece pelo primeiro som e siga até o fim.", visual, target);
      } else {
        const rules = [["PEI__E", "X", "CH", "S"], ["MI__ÃO", "SS", "S", "Ç"], ["__MPO", "CA", "NA", "RA"], ["CAFE", "CAFÉ", "CAFE", "CAFÊ"], ["ESCEÇÃO", "EXCEÇÃO", "ESCESÃO", "EXCESSÃO"], ["Vou __ a roupa.", "COSER", "COZER", "COZER"], ["Não fui __ estava chovendo.", "porque", "por que", "porquê"], ["__IRAFA", "G", "J", "CH"]][(variant + activityIndex) % 8];
        if (activityIndex === 8) question = choice(id, "Qual é o plural correto de CIDADÃO?", ["CIDADÃOS", "CIDADÕES", "CIDADANS"], "CIDADÃOS", "Observe a transformação do final da palavra.", visual);
        else if (activityIndex === 9) question = choice(id, "Qual palavra está escrita corretamente?", ["PSICÓLOGO", "PISICÓLOGO", "PSICOLOGO"], "PSICÓLOGO", "Leia devagar e procure as letras silenciosas e o acento.", visual);
        else question = choice(id, `Qual opção resolve o desafio: ${rules[0]}?`, [rules[1], rules[2], rules[3]], rules[1], "Pronuncie a palavra e observe a regra ortográfica.", visual);
      }
      result.push(addActivity(question, activity, worldId, variant));
    }
  });
  return result;
}
const WORLD_QUESTION_BANKS: Record<number, GameQuestion[]> = Object.fromEntries(WORLDS.map((world) => [world.id, buildWorldBank(world.id)]));
const GARATUJA_PHASE_ONE: GameQuestion[] = [
  seedRain(0, "Faça as sementes nascerem seguindo um caminho de terra.", "Arraste o dedo devagar pela terra e observe as primeiras folhas.", 3),
  seedRain(1, "Leve a chuva de sementes até o canteiro azul.", "Trace uma linha contínua até o canteiro marcado.", 4),
  seedRain(2, "Crie um caminho curvo para a flor abrir.", "O caminho pode ser grande e livre. A flor acompanha o seu gesto.", 5),
  seedRain(3, "Plante sementes em dois caminhos que se encontram.", "Faça dois traços que cruzem a terra e espalhem pontos de vida.", 6),
  seedRain(4, "Cubra a faixa de terra com um traço comprido.", "Passe o dedo de uma ponta até a outra sem pressa.", 7),
  seedRain(5, "Faça nascer um pequeno jardim com seus movimentos.", "Mude a direção quando quiser. Cada marca ajuda o jardim a crescer.", 8),
  seedRain(6, "Siga a trilha pontilhada e acenda as sementes.", "Acompanhe os pontos com um gesto contínuo.", 9),
  seedRain(7, "Complete o canteiro e revele a flor da Lumi.", "Explore todo o espaço de terra. O jardim floresce quando estiver pronto.", 10),
];
const GARATUJA_PHASE_TWO: GameQuestion[] = [
  lantern(0, "Encontre os brinquedos escondidos no quarto escuro.", "Passe a lanterna devagar e procure os pontos que brilham.", 2),
  lantern(1, "Ilumine a trilha e descubra quem está esperando.", "A luz acompanha seu dedo. Explore os cantinhos sem pressa.", 2),
  lantern(2, "Procure as duas surpresas atrás da noite.", "Quando a luz passar por um objeto, ele vai reagir.", 2),
  lantern(3, "Acenda os objetos escondidos para abrir a janela.", "Você não precisa acertar um ponto pequeno: ilumine áreas grandes.", 3),
  lantern(4, "Explore o céu escuro e encontre as formas brilhantes.", "Mova o dedo em círculos para ampliar sua busca.", 3),
  lantern(5, "Revele os amigos que estão brincando no escuro.", "A cada descoberta, a tela fica um pouco mais iluminada.", 3),
  lantern(6, "Passe a luz pelo mapa e encontre os sinais secretos.", "Siga de um lado ao outro e observe as reações.", 4),
  lantern(7, "Ilumine o quarto inteiro e revele a grande surpresa.", "Procure todos os brilhos. A última descoberta abre a passagem.", 4),
];
const GARATUJA_PHASE_THREE: GameQuestion[] = [
  sandTracks(0, "FAÇA PEGADAS NA AREIA E LEVE A TRILHA ATÉ O COQUEIRO.", "Arraste pela areia. Ao completar as marcas, a trilha continua até a sombra do coqueiro.", 5),
  sandTracks(1, "FAÇA PEGADAS NA AREIA E LEVE A TRILHA ATÉ O COQUEIRO.", "Arraste pela areia. Ao completar as marcas, a trilha continua até a sombra do coqueiro.", 5),
  sandTracks(2, "FAÇA PEGADAS NA AREIA E LEVE A TRILHA ATÉ O COQUEIRO.", "Arraste pela areia. Ao completar as marcas, a trilha continua até a sombra do coqueiro.", 6),
  sandTracks(3, "FAÇA PEGADAS NA AREIA E LEVE A TRILHA ATÉ O COQUEIRO.", "Arraste pela areia. Ao completar as marcas, a trilha continua até a sombra do coqueiro.", 6),
  sandTracks(4, "FAÇA PEGADAS NA AREIA E LEVE A TRILHA ATÉ O COQUEIRO.", "Arraste pela areia. Ao completar as marcas, a trilha continua até a sombra do coqueiro.", 7),
  sandTracks(5, "FAÇA PEGADAS NA AREIA E LEVE A TRILHA ATÉ O COQUEIRO.", "Arraste pela areia. Ao completar as marcas, a trilha continua até a sombra do coqueiro.", 7),
  sandTracks(6, "FAÇA PEGADAS NA AREIA E LEVE A TRILHA ATÉ O COQUEIRO.", "Arraste pela areia. Ao completar as marcas, a trilha continua até a sombra do coqueiro.", 8),
  sandTracks(7, "FAÇA PEGADAS NA AREIA E LEVE A TRILHA ATÉ O COQUEIRO.", "Arraste pela areia. Ao completar as marcas, a trilha continua até a sombra do coqueiro.", 8),
];
const GARATUJA_PHASE_FOUR: GameQuestion[] = [
  mosquitoSweep(0, "ESPANTE OS MOSQUITOS DA MAÇÃ COM GESTOS RÁPIDOS.", "Comece perto de um mosquito e faça um movimento rápido para fora da fruta.", 8),
  mosquitoSweep(1, "LIMPE O CACHO DE UVAS ANTES QUE OS MOSQUITOS CHEGUEM À FRUTA.", "Cada gesto deve sair de perto de um inseto e terminar longe dele.", 8),
  mosquitoSweep(2, "PROTEJA A PERA: EMPURRE OS INSETOS PARA FORA DA CENA.", "Aponte para um mosquito, arraste com firmeza e solte depois de afastá-lo.", 8),
  mosquitoSweep(3, "DEIXE O POMAR TRANQUILO AFASTANDO TODOS OS INSETOS.", "Faça um flick curto e veloz em uma direção diferente para cada mosquito.", 8),
  mosquitoSweep(4, "ESPANTE OS MOSQUITOS QUE RODEIAM A FRUTA AMARELA.", "O movimento começa perto do inseto; um toque parado não conta.", 8),
  mosquitoSweep(5, "FAÇA UMA LIMPEZA RÁPIDA AO REDOR DO CESTO DE FRUTAS.", "Procure os insetos ao redor e empurre cada um para além da borda.", 8),
  mosquitoSweep(6, "SALVE A FRUTA MADURA COM GESTOS DE VARRER.", "Use um movimento rápido e contínuo, como se estivesse varrendo a tela.", 8),
  mosquitoSweep(7, "ESPANTE A ÚLTIMA NUVEM DE MOSQUITOS DO POMAR.", "Afaste todos os insetos sem parar sobre a fruta: movimento e direção são importantes.", 8),
];
const GARATUJA_PHASE_FIVE: GameQuestion[] = [
  magnetPaint(0, "GUIE O ÍMÃ E DESENHE UMA FORMA COM A LIMALHA.", "Arraste a ferradura devagar; as partículas seguem o seu caminho.", 8),
  magnetPaint(1, "CRIE UM CAMINHO CURVO COM AS PARTÍCULAS MAGNÉTICAS.", "Faça uma curva ampla e passe por todos os pontos brilhantes.", 8),
  magnetPaint(2, "LIGUE OS PONTOS E FORME UM CÍRCULO DE LUZ.", "Aproxime a ferradura de cada ponto até ele acender.", 8),
  magnetPaint(3, "DESENHE UMA ESPIRAL COM O ÍMÃ SEM SOLTAR O DEDO.", "Mantenha o movimento contínuo e observe as linhas fluidas.", 8),
  magnetPaint(4, "FAÇA A LIMALHA DANÇAR E MONTE UM TRIÂNGULO.", "Passe pelos três cantos e depois complete os pontos do centro.", 8),
  magnetPaint(5, "CRUZE O ATELIÊ E REVELE A FORMA ESCONDIDA.", "Mova o ímã em zigue-zague para juntar as partículas.", 8),
  magnetPaint(6, "DESENHE UMA ESTRELA COM LINHAS DE FERRO.", "Passe pela ponta de cada raio; a estrela vai aparecer aos poucos.", 8),
  magnetPaint(7, "COMPLETE A GRANDE FIGURA MAGNÉTICA DA LUMI.", "Explore toda a tela e acenda os oito pontos da forma final.", 8),
];
const GARATUJA_PHASE_SIX: GameQuestion[] = [
  iceMelt(0, "ESFREGUE O GELO E REVELE O SORVETE DE MORANGO.", "O sorvete está no centro da janela. Esfregue toda a imagem, sem deixar partes cobertas.", "sorvete-morango", "Sorvete de morango"),
  iceMelt(1, "ENCONTRE O SORVETE DE MORANGO ATRÁS DO GELO.", "Passe o dedo sobre a imagem central até revelar o sorvete inteiro.", "sorvete-morango", "Sorvete de morango"),
  iceMelt(2, "DERRETA A JANELA E DESCUBRA O SORVETE.", "A surpresa está no meio da tela. Cubra toda a figura com seus movimentos.", "sorvete-morango", "Sorvete de morango"),
  iceMelt(3, "LIMPE O VIDRO GELADO PARA VER O SORVETE.", "Esfregue cada parte da imagem rosa e da casquinha até tudo aparecer.", "sorvete-morango", "Sorvete de morango"),
  iceMelt(4, "ABRA UM CAMINHO NO GELO ATÉ O SORVETE.", "O sorvete está centralizado. Continue até nenhuma parte da figura ficar escondida.", "sorvete-morango", "Sorvete de morango"),
  iceMelt(5, "FAÇA O GELO SUMIR E REVELE O SORVETE DE MORANGO.", "Movimente o dedo em círculos pequenos sobre toda a imagem central.", "sorvete-morango", "Sorvete de morango"),
  iceMelt(6, "DESCONGELE A TELA E ENCONTRE O SORVETE.", "Não basta abrir um risco: esfregue a figura inteira para completar a descoberta.", "sorvete-morango", "Sorvete de morango"),
  iceMelt(7, "REVELE POR COMPLETO A GRANDE SURPRESA GELADA.", "O sorvete só aparece quando toda a imagem central estiver sem gelo.", "sorvete-morango", "Sorvete de morango"),
];
const GARATUJA_PHASE_SEVEN: GameQuestion[] = [
  paintRoller(0, "PASSE O ROLO E PINTE AS TRÊS FAIXAS.", "Comece pela esquerda e cubra cada faixa até o fim.", { rollerRows: 3, rollerColumns: 10, rollerOrdered: false, rollerDirection: "left", rollerPattern: "straight", rollerColor: "#F6B84B" }),
  paintRoller(1, "CUBRA AS QUATRO FAIXAS COM O ROLO.", "As faixas são largas. Siga de uma ponta à outra, alternando os lados.", { rollerRows: 4, rollerColumns: 12, rollerOrdered: false, rollerDirection: "alternate", rollerPattern: "straight", rollerColor: "#F28C5C" }),
  paintRoller(2, "PINTE AS FAIXAS DE CIMA PARA BAIXO.", "Agora siga a ordem: comece na faixa de cima e só depois passe para a próxima.", { rollerRows: 5, rollerColumns: 14, rollerOrdered: true, rollerDirection: "alternate", rollerPattern: "straight", rollerColor: "#E978A5" }),
  paintRoller(3, "PREENCHA AS SEIS FAIXAS SEM DEIXAR BURACOS.", "Use movimentos contínuos e alterne o lado de início em cada faixa.", { rollerRows: 6, rollerColumns: 16, rollerOrdered: true, rollerDirection: "alternate", rollerPattern: "straight", rollerColor: "#9B7BD1" }),
  paintRoller(4, "SIGA O CAMINHO EM ZIGUE-ZAGUE COM O ROLO.", "Passe pela faixa na ordem indicada; a próxima só acende quando a anterior estiver completa.", { rollerRows: 6, rollerColumns: 16, rollerOrdered: true, rollerDirection: "alternate", rollerPattern: "zigzag", rollerColor: "#57AFC1" }),
  paintRoller(5, "PINTE SETE FAIXAS ALTERNANDO O SENTIDO.", "Uma faixa começa à esquerda, a seguinte começa à direita. Cubra todas por inteiro.", { rollerRows: 7, rollerColumns: 18, rollerOrdered: true, rollerDirection: "alternate", rollerPattern: "straight", rollerColor: "#6DBB75" }),
  paintRoller(6, "DOMINE O ROLO NAS FAIXAS ESTREITAS.", "Mantenha o rolo dentro da faixa e avance de cima para baixo, sem pular nenhuma.", { rollerRows: 8, rollerColumns: 18, rollerOrdered: true, rollerDirection: "alternate", rollerPattern: "zigzag", rollerColor: "#4B91D1" }),
  paintRoller(7, "COMPLETE O GRANDE MURAL COM O ROLO.", "Cubra as oito faixas estreitas na ordem, alternando o sentido e seguindo o zigue-zague.", { rollerRows: 8, rollerColumns: 20, rollerOrdered: true, rollerDirection: "alternate", rollerPattern: "zigzag", rollerColor: "#D8689A" }),
];
const GARATUJA_FINAL_CHALLENGE: GameQuestion[] = [
  { ...seedRain(7, "ACENDA A PRIMEIRA ESTRELA DO FESTIVAL DA LUMI.", "Trace toda a trilha de sementes para abrir o portão do jardim.", 10), id: "desafio-final-garat-01-sementes" },
  { ...lantern(7, "ILUMINE O MAPA E ENCONTRE OS SINAIS SECRETOS.", "Passe a luz com calma pelos quatro pontos escondidos.", 4), id: "desafio-final-garat-02-lanterna" },
  { ...sandTracks(7, "LEVE AS PEGADAS ATÉ A PRAIA DA FESTA.", "Siga os oito pontos sem pular a rota até chegar ao coqueiro.", 8), id: "desafio-final-garat-03-pegadas" },
  { ...mosquitoSweep(7, "PROTEJA A FRUTA DA FESTA.", "Afaste os oito mosquitos com gestos rápidos, sempre para longe da fruta.", 8), id: "desafio-final-garat-04-pomar" },
  { ...magnetPaint(7, "FORME O EMBLEMA DA LUMI COM O ÍMÃ.", "Acenda todos os pontos e deixe a forma magnética completa.", 8), id: "desafio-final-garat-05-ima" },
  { ...iceMelt(7, "DESCONGELE A SURPRESA DO FESTIVAL.", "Esfregue toda a imagem central até revelar por completo o sorvete.", "sorvete-morango", "Sorvete de morango"), id: "desafio-final-garat-06-gelo" },
  { ...paintRoller(7, "PINTE O GRANDE MURAL DE ENCERRAMENTO.", "Cubra as oito faixas na ordem, alternando o sentido e seguindo o zigue-zague.", { rollerRows: 8, rollerColumns: 20, rollerOrdered: true, rollerDirection: "alternate", rollerPattern: "zigzag", rollerColor: "#D8689A" }), id: "desafio-final-garat-07-mural" },
  { ...beeFlight(7, "GUIE A ABELHINHA DA LUMI ATÉ A COLMEIA FINAL.", "Siga os nove pontos da rota sem sair do caminho. Quando chegar à colmeia, o Festival termina.", 9), id: "desafio-final-garat-08-abelha" },
];

/** Um bloco exclusivo de 8 perguntas para cada fase (0..6) e para o final (7). */
export function getQuestionBank(worldId: number, phase: number): GameQuestion[] {
  if (worldId === 0 && phase === 0) return GARATUJA_PHASE_ONE;
  if (worldId === 0 && phase === 1) return GARATUJA_PHASE_TWO;
  if (worldId === 0 && phase === 2) return GARATUJA_PHASE_THREE;
  if (worldId === 0 && phase === 3) return GARATUJA_PHASE_FOUR;
  if (worldId === 0 && phase === 4) return GARATUJA_PHASE_FIVE;
  if (worldId === 0 && phase === 5) return GARATUJA_PHASE_SIX;
  if (worldId === 0 && phase === 6) return GARATUJA_PHASE_SEVEN;
  if (worldId === 0 && phase === 7) return GARATUJA_FINAL_CHALLENGE;
  if (worldId === 1 && phase === 0) return ALFABETO_PHASE_ONE;
  if (worldId === 2 && phase === 0) return PRE_SILABICO_PHASE_ONE;
  if (worldId === 3 && phase === 0) return SILABICO_PHASE_ONE;
  const bank = WORLD_QUESTION_BANKS[worldId] ?? WORLD_QUESTION_BANKS[0];
  const safePhase = Math.max(0, Math.min(7, phase));
  // O banco está agrupado por atividade (10 grupos de 8). Cada fase percorre
  // oito atividades consecutivas e usa a variação correspondente à fase.
  // Assim, as 10 atividades aparecem ao longo da trilha, sem repetir IDs.
  const selected = Array.from({ length: 8 }, (_, slot) => bank[((safePhase + slot) % 10) * 8 + safePhase]);
  return selected.map((question, index) => ({ ...question, id: `${safePhase === 7 ? "desafio-final" : `fase-${safePhase + 1}`}-${question.id}-${index}` }));
}

export const PLACEMENT_QUESTIONS: GameQuestion[] = [
  choice("nivel-abc-a", "QUAL É A LETRA A?", ["A", "M", "O"], "A", "PROCURE A LETRA A."), choice("nivel-abc-ordem", "QUAL LETRA VEM DEPOIS DE C?", ["B", "D", "E"], "D", "FALE: A, B, C, D."), choice("nivel-abc-inicial", "QUAL LETRA COMEÇA BOLA?", ["B", "P", "D"], "B", "O SOM INICIAL É BÊÊÊ."), choice("nivel-g-forma", "Qual forma é redonda?", ["○", "△", "□"], "○", "Procure a forma que parece uma bola."), choice("nivel-g-quantidade", "CONTE AS ESTRELAS ABAIXO.", ["2", "3", "4"], "3", "CONTE CADA ESTRELA.", "★ ★ ★"), choice("nivel-g-rabisco", "Qual desenho parece uma letra?", ["A", "☀", "○"], "A", "Uma letra pode fazer parte de uma palavra."), draw("nivel-g-risco", "FAÇA UM RISCO DE IDA E VOLTA.", "Use o dedo ou o mouse e faça um traço contínuo. Não precisa ficar perfeito.", "〰"), choice("nivel-p-letra", "Qual destes é uma letra?", ["8", "M", "△"], "M", "Letras servem para escrever."), choice("nivel-p-numero", "Qual destes é um número?", ["B", "7", "☁"], "7", "Números ajudam a contar."), choice("nivel-p-tamanho", "Qual palavra tem mais letras?", ["SOL", "BOLA", "BORBOLETA"], "BORBOLETA", "Compare o tamanho das palavras."), choice("nivel-s-inicio", "Qual sílaba começa BO-LA?", ["BO", "LA", "BA"], "BO", "Fale devagar: BO-LA."), choice("nivel-s-palmas", "Quantas sílabas tem CA-SA?", ["1", "2", "3"], "2", "Bata duas palmas: CA / SA."), order("nivel-s-monta", "COMO SE ESCREVE O NOME DO ANIMAL DA FIGURA?", ["TO", "PA"], "PATO", "OLHE PARA O ANIMAL E EXPERIMENTE AS SÍLABAS.", "🦆", "PATO"), choice("nivel-sa-completa", "Complete: CA _ A", ["S", "T", "P"], "S", "A palavra é CASA."), choice("nivel-sa-final", "Qual letra termina GATO?", ["A", "O", "T"], "O", "Olhe para o fim da palavra."), choice("nivel-sa-ditado", "Qual escrita corresponde a MESA?", ["MESA", "MEZA", "SEMA"], "MESA", "Procure M-E-S-A."), choice("nivel-a-frase", "Qual frase está escrita corretamente?", ["O gato dorme.", "gato O dorme.", "Dorme gato o."], "O gato dorme.", "Frases começam com maiúscula e terminam com ponto."), choice("nivel-a-rima", "Qual palavra rima com GATO?", ["PATO", "MESA", "LUA"], "PATO", "GATO e PATO terminam igual."), choice("nivel-a-problema", "João tinha 5 maçãs e comeu 2. Quantas sobraram?", ["2", "3", "4"], "3", "Comece com cinco e retire duas."), choice("nivel-o-rr", "Qual palavra está escrita corretamente?", ["CARRO", "CARO", "CARRU"], "CARRO", "O som forte de R no meio usa RR."), choice("nivel-o-cedilha", "Qual palavra está correta?", ["CORAÇÃO", "CORASÃO", "CORASAO"], "CORAÇÃO", "A cedilha faz som de S antes de A."), choice("nivel-o-acento", "Qual escrita está correta?", ["mamãe", "mamae", "mãmae"], "mamãe", "Observe o til e o acento."),
];
export function getPlacementWorld(score: number, total = PLACEMENT_QUESTIONS.length) { const percentage = total > 0 ? (score / total) * 100 : 0; if (percentage <= 20) return 0; if (percentage <= 35) return 1; if (percentage <= 50) return 2; if (percentage <= 65) return 3; if (percentage <= 80) return 4; if (percentage <= 92) return 5; return 6; }
