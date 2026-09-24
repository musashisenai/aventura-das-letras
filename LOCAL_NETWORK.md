# Aventura das Letras na rede local

## Configuração única no computador do professor

1. Crie um projeto no [Supabase](https://supabase.com).
2. No Supabase, abra **SQL Editor**, cole o conteúdo de `database/schema.sql` e clique em **Run**.
3. Copie `.env.example` para `.env` na pasta do projeto.
4. Em **Project Settings → API**, copie a **Project URL** para `SUPABASE_URL` e a chave secreta `service_role` para `SUPABASE_SERVICE_ROLE_KEY`.
5. Nunca compartilhe a `service_role key` com os alunos nem publique o arquivo `.env`.

## Iniciar o servidor

No computador do professor:

```bat
pnpm install
pnpm start:dev
```

Ao iniciar, o servidor conecta automaticamente ao Supabase, carrega os alunos e seus progressos e limpa somente sessões antigas. Os perfis e saves ficam no Supabase.

## Acessar pelos computadores dos alunos

1. No computador do professor, execute `ipconfig`.
2. Encontre o IPv4 da rede local, por exemplo `192.168.0.10`.
3. Nos computadores dos alunos, abra:

```text
http://192.168.0.10:3000
```

Os alunos não precisam instalar o projeto, configurar o Supabase ou informar senha. Eles apenas acessam o IP do computador do professor.

Se o Windows Firewall perguntar, permita o acesso em redes privadas.

> O comando `pnpm start:dev` usa a porta `3000` por padrão. Se a variável `PORT` estiver definida no `.env`, use essa porta no endereço dos alunos.

## MySQL local e sincronização

O servidor usa o MySQL local como armazenamento imediato e mantém o Supabase sincronizado. Na inicialização, o Supabase precisa estar acessível para sincronizar os dados; depois, se a internet cair, novas alterações continuam sendo salvas no MySQL local e entram em uma fila para sincronização automática quando a conexão voltar.

1. Instale o MySQL Community Server no computador do professor e deixe o serviço MySQL iniciado automaticamente. Durante a instalação, escolha o disco persistente `D:` para o **Data Directory** do MySQL, por exemplo `D:\MySQL\Data`. Apenas configurar `LOCAL_DATA_DIR` não move os arquivos internos do MySQL; o `Data Directory` também precisa estar em uma unidade que não seja restaurada.
2. Copie `.env.example` para `.env` e preencha `LOCAL_MYSQL_PASSWORD` com a senha criada durante a instalação.
3. Ajuste `LOCAL_DATA_DIR` para uma pasta do disco persistente, por exemplo `D:\AventuraDasLetras\dados`. O projeto cria o banco `aventura_das_letras` e suas tabelas automaticamente.
4. Mantenha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` preenchidos. O sistema sincroniza durante a inicialização e verifica alterações pendentes a cada 30 segundos.
5. Para criar uma cópia manual na Área de Trabalho, pare ou mantenha o servidor em execução e execute:

```bat
npm run backup
```

O arquivo `aventura-das-letras-backup-AAAA-MM-DD...json` poderá ser anexado ao e-mail. Ele contém os alunos e os progressos, portanto deve ser tratado como informação privada.
