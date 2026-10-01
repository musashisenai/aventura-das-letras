## Como utilizar este repositório

Este projeto usa **Node.js + Express + banco JSON versionado**. Não é mais necessário criar um projeto no Supabase nem configurar chaves de banco em nuvem.

### Configuração única no computador do professor

1. Instale o **Node.js 22 ou superior**.
2. Clone este repositório:

```bash
git clone https://github.com/musashisenai/aventura-das-letras.git
cd aventura-das-letras
```

3. Instale as dependências:

```bash
npm install --include=dev --include=optional --legacy-peer-deps
```

O banco está dentro do próprio repositório em `database/classroom.json`. O VS Code abre esse arquivo nativamente, sem extensão. O Node.js lê e grava o arquivo automaticamente sempre que houver alteração no jogo.

### Iniciar o jogo com o banco local

```bash
npm run start:dev
```

Esse comando compila o frontend, inicia o servidor Node/Express e serve o jogo e a API na mesma porta. Não é necessário iniciar um segundo servidor para o banco: o arquivo JSON é aberto e atualizado pelo próprio Node.

O servidor escuta a rede local. No terminal, procure a linha `Acesso pela rede local: http://...:3000/` e use esse endereço nos computadores dos alunos. `localhost` só funciona no próprio computador que está executando o servidor.

Para desenvolvimento visual do frontend com Hot Module Reload, é possível usar dois terminais. No primeiro, inicie o Node e o banco JSON:

```bash
npm run build && npm start
```

No segundo, inicie o Vite:

```bash
npm run dev
```

O Vite encaminha `/api` para o Node na porta 3000; portanto, mesmo nesse modo, o jogo continua usando o mesmo arquivo JSON. Para uso normal, prefira apenas `npm run start:dev`.

Se existir um `.local-data/students.json` de uma versão anterior, ele será migrado automaticamente para `database/classroom.json` na primeira execução. O arquivo antigo é mantido como cópia de segurança.

### O que é salvo

Cada alteração do aluno é sincronizada com a API do servidor e salva em `database/classroom.json`. Além do nome, o registro guarda o perfil, fases concluídas, respostas, mundo atual e o estado momentâneo do jogo: tela, mundo, fase, ordem das perguntas, pergunta atual, tentativas, pontuação, feedback e progresso do teste inicial. Assim, ao continuar pelo nome, o aluno volta ao ponto salvo.

O arquivo fica organizado por aluno em `name`, `status` e `save`. `status` concentra o resumo atual para consulta rápida; `save` contém o perfil completo, respostas, conclusões e a posição exata da partida.

Para consultar essas informações em abas separadas no VS Code, o servidor também mantém `database/sections/names.json` (nomes), `statuses.json` (status), `saves.json` (posição e progresso) e `answers.json` (respostas). São visões geradas automaticamente; a fonte oficial continua sendo `database/classroom.json`.

Na área do professor, o perfil selecionado oferece **Editar nome**, **Resetar status e teste inicial** e **Excluir perfil**. O reset apaga respostas, fases, posição e progresso do teste, deixando o aluno obrigado a refazer o teste inicial. A exclusão exige confirmação digitando o nome. Em **Meu perfil**, **Excluir todos os dados** exige confirmação visual, a senha do professor, o IP do servidor e a senha final `Pindamonhagaba` antes de remover todos os alunos.

O servidor tenta sincronizar o banco com o GitHub automaticamente a cada 15 minutos. O professor também pode entrar em **Meu perfil → Salvar banco no GitHub** para fazer a sincronização imediatamente. Se estiver sem internet, o arquivo continua sendo salvo localmente e a sincronização pode ser tentada depois.

Quando um aluno joga em outro computador da mesma rede, o navegador envia as alterações para o Node que está rodando no computador do professor. O Node grava o progresso no mesmo `database/classroom.json`; portanto, o save não fica preso ao computador do aluno. A cada 15 minutos, ou quando o professor usa o botão, esse arquivo é commitado e enviado ao GitHub, desde que o computador servidor tenha conexão e autenticação Git configurada.

Alunos cadastrados diretamente no banco devem ter `status.placementCompleted` e `save.profile.placementCompleted` como `false`. Na primeira entrada, o teste inicial será obrigatório. Se o aluno sair antes de concluir esse teste, na próxima entrada ele será obrigado a começar o teste novamente desde a primeira questão; o teste incompleto não libera o mapa.

Se o nome digitado em **Começar nova aventura** já estiver cadastrado, o sistema tenta automaticamente a retomada desse aluno. Se outro dispositivo estiver usando a conta, a mensagem de sessão ativa será exibida. Ao desligar a leitura opcional da Lumi, atividades que dependem de uma palavra ouvida continuam reproduzindo o áudio essencial da palavra.

### Senha da Área do Professor

Na primeira execução:

```text
7391846205
```

Depois de alterada, a senha fica armazenada no banco local.

### Sincronização com o GitHub

O arquivo `database/classroom.json` faz parte do repositório e pode ser versionado junto com o código. Para publicar alterações de código e dados:

```bash
git add .
git commit -m "Descreva a alteração"
git push
```

Ao clonar o repositório em outro dispositivo, o programa funcionará normalmente depois de instalar o Node.js e executar `npm install`, e o banco que estava no último commit estará em `database/classroom.json`. Não é necessário copiar pasta, usar extensão ou instalar outro banco. Se houver alterações feitas depois do último `git push`, elas ainda estarão somente no computador antigo até serem enviadas ao GitHub.

### Autores

Desenvolvido por **Leonardo Neves**, **Leonardo Henrique**, **Felipe Tavares** e **Daniel Borges**.
