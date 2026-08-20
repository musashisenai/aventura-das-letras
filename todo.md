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
