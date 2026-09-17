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
http://192.168.0.10:4173
```

Os alunos não precisam instalar o projeto, configurar o Supabase ou informar senha. Eles apenas acessam o IP do computador do professor.

Se o Windows Firewall perguntar, permita o acesso em redes privadas.
