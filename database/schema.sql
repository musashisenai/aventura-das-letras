# Banco de dados versionado do Aventura das Letras

O banco usado pelo servidor está em `database/classroom.json`.

Ele possui esta estrutura:

```json
{
  "students": {
    "id-do-aluno": {
      "id": "id-do-aluno",
      "profile": {
        "name": "Nome do aluno",
        "placementCompleted": false
      },
      "completions": {},
      "worldApprovals": {},
      "answers": [],
      "gameState": {}
    }
  },
  "settings": {
    "teacherPassword": "7391846205"
  }
}
```

O Node.js lê e grava este arquivo automaticamente com escrita temporária e substituição atômica. Não é necessário instalar banco de dados, extensão ou ferramenta adicional.
