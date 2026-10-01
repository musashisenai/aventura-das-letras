## Como utilizar este repositório

Este projeto usa **Node.js + Express + SQLite local**. Não é mais necessário criar um projeto no Supabase nem configurar chaves de banco em nuvem.

### Configuração única no computador do professor

1. Instale o **Node.js 22 ou superior**.
2. Clone este repositório:

```bash
git clone https://github.com/musashisenai/aventura-das-letras.git
cd aventura-das-letras
```

3. Instale as dependências:

```bash
npm install --include=dev --legacy-peer-deps
```

O banco é criado automaticamente no primeiro início em `.local-data/classroom.sqlite`. No VS Code, abra a pasta do projeto e localize a pasta oculta `.local-data`; não cole os dados dentro do `server/index.ts` nem do `database/schema.sql`. Essa pasta está no `.gitignore`, portanto os dados dos alunos e a senha do professor não vão para o GitHub.

### Iniciar o jogo com o banco local

```bash
npm run start:dev
```

Esse comando compila o frontend, inicia o servidor Node/Express e serve o jogo e a API na mesma porta. Não é necessário iniciar um segundo servidor para o banco: o SQLite é aberto pelo próprio Node.

Para desenvolvimento visual do frontend com Hot Module Reload, é possível usar dois terminais. No primeiro, inicie o Node/SQLite:

```bash
npm run build && npm start
```

No segundo, inicie o Vite:

```bash
npm run dev
```

O Vite encaminha `/api` para o Node na porta 3000; portanto, mesmo nesse modo, o jogo continua usando o mesmo SQLite. Para uso normal, prefira apenas `npm run start:dev`.

Se existir um `.local-data/students.json` de uma versão anterior, ele será migrado automaticamente para o SQLite na primeira execução. O arquivo antigo é mantido como cópia de segurança.

### O que é salvo

Cada alteração do aluno é sincronizada com a API do servidor e salva no SQLite. Além do nome, o registro guarda o perfil, fases concluídas, respostas, mundo atual e o estado momentâneo do jogo: tela, mundo, fase, ordem das perguntas, pergunta atual, tentativas, pontuação, feedback e progresso do teste inicial. Assim, ao continuar pelo nome, o aluno volta ao ponto salvo.

Alunos cadastrados diretamente no banco devem ter `profile.placementCompleted` como `false`. Na primeira entrada, o teste inicial será obrigatório. Se o aluno sair antes de concluir esse teste, na próxima entrada ele será obrigado a começar o teste novamente desde a primeira questão; o teste incompleto não libera o mapa.

### Senha da Área do Professor

Na primeira execução:

```text
7391846205
```

Depois de alterada, a senha fica armazenada no banco local.

### Sincronização com o GitHub

O GitHub deve sincronizar o **código**, não o banco vivo. O arquivo SQLite é local e está ignorado de propósito para evitar expor dados de alunos, conflitos e corrupção do arquivo. Para publicar alterações de código:

```bash
git add .
git commit -m "Descreva a alteração"
git push
```

Ao clonar o repositório em outro dispositivo, o programa funcionará normalmente depois de instalar o Node.js e executar `npm install`. Porém, o clone começa com um banco vazio, porque o banco não é enviado ao GitHub. Para levar também os alunos e os progressos, pare o servidor no computador antigo e copie a pasta `.local-data` inteira para a pasta clonada no novo dispositivo. Copie também os arquivos `classroom.sqlite`, `classroom.sqlite-shm` e `classroom.sqlite-wal` se existirem.

### Autores

Desenvolvido por **Leonardo Neves**, **Leonardo Henrique**, **Felipe Tavares** e **Daniel Borges**.
