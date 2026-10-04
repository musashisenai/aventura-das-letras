# Estratégia de produção por atividade-matriz

## Diretriz oficial

A partir deste documento, o projeto será produzido pelo ciclo:

> **Matriz → planejamento das 8 variações → implementação em lote → teste → refinamento → acesso no painel de desenvolvedor → commit**

A regra não altera as atividades já aprovadas. Ela orienta a evolução futura e a análise das cinco fases existentes.

## Escopo analisado

As cinco fases já implementadas são as fases 1 a 5 do **Mundo da Garatuja**. Cada fase já possui uma mecânica principal reutilizável e oito registros de conteúdo.

### Fase 1 — Chuva de Sementes

**Atividade-matriz:** traçar caminhos contínuos para fazer a terra florescer.

**O que já funciona e será reaproveitado:** canvas de toque, cobertura de pontos, crescimento visual das plantas, progressão por cobertura e feedback de conclusão.

**Diagnóstico:** a progressão atual de 3 a 10 pontos já cria aumento de dificuldade. A evolução futura deve variar também geometria, ramificação e necessidade de precisão, não apenas a quantidade.

**Plano das 8 variações:**

1. Introdução: um caminho curto, largo e direto.
2. Familiarização: caminho curvo com pontos espaçados.
3. Variação: dois caminhos que se encontram.
4. Desafio: caminho mais estreito e com mudança de direção.
5. Surpresa: bifurcação; somente um ramo faz a planta crescer.
6. Combinação: dois canteiros precisam ser cobertos na ordem correta.
7. Domínio: trilha sinuosa com pontos menores e menos tolerância.
8. Desafio final: jardim com caminhos conectados, sequência e cobertura mínima.

### Fase 2 — Dedos de Lanterna

**Atividade-matriz:** mover uma área de luz para revelar objetos escondidos.

**O que já funciona e será reaproveitado:** canvas de máscara, luz circular, objetos reveláveis, contador de descobertas e estados de conclusão.

**Diagnóstico:** os alvos atuais evoluem de 2 a 4, mas as mudanças de experiência ainda dependem principalmente da quantidade.

**Plano das 8 variações:**

1. Introdução: dois objetos grandes e imóveis.
2. Familiarização: dois objetos em regiões opostas.
3. Variação: três objetos com posições assimétricas.
4. Desafio: quatro objetos menores e maior área escura.
5. Surpresa: brilhos distratores que não contam.
6. Combinação: memorizar a ordem de descoberta e repetir a sequência.
7. Domínio: objetos que mudam lentamente de posição enquanto a lanterna se move.
8. Desafio final: quatro descobertas, distratores, ordem e tempo amplo, sem perder acessibilidade.

### Fase 3 — Pegadas na Areia

**Atividade-matriz:** seguir uma rota com o dedo e criar pegadas até o destino.

**O que já funciona e será reaproveitado:** canvas de desenho, checkpoints, pegadas com direção, cenário de praia, rota e feedback final.

**Diagnóstico:** os oito registros atuais usam o mesmo enunciado e variam essencialmente de 5 a 8 marcas. Esta é a fase que mais precisa de planejamento de variações, sem trocar sua mecânica central.

**Plano das 8 variações:**

1. Introdução: rota reta com cinco marcas grandes.
2. Familiarização: curva simples com seis marcas.
3. Variação: rota em ondas com sete marcas.
4. Desafio: zigue-zague com pontos menores.
5. Surpresa: duas rotas visíveis, apenas uma chega ao coqueiro.
6. Combinação: passar por marcas em uma ordem indicada por cores.
7. Domínio: rota com curvas fechadas e tolerância menor.
8. Desafio final: caminho ramificado, distratores e chegada obrigatória ao destino.

### Fase 4 — Espanta-Mosquitos

**Atividade-matriz:** iniciar perto de um inseto e fazer um gesto rápido para afastá-lo da fruta.

**O que já funciona e será preservado:** visual minimalista, oito mosquitos obrigatórios por atividade, voo animado, colisão/gesto de afastamento, áudio com volume proporcional aos restantes, progresso, canvas/DOM sem geração de novos assets.

**Diagnóstico:** a exigência fixa de oito mosquitos está correta. As variações atuais mudam principalmente o texto e o layout, portanto a evolução deve ser adicionada por configuração sem alterar a regra central de remoção.

**Plano das 8 variações:**

1. Introdução: oito mosquitos lentos, bem separados e sem distratores.
2. Familiarização: oito trajetórias alternadas ao redor da fruta.
3. Variação: velocidades e direções diferentes por inseto.
4. Desafio: mosquitos mais próximos das bordas e trajetórias cruzadas.
5. Surpresa: uma área de proteção da fruta onde o gesto não pode terminar.
6. Combinação: afastar os oito insetos usando gestos em direções diferentes.
7. Domínio: voo mais irregular, alvos menores visualmente, mantendo área de toque acessível.
8. Desafio final: enxame com oito alvos, padrões de voo combinados e áudio desaparecendo progressivamente.

### Fase 5 — Pintura de Ímã

**Atividade-matriz:** conduzir uma ferradura magnética para atrair limalha e completar uma forma.

**O que já funciona e será preservado:** canvas otimizado, ferradura visível desde o início, partículas animadas, pontos magnéticos, guias geométricas, oito pontos por atividade, fundo verde, progresso e acesso no painel de desenvolvedor.

**Diagnóstico:** a matriz está aprovada. As oito versões atuais possuem três layouts e prompts distintos, mas devem evoluir também em regra, precisão, sequência e complexidade visual.

**Plano das 8 variações:**

1. Introdução: completar uma forma aberta com pontos grandes.
2. Familiarização: caminho curvo com partículas bem distribuídas.
3. Variação: fechar um círculo seguindo pontos em ordem livre.
4. Desafio: completar uma espiral sem abandonar a trajetória.
5. Surpresa: pontos de atração e partículas distratoras.
6. Combinação: seguir uma ordem indicada por cores enquanto forma a figura.
7. Domínio: estrela ou forma composta com maior precisão de aproximação.
8. Desafio final: forma completa com rota, ordem, distratores e recompensa visual final.

### Fase 7 — Rolo de Pintura Gigante

**Atividade-matriz:** conduzir um rolo pelas faixas de um mural para cobrir toda a área com tinta.

**O que foi implementado e será reaproveitado:** um único Canvas com cobertura por células, rolo visual acompanhado pelo ponteiro, progresso percentual, orientação de direção e conclusão somente após a cobertura integral.

**Plano das 8 variações implementado:**

1. Introdução: três faixas largas, movimento direto da esquerda para a direita.
2. Familiarização: quatro faixas largas, alternando o lado de início.
3. Variação: cinco faixas e ordem obrigatória de cima para baixo.
4. Desafio: seis faixas mais estreitas, ordem e alternância de direção.
5. Surpresa: seis faixas em guia de zigue-zague, com liberação sequencial.
6. Combinação: sete faixas, ordem obrigatória e sentidos alternados.
7. Domínio: oito faixas estreitas com guia de zigue-zague e tolerância visual menor.
8. Desafio final: mural com oito faixas, vinte células por faixa, ordem, alternância e zigue-zague.

### Mundo do Alfabeto · Fase 1 — Molde de Biscoito

**Atividade-matriz:** comparar o desenho de uma letra-alvo com fôrmas de biscoito e escolher a cópia visual correta.

**Objetivo pedagógico:** fortalecer a memorização do formato das letras, a diferenciação entre grafemas visualmente próximos e a atenção a maiúsculas e minúsculas.

**Plano das 8 variações implementado:**

1. Introdução: letra A grande, três fôrmas bem contrastantes e escolha direta.
2. Familiarização: letra B com distratores visualmente próximos, em disposição curva.
3. Variação: letra C contra O e G, exigindo perceber abertura e fechamento do contorno.
4. Desafio: letra M contra N e W, com disposição em grade e contraste de direção.
5. Variação: letra E contra F e L, exigindo observar as três barras horizontais.
6. Combinação: letra a minúscula contra o e e, exigindo comparar caixa e forma.
7. Domínio: letra R com mistura de caixa e quatro fôrmas, incluindo distrator minúsculo.
8. Desafio final: letra S com quatro opções, incluindo s minúsculo, Z e C como distratores de contorno.

**Regra preservada:** a resposta só é enviada depois que a criança escolhe uma fôrma e confirma o botão de assar; a mecânica permanece pareamento visual, sem transformar a atividade em digitação ou ordenação.

### Mundo Pré-Silábico · Fase 1 — O Escudo Mágico

**Atividade-matriz:** proteger somente os caracteres que são letras, separando escrita de números e símbolos.

**Objetivo pedagógico:** fortalecer a compreensão inicial de que letras formam palavras e pertencem a um sistema diferente de números, desenhos e outros sinais. A criança não precisa nomear todas as letras: ela classifica visualmente o que pode representar escrita.

**Mecânica aprovada:** a criança toca nos cartões de letras que chegam ao portão. Cartões numéricos e simbólicos são distratores, não contam para o progresso e recebem apenas um feedback visual breve. A fase conclui somente quando todas as letras da variação foram protegidas.

**Plano das 8 variações implementado:**

1. Introdução: 3 cartões, 1 letra e 2 distratores, em fila.
2. Familiarização: 4 cartões, 2 letras e distratores, em posições espalhadas.
3. Variação: 5 cartões, 2 letras, números e símbolo com movimento suave.
4. Desafio: 6 cartões, 3 letras em grade visual.
5. Surpresa: 7 cartões, 3 letras, números e desenhos misturados.
6. Combinação: 8 cartões, 4 letras que formam BOLA e distratores em posições espalhadas.
7. Domínio: 9 cartões, 4 letras de CASA, repetição intencional da letra A e grade mais cheia.
8. Desafio final: 10 cartões, 5 letras de PATOL, distratores, movimento orbital decorativo e conclusão obrigatória de todas as letras.

**Economia técnica:** a cena usa DOM, CSS, animações determinísticas e o ícone vetorial já disponível em `lucide-react`; não depende de imagem, áudio novo ou geração de asset.

### Mundo Silábico · Fase 1 — O Martelo dos Pedaços

**Atividade-matriz:** bater uma vez para cada sílaba ouvida, registrando uma marca por parte falada da palavra.

**Objetivo pedagógico:** desenvolver a percepção de que as palavras podem ser divididas em partes faladas, sem exigir ainda a correspondência completa entre cada sílaba e sua grafia. A criança pronuncia, segmenta e coordena fala, escuta e toque.

**Mecânica aprovada:** a palavra aparece separada em blocos silábicos como apoio visual. A criança toca no martelo uma vez por sílaba; cada batida preenche uma marca. O avanço só acontece depois que a quantidade de batidas coincide com todas as partes da palavra.

**Plano das 8 variações implementado:**

1. Introdução: SOL, uma parte, uma batida e ritmo calmo.
2. Familiarização: BO-LA, duas partes e batidas regulares.
3. Variação: SA-PA-TO, três partes e palavra de uso infantil.
4. Desafio: JA-CA-RÉ, três partes com ritmo alternado.
5. Surpresa: E-LE-FAN-TE, quatro partes, incluindo uma sílaba curta.
6. Combinação: BI-CI-CLE-TA, quatro vagões visuais em sequência.
7. Domínio: BOR-BO-LE-TA, quatro partes e ritmo de desafio.
8. Desafio final: A-BA-CA-XI, quatro partes, sequência completa e conclusão obrigatória.

**Economia técnica:** a atividade usa DOM, CSS e o ícone vetorial `Hammer` já disponível em `lucide-react`; não depende de imagem, áudio novo ou geração de asset.

### Desafio final — Festival Final da Lumi

Depois das sete matrizes do Mundo da Garatuja, o desafio final reúne uma etapa decisiva de cada habilidade praticada: sementes, lanterna, pegadas, pomar, ímã, gelo e rolo de pintura. A oitava descoberta encerra a jornada com um voo guiado até a colmeia da Lumi.

**Sequência oficial:**

1. Acender a trilha final de sementes.
2. Iluminar quatro sinais secretos.
3. Completar oito marcas na rota da praia.
4. Proteger a fruta afastando oito mosquitos.
5. Formar o emblema magnético com oito pontos.
6. Revelar integralmente o sorvete escondido no gelo.
7. Cobrir o mural final com oito faixas em zigue-zague.
8. Guiar a abelhinha da Lumi pelos nove pontos até a colmeia final.

O desafio reutiliza os componentes aprovados, mantém oito descobertas e altera apenas a composição narrativa e o nível final de exigência. A conclusão segue o mesmo fluxo de pontuação e recompensa do controlador, com o ovo lendário reservado para esta etapa.

## O que será transformado antes de novas fases

- Os componentes atuais continuarão sendo os renderizadores das matrizes.
- As variações passarão a ser cada vez mais dirigidas por configuração: pontos, rotas, velocidades, tolerância, distratores, ordem, tempo e regras secundárias.
- O conteúdo textual deixará de ser a principal diferença entre as oito experiências.
- Toda fase nova terá uma matriz nomeada, um objetivo pedagógico, uma progressão de oito variações e uma ficha de teste no painel de desenvolvedor.

## Arquitetura técnica planejada

A evolução recomendada é introduzir uma configuração semelhante a:

```ts
{
  matrixId: "pintura-ima",
  phase: 5,
  progression: [
    { variant: 0, difficulty: "introducao", ... },
    { variant: 1, difficulty: "familiarizacao", ... },
    // ... oito configurações
  ]
}
```

O componente de interação continua único por matriz. A configuração altera a experiência sem criar oito sistemas independentes.

## Checklist obrigatório antes de aprovar uma fase

- As oito atividades mantêm a mesma identidade e mecânica central?
- Cada variação possui uma mudança de experiência além de trocar texto ou imagem?
- Existe progressão de introdução até desafio final?
- O conteúdo respeita o nível de alfabetização do mundo?
- A variação é acessível pelo painel de desenvolvedor?
- A atividade pode ser testada em todas as oito versões?
- Foram reutilizados componentes, CSS, Canvas e assets existentes quando possível?
- `pnpm check`, `pnpm build`, testes e revisão visual foram executados?
- A implementação foi publicada em commit separado e sincronizada com `origin/main`?

## Pontos de alinhamento futuro

O guia estratégico estabelece **8 mundos**, enquanto o catálogo atual do repositório ainda está estruturado com 7 mundos e as cinco matrizes analisadas pertencem ao Mundo da Garatuja. Isso não será alterado agora. A diferença será tratada como decisão de planejamento antes da criação do oitavo mundo.
