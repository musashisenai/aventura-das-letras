# Aventura das Letras na rede local

## Iniciar no notebook servidor

Abra o terminal na pasta do projeto e execute:

```bat
npm install
npm run dev -- --host=0.0.0.0 --port=4173
```

Mantenha essa janela aberta. O servidor grava os alunos conectados em `.local-data/students.json`.

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

Cada navegador mantém a sessão local do aluno, enquanto o servidor mantém uma cópia resumida para a lista da turma. O notebook servidor precisa permanecer ligado e com o terminal aberto.
