# Aventura das Letras

## Runtime

- Babylon.js 9.22.0
- React 19, TypeScript e Vite
- Navegador em tela cheia, com interface DOM sobre uma cena Babylon 2D
- Salvamento local no navegador para o protótipo jogável

## App Entry

- `client/src/App.tsx` renderiza exclusivamente `GameCanvas` na rota raiz.
- `client/src/components/GameCanvas.tsx` possui o ciclo de vida seguro do `Engine` e hospeda a interface.
- `client/src/game/scene.ts` cria a cena de fundo com a ilustração gerada.

## Game Entry

- `client/src/game/GameController.ts` é a fonte de verdade do perfil, nivelamento, fases, correção, recompensas, pets, professor e persistência.
- `client/src/game/content.ts` concentra mundos, questões e URLs dos ativos.
- `client/src/components/GameUI.tsx` traduz o estado do controlador em telas acessíveis e grandes para crianças.

## Planned Modules

- `GameController` → regras, rodadas, progresso e salvamento.
- `GameCanvas` → ciclo do Babylon e assinatura do controlador.
- `GameUI` → mapa, perguntas, baú, pet e área docente.

## Assets

- URLs estáveis em `/manus-storage/` para fundo, mascote, símbolo e kit de recompensa.
- Formas geométricas e trilhas de interface são construídas por CSS e SVG para alta legibilidade.

## Verification

- `pnpm check`
- `pnpm build`
- Capturas da prévia WebDev, incluindo `?demo`

