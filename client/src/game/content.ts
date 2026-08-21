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
  { id: 0, name: "Mundo do Alfabeto", shortName: "Alfabeto", theme: "Jardim das 26 chaves", color: "#2FAF88", accent: "#E7FFF6", icon: "ABC" },
  { id: 1, name: "Mundo da Garatuja", shortName: "Garatuja", theme: "Ateliê das primeiras marcas", color: "#70B9E8", accent: "#EEF9FF", icon: "✎" },
  { id: 2, name: "Mundo Pré-Silábico", shortName: "Pré-Silábico", theme: "Cidade das letras curiosas", color: "#F1A83B", accent: "#FFF5D8", icon: "A" },
  { id: 3, name: "Mundo Silábico", shortName: "Silábico", theme: "Ilhas que cantam sílabas", color: "#E86E73", accent: "#FFF0F1", icon: "SA" },
  { id: 4, name: "Mundo Silábico-Alfabético", shortName: "Sílaba + Letra", theme: "Montanha das palavras", color: "#9673D3", accent: "#F4F0FF", icon: "PA" },
  { id: 5, name: "Mundo Alfabético", shortName: "Alfabético", theme: "Céu das frases leitoras", color: "#35A281", accent: "#E9FFF7", icon: "LÊ" },
  { id: 6, name: "Mundo Ortográfico", shortName: "Ortográfico", theme: "Biblioteca dos sons especiais", color: "#416DCE", accent: "#EDF3FF", icon: "CH" },
];

const choice = (id: string, prompt: string, options: string[], answer: string, hint: string, visual?: string): GameQuestion => ({ id, kind: "choice", prompt, options, answer, hint, visual });
const order = (id: string, prompt: string, options: string[], answer: string, hint: string, visual?: string): GameQuestion => ({ id, kind: "order", prompt, options, answer, hint, visual });
const draw = (id: string, prompt: string, hint: string, visual?: string): GameQuestion => ({ id, kind: "draw", prompt, answer: "__drawing__", hint, visual });

/** Cada mundo oferece 20 descobertas. Uma fase sorteia 8, sem repetir a mesma página. */
const WORLD_QUESTION_BANKS: Record<number, GameQuestion[]> = {
  0: [
    choice("abc-a", "QUAL É A LETRA A?", ["A", "M", "O"], "A", "A PARECE UMA MONTANHA COM DUAS PERNAS."),
    choice("abc-b", "QUAL LETRA COMEÇA BOLA?", ["B", "D", "P"], "B", "FAÇA O SOM BÊÊÊ."),
    choice("abc-c", "QUAL LETRA VEM DEPOIS DE B?", ["A", "C", "D"], "C", "CANTE: A, B, C."),
    order("abc-ordem-abc", "COLOQUE AS LETRAS NA ORDEM: A B C.", ["C", "A", "B"], "ABC", "A VEM PRIMEIRO, B VEM DEPOIS E C FECHA A FILA."),
    choice("abc-d", "QUAL É A LETRA D?", ["O", "D", "Q"], "D", "D TEM UMA BARRIGA REDONDA DO LADO DIREITO."),
    choice("abc-e", "QUAL LETRA COMEÇA ELEFANTE?", ["E", "F", "L"], "E", "ELEFANTE COMEÇA COM O SOM ÊÊÊ." , "🐘"),
    choice("abc-vogal", "QUAL DESTAS É UMA VOGAL?", ["A", "T", "R"], "A", "AS VOGAIS SÃO A, E, I, O E U."),
    choice("abc-f", "QUAL LETRA TEM O MESMO SOM INICIAL DE FADA?", ["F", "V", "P"], "F", "FADA COMEÇA COM FFFFF." , "🧚"),
    order("abc-gato", "MONTE A PALAVRA GATO COM AS LETRAS.", ["O", "G", "A", "T"], "GATO", "COMECE PELA LETRA G." , "🐱"),
    choice("abc-h", "QUAL LETRA VEM ANTES DE I?", ["G", "H", "J"], "H", "Fale: G, H, I."),
    choice("abc-i", "QUAL É A LETRA I?", ["I", "L", "T"], "I", "I É UMA LETRA RETINHA."),
    choice("abc-j", "QUAL LETRA COMEÇA JANELA?", ["J", "G", "L"], "J", "JANELA COMEÇA COM JJJJ." , "🪟"),
    choice("abc-k", "QUAL GRUPO ESTÁ EM ORDEM ALFABÉTICA?", ["A B C", "C B A", "B A C"], "A B C", "A FILA DO ALFABETO COMEÇA A, B, C."),
    choice("abc-l", "QUAL LETRA COMEÇA LUZ?", ["L", "U", "Z"], "L", "LUZ COMEÇA COM LLLL." , "💡"),
    choice("abc-m", "QUAL É A LETRA M?", ["M", "W", "N"], "M", "M PARECE DUAS MONTANHAS JUNTAS."),
    choice("abc-n", "QUAL LETRA VEM DEPOIS DE M?", ["L", "N", "O"], "N", "Fale: L, M, N."),
    choice("abc-o", "QUAL LETRA TEM FORMATO REDONDO?", ["O", "X", "V"], "O", "O PARECE UM CÍRCULO."),
    choice("abc-p", "QUAL LETRA COMEÇA PATO?", ["P", "B", "T"], "P", "PATO COMEÇA COM PPPP." , "🦆"),
    choice("abc-q", "QUAL LETRA VEM DEPOIS DE P?", ["O", "Q", "R"], "Q", "Fale: O, P, Q."),
    draw("abc-desenhe", "DESENHE OU ESCREVA A PRIMEIRA LETRA DO SEU NOME.", "CADA LETRA É UMA CHAVE PARA UMA NOVA AVENTURA.", "✎"),
  ],
  1: [
    draw("g-desenhe-sol", "Desenhe um sol para iluminar a trilha.", "Use o dedo ou o mouse. O seu desenho vai para o portfólio.", "☀️"),
    choice("g-conte-3", "Quantas bolinhas azuis você vê?", ["2", "3", "4"], "3", "Aponte uma bolinha de cada vez.", "🔵 🔵 🔵"),
    choice("g-circulo", "Qual forma é redonda como uma bola?", ["△", "○", "□"], "○", "Pense em uma bola bem redondinha."),
    choice("g-reto", "Qual traço parece uma estrada retinha?", ["〰", "—", "⌇"], "—", "Uma estrada reta não faz ondas."),
    choice("g-rabisco-letra", "Qual rabisco parece uma letra?", ["A", "☁", "○"], "A", "As letras têm partes que podemos usar para escrever."),
    choice("g-conte-estrelas", "Quantas estrelas estão no céu?", ["4", "5", "6"], "5", "Conte as estrelas devagar.", "★ ★ ★ ★ ★"),
    choice("g-quadrado", "Qual forma tem quatro lados iguais?", ["○", "□", "△"], "□", "Olhe para os quatro ladinhos."),
    draw("g-desenhe-peixe", "Desenhe um peixe para o lago da Lumi.", "Pode ser do jeito que você imaginar.", "🐟"),
    choice("g-triangulo", "Qual forma tem três pontas?", ["□", "△", "○"], "△", "Conte as pontinhas: uma, duas, três."),
    choice("g-mais-bolinhas", "Em qual grupo há mais bolinhas?", ["●●", "●●●●", "●"], "●●●●", "Conte cada grupo antes de escolher."),
    choice("g-soma-1-2", "Quantas frutas ficam juntas?", ["2", "3", "4"], "3", "Uma fruta e mais duas frutas.", "🍎 + 🍎 🍎"),
    choice("g-desenho", "Qual é um desenho de verdade?", ["☀", "A", "3"], "☀", "Desenhos mostram coisas que vemos no mundo."),
    choice("g-cor-forma", "Qual forma parece uma janela?", ["□", "○", "△"], "□", "Uma janela costuma ter quatro lados."),
    order("g-sol", "Toque nas letras para montar SOL.", ["O", "S", "L"], "SOL", "O astro amarelo do dia se chama SOL.", "☀️"),
    choice("g-conte-4", "Quantos peixinhos nadam aqui?", ["3", "4", "5"], "4", "Conte sem pular nenhum.", "🐟 🐟 🐟 🐟"),
    choice("g-ondulado", "Qual traço faz ondas?", ["—", "〰", "|"], "〰", "Olhe para o traço que sobe e desce."),
    draw("g-nome", "Faça a sua marca ou tente desenhar seu nome.", "Não precisa ficar perfeito. Cada marca conta uma história.", "✎"),
    choice("g-dupla-forma", "Qual forma combina com este triângulo?", ["△", "○", "□"], "△", "Procure a figura com as mesmas três pontas.", "△"),
    choice("g-menor-grupo", "Qual grupo tem menos estrelas?", ["★★★", "★", "★★★★★"], "★", "Menos quer dizer a menor quantidade."),
    choice("g-numero-2", "Qual símbolo mostra duas coisas?", ["1", "2", "A"], "2", "Os números nos ajudam a contar."),
  ],
  2: [
    choice("p-letra-numero", "Qual destes é uma letra?", ["7", "M", "◇"], "M", "Letras ajudam a formar palavras."),
    choice("p-numero", "Qual destes é um número?", ["B", "4", "☀"], "4", "Números ajudam a contar."),
    choice("p-inicial-nome", "Qual letra pode começar o nome LIA?", ["L", "I", "A"], "L", "O primeiro som é LLL."),
    choice("p-poucas-letras", "Qual palavra tem menos letras?", ["SOL", "BORBOLETA", "ELEFANTE"], "SOL", "Conte os pedacinhos escritos."),
    choice("p-muitas-letras", "Qual palavra tem muitas letras?", ["PÉ", "BOLA", "BORBOLETA"], "BORBOLETA", "Compare o tamanho das palavras."),
    choice("p-nome-animal", "Qual pode ser o nome deste animal?", ["GATO", "MESA", "LUA"], "GATO", "Olhe para o bichinho e escolha seu nome.", "🐱"),
    order("p-torre-letras", "Monte uma torre só com as letras de BOLA.", ["A", "B", "O", "L"], "BOLA", "Letras juntas podem virar uma palavra."),
    choice("p-conte-letras-sol", "Quantas letras você vê em SOL?", ["2", "3", "4"], "3", "Conte S, O e L."),
    choice("p-forma-escondida", "Qual forma está escondida nesta janela?", ["△", "□", "○"], "□", "A janela tem quatro lados.", "▣"),
    choice("p-blocos-2-1", "Com dois blocos e mais um bloco, quantos há?", ["2", "3", "4"], "3", "Junte os blocos.", "🧱 🧱 + 🧱"),
    choice("p-letra-a", "Qual destes é a letra A?", ["A", "8", "△"], "A", "Ela parece uma montanha com dois lados."),
    choice("p-numero-5", "Qual destes é o número cinco?", ["S", "5", "E"], "5", "Veja o símbolo usado para contar cinco coisas."),
    choice("p-primeira-bola", "Qual letra aparece primeiro em BOLA?", ["B", "O", "A"], "B", "Leia olhando da esquerda para a direita."),
    choice("p-letras-gato", "Quantas letras tem GATO?", ["3", "4", "5"], "4", "Conte G, A, T, O."),
    choice("p-desenho-ou-palavra", "Qual é uma palavra escrita?", ["🍎", "BOLA", "3"], "BOLA", "Palavras são feitas de letras."),
    order("p-sapo", "Organize as letras para formar SAPO.", ["P", "A", "S", "O"], "SAPO", "É um animal que pula.", "🐸"),
    choice("p-quais-letras", "Qual grupo tem somente letras?", ["A B C", "2 4 6", "○ △ □"], "A B C", "Letras não são números nem desenhos."),
    choice("p-quantidade-6", "Qual grupo tem seis bolinhas?", ["●●●●●", "●●●●●●", "●●●●"], "●●●●●●", "Conte uma por uma."),
    choice("p-inicial-pato", "Qual letra abre a palavra PATO?", ["P", "T", "O"], "P", "O som inicial é PPP."),
    choice("p-ordem-abc", "Qual letra vem depois de C?", ["B", "D", "E"], "D", "Fale: A, B, C, D."),
  ],
  3: [
    choice("s-primeira-pato", "Qual sílaba começa PATO?", ["PA", "TO", "TA"], "PA", "Fale em duas partes: PA-TO.", "🦆"),
    choice("s-completa-bola", "Complete: BO ___", ["LA", "LI", "LU"], "LA", "O brinquedo redondo é BO-LA.", "⚽"),
    choice("s-casa-partes", "Quantas sílabas tem CA-SA?", ["1", "2", "3"], "2", "Bata duas palmas: CA / SA."),
    order("s-pato", "Monte a palavra com as sílabas.", ["TO", "PA"], "PATO", "Comece pela sílaba PA.", "🦆"),
    order("s-ma", "Junte a consoante e a vogal para formar MA.", ["A", "M"], "MA", "M com A faz MA."),
    choice("s-primeira-bola", "Qual parte vem primeiro em BO-LA?", ["BO", "LA", "BA"], "BO", "A primeira palma é BO."),
    choice("s-elefante", "Quantas palmas damos para E-LE-FAN-TE?", ["3", "4", "5"], "4", "Diga bem devagar as quatro partes."),
    order("s-bola", "Coloque as sílabas na ordem certa.", ["LA", "BO"], "BOLA", "A palavra começa com BO.", "⚽"),
    choice("s-rima", "Qual palavra termina como BOLA?", ["MALA", "SAPO", "DADO"], "MALA", "BOLA e MALA terminam com LA."),
    choice("s-gato", "Complete: GA ___", ["TO", "TA", "TU"], "TO", "O animal que mia é GA-TO.", "🐱"),
    choice("s-duas-palmas", "Qual palavra tem duas sílabas?", ["CASA", "BORBOLETA", "PÉ"], "CASA", "CA-SA tem duas palmas."),
    order("s-sapo", "Monte SA-PO.", ["PO", "SA"], "SAPO", "Comece por SA.", "🐸"),
    choice("s-vogal-ma", "Qual vogal completa M_ para formar MA?", ["A", "E", "O"], "A", "O som é MAAA."),
    choice("s-tesouro", "Quantas sílabas tem a palavra TESOURO?", ["2", "3", "4"], "3", "TE / SOU / RO: três palmas."),
    choice("s-final-casa", "Qual sílaba fica no final de CA-SA?", ["CA", "SA", "SO"], "SA", "A última palma é SA."),
    order("s-lata", "Organize as sílabas para formar LATA.", ["TA", "LA"], "LATA", "Comece por LA."),
    choice("s-quantas-bola", "Quantas sílabas tem BO-LA?", ["1", "2", "3"], "2", "BO e LA são duas partes."),
    choice("s-inicial-mesa", "Qual sílaba começa MESA?", ["ME", "SA", "MA"], "ME", "Diga ME-SA."),
    order("s-cama", "Forme a palavra CAMA.", ["MA", "CA"], "CAMA", "Comece por CA."),
    choice("s-silaba-ca", "Qual palavra começa com CA?", ["CASA", "BOLA", "MALA"], "CASA", "CA é a primeira parte de CASA."),
  ],
  4: [
    choice("sa-casa", "Complete a palavra: CA _ A", ["S", "T", "P"], "S", "É o lugar em que moramos: CASA.", "🏠"),
    order("sa-gato", "Monte a palavra GATO.", ["T", "G", "A", "O"], "GATO", "O animal faz miau.", "🐱"),
    choice("sa-vogal", "Qual destas letras é uma vogal?", ["E", "M", "R"], "E", "As vogais fazem sons que podemos cantar."),
    choice("sa-final-pato", "Qual letra termina PATO?", ["A", "O", "T"], "O", "Olhe para a última letra escrita."),
    choice("sa-ditado", "Qual escrita combina com a palavra falada GATO?", ["GATO", "GOTA", "TACO"], "GATO", "Procure G-A-T-O."),
    choice("sa-soma-gatos", "Três gatos e mais dois gatos são quantos?", ["4", "5", "6"], "5", "Junte três e dois.", "🐱🐱🐱 + 🐱🐱"),
    choice("sa-conserte", "A palavra CASA está assim: CAA. Qual letra falta?", ["S", "M", "L"], "S", "Coloque S para formar CASA."),
    order("sa-mesa", "Organize as letras para formar MESA.", ["A", "M", "S", "E"], "MESA", "É o móvel onde podemos comer."),
    choice("sa-sapato", "Quantas partes tem SA-PA-TO?", ["2", "3", "4"], "3", "Dê três palmas."),
    choice("sa-inicial-lua", "Que letra começa LUA?", ["L", "U", "A"], "L", "O primeiro som é LLL."),
    choice("sa-rato", "Complete: RA _ O", ["T", "C", "P"], "T", "É um bichinho pequeno: RATO."),
    order("sa-pato", "Monte PATO com as letras.", ["O", "P", "A", "T"], "PATO", "A palavra começa com P."),
    choice("sa-consoante", "Qual destas é uma consoante?", ["A", "I", "B"], "B", "Consoantes se juntam às vogais."),
    choice("sa-dado", "Qual palavra começa e termina com a mesma letra?", ["DADO", "GATO", "BOLA"], "DADO", "Veja D no início e no fim."),
    choice("sa-subtracao", "Cinco flores menos duas flores deixam quantas?", ["2", "3", "4"], "3", "Comece no cinco e tire duas.", "🌸🌸🌸🌸🌸 − 🌸🌸"),
    order("sa-bolo", "Organize B-O-L-O.", ["O", "B", "L", "O"], "BOLO", "É uma comida gostosa."),
    choice("sa-escrita", "Qual escrita está certa para MALA?", ["MALA", "MALL", "MLA"], "MALA", "A palavra tem quatro letras."),
    choice("sa-vogal-final", "Qual vogal termina a palavra MESA?", ["A", "E", "O"], "A", "Leia ME-SA."),
    order("sa-sapo", "Monte a palavra SAPO.", ["O", "S", "A", "P"], "SAPO", "O animal pula no lago."),
    choice("sa-fruta", "Qual letra falta em _VA para formar UVA?", ["U", "A", "E"], "U", "A fruta começa com U."),
  ],
  5: [
    order("a-flor", "Organize as letras para formar FLOR.", ["R", "F", "O", "L"], "FLOR", "É algo que nasce no jardim.", "🌸"),
    choice("a-frase", "Qual frase está escrita do jeito certo?", ["O gato dorme.", "gato O dorme.", "Dorme gato o."], "O gato dorme.", "Frases começam com letra maiúscula e terminam com ponto."),
    choice("a-rima", "Qual palavra rima com GATO?", ["PATO", "MESA", "LUA"], "PATO", "As duas terminam com o som ATO."),
    choice("a-leitura", "Complete a frase: O ___ comeu a banana.", ["macaco", "janela", "livro"], "macaco", "Quem pode comer uma banana?"),
    choice("a-problema", "João tinha 5 maçãs e comeu 2. Quantas sobraram?", ["2", "3", "4"], "3", "Tire duas maçãs de cinco."),
    order("a-gato", "Monte GATO com as letras embaralhadas.", ["T", "A", "O", "G"], "GATO", "Leia a palavra do animal que mia."),
    choice("a-silabas", "Quantas sílabas tem BOR-BO-LE-TA?", ["3", "4", "5"], "4", "Bata quatro palmas."),
    choice("a-secreta", "A palavra secreta é _OLA, uma coisa redonda. Qual letra falta?", ["B", "M", "P"], "B", "BOLA começa com B."),
    choice("a-alfabeto", "Qual letra vem antes de M?", ["L", "N", "O"], "L", "Fale: K, L, M."),
    choice("a-frase-ponto", "Qual frase precisa de ponto no final?", ["Eu li um livro", "Qual é seu nome?", "Que legal!"], "Eu li um livro", "Uma frase que conta algo termina com ponto."),
    order("a-mesa", "Forme a palavra MESA.", ["S", "A", "M", "E"], "MESA", "É onde colocamos o prato."),
    choice("a-rima-lua", "Qual palavra rima com LUA?", ["RUA", "SOL", "PÉ"], "RUA", "LUA e RUA terminam com UA."),
    choice("a-subtracao", "Quanto é 9 menos 5?", ["3", "4", "5"], "4", "Dê cinco pulinhos para trás a partir do nove."),
    choice("a-final", "Qual letra termina a palavra FLOR?", ["F", "R", "O"], "R", "Olhe para a última letra da palavra."),
    choice("a-frase-leitura", "Quem dorme na frase “O gato dorme”?", ["O gato", "O sono", "A cama"], "O gato", "Procure quem faz a ação de dormir."),
    order("a-livro", "Monte a palavra LIVRO.", ["R", "L", "I", "V", "O"], "LIVRO", "É o amigo das histórias."),
    choice("a-maior-palavra", "Qual palavra tem mais letras?", ["SOL", "BOLA", "BORBOLETA"], "BORBOLETA", "Compare o tamanho das palavras."),
    choice("a-continua", "Complete: A menina ___ um livro.", ["lê", "sol", "casa"], "lê", "Uma ação cabe na frase."),
    choice("a-soma", "Duas estrelas e quatro estrelas são quantas?", ["5", "6", "7"], "6", "Junte dois e quatro."),
    choice("a-ordem", "Qual frase está na ordem certa?", ["A bola rola.", "Rola a bola.", "Bola a rola."], "A bola rola.", "Procure quem faz a ação primeiro."),
  ],
  6: [
    choice("o-ch", "Qual palavra começa com CH?", ["CHAVE", "XÍCARA", "SAPO"], "CHAVE", "Faça o som de CH em chave."),
    choice("o-rr", "Qual palavra tem som forte de R no meio?", ["RATO", "CARRO", "BOLA"], "CARRO", "No meio de CARRO aparecem dois erres."),
    choice("o-ss", "Complete: PA__ARO", ["SS", "S", "Ç"], "SS", "A palavra é PÁSSARO."),
    choice("o-acento-avo", "Qual palavra fala da avó?", ["avó", "avô", "avo"], "avó", "O acento mostra o som final de vó."),
    choice("o-c-cedilha", "Complete: _ORAÇÃO", ["C", "Ç", "S"], "Ç", "A palavra começa com o som de coração."),
    choice("o-correcao", "Qual escrita está correta?", ["CASA", "CAZA", "CASSA"], "CASA", "Essa palavra é escrita com S."),
    choice("o-ninho", "Complete: NI___O", ["NH", "LH", "CH"], "NH", "A casa dos passarinhos é NINHO."),
    choice("o-m-final", "Qual palavra termina com M?", ["TAMBÉM", "TAMBEN", "TABEM"], "TAMBÉM", "No fim, ouvimos o som nasal de M."),
    choice("o-pergunta", "Qual sinal termina uma pergunta?", [".", "?", "!"], "?", "Perguntas terminam com um sinal de gancho."),
    choice("o-texto", "Qual frase deve vir primeiro em um bilhete?", ["Olá, amiga!", "Com carinho, Lia.", "Até amanhã."], "Olá, amiga!", "Um bilhete costuma começar cumprimentando."),
    choice("o-problema", "Cada livro custa 4 moedas. Com 10 moedas, quantos livros inteiros você compra?", ["1", "2", "3"], "2", "Dois livros custam oito moedas."),
    choice("o-r", "Complete: CA__O", ["R", "RR", "S"], "RR", "A palavra CARRO tem som forte de R no meio."),
    choice("o-s", "Qual palavra usa SS?", ["PASSO", "PASO", "PAÇO"], "PASSO", "O som de S forte no meio pode usar SS."),
    choice("o-acentuacao", "Qual escrita está correta?", ["mamãe", "mamae", "mãmae"], "mamãe", "O til e o acento mostram o som da palavra."),
    choice("o-cacador", "Encontre a palavra escrita com erro.", ["BOLA", "GATO", "CAXA"], "CAXA", "A palavra correta é CAIXA."),
    choice("o-familia", "Qual palavra é da família de CASA?", ["casinha", "cavalo", "caneta"], "casinha", "CASA e CASINHA têm a mesma raiz."),
    order("o-frase", "Organize para formar uma frase.", ["livro.", "um", "Eu", "li"], "Eu li um livro.", "A frase começa com Eu."),
    choice("o-pontuacao", "Qual frase está pontuada corretamente?", ["Que dia lindo!", "Que dia lindo.", "Que dia lindo?"], "Que dia lindo!", "Uma exclamação mostra entusiasmo."),
    choice("o-c-cedilha-2", "Qual palavra usa Ç?", ["CORAÇÃO", "CORASÃO", "CORASAO"], "CORAÇÃO", "A cedilha faz o som de S antes de A."),
    choice("o-mensagem", "Qual palavra está correta para uma mensagem?", ["obrigado", "obrigadu", "obrigato"], "obrigado", "Leia com atenção o final da palavra."),
  ],
};

export function getQuestionBank(worldId: number, phase: number): GameQuestion[] {
  const phaseTag = phase === 7 ? "desafio" : `fase-${phase + 1}`;
  const bank = WORLD_QUESTION_BANKS[worldId] ?? WORLD_QUESTION_BANKS[0];
  const start = (phase * 3) % bank.length;
  const rotated = [...bank.slice(start), ...bank.slice(0, start)];
  return rotated.map((question, index) => ({ ...question, id: `${phaseTag}-${question.id}-${index}` }));
}

/**
 * O nivelamento é progressivo: sete blocos curtos observam letras, marcas,
 * sílabas, palavras, leitura e ortografia sem impedir a trilha do alfabeto.
 */
export const PLACEMENT_QUESTIONS: GameQuestion[] = [
  choice("nivel-abc-a", "QUAL É A LETRA A?", ["A", "M", "O"], "A", "PROCURE A LETRA A."),
  choice("nivel-abc-ordem", "QUAL LETRA VEM DEPOIS DE C?", ["B", "D", "E"], "D", "FALE: A, B, C, D."),
  choice("nivel-abc-inicial", "QUAL LETRA COMEÇA BOLA?", ["B", "P", "D"], "B", "O SOM INICIAL É BÊÊÊ."),
  choice("nivel-g-forma", "Qual forma é redonda?", ["○", "△", "□"], "○", "Procure a forma que parece uma bola."),
  choice("nivel-g-quantidade", "CONTE AS ESTRELAS ABAIXO.", ["2", "3", "4"], "3", "CONTE CADA ESTRELA.", "★ ★ ★"),
  choice("nivel-g-rabisco", "Qual desenho parece uma letra?", ["A", "☀", "○"], "A", "Uma letra pode fazer parte de uma palavra."),
  choice("nivel-p-letra", "Qual destes é uma letra?", ["8", "M", "△"], "M", "Letras servem para escrever."),
  choice("nivel-p-numero", "Qual destes é um número?", ["B", "7", "☁"], "7", "Números ajudam a contar."),
  choice("nivel-p-tamanho", "Qual palavra tem mais letras?", ["SOL", "BOLA", "BORBOLETA"], "BORBOLETA", "Compare o tamanho das palavras."),
  choice("nivel-s-inicio", "Qual sílaba começa BO-LA?", ["BO", "LA", "BA"], "BO", "Fale devagar: BO-LA."),
  choice("nivel-s-palmas", "Quantas sílabas tem CA-SA?", ["1", "2", "3"], "2", "Bata duas palmas: CA / SA."),
  order("nivel-s-monta", "Monte a palavra PATO com as sílabas.", ["TO", "PA"], "PATO", "Comece pela sílaba PA."),
  choice("nivel-sa-completa", "Complete: CA _ A", ["S", "T", "P"], "S", "A palavra é CASA."),
  choice("nivel-sa-final", "Qual letra termina GATO?", ["A", "O", "T"], "O", "Olhe para o fim da palavra."),
  choice("nivel-sa-ditado", "Qual escrita corresponde a MESA?", ["MESA", "MEZA", "SEMA"], "MESA", "Procure M-E-S-A."),
  choice("nivel-a-frase", "Qual frase está escrita corretamente?", ["O gato dorme.", "gato O dorme.", "Dorme gato o."], "O gato dorme.", "Frases começam com maiúscula e terminam com ponto."),
  choice("nivel-a-rima", "Qual palavra rima com GATO?", ["PATO", "MESA", "LUA"], "PATO", "GATO e PATO terminam igual."),
  choice("nivel-a-problema", "João tinha 5 maçãs e comeu 2. Quantas sobraram?", ["2", "3", "4"], "3", "Comece com cinco e retire duas."),
  choice("nivel-o-rr", "Qual palavra está escrita corretamente?", ["CARRO", "CARO", "CARRU"], "CARRO", "O som forte de R no meio usa RR."),
  choice("nivel-o-cedilha", "Qual palavra está correta?", ["CORAÇÃO", "CORASÃO", "CORASAO"], "CORAÇÃO", "A cedilha faz som de S antes de A."),
  choice("nivel-o-acento", "Qual escrita está correta?", ["mamãe", "mamae", "mãmae"], "mamãe", "Observe o til e o acento."),
];
