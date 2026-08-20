# Registro de revisão visual

O primeiro teste visual confirmou que a tipografia, a paleta de papel e os controles infantis estavam consistentes com o conceito **Livro-Mapa Encantado**. A ilustração externa do mascote não foi renderizada; por isso, ela será substituída por uma ilustração original em CSS, mantendo a experiência íntegra e reduzindo dependências de mídia externa.

O mapa demonstrativo abriu com o perfil de Clara, os mundos bloqueados, as fases, a dica do mascote e os atalhos de pets e professor. A marca externa também não renderizou corretamente, portanto o símbolo da marca será composto localmente para preservar a identidade visual em todas as telas.

A primeira fase foi localizada no mapa demonstrativo, mas a interação automatizada não alterou a tela no navegador de validação. O fluxo precisa ser inspecionado na camada de estado antes da entrega.

O diagnóstico identificou que o controlador enviava a mesma referência de objeto ao estado do React, que pode ignorar atualizações idênticas por referência. A emissão deve entregar uma cópia superficial da sessão para que a interface responda a cada ação.

A correção foi validada: a Fase 1 abriu a atividade “Qual forma é redonda como uma bola?”, com três opções, controle de áudio, contador de tentativas e o painel de apoio da Lumi.

A resposta correta exibiu o reforço “Muito bem! Sua trilha ganhou uma nova pegada.” e liberou o botão de continuidade. A segunda descoberta carregou em seguida com um novo formato de pergunta sobre a palavra BOLA.

O botão de retorno da fase levou corretamente de volta ao mapa. A Casa dos pets foi localizada, mas o clique automatizado por índice não alterou a tela; a área será validada pelo acionamento direto do DOM, tal como a fase.

A Casa dos pets abriu corretamente por acionamento direto. A tela exibe Faísca no nível 2, o medidor de carinho e energia em 62%, três ações de cuidado, a mochila com um ovo e retorno ao mapa.

A ação gratuita de carinho aumentou o medidor de 62% para 74%, e o retorno ao mapa continuou funcionando. Isso confirma a atualização do estado do perfil na área de pets.

A Área do professor abriu com uma tela de acesso orientador, campo de senha e retorno ao jogo. A visualização dos dados pedagógicos será testada com a credencial demonstrativa documentada no jogo.

Com a senha demonstrativa “professor”, o painel exibiu o perfil de Clara, mundo atual, acerto no mundo, respostas salvas, progresso por fase, regra de avanço e o portfólio com a resposta registrada durante a validação.
