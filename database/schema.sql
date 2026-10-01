# Banco de dados versionado do Aventura das Letras

O banco usado pelo servidor está em `database/classroom.json`. Ele não é SQL: é um JSON local, versionado e legível diretamente no VS Code.

Cada aluno fica organizado em três partes principais:

```json
{
  "students": {
    "id-do-aluno": {
      "id": "id-do-aluno",
      "name": "Nome do aluno",
      "status": {
        "placementCompleted": false,
        "currentWorld": 0,
        "recommendedWorld": 0,
        "activeScreen": "placement",
        "activeWorld": 0,
        "activePhase": 0,
        "questionIndex": 0
      },
      "save": {
        "profile": { "name": "Nome do aluno", "...": "dados do perfil" },
        "completions": {},
        "worldApprovals": {},
        "answers": [],
        "gameState": { "...": "posição exata da partida" }
      },
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  },
  "settings": {
    "teacherPassword": "7391846205"
  }
}
```

- `name`: identificação simples do aluno.
- `status`: resumo atual, fácil de consultar no VS Code.
- `save`: perfil, respostas, fases e estado exato para continuar.
- `activeSession`: quando existir, é interno e impede dois acessos simultâneos ao mesmo perfil.

O Node.js lê e grava este arquivo automaticamente com escrita temporária e substituição atômica. Não é necessário instalar SQL, SQLite, extensão ou ferramenta adicional.
