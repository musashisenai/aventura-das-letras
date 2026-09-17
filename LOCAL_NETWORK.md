# Aventura das Letras na rede local

## Iniciar no notebook servidor

Crie um banco MySQL em um servidor acessível pela rede (pode ser o computador que hospeda o MySQL Server administrado pelo MySQL Workbench), crie o schema `aventura_das_letras`, copie `.env.example` para `.env` e preencha `MYSQL_URL`. Depois, abra o terminal na pasta do projeto e execute:

```bat
pnpm install
pnpm start:dev
```

O servidor cria a tabela automaticamente e grava os perfis, respostas e progresso no MySQL. Se existir um `.local-data/students.json` antigo, ele é migrado automaticamente na primeira inicialização com o banco configurado.

Em outro dispositivo, clone o repositório, copie `.env.example` para `.env`, use a mesma `MYSQL_URL`, instale as dependências e execute `pnpm start:dev`. Os dados aparecerão porque estão no MySQL, não no disco do computador anterior.

## Acessar em outros dispositivos

1. No notebook servidor, execute `ipconfig`.
2. Use o IPv4 do adaptador Wi-Fi ou Ethernet, não o de VPN, Docker, WSL ou VirtualBox.
3. Nos demais dispositivos, abra `http://IP-DO-SERVIDOR:4173`.

Exemplo:

```text
http://10.137.11.210:4173
```

Todos precisam estar na mesma rede. Se o Windows Firewall perguntar, permita o acesso em redes privadas. O professor verá automaticamente os alunos que abrirem a aventura pelo endereço do servidor. O MySQL precisa aceitar conexões do computador que executa o jogo.

## Observação

O navegador mantém uma cópia temporária para funcionamento da interface, mas a fonte oficial dos perfis e saves é o MySQL. O computador que estiver executando o servidor precisa permanecer ligado para os alunos acessarem o jogo; os dados permanecem no servidor MySQL mesmo que esse computador do jogo seja desligado.
