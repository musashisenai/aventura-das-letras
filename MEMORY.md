# Memory

- O projeto usa uma cena Babylon de fundo e uma interface DOM grande para as atividades educacionais, preservando a separação entre renderização e regras.
- O navegador exige interação do usuário para áudio: a leitura da pergunta usa a síntese de voz apenas ao acionar o botão.
- O protótipo usa `localStorage` no lugar de autenticação e banco remoto; por isso, professor, respostas e desenhos funcionam no mesmo navegador/dispositivo.
- Para captura previsível, `?demo` abre uma conta de demonstração diretamente no mapa.

## Regra permanente de execução

- **Otimização de créditos é prioridade máxima:** antes de gerar qualquer imagem, áudio ou vídeo, preferir CSS, Canvas, SVG, assets já existentes e código determinístico. Só gerar um asset novo quando houver necessidade real e autorização no escopo.
- Cada melhoria funcional deve ser validada (`pnpm check`, `pnpm build`, testes relevantes e revisão visual quando aplicável) e publicada em um **commit separado, rastreável e sincronizado com `origin/main`**.
- Toda atividade nova deve ser registrada e testável no **painel de desenvolvedor**, com acesso ao mundo, à fase e às variações da atividade antes da publicação.
- A produção oficial segue o modelo **atividade-matriz + 8 variações progressivas**: preservar identidade e mecânica central, variar a experiência por dificuldade, configuração, regra secundária e exigência pedagógica, implementar em lote e refinar antes da próxima fase.
- O guia detalhado desta estratégia está em `docs/ESTRATEGIA-MATRIZES.md`; as cinco fases existentes não devem ser reconstruídas, apenas analisadas e evoluídas gradualmente.
