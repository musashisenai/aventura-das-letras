# Aventura das Letras — Documentação do projeto

## 1. Visão geral

**Aventura das Letras** é um jogo educativo para navegador, desenvolvido em português brasileiro, com foco no acompanhamento da alfabetização por meio de uma aventura interativa. A criança percorre um mapa-livro, responde a atividades de linguagem, matemática inicial, reconhecimento visual e desenho, recebe feedback encorajador e acumula progresso, moedas, experiência, ovos e cuidados com um pet.

O projeto combina uma cena visual em **Babylon.js** com uma interface de telas construída em **React**. O estado do jogo é centralizado no `GameController`, que coordena o perfil da criança, o teste inicial de nivelamento, a seleção de fases, as respostas, as recompensas, a casa dos pets, as decisões do professor e a persistência dos dados.

A aplicação também possui uma área do professor. Nela, o responsável pode acompanhar alunos sincronizados pelo servidor, consultar respostas, analisar desempenho, liberar o próximo mundo, controlar a leitura em voz alta individual, alterar sua senha e excluir perfis mediante dupla confirmação.

## 2. Como o jogo funciona

### 2.1 Entrada e criação do perfil

A entrada principal é renderizada por `client/src/App.tsx`, que carrega `GameCanvas`. O componente `GameCanvas` cria o controlador e a cena visual, assina as mudanças de estado e monta a interface `GameUI` sobre o canvas.

Na tela inicial, a pessoa pode escolher entre iniciar uma aventura como criança ou acessar a área do professor. Ao iniciar uma aventura, o nome da criança é validado contra os alunos já sincronizados para evitar duplicidade de nomes. Em seguida, o jogo cria um identificador de estudante, inicializa o perfil e conduz a criança ao teste de nivelamento.

O perfil contém, entre outros dados:

- Nome e identificador do aluno;
- Mundo atual e mundo recomendado;
- Moedas, XP e ovos;
- Nome, espécie, estágio, nível e energia do pet;
- Preferência de áudio;
- Progresso de fases e respostas registradas.

### 2.2 Teste inicial de nivelamento

O teste inicial está definido em `PLACEMENT_QUESTIONS`, no arquivo `client/src/game/content.ts`. Ele possui perguntas que observam habilidades progressivas, incluindo:

- Reconhecimento de letras;
- Ordem alfabética;
- Identificação de números e formas;
- Contagem e comparação de quantidades;
- Coordenação gráfica por meio de desenho;
- Reconhecimento de palavras maiores e menores;
- Consciência silábica;
- Montagem de palavras;
- Completar palavras;
- Escrita convencional;
- Leitura de frases;
- Rimas;
- Matemática inicial;
- Ortografia, acentuação e uso de cedilha.

As questões são embaralhadas quando a fila de nivelamento é criada. As alternativas também podem ser embaralhadas. Quando a criança erra, o jogo apresenta uma pista positiva e permite uma nova tentativa. Se a segunda tentativa também estiver incorreta, a questão é registrada como não acertada e o teste continua sem uma mensagem punitiva.

A classificação utiliza o percentual de acertos, com uma pequena penalização para questões que exigiram uma segunda tentativa. As faixas atualmente implementadas são:

| Percentual de desempenho | Mundo recomendado | Interpretação geral |
|---:|---|---|
| Até 20% | Garatuja | Exploração de marcas, formas, traços e noções iniciais |
| Mais de 20% até 35% | Alfabeto | Reconhecimento de letras, sons iniciais e ordem alfabética |
| Mais de 35% até 50% | Pré-Silábico | Relação entre letras, números, palavras e características da escrita |
| Mais de 50% até 65% | Silábico | Percepção de sílabas, rimas, palmas e composição de palavras |
| Mais de 65% até 80% | Silábico-Alfabético | Combinação de sílabas e letras na construção da escrita |
| Mais de 80% até 92% | Alfabético | Leitura, frases, escrita convencional e compreensão de palavras |
| Acima de 92% | Ortográfico | Convenções ortográficas, acentuação, cedilha e grafias específicas |

A função `getPlacementWorld` concentra essa regra. O resultado é salvo no perfil como `currentWorld` e `recommendedWorld`, e a criança é encaminhada ao mapa.

> O teste é um instrumento de orientação dentro do jogo. Ele não substitui avaliação pedagógica, diagnóstico profissional ou acompanhamento individualizado.

### 2.3 Mapa, mundos e fases

Os mundos são definidos em `client/src/game/content.ts` e apresentados na seguinte ordem:

1. **Garatuja** — ateliê das primeiras marcas;
2. **Alfabeto** — jardim das 26 chaves;
3. **Pré-Silábico** — cidade das letras curiosas;
4. **Silábico** — ilhas que cantam sílabas;
5. **Silábico-Alfabético** — montanha das palavras;
6. **Alfabético** — céu das frases leitoras;
7. **Ortográfico** — biblioteca dos sons especiais.

Cada mundo possui um banco de perguntas maior que a quantidade exibida em uma fase. O jogo seleciona e rotaciona perguntas do banco, gerando uma fila de oito desafios por fase. A oitava posição é tratada como desafio final do mundo.

O professor pode liberar o próximo mundo quando o aluno conclui as fases do mundo atual e alcança pelo menos 70% de desempenho, conforme a lógica de aprovação implementada no controlador e no painel docente.

Saves criados antes da troca da ordem entre Garatuja e Alfabeto possuem migração automática. O `worldOrderVersion` permite remapear o progresso antigo para que os dados não sejam associados ao mundo errado.

### 2.4 Tipos de atividade

As perguntas possuem três formatos principais:

- **Escolha:** a criança seleciona uma alternativa visual ou textual;
- **Ordenação:** a criança monta uma palavra ou frase usando blocos/cartões;
- **Desenho:** a criança envia um traço, desenho ou marca gráfica.

Os conteúdos também incluem elementos visuais para contagem, formas geométricas, objetos, animais, palavras de referência e situações matemáticas. A narração utiliza a Web Speech API quando disponível e respeita a preferência de áudio definida no perfil.

### 2.5 Feedback, progresso e recompensas

O jogo evita tratar o erro como punição. A primeira tentativa incorreta gera uma pista textual encorajadora. Ao completar atividades, a criança pode receber:

- Moedas;
- XP;
- Ovos com diferentes raridades;
- Progresso de cuidado do pet;
- Evolução do pet;
- Registros de conclusão de fase.

As respostas são registradas com pergunta, resposta, correção, mundo, fase, tipo de questão, pista, horário e, quando aplicável, desenho. Esses registros podem ser consultados pelo professor.

## 3. Níveis de alfabetização abordados

A progressão do jogo foi organizada para acompanhar uma sequência de hipóteses e habilidades de alfabetização. Os nomes dos mundos são usados como categorias pedagógicas de progressão dentro da experiência, não como diagnóstico automático da criança.

### 3.1 Garatuja

Trabalha a exploração inicial de marcas e representações gráficas. O jogo aborda traços retos e ondulados, formas, desenhos, contagem visual, reconhecimento de símbolos e coordenação para produzir marcas no canvas.

### 3.2 Alfabeto

Trabalha o reconhecimento visual de letras, identificação de vogais e consoantes em situações simples, ordem alfabética, letra inicial e associação entre letra, som e palavra de referência.

### 3.3 Pré-Silábico

Trabalha a diferenciação entre letras, números, símbolos e desenhos; comparação de quantidade de letras; identificação de palavras maiores ou menores; reconhecimento de nomes e relações iniciais entre escrita e significado.

### 3.4 Silábico

Trabalha a consciência silábica por meio de divisão oral, contagem de sílabas, palmas, identificação da sílaba inicial, sílaba final, rimas e montagem de palavras com unidades silábicas.

### 3.5 Silábico-Alfabético

Trabalha a transição entre representar palavras por sílabas e representar seus componentes sonoros com letras. As atividades incluem completar palavras, localizar letras ausentes, comparar escritas e organizar partes de palavras.

### 3.6 Alfabético

Trabalha a leitura e a escrita de palavras e frases, a ordem convencional da frase, rimas, identificação de letras finais e compreensão de pequenas situações textuais e matemáticas.

### 3.7 Ortográfico

Trabalha convenções da escrita, como uso de `RR`, `SS`, `Ç`, acentos, til, pontuação, grafias corretas e distinção entre palavras convencionais e formas incorretas.

## 4. Área do professor

A área docente é acessada pela tela de entrada e exige autenticação. A senha é validada pelo servidor em `/api/teacher/authorize`, e a alteração é feita por `/api/teacher/password`. A senha configurada pelo professor é armazenada no arquivo de dados local do servidor, em `.local-data/teacher.json`, e não deve ser publicada na documentação ou no controle de versão.

O painel permite:

- Visualizar a quantidade de alunos sincronizados;
- Selecionar um aluno e consultar o mundo atual;
- Ver fases concluídas, XP, pet e respostas;
- Explorar respostas por mundo e fase;
- Inspecionar alternativas escolhidas, resposta correta, pistas e desenhos;
- Aprovar e liberar o próximo mundo;
- Ativar ou desativar a leitura em voz alta de um aluno;
- Exportar relatórios da turma em CSV ou impressão para PDF;
- Alterar o nome do professor;
- Alterar a senha de acesso;
- Excluir um aluno com confirmação inicial e digitação do nome do aluno.

A exclusão é deliberadamente destrutiva. A interface exige duas confirmações e a API valida o nome normalizado antes de remover o registro de `students.json`.

## 5. Arquitetura técnica

### 5.1 Fluxo principal

```text
App.tsx
  └── GameCanvas.tsx
       ├── Babylon.js Engine e cena visual
       ├── GameController
       │    ├── Estado do jogo
       │    ├── Nivelamento
       │    ├── Fases e respostas
       │    ├── Recompensas e pets
       │    ├── Persistência local
       │    └── Sincronização do aluno
       └── GameUI.tsx
            ├── Entrada e perfil
            ├── Nivelamento
            ├── Mapa e fases
            ├── Perguntas e desenho
            ├── Pets e recompensas
            └── Área do professor
```

### 5.2 Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| `client/src/App.tsx` | Entrada da aplicação e renderização da tela principal |
| `client/src/components/GameCanvas.tsx` | Integração entre canvas, Babylon.js, controlador e interface |
| `client/src/components/GameUI.tsx` | Telas, componentes de interação e painel do professor |
| `client/src/game/GameController.ts` | Estado, regras, navegação, nivelamento, progresso, recompensas e persistência |
| `client/src/game/content.ts` | Mundos, bancos de perguntas, questões de nivelamento e conteúdos pedagógicos |
| `client/src/game/scene.ts` | Criação e descarte da cena visual Babylon.js |
| `client/src/components/Map.tsx` | Elementos visuais e navegação do mapa |
| `client/src/index.css` | Estilos globais e identidade visual |
| `server/index.ts` | API Express, arquivos locais de alunos e senha do professor |
| `shared/const.ts` | Constantes compartilhadas entre cliente e servidor |

### 5.3 Persistência

O navegador mantém o estado do jogo em `localStorage`, usando as chaves da versão atual e de compatibilidade legada. Isso permite continuar a aventura no mesmo dispositivo.

Quando existe um perfil, o controlador tenta sincronizar os dados com `POST /api/students`. A sincronização inclui perfil, conclusões, aprovações de mundo e respostas. A decisão do professor é consultada periodicamente por `GET /api/students/:id`.

No servidor, os dados são mantidos em arquivos JSON dentro de `.local-data`:

- `students.json`: registros dos alunos;
- `teacher.json`: senha persistida do professor.

A aplicação foi desenhada para continuar funcionando localmente quando a sincronização não estiver disponível; nesse caso, a tentativa de sincronização é repetida nas alterações seguintes.

## 6. Linguagens, bibliotecas e ferramentas utilizadas

### 6.1 Linguagens

| Tecnologia | Uso no projeto |
|---|---|
| **TypeScript** | Lógica do jogo, tipos, componentes React, servidor e contratos de dados |
| **TSX** | Componentes React com marcação JSX tipada |
| **JavaScript** | Runtime gerado pelo build e ecossistema Node/Vite |
| **CSS** | Layout, responsividade, identidade visual, acessibilidade visual e animações |
| **HTML** | Documento base em `client/index.html` e estrutura renderizada pelos componentes |
| **JSON** | Configuração do projeto, lockfile e persistência local de alunos/senha |

### 6.2 Bibliotecas e ferramentas principais

| Ferramenta | Função |
|---|---|
| **React 19** | Construção da interface declarativa e gerenciamento de renderização |
| **Babylon.js 9** | Engine e cena visual 2D/3D do palco do jogo |
| **Vite** | Servidor de desenvolvimento e empacotamento do frontend |
| **Express** | API HTTP do servidor local |
| **TypeScript 5.6** | Verificação estática e compilação tipada |
| **esbuild** | Bundle do servidor para produção |
| **pnpm** | Gerenciamento de dependências e execução dos scripts |
| **Lucide React** | Ícones da interface |
| **Web Speech API** | Narração opcional de perguntas e palavras no navegador |
| **Vitest** | Infraestrutura disponível para testes automatizados |
| **Prettier** | Formatação do código |

## 7. Execução local

Pré-requisitos: Node.js, pnpm e um navegador moderno com suporte a canvas.

```bash
pnpm install
pnpm dev
```

Para verificar tipos:

```bash
pnpm check
```

Para gerar o build de produção:

```bash
pnpm build
```

Para iniciar o bundle de produção depois do build:

```bash
pnpm start
```

A aplicação usa o host configurado pelo Vite no desenvolvimento e a porta definida pela variável `PORT` no servidor de produção, com `3000` como padrão.

## 8. Verificação e manutenção

Antes de publicar alterações, recomenda-se executar `pnpm check`, `pnpm build` e `git diff --check`. Alterações em `WORLDS`, bancos de perguntas ou IDs de mundo devem considerar a compatibilidade com saves existentes, conclusões, respostas, aprovações e relatórios do professor.

Ao criar novas atividades, é importante manter uma pergunta com enunciado claro, alternativas coerentes, resposta correta, pista não punitiva e, quando aplicável, suporte a áudio ou elemento visual. O conteúdo deve continuar adequado à faixa de alfabetização representada pelo mundo.

## 9. Limitações conhecidas

O nivelamento é heurístico e baseado no desempenho observado nas questões; ele não realiza avaliação clínica ou pedagógica completa. Atividades de desenho verificam a existência de um desenho enviado, mas não interpretam semanticamente o conteúdo desenhado. A persistência em arquivos JSON é adequada ao protótipo e a ambientes locais, mas uma implantação multiusuário de maior escala deve migrar para um banco de dados com autenticação, controle de acesso, backups e auditoria.

A senha do professor não deve ser compartilhada em documentação pública. Em um ambiente de produção, recomenda-se definir a senha inicial por variável de ambiente ou procedimento administrativo seguro e proteger o arquivo de dados do servidor.

## 10. Autores

O repositório identifica como autores **Leonardo Neves**, **Leonardo Henrique**, **Felipe Tavares** e **Daniel Borges**.
