# Game Plan: Aventura das Letras

## Main Build

Criar uma experiência de alfabetização em português brasileiro que use um mapa-livro de seis mundos, um parceiro animal, um nivelamento inicial e fases com bancos de questões maiores que a rodada jogada. A versão entregue funciona integralmente no navegador e utiliza salvamento local para perfil, respostas, recompensas e desenho.

- **Assets needed:** Fundo de floresta em livro pop-up (1920x1080, tela inteira); mascote Lumi (256x256 px); símbolo de marca (128x128 px); kit de recompensas (160x160 px).
- **Verify:**
  - A cena Babylon abre sem erro, ajusta-se ao redimensionamento e é descartada ao desmontar a tela.
  - O nivelamento cria um perfil e conduz ao mapa com o primeiro mundo aberto.
  - Cada fase seleciona 8 desafios por embaralhamento de um banco maior; as rejogadas mudam a ordem.
  - O primeiro erro mostra dica positiva; a segunda tentativa conduz à próxima pergunta sem mensagem punitiva.
  - Os quatro primeiros mundos exibem controle de leitura em voz alta; os dois seguintes não o exibem.
  - Os formatos de alternativa, composição por arrastar/tocar, matemática visual e desenho são jogáveis.
  - O baú entrega moedas, XP e ovos; o pet responde a cuidado e alimentação.
  - A área local do professor permite consultar respostas, incluindo desenho, e liberar o próximo mundo após 70%.
  - Não há falhas de leitura, sobreposição crítica ou erro no console durante a captura.
  - A imagem de referência é refletida pela paleta, pela profundidade em papel e pelo mapa-livro ilustrado.

