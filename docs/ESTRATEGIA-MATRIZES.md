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
