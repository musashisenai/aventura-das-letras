## Como utilizar este repositório
1. Crie um projeto no [Supabase](https://supabase.com), abra **SQL Editor**, execute `database/schema.sql` e copie a **Project URL** e a chave secreta **service_role** em **Project Settings > API**.
2. Clone este repositório para seu ambiente de desenvolvimento local:
```
git clone https://github.com/musashisenai/aventura-das-letras.git
```
```
cd aventura-das-letras
```
3. Configure as mesmas credenciais do Supabase em qualquer dispositivo:
```bash
cp .env.example .env
# edite .env e preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
```
4. Instale e inicie:
```bash
pnpm install
pnpm start:dev
```

O servidor verifica a tabela e grava os perfis, progresso exato, respostas, moedas, XP, pets e mundo atual no Supabase. Um arquivo `.local-data/students.json` antigo é migrado automaticamente na primeira inicialização com as credenciais configuradas. Sem as credenciais do Supabase, o projeto continua funcionando localmente usando JSON como fallback de desenvolvimento.

Para acessar de outros dispositivos na mesma rede, use o endereço IP do computador que está executando o servidor, por exemplo `http://192.168.0.10:4173`. Consulte `LOCAL_NETWORK.md` para o passo a passo.
## Senha da Área do Professor
```
7391846205
```
## 👨‍💻 Autores

Desenvolvido por **Leonardo Neves**; **Leonardo Henrique**; **Felipe Tavares** e **Daniel Borges**
