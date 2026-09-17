## Como utilizar este repositório
1. Crie um banco MySQL acessível pela rede e o schema `aventura_das_letras` usando o MySQL Workbench ou um provedor MySQL hospedado.
2. Clone este repositório para seu ambiente de desenvolvimento local:
```
git clone https://github.com/musashisenai/aventura-das-letras.git
```
```
cd aventura-das-letras
```
3. Configure a mesma conexão do MySQL em qualquer dispositivo:
```bash
cp .env.example .env
# edite .env e preencha MYSQL_URL
```
4. Instale e inicie:
```bash
pnpm install
pnpm start:dev
```

O servidor cria a tabela de alunos automaticamente. Os perfis, progresso exato, respostas, moedas, XP, pets e mundo atual ficam no MySQL e continuam disponíveis após desligar o servidor ou trocar de dispositivo. Um arquivo `.local-data/students.json` antigo é migrado automaticamente na primeira inicialização com `MYSQL_URL` configurada. Sem `MYSQL_URL`, o projeto continua funcionando localmente usando JSON como fallback de desenvolvimento.

Para acessar de outros dispositivos na mesma rede, use o endereço IP do computador que está executando o servidor, por exemplo `http://192.168.0.10:4173`. Consulte `LOCAL_NETWORK.md` para o passo a passo.
## Senha da Área do Professor
```
7391846205
```
## 👨‍💻 Autores

Desenvolvido por **Leonardo Neves**; **Leonardo Henrique**; **Felipe Tavares** e **Daniel Borges**
