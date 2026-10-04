# Aba de áudios das atividades

Esta pasta reúne exclusivamente os arquivos de áudio versionados do jogo. Ela é separada de:

- `classroom.json`: dados dos alunos, progresso e respostas;
- `questions/`: perguntas e configurações pedagógicas;
- `images/`: ilustrações e sprites visuais.

## Como adicionar um novo áudio

1. Coloque o arquivo final nesta pasta, preferencialmente em `.mp3` ou `.wav`.
2. Registre o arquivo em `metadata.json`.
3. Copie o arquivo para `client/public/assets/` quando ele for usado diretamente pelo navegador.
4. Atualize o componente ou o banco de perguntas que fará referência ao áudio.
5. Valide o catálogo com `python3 -m json.tool metadata.json`.

## Áudio atual

- `mosquito-buzz.mp3`: zumbido cartunesco em loop usado na atividade Espanta-Mosquitos. O jogo reduz o volume proporcionalmente aos mosquitos restantes e silencia ao concluir.
