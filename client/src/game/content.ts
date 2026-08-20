/**
 * Design reminder — Livro-Mapa Encantado: conteúdo curto, positivo e legível;
 * cores de guache sobre papel claro; toda pergunta deve parecer uma descoberta.
 */

export const ASSETS = {
  forest: "/manus-storage/floresta-livro-fundo_13d81f22.png",
  mascot: "/manus-storage/mascote-lumi_8d8abb75.png",
  logo: "/manus-storage/logo-aventura-simbolo_5ffaf790.png",
  rewards: "/manus-storage/recompensas-aventura_7af48267.png",
} as const;

export type QuestionKind = "choice" | "order" | "draw";

export type GameQuestion = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  options?: string[];
  answer: string;
  hint: string;
  visual?: string;
};

export type World = {
  id: number;
  name: string;
  shortName: string;
  theme: string;
  color: string;
  accent: string;
  icon: string;
};

export const WORLDS: World[] = [
  { id: 0, name: "Mundo da Garatuja", shortName: "Garatuja", theme: "Ateliê das primeiras marcas", color: "#70B9E8", accent: "#EEF9FF", icon: "✎" },
  { id: 1, name: "Mundo Pré-Silábico", shortName: "Pré-Silábico", theme: "Jardim das letras curiosas", color: "#F1A83B", accent: "#FFF5D8", icon: "A" },
  { id: 2, name: "Mundo Silábico", shortName: "Silábico", theme: "Ilhas que cantam sílabas", color: "#E86E73", accent: "#FFF0F1", icon: "SA" },
  { id: 3, name: "Mundo Silábico-Alfabético", shortName: "Sílaba + Letra", theme: "Ponte das palavras inteiras", color: "#9673D3", accent: "#F4F0FF", icon: "PA" },
  { id: 4, name: "Mundo Alfabético", shortName: "Alfabético", theme: "Bosque das frases leitoras", color: "#35A281", accent: "#E9FFF7", icon: "ABC" },
  { id: 5, name: "Mundo Ortográfico", shortName: "Ortográfico", theme: "Observatório dos sons especiais", color: "#416DCE", accent: "#EDF3FF", icon: "CH" },
];

const choice = (id: string, prompt: string, options: string[], answer: string, hint: string, visual?: string): GameQuestion => ({ id, kind: "choice", prompt, options, answer, hint, visual });
const order = (id: string, prompt: string, options: string[], answer: string, hint: string, visual?: string): GameQuestion => ({ id, kind: "order", prompt, options, answer, hint, visual });

export function getQuestionBank(worldId: number, phase: number): GameQuestion[] {
  const common: GameQuestion[] = [
    choice("vogal-a", "Qual destas letras é uma vogal?", ["A", "B", "T"], "A", "As vogais fazem sons que podemos cantar: A, E, I, O, U."),
    choice("numero-7", "Qual símbolo é um número?", ["M", "7", "□"], "7", "Os números nos ajudam a contar as coisas."),
    choice("forma-circulo", "Qual forma é redonda como uma bola?", ["△", "○", "□"], "○", "Pense na forma de uma bola bem redondinha."),
    choice("conta-3-2", "Resolva a continha com atenção.", ["4", "5", "6"], "5", "Conte três e depois mais dois.", "🍎 🍎 🍎  +  🍎 🍎"),
    choice("primeira-bola", "Qual letra começa a palavra BOLA?", ["B", "D", "P"], "B", "Diga devagar: B-b-bola. Qual som aparece primeiro?", "⚽"),
    order("sol", "Arraste ou toque nas letras para formar a palavra do desenho.", ["S", "O", "L"], "SOL", "O astro amarelo se chama SOL.", "☀️"),
    choice("conta-7-4", "Quantos ficam depois de tirar quatro?", ["2", "3", "4"], "3", "Comece no sete e dê quatro pulinhos para trás.", "🐟 🐟 🐟 🐟 🐟 🐟 🐟  −  🐟 🐟 🐟 🐟"),
    choice("ultima-gato", "Qual é a última letra de GATO?", ["A", "O", "T"], "O", "Fale bem devagar: ga-to. Que letra você escuta no fim?", "🐱"),
    choice("consoante", "Qual destas letras é uma consoante?", ["I", "U", "M"], "M", "As consoantes precisam de uma vogal para formar uma sílaba."),
    order("lua", "Organize as letras para escrever o nome da imagem.", ["A", "U", "L"], "LUA", "A LUA aparece no céu quando a noite chega.", "🌙"),
    choice("forma-triangulo", "Qual forma tem três pontas?", ["□", "○", "△"], "△", "Conte as pontinhas: uma, duas, três."),
    choice("conta-1-4", "Quanto é 1 + 4?", ["4", "5", "6"], "5", "Imagine uma fruta e depois mais quatro frutas."),
  ];

  const advanced: Record<number, GameQuestion[]> = {
    0: [
      { id: "desenho", kind: "draw", prompt: "Faça um desenho livre de algo que começa com a letra A.", answer: "__drawing__", hint: "Pode ser um animal, um objeto ou uma comida. Use sua imaginação!", visual: "✏️" },
      choice("letra-ou-numero", "Qual é uma letra?", ["5", "R", "◇"], "R", "As letras ajudam a formar palavras."),
      choice("mais-estrela", "Em qual grupo há mais estrelas?", ["★★", "★★★★", "★"], "★★★★", "Conte cada grupo bem devagar."),
      choice("cor-azul", "Qual destes objetos tem a forma de um quadrado?", ["○", "□", "△"], "□", "Veja os quatro lados iguais."),
    ],
    1: [
      choice("nome-lapis", "Qual palavra pode ser o nome deste objeto?", ["LÁPIS", "SAPO", "BOLA"], "LÁPIS", "Começa com o som LÁ.", "✏️"),
      choice("letra-inicial-sapo", "Que letra abre a palavra SAPO?", ["S", "P", "O"], "S", "Faça o som SSSS de sapo deslizando."),
      choice("ordem-abc", "Qual letra vem depois de C no alfabeto?", ["B", "D", "E"], "D", "Fale: A, B, C... e continue."),
      choice("maior-grupo", "Qual grupo tem 6 bolinhas?", ["●●●●●", "●●●●●●", "●●●●"], "●●●●●●", "Conte apontando cada bolinha."),
    ],
    2: [
      choice("silaba-pa", "Qual sílaba você escuta no começo de PATO?", ["PA", "TO", "TA"], "PA", "Fale em duas partes: PA-TO.", "🦆"),
      choice("silaba-bo", "Complete: BO ___", ["LA", "LI", "LU"], "LA", "A palavra é o brinquedo redondo: BO-LA.", "⚽"),
      choice("duas-silabas", "Quantas partes tem a palavra CA-SA?", ["1", "2", "3"], "2", "Bata palmas: CA / SA."),
      order("pato", "Monte a palavra usando as sílabas.", ["TO", "PA"], "PATO", "Comece pela sílaba que ouvimos no início: PA.", "🦆"),
    ],
    3: [
      choice("falta-rato", "Complete a palavra: RA ___", ["TO", "TA", "TE"], "TO", "É um bichinho pequeno: RA-TO.", "🐭"),
      order("casa", "Junte as letras para formar a palavra.", ["S", "A", "C", "A"], "CASA", "É o lugar onde a gente mora.", "🏠"),
      choice("som-final", "Qual palavra termina com o mesmo som de BOLA?", ["MALA", "SAPO", "DADO"], "MALA", "BOLA e MALA terminam com o som LA."),
      choice("soma-4-3", "Quanto é 4 + 3?", ["6", "7", "8"], "7", "Junte quatro blocos e mais três blocos."),
    ],
    4: [
      order("flor", "Coloque as letras em ordem para formar a palavra.", ["R", "F", "O", "L"], "FLOR", "Pense no que nasce no jardim.", "🌸"),
      choice("frase", "Qual frase está escrita do jeito certo?", ["O gato dorme.", "gato O dorme.", "Dorme gato o."], "O gato dorme.", "A frase começa com letra maiúscula e termina com ponto."),
      choice("subtracao-9-5", "Quanto é 9 − 5?", ["3", "4", "5"], "4", "Dê cinco passinhos para trás começando no nove."),
      choice("alfabeto-m", "Qual letra vem antes de M?", ["L", "N", "O"], "L", "Fale o alfabeto perto dessa parte: K, L, M."),
    ],
    5: [
      choice("chave-ch", "Qual palavra começa com CH?", ["CHAVE", "XÍCARA", "SAPO"], "CHAVE", "Faça o som de CH em chave."),
      choice("nh", "Complete: NI ___ O", ["NHO", "LHO", "MHO"], "NHO", "A palavra é NINHO.", "🪺"),
      choice("rr", "Qual palavra tem o som forte de R?", ["RATO", "CARRO", "BOLA"], "CARRO", "No meio de CARRO aparecem dois erres."),
      choice("pontuacao", "Qual sinal usamos no fim de uma pergunta?", [".", "?", "!"], "?", "Perguntas terminam com um sinal que parece um anzol."),
    ],
  };

  const extras = advanced[worldId] ?? advanced[0];
  const phaseTag = phase === 7 ? "desafio" : `fase-${phase + 1}`;
  return [...common, ...extras].map((question, index) => ({ ...question, id: `${phaseTag}-${question.id}-${index}` }));
}

export const PLACEMENT_QUESTIONS: GameQuestion[] = [
  choice("nivel-a", "Qual letra é A?", ["A", "M", "S"], "A", "Procure a letra que parece uma montanha."),
  choice("nivel-silaba", "Qual pedacinho começa a palavra BOLA?", ["BO", "LA", "BA"], "BO", "Fale devagar: BO-LA."),
  choice("nivel-frase", "Qual palavra está escrita corretamente?", ["CASA", "KAZA", "CZA"], "CASA", "É o lugar onde moramos."),
];

