# Abas de consulta do banco

O banco oficial continua em `database/classroom.json`.

O servidor Node mantém estas visões legíveis no VS Code e as atualiza automaticamente a cada gravação:

- `names.json`: IDs e nomes.
- `statuses.json`: status resumidos.
- `saves.json`: perfil, posição, fases e estado salvo.
- `answers.json`: respostas dos alunos.
- `questions/`: perguntas organizadas em subabas por mundo, com oito fases e oito perguntas por fase.

## Restauração atual

Os dados atuais foram recuperados do commit histórico `aa5430e`, que continha a turma completa. A fonte principal contém 34 alunos e os saves/respostas existentes naquela versão; as quatro visões acima foram regeneradas a partir dela.

Não edite as visões manualmente para alterar o jogo; use o jogo ou a área do professor.
