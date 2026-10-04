# Aba de imagens das atividades

Esta aba armazenará as ilustrações que substituirão os emojis usados atualmente nas atividades. Cada arquivo será associado a um mundo e poderá ser referenciado pelas perguntas sem alterar o banco de alunos.

## Subabas atuais

- `world-0.png`: ilustrações do Mundo da Garatuja.
- `world-1.png`: ilustrações do Mundo do Alfabeto.
- `pegadas-coqueiro.png`: asset transparente do coqueiro usado na fase 3 do Mundo da Garatuja.
- `sorvete-morango`: ilustração determinística em Canvas, centralizada na janela congelada da fase 6; não é um PNG gerado.
- `metadata.json`: catálogo, finalidade, formato e caminho de cada imagem.

As imagens são assets versionados do projeto. As perguntas continuarão funcionando com os emojis atuais até que os componentes do jogo sejam atualizados para consumir estes arquivos.

## Áudio das atividades

- `client/public/assets/mosquito-buzz.mp3`: efeito sonoro original em loop para o pomar; a atividade inicia o áudio após a primeira interação e reduz o volume conforme os mosquitos são afastados, silenciando ao concluir.
