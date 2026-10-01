# Aventura das Letras na rede local

## Configuração única no computador do professor

1. Instale o **Node.js 22 ou superior**.
2. Clone o repositório, entre na pasta e instale as dependências:

```bat
git clone https://github.com/musashisenai/aventura-das-letras.git
cd aventura-das-letras
npm install --include=dev --legacy-peer-deps
```

O banco local será criado automaticamente em `.local-data/classroom.sqlite` pelo próprio servidor Node. Não é necessário instalar PostgreSQL, Supabase ou um segundo servidor de banco.

## Iniciar o servidor

No computador do professor:

```bat
npm run start:dev
```

Esse único comando compila o jogo, inicia o Express e abre o SQLite local. Os perfis, progressos, sessões e senha ficam no computador do professor.

Não é obrigatório abrir dois CMDs. Se quiser Hot Module Reload para desenvolver no VS Code, use dois terminais: no primeiro execute `npm run build && npm start`; no segundo execute `npm run dev`. O Vite encaminha a API para o Node na porta 3000, então ambos continuam usando o mesmo SQLite.

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

## Backup do banco

O banco está em `.local-data/classroom.sqlite`. Para fazer backup, pare o servidor e copie essa pasta para um local seguro. Não faça commit dela no GitHub, pois ela contém dados dos alunos.

Ao clonar o código em outro computador, o jogo funciona após `npm install`, mas o banco começa vazio. Para transportar os alunos e seus progressos, pare o servidor antigo e copie a pasta `.local-data` completa para o projeto novo. Não copie o banco enquanto o servidor estiver em execução.
