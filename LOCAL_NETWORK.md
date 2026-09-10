# Aventura das Letras na rede local

## Iniciar no notebook servidor

Abra o terminal na pasta do projeto e execute:

```bat
npm install
npm run dev -- --host=0.0.0.0 --port=4173
```

Mantenha essa janela aberta. Com `DATABASE_URL` configurada, o servidor grava alunos e respostas no banco compartilhado. Sem essa variável, ele usa o fallback local `.local-data/students.json` para preservar o funcionamento offline.

Para que um servidor iniciado em outro notebook veja os mesmos alunos, configure nele a mesma `DATABASE_URL` do banco compartilhado antes de iniciar o projeto. Nunca publique essa URL no GitHub nem a coloque no frontend.

## Acessar em outros dispositivos

1. No notebook servidor, execute `ipconfig`.
2. Use o IPv4 do adaptador Wi-Fi ou Ethernet, não o de VPN, Docker, WSL ou VirtualBox.
3. Nos demais dispositivos, abra `http://IP-DO-SERVIDOR:4173`.

Exemplo:

```text
http://10.137.11.210:4173
```

Todos precisam estar na mesma rede. Se o Windows Firewall perguntar, permita o acesso em redes privadas. O professor verá automaticamente os alunos que abrirem a aventura pelo endereço do servidor.

## Observação

Cada navegador mantém a sessão local do aluno, enquanto o banco mantém uma cópia completa do perfil, respostas, desenhos e aprovações. O notebook servidor precisa permanecer ligado e com o terminal aberto. O nome do aluno é único, ignorando diferenças de maiúsculas, espaços e acentos.

## Segurança da exclusão

A exclusão de um aluno só fica disponível na área protegida do professor. Além da senha do professor, o servidor exige uma segunda confirmação digitando exatamente `EXCLUIR NOME DO ALUNO`. Defina `TEACHER_PASSWORD` no ambiente do servidor para substituir a senha padrão de desenvolvimento.
