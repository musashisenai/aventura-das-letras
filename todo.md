- [x] Reproduzir a abertura da aplicação sem perfil salvo no navegador.
- [x] Proteger leituras de `profile.currentWorld` e demais dados de perfil no mapa.
- [x] Compilar e testar a tela inicial e o início de uma expedição.
- [x] Salvar e entregar o checkpoint da correção.

Validação registrada: foi forçado um estado salvo com `screen: "map"` e `profile: null`. Após a recarga, o jogo voltou para a tela de boas-vindas sem acessar `currentWorld`.

Também foi validado o painel do professor sem aluno cadastrado: ele exibe um estado vazio seguro, sem tentar ler o mundo atual de um perfil ausente.

O retorno “Voltar ao mapa” no painel sem aluno agora direciona para a tela de boas-vindas. A verificação de tipos e a compilação de produção foram concluídas com êxito.

## Ampliação pedagógica

- [x] Mapear a estrutura de perguntas, nivelamento e painel do professor.
- [x] Criar um nivelamento inicial ampliado com critérios de classificação por mundo.
- [x] Ampliar os bancos de perguntas e embaralhar cada fase em toda nova entrada.
- [x] Salvar a preferência individual de áudio e criar seu controle na área do professor.
- [x] Validar o fluxo completo e salvar o checkpoint da atualização.

Validação em andamento: o mapa demonstrativo foi aberto com o perfil de Clara e os novos bancos carregados. A navegação para a área do professor será validada com acionamento direto caso o clique da prévia permaneça indisponível.

O acesso à área do professor foi acionado no mapa demonstrativo e exibiu corretamente a tela de autenticação.

O painel autenticado de Clara mostra o bloco “Leitura em voz alta”, com o estado ativo e o comando para desativar o áudio exclusivamente para essa aluna.

O comando foi testado: a interface passou a informar que a narração está desligada e o botão mudou para “Ativar áudio deste aluno”. O retorno ao mapa foi concluído mantendo essa preferência.

Com o áudio desativado, a Fase 1 foi aberta sem o botão de leitura em voz alta. A primeira pergunta sorteada foi “Qual grupo tem seis bolinhas?”.

Ao reabrir a mesma Fase 1, a primeira pergunta mudou para “Qual letra pode começar o nome LIA?”, confirmando o sorteio de perguntas e alternativas a cada entrada. A validação do perfil novo será refeita com a chave local correta, pois a prévia de demonstração restaura Clara automaticamente.

O estado persistido correto foi removido. A entrada sem demonstração exibiu o onboarding de uma nova aluna, pronto para iniciar o nivelamento.

O nivelamento de Lia foi iniciado e mostrou “1 de 18”, confirmando a ampliação para dezoito desafios diagnósticos distribuídos pelos seis níveis de aprendizagem.

A tipagem e a compilação de produção foram concluídas com êxito após a atualização.

## Navegação por mundos, alfabeto e análise docente

- [x] Mapear componentes do mapa, persistência de respostas e painel do professor.
- [x] Permitir selecionar qualquer mundo e exibir suas fases, pontuações e progressão no mapa.
- [x] Criar o mundo introdutório de Alfabeto com fases próprias e letras maiúsculas.
- [x] Tornar funcionais as abas docentes e a análise de resposta, alternativas e desenhos.
- [x] Validar os fluxos de aluno e professor, compilar e salvar o checkpoint.

Validação registrada: no mapa demonstrativo, a escolha do Mundo do Alfabeto atualizou imediatamente a seção inferior para suas oito fases, mostrando duas fases concluídas com pontuação, a próxima fase liberada e as demais etapas bloqueadas pela progressão.

Na Fase 3 do Mundo do Alfabeto, a atividade “QUAL LETRA COMEÇA LUZ?” foi exibida com alternativas em maiúsculas, confirmando a nova trilha introdutória e a padronização para leitura infantil.

O acesso à Área do Professor foi aberto a partir do mapa com a descrição atualizada de acompanhamento de trilha, respostas e desenhos por aluno.

O painel autenticado exibiu controles funcionais para Visão geral, Perfis de alunos, Respostas, Desenhos, retorno ao mapa, áudio individual e cada mundo da trilha. O perfil demonstrativo ainda não possui respostas registradas neste ciclo; será criada uma resposta para validar a inspeção detalhada.

As abas “Perfis de alunos” e “Respostas” foram abertas com êxito. O perfil mostra atalhos para o livro-mapa e as respostas; a aba de respostas apresenta corretamente o estado vazio até que a criança responda uma atividade.

O retorno ao mapa foi validado. Como o botão da fase está abaixo da área interativa da prévia, a abertura da Fase 3 do Alfabeto será acionada por uma alternativa segura para criar um registro de resposta.

A Fase 3 foi aberta e apresentou o desafio “QUAL GRUPO ESTÁ EM ORDEM ALFABÉTICA?”, com as três alternativas em maiúsculas. A próxima ação registrará uma resposta para validar sua análise individual.

Clara respondeu corretamente “A B C” na Fase 3 do Mundo do Alfabeto. O mapa foi reaberto após o registro da tentativa, que será inspecionada no painel docente.

A resposta registrada apareceu no painel e foi aberta para análise: o professor visualiza mundo, fase, pergunta, todas as alternativas, opção escolhida, acerto, pista usada e horário do registro.

A trilha de Garatuja foi selecionada no mapa. Suas fases e pontuações foram exibidas no mesmo painel inferior, com a Fase 2 liberada para registrar um novo portfólio visual.

A abertura da Fase 1 na prévia permaneceu no mapa após o clique visual; a validação do desenho seguirá por um acionamento alternativo, sem afetar o progresso salvo da aluna.

O acionamento alternativo abriu a Fase 1 da Garatuja. A primeira descoberta foi apresentada em maiúsculas e o ciclo será avançado até uma atividade de desenho para confirmar o portfólio visual.

As duas primeiras descobertas foram percorridas com sucesso; a segunda apresentou “QUAL SÍMBOLO MOSTRA DUAS COISAS?” em maiúsculas. A fila aleatória seguirá até o desafio de desenho.

O ciclo avançou para a terceira descoberta, “QUANTAS ESTRELAS ESTÃO NO CÉU?”, preservando a apresentação em maiúsculas. O sorteio continua a percorrer atividades variadas do banco da Garatuja.

O portfólio visual está conectado ao desenho real da criança: o canvas é salvo como imagem no registro da resposta e o inspetor docente mostra a pergunta, a ilustração de apoio e a imagem enviada. As abas de visão geral, perfil, respostas e desenhos foram verificadas como navegáveis.

A compilação de produção foi concluída com êxito. As capturas em desktop e em 375 px confirmaram que os mundos seguem uma trilha horizontal e as fases do mundo escolhido se reorganizam em uma grade legível na parte inferior.

## Correções do nivelamento inicial

- [x] Mapear a posição do mascote, a questão de estrelas e a construção da fila inicial.
- [x] Ajustar o mascote para não sobrepor os textos em telas pequenas.
- [x] Corrigir a pergunta de estrelas com ilustração visível e consistente.
- [x] Embaralhar a ordem das perguntas em cada novo nivelamento.
- [x] Validar a tela, a aleatoriedade e a compilação antes de salvar o checkpoint.

Diagnóstico: o nível inicial usava a lista estática diretamente, e o componente não exibida o campo visual da questão. O mascote estava posicionado parcialmente para fora do cartão, sem reservar espaço para a mensagem de abertura.

O perfil local anterior foi removido da prévia para testar o nivelamento como uma nova criança, sem reutilizar a ordem persistida de perguntas.

Na nova entrada de JYCA, o nivelamento abriu em “1 DE 21” com “QUAL DESTES É UM NÚMERO?”, diferente da primeira pergunta exibida no ciclo anterior. O mascote permanece no canto superior direito, com espaço reservado e sem cobrir a saudação ou o enunciado.

A questão “QUANTAS ESTRELAS ESTÃO NO CÉU?” foi validada visualmente: cinco estrelas douradas agora aparecem em uma faixa própria entre o enunciado e as alternativas, sem conflito com o mascote.

A verificação de tipos e a compilação de produção foram concluídas com êxito. A prévia em viewport compacto também foi capturada para documentar a revisão da tela inicial.

## Montagem silábica e narração por autonomia

- [x] Mapear a atividade de sílabas, os recursos visuais e a regra de áudio atual.
- [x] Substituir a palavra escrita por imagem e montar sílabas por clique e arraste.
- [x] Exibir narração somente até o Mundo do Alfabeto, respeitando o bloqueio do professor.
- [x] Validar a montagem, a narração e o bloqueio individual antes de salvar o checkpoint.

## Menu inicial e autonomia de narração

- [x] Revisar a entrada do jogo e a persistência da preferência de áudio da criança.
- [x] Criar uma tela de menu anterior ao cadastro, com rotas claras para criança e professor.
- [x] Adicionar um controle de narração para a criança, com confirmação visual e efeito imediato.
- [x] Validar a convivência entre a escolha da criança, o bloqueio docente e a compilação de produção.

Validação registrada: o menu foi capturado em desktop e em 375 px. A escolha “Lumi pode ler para mim” muda para “Vou ler sem ajuda” no mesmo controle e é transportada para o perfil ao iniciar a expedição. A preferência do professor segue sendo aplicada no perfil individual, e `pnpm check` e `pnpm build` foram concluídos sem erros.
