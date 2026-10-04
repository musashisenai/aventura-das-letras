# Aba de perguntas

Esta aba organiza o conteúdo pedagógico por **mundo** e, dentro de cada mundo, por **fase**.

## Subabas

- `world-0.json` — Mundo da Garatuja
- `world-1.json` — Mundo do Alfabeto
- `world-2.json` — Mundo Pré-Silábico
- `world-3.json` — Mundo Silábico
- `world-4.json` — Mundo Silábico-Alfabético
- `world-5.json` — Mundo Alfabético
- `world-6.json` — Mundo Ortográfico

Cada arquivo contém:

- Identificação e nome do mundo.
- Oito fases (`fase-1` até `fase-8`).
- As oito perguntas disponíveis em cada fase.
- Tipo da atividade: escolha, ordenação, desenho ou interação guiada (`seed-rain`, `lantern`, `sand-tracks`, `mosquito-sweep`, `magnet-paint`).
- Enunciado, alternativas, resposta, dica, visual e dados de áudio quando existentes.

Os arquivos são uma visão organizada do conteúdo que o jogo utiliza em `client/src/game/content.ts`. Alterações futuras no conteúdo do jogo devem ser feitas nessa fonte e depois exportadas novamente para manter esta aba sincronizada.
