# Aventura das Letras na rede local

## Configuração única no computador do professor

1. Instale o **Node.js 22 ou superior**.
2. Clone o repositório, entre na pasta e instale as dependências:

```bat
git clone https://github.com/musashisenai/aventura-das-letras.git
cd aventura-das-letras
npm install --include=dev --legacy-peer-deps
```

O banco está dentro do próprio projeto em `database/classroom.json`. Não é necessário instalar PostgreSQL, Supabase, extensão do VS Code ou um segundo servidor de banco.

## Iniciar o servidor

No computador do professor:

```bat
npm run start:dev
```

Esse único comando compila o jogo, inicia o Express e abre o banco JSON versionado. Os perfis, progressos, sessões e senha ficam em `database/classroom.json`.

Não é obrigatório abrir dois CMDs. Se quiser Hot Module Reload para desenvolver no VS Code, use dois terminais: no primeiro execute `npm run build && npm start`; no segundo execute `npm run dev`. O Vite encaminha a API para o Node na porta 3000, então ambos continuam usando o mesmo arquivo JSON.

O progresso é salvo automaticamente: nome, fases, mundo, fase, pergunta atual, tentativas e o estado do teste inicial. Se um aluno criado no banco tiver `placementCompleted` como `false`, ele será direcionado obrigatoriamente ao teste inicial. Se sair antes de terminar, terá de refazer o teste desde o começo na próxima entrada.

## Acessar pelos computadores dos alunos

1. No computador do professor, execute `ipconfig`.
2. Encontre o IPv4 da rede local, por exemplo `192.168.0.10`.
3. Nos computadores dos alunos, abra:

```text
http://192.168.0.10:3000
```

Os alunos não precisam instalar o projeto nem configurar banco. Eles apenas acessam o IP do computador do professor.

Se o Windows Firewall perguntar, permita o acesso em redes privadas.

> O comando `npm run start:dev` usa a porta `3000` por padrão. Se a variável `PORT` estiver definida, use essa porta no endereço dos alunos.

## Backup e clonagem do banco

O banco está em `database/classroom.json` e é salvo automaticamente a cada alteração do jogo. Ele pode ser aberto diretamente no VS Code, sem extensão.

Ao clonar o código em outro computador, o jogo funciona após `npm install` e o banco existente no último commit vem junto no clone. Para manter o GitHub atualizado, faça `git add database/classroom.json`, `git commit` e `git push` quando houver internet. O jogo continua funcionando e salvando localmente mesmo sem internet; apenas a sincronização com o GitHub aguarda o próximo push.
