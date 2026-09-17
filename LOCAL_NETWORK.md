# Aventura das Letras na rede local

## Iniciar no notebook servidor

Crie um projeto no [Supabase](https://supabase.com), execute `database/schema.sql` no **SQL Editor**, copie a **Project URL** e a chave secreta **service_role** em **Project Settings > API**, copie `.env.example` para `.env` e preencha as duas variáveis. Depois, abra o terminal na pasta do projeto e execute:

```bat
pnpm install
pnpm start:dev
```

O servidor verifica a tabela e grava os perfis, respostas e progresso no Supabase. Se existir um `.local-data/students.json` antigo, ele é migrado automaticamente na primeira inicialização com o banco configurado.

Em outro dispositivo, clone o repositório, copie `.env.example` para `.env`, use as mesmas credenciais do Supabase, instale as dependências e execute `pnpm start:dev`. Os dados aparecerão porque estão no Supabase, não no disco do computador anterior.

## Acessar em outros dispositivos

1. No notebook servidor, execute `ipconfig`.
2. Use o IPv4 do adaptador Wi-Fi ou Ethernet, não o de VPN, Docker, WSL ou VirtualBox.
3. Nos demais dispositivos, abra `http://IP-DO-SERVIDOR:4173`.

Exemplo:

```text
http://10.137.11.210:4173
```

Todos precisam estar na mesma rede. Se o Windows Firewall perguntar, permita o acesso em redes privadas. O professor verá automaticamente os alunos que abrirem a aventura pelo endereço do servidor. O Supabase precisa estar acessível pela internet.

## Observação

O navegador mantém uma cópia temporária para funcionamento da interface, mas a fonte oficial dos perfis e saves é o Supabase. O computador que estiver executando o servidor precisa permanecer ligado para os alunos acessarem o jogo; os dados permanecem no Supabase mesmo que esse computador do jogo seja desligado.
