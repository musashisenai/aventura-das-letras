- [x] Reproduzir a abertura da aplicação sem perfil salvo no navegador.
- [x] Proteger leituras de `profile.currentWorld` e demais dados de perfil no mapa.
- [x] Compilar e testar a tela inicial e o início de uma expedição.
- [x] Salvar e entregar o checkpoint da correção.

Validação registrada: foi forçado um estado salvo com `screen: "map"` e `profile: null`. Após a recarga, o jogo voltou para a tela de boas-vindas sem acessar `currentWorld`.

Também foi validado o painel do professor sem aluno cadastrado: ele exibe um estado vazio seguro, sem tentar ler o mundo atual de um perfil ausente.

O retorno “Voltar ao mapa” no painel sem aluno agora direciona para a tela de boas-vindas. A verificação de tipos e a compilação de produção foram concluídas com êxito.
