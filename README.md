# Aventura das Letras

## Como utilizar este repositório

Os perfis dos alunos e o progresso completo da aventura são armazenados em um banco Supabase compartilhado. Assim, computadores diferentes podem iniciar o servidor apontando para o mesmo projeto e acessar os mesmos saves.

### Configuração única do banco

1. Crie um projeto no [Supabase](https://supabase.com).
2. Abra o **SQL Editor** e execute todo o conteúdo de [`database/schema.sql`](database/schema.sql). Se a tabela já existia, execute o arquivo novamente para aplicar a chave única dos nomes.
3. No **Project Settings → API**, copie a URL do projeto e a chave `service_role`. Essa chave fica somente no servidor e nunca deve ser enviada ao GitHub ou compartilhada com os alunos.

### Configuração em cada computador

Em cada computador que iniciar o servidor, clone o repositório e configure o mesmo banco:

```bash
git clone https://github.com/musashisenai/aventura-das-letras.git
cd aventura-das-letras
pnpm install
cp .env.example .env
```

Abra o arquivo `.env` e preencha os mesmos valores de `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` usados nos outros computadores. Depois, inicie o servidor:

```bash
pnpm start:dev
```

O comando `start:dev` compila o jogo e inicia o servidor. Não é necessário copiar arquivos de save entre computadores. Quando a versão com Supabase for iniciada pela primeira vez e ainda existir um arquivo local `.local-data/students.json`, o servidor tenta migrar esses perfis para o banco antes de remover o arquivo local.

### O que é salvo

Para cada aluno, o banco guarda o perfil, mundo atual, mundo recomendado, fases concluídas, pontuações, respostas, aprovações do professor, moedas, XP, ovos, pet e demais dados necessários para continuar exatamente do ponto anterior. O navegador mantém apenas um cache local; a fonte compartilhada é o Supabase.

### Verificação rápida

Depois de iniciar, abra o endereço exibido pelo servidor. Cadastre ou continue um aluno, conclua uma fase e depois inicie o servidor em outro computador usando o mesmo `.env`. O perfil e o progresso devem aparecer no mesmo nome de aluno.

## Senha da Área do Professor

```text
7391846205
```

A senha pode ser alterada na própria área do professor. A alteração fica persistida na configuração local do servidor; se for necessário compartilhar também a senha entre computadores, esse valor deve ser centralizado separadamente e não deve ser colocado no repositório.

## Autores

Desenvolvido por **Leonardo Neves**, **Leonardo Henrique**, **Felipe Tavares** e **Daniel Borges**.
