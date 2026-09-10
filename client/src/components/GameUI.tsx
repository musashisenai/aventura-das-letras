/**
 * Design reminder — Livro-Mapa Encantado: papel recortado, trilhas costuradas,
 * leitura ampla e feedback que convida a tentar em vez de rotular erros.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type PointerEvent } from "react";
import { ArrowLeft, BookOpen, Check, ChevronRight, CircleHelp, Coins, Gift, Heart, Lock, Paintbrush, PawPrint, Play, RotateCcw, Sparkles, Star, Volume2, VolumeX, X } from "lucide-react";
import { PLACEMENT_QUESTIONS, WORLDS, type GameQuestion } from "@/game/content";
import { type GameController, type GameState } from "@/game/GameController";
import "./placement-fixes.css";

type Props = { state: GameState; controller: GameController };
type TeacherTab = "overview" | "profiles" | "answers" | "drawings";
const PHASES_PER_WORLD = 8;

function Mascot({ className = "", label = "Lumi, raposa parceira" }: { className?: string; label?: string }) {
  return <div className={`mascot-illustration ${className}`} role="img" aria-label={label}>
    <i className="fox-ear fox-ear-left" /><i className="fox-ear fox-ear-right" /><i className="fox-body" /><i className="fox-tail" />
    <i className="fox-head" /><i className="fox-muzzle" /><i className="fox-eye fox-eye-left" /><i className="fox-eye fox-eye-right" /><i className="fox-nose" /><i className="fox-scarf" /><b className="fox-spark">✦</b>
  </div>;
}

function BrandMark() {
  return <div className="brand-emblem" aria-hidden="true"><b>A</b><i>· ·</i><span>✦</span></div>;
}

function TreasureArt({ className = "" }: { className?: string }) {
  return <div className={`treasure-art ${className}`} role="img" aria-label="Baú de aventura, moedas e um ovo surpresa"><i className="treasure-ray ray-one" /><i className="treasure-ray ray-two" /><b className="treasure-egg">✦</b><span className="treasure-lid" /><span className="treasure-chest" /><em className="treasure-lock">★</em></div>;
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

function useQuestionNarration(question: GameQuestion | undefined, enabled: boolean, wordOnly = false) {
  const narration = wordOnly
    ? question?.targetWord ?? question?.audioText
    : question?.prompt;
  useEffect(() => {
    if (!enabled || !narration) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      return;
    }
    const timer = window.setTimeout(() => speak(narration), 260);
    return () => {
      window.clearTimeout(timer);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [enabled, narration, question?.id]);

  return () => {
    if (enabled && narration) speak(narration);
  };
}

function visiblePrompt(question: GameQuestion) {
  return question.displayPrompt ?? question.prompt;
}

function audioLabel(question: GameQuestion, wordOnly = false) {
  return wordOnly ? "Ouvir palavra" : "Ouvir pergunta";
}

function FigureIllustration({ question, placement = false }: { question: GameQuestion; placement?: boolean }) {
  if (!question.visual) return null;
  const math: Record<string, { left: string[]; operator?: string; right?: string[] }> = {
    "g-soma-1-2": { left: ["🍎"], operator: "+", right: ["🍎", "🍎"] },
    "p-blocos-2-1": { left: ["🧱", "🧱"], operator: "+", right: ["🧱"] },
    "sa-soma-gatos": { left: ["🐱", "🐱", "🐱"], operator: "+", right: ["🐱", "🐱"] },
    "sa-subtracao": { left: ["🌸", "🌸", "🌸", "🌸", "🌸"], operator: "−", right: ["🌸", "🌸"] },
    "a-problema": { left: ["🍎", "🍎", "🍎", "🍎", "🍎"], operator: "−", right: ["🍎", "🍎"] },
    "nivel-a-problema": { left: ["🍎", "🍎", "🍎", "🍎", "🍎"], operator: "−", right: ["🍎", "🍎"] },
    "a-soma": { left: ["★", "★"], operator: "+", right: ["★", "★", "★", "★"] },
    "a-subtracao": { left: ["9"], operator: "−", right: ["5"] },
  };
  const spec = math[question.id];
  if (spec) return <div className={placement ? "placement-question-visual math-visual" : "question-visual math-visual"} role="img" aria-label="Representação visual do cálculo"><div className="math-group">{spec.left.map((token, index) => <i key={`l-${index}`}>{token}</i>)}</div><b className="math-operator">{spec.operator}</b><div className="math-group">{spec.right?.map((token, index) => <i key={`r-${index}`}>{token}</i>)}</div></div>;
  const key = (question.targetWord ?? question.answer).toUpperCase();
  const assets: Record<string, string> = { MESA: "/figura-mesa.png", BOLO: "/figura-bolo.png", LIVRO: "/figura-livro.png", FLOR: "/figura-flor.png" };
  const asset = assets[key];
  return <div className={placement ? "placement-question-visual" : "question-visual"} role="img" aria-label="Ilustração da figura da atividade"><span className="figure-glyph">{asset ? <img src={asset} alt="" /> : question.visual}</span></div>;
}

function Header({ state, controller, back = false }: { state: GameState; controller: GameController; back?: boolean }) {
  const profile = state.profile;
  return (
    <header className="game-header">
      <div className="brand-lockup">
        <BrandMark />
        <div>
          <strong>Aventura</strong><span>das Letras</span>
        </div>
      </div>
      {profile && (
        <div className="header-actions">
          {back && <button className="icon-button" onClick={() => controller.goToMap()} aria-label="Voltar ao mapa"><ArrowLeft size={22} /></button>}
          <button className="currency-pill" onClick={() => controller.openPets()} aria-label="Abrir casa dos pets"><Coins size={19} /> {profile.coins}</button>
          <button className="currency-pill xp" onClick={() => controller.openPets()} aria-label="Abrir casa dos pets"><Star size={19} fill="currentColor" /> {profile.xp} XP</button>
          <button className="partner-chip" onClick={() => controller.openPets()}><Mascot label="Lumi, parceira do jogo" /> <span>{profile.name}</span></button>
        </div>
      )}
    </header>
  );
}

function EntryMenu({ state, controller }: Props) {
  const narrationOn = state.setupAudioEnabled;
  return <main className="entry-menu-page">
    <div className="opening-book-spread entry-spread" aria-hidden="true"><i className="book-spine" /><b>✦</b></div>
    <section className="entry-menu-copy paper-panel">
      <span className="page-tab">PORTA DE ENTRADA</span>
      <div className="entry-brand-stamp"><BrandMark /><span><strong>Aventura</strong><small>das Letras</small></span><i>✦</i></div>
      <p className="eyebrow"><Sparkles size={16} /> Livro-mapa encantado</p>
      <h1>Qual trilha<br /><em>vamos abrir?</em></h1>
      <p className="welcome-description">Escolha sua porta de entrada. A Lumi guarda seu combinado de leitura para esta expedição.</p>
      <div className="entry-actions">
        <button className="entry-path child-path" onClick={() => controller.openPlayerSetup()}><i className="entry-stop-tag" aria-hidden="true">PARADA 01</i><span className="entry-icon"><PawPrint size={25} /></span><span><strong>Sou criança</strong><small>Abrir minha expedição</small></span><ChevronRight size={24} /></button>
        <button className={`self-audio-toggle ${narrationOn ? "on" : "off"}`} onClick={() => controller.setSetupAudio(!narrationOn)} aria-pressed={narrationOn}><i className="entry-stop-tag" aria-hidden="true">COMBINADO</i><span className="entry-icon">{narrationOn ? <Volume2 size={25} /> : <VolumeX size={25} />}</span><span><strong>{narrationOn ? "Lumi pode ler para mim" : "Vou ler sem ajuda"}</strong><small>{narrationOn ? "Toque para mutar a narração" : "Toque para ouvir a Lumi novamente"}</small></span><i aria-hidden="true">{narrationOn ? "ON" : "OFF"}</i></button>
      </div>
      <p className="menu-reassurance">Você pode mudar esse combinado antes de escrever seu nome.</p>
      <button className="teacher-entry menu-teacher-entry" onClick={() => controller.openTeacher()}><Lock size={15} /> Sou professor(a)</button>
    </section>
    <aside className="entry-menu-art" aria-label="Lumi apresenta as portas de entrada do livro-mapa">
      <span className="diorama-tab">MAPA ABERTO</span>
      <i className="pop-paper-hill hill-back" aria-hidden="true" /><i className="pop-paper-hill hill-mid" aria-hidden="true" /><i className="star-stamp" aria-hidden="true">✦</i>
      <div className="menu-sign sign-child"><PawPrint size={17} /> MINHA TRILHA</div><div className="menu-sign sign-teacher"><BookOpen size={17} /> GUIA</div>
      <div className="menu-path" aria-hidden="true"><i>●</i><i>●</i><i>✦</i></div>
      <Mascot className="welcome-mascot" />
      <div className="welcome-note menu-note"><span>“A escolha é sua!”</span><small>— Lumi, sua parceira de trilha</small></div>
    </aside>
  </main>;
}

function Welcome({ state, controller }: Props) {
  const [name, setName] = useState("");
  return (
    <main className="welcome-page">
      <div className="opening-book-spread" aria-hidden="true"><i className="book-spine" /><b>✦</b></div>
      <section className="welcome-copy paper-panel">
        <span className="page-tab">PÁGINA DE PARTIDA</span>
        <p className="eyebrow"><Sparkles size={16} /> Uma expedição para aprender brincando</p>
        <h1>As letras estão<br /><em>chamando você.</em></h1>
        <p className="welcome-description">Aqui, cada pergunta abre um pedacinho de um grande livro de aventuras. Vamos descobrir letras, palavras, números e formas?</p>
        <div className="page-trail" aria-hidden="true"><i>✦</i><span /><b>●</b></div>
        <button className={`setup-audio-summary ${state.setupAudioEnabled ? "on" : "off"}`} onClick={() => controller.returnToMenu()}><span>{state.setupAudioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</span>{state.setupAudioEnabled ? "LUMI VAI LER AS PERGUNTAS" : "VOCÊ ESCOLHEU LER SOZINHO"}<small>AJUSTAR NO MENU</small></button>
        <label className="input-label" htmlFor="child-name">Qual nome vai no mapa da sua expedição?</label>
        <input id="child-name" className="name-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={18} placeholder="Escreva seu nome aqui" />
        <p className="input-label lumi-companion-note">A Lumi será sua única companheira de trilha e vai ajudar com dicas, leituras e descobertas.</p>
        <button className="primary-action" onClick={() => controller.beginProfile(name)}>Começar a expedição <ChevronRight size={23} /></button>
        <button className="teacher-entry" onClick={() => controller.openTeacher()}>Sou professor(a)</button>
      </section>
      <aside className="welcome-art" aria-label="Lumi, a raposa parceira, em uma floresta de papel">
        <span className="diorama-tab">ROTA 01</span>
        <div className="diorama-trail" aria-hidden="true"><i>●</i><i>●</i><i>✦</i></div>
        <div className="paper-sun">A</div>
        <div className="welcome-note"><span>“Eu vou com você!”</span><small>— Lumi, sua parceira de trilha</small></div>
        <Mascot className="welcome-mascot" />
        <div className="floating-letters"><b>A</b><b>3</b><b>△</b><b>O</b></div>
      </aside>
    </main>
  );
}

function Placement({ state, controller }: Props) {
  const placementQueue = state.placementQueue.length ? state.placementQueue : PLACEMENT_QUESTIONS;
  const question = placementQueue[state.placementIndex];
  const audioAvailable = state.profile?.audioEnabled !== false;
  const playNarration = useQuestionNarration(question, audioAvailable);
  const attemptLabel = state.placementAttempts === 0 ? "1ª tentativa" : "2ª tentativa";
  if (!question) return null;
  return (
    <main className="single-game-page">
      <section className="placement-card paper-panel">
        <div className="placement-topline"><span>Nivelamento inteligente</span><span>{state.placementIndex + 1} de {placementQueue.length}</span></div>
        <div className="progress-track"><i style={{ width: `${((state.placementIndex + 1) / placementQueue.length) * 100}%` }} /></div>
        <Mascot className="mini-lumi" label="Lumi" />
        <p className="eyebrow">Olá, {state.profile?.name}! Vamos só descobrir por onde sua aventura pode começar.</p>
        <div className="placement-question-title"><h2>{visiblePrompt(question)}</h2>{audioAvailable && <button className="audio-button placement-audio" onClick={playNarration} aria-label={audioLabel(question)}><Volume2 size={20} /> {audioLabel(question)}</button>}</div>
        <FigureIllustration question={question} placement />
        <p className="placement-attempt-label">{attemptLabel} · você pode tentar duas vezes</p>
        {question.kind === "draw" ? <DrawingPad disabled={Boolean(state.feedback)} onSend={(drawing) => controller.submitPlacement("Desenho enviado", drawing)} /> : question.kind === "order" ? <WordBuilder question={question} onAnswer={(answer) => controller.submitPlacement(answer)} /> : <div className="answer-grid placement-grid">
          {question.options?.map((option) => <button key={option} className="answer-tile" onClick={() => controller.submitPlacement(option)}>{option}</button>)}
        </div>}
        {state.feedback && <div className={`feedback-card ${state.feedback.tone}`}><div><CircleHelp size={22} /></div><p>{state.feedback.text}</p></div>}
        <p className="soft-note">Não é prova. Cada resposta ajuda a Lumi a escolher a melhor trilha para você.</p>
      </section>
    </main>
  );
}

function placementLevelMessage(worldId: number) {
  if (worldId <= 1) return "Vamos começar pelas descobertas iniciais, com calma e brincadeira.";
  if (worldId <= 3) return "Você já reconhece várias pistas. Vamos fortalecer a leitura passo a passo.";
  if (worldId <= 5) return "Você está pronta para juntar sons, sílabas e palavras em novas aventuras.";
  return "Você já está avançando na leitura de frases e na escrita das palavras.";
}

function PlacementResult({ state, controller }: Props) {
  const profile = state.profile!;
  const world = WORLDS[profile.recommendedWorld] ?? WORLDS[0];
  const total = state.placementResults.length;
  const retries = state.placementResults.filter((result) => result.attempts > 1).length;
  const evaluatedScore = Math.max(0, Math.round(state.placementScore - retries * 0.5));
  const totalAttempts = state.placementResults.reduce((sum, result) => sum + result.attempts, 0);
  return <main className="single-game-page placement-result-page">
    <section className="placement-result-card paper-panel">
      <div className="placement-result-kicker"><Sparkles size={18} /> Resultado da sua expedição</div>
      <Mascot className="result-lumi" label="Lumi comemorando o resultado" />
      <p className="eyebrow">Muito bem, {profile.name}! A Lumi olhou para cada resposta com atenção.</p>
      <h1>Seu próximo caminho é o <em>{world.shortName}</em></h1>
      <p className="result-intro">{placementLevelMessage(world.id)} Este é o ponto de partida escolhido para você.</p>
      <div className="placement-summary-grid">
        <article><strong>{state.placementScore}</strong><span>acertos em {total}</span></article>
        <article><strong>{totalAttempts}</strong><span>tentativas no total</span></article>
        <article><strong>{evaluatedScore}/{total}</strong><span>desempenho considerado</span></article>
      </div>
      <div className="placement-level-note" style={{ "--world": world.color, "--soft": world.accent } as CSSProperties}><span>{world.icon}</span><div><small>NÍVEL RECOMENDADO</small><strong>{world.name}</strong><p>{world.theme}</p></div></div>
      <section className="placement-results-list"><div className="table-head"><div><p className="eyebrow">Como foi o teste?</p><h2>Resposta por resposta</h2></div><span>{retries ? `${retries} questão(ões) refeita(s)` : "Todas na primeira tentativa"}</span></div>{state.placementResults.map((result, index) => <div className="placement-result-row" key={`${result.questionId}-${index}`}><span className={result.correct ? "result-check correct" : "result-check retry"}>{result.correct ? <Check size={17} /> : <X size={17} />}</span><p><strong>{index + 1}. {result.question}</strong><small>{result.attempts === 1 ? "1 tentativa" : `${result.attempts} tentativas`}</small></p><b>{result.correct ? "ACERTO" : "COM DICA"}</b></div>)}</section>
      <button className="primary-action" onClick={() => controller.openMapFromPlacement()}>Abrir meu livro-mapa <ChevronRight size={22} /></button>
    </section>
  </main>;
}

function MapPage({ state, controller }: Props) {
  const profile = state.profile!;
  const selectedWorld = WORLDS[state.selectedWorld] ?? WORLDS[profile.currentWorld];
  const totalDone = Object.keys(state.completions).length;
  return (
    <main className="map-page">
      <Header state={state} controller={controller} />
      <section className="map-hero">
        <div className="map-intro"><p className="eyebrow"><BookOpen size={16} /> Seu livro-mapa está aberto</p><h1>Olá, {profile.name}.<br />Qual trilha vamos <em>explorar?</em></h1><p>Você está vendo <strong>{selectedWorld.name}</strong>. Escolha qualquer mundo liberado para abrir suas fases, pontos e próximos passos.</p></div>
        <div className="profile-stamp"><span>Expedição</span><strong>Nível {Math.max(1, Math.floor(profile.xp / 40) + 1)}</strong><small>{totalDone} carimbos coletados</small></div>
      </section>
      <section className="world-trail" aria-label="Trilha dos mundos de alfabetização">
        <div className="trail-line" />
        {WORLDS.map((world, index) => {
          const open = controller.isWorldOpen(world.id);
          const selected = world.id === selectedWorld.id;
          const done = Object.keys(state.completions).filter((key) => key.startsWith(`${world.id}:`)).length;
          return <button key={world.id} className={`world-stop ${open ? "open" : "locked"} ${selected ? "current" : ""}`} style={{ "--world": world.color, "--soft": world.accent } as CSSProperties} onClick={() => open && controller.selectWorld(world.id)} disabled={!open} aria-pressed={selected}>
            <span className="world-icon">{open ? world.icon : <Lock size={19} />}</span><span className="world-number">0{index + 1}</span><strong>{world.shortName}</strong><small>{open ? world.theme : "Aventura bloqueada"}</small>{open && <b className="world-score">{done}/{PHASES_PER_WORLD}</b>}{world.id === profile.recommendedWorld && <i>TRILHA INDICADA</i>}
          </button>;
        })}
      </section>
      <section className="map-lower">
        <PhaseBook worldId={selectedWorld.id} state={state} controller={controller} />
        <aside className="lumi-tip-card"><Mascot label="Lumi" /><div><span>Dica da Lumi</span><p>“Quando uma letra parece difícil, nós podemos ouvir seu som bem devagar.”</p></div></aside>
      </section>
      <footer className="map-footer"><button onClick={() => controller.openPets()}><PawPrint size={19} /> Casa dos pets</button><button onClick={() => controller.openTeacher()}><BookOpen size={19} /> Área do professor</button></footer>
    </main>
  );
}

function PhaseBook({ worldId, state, controller }: { worldId: number; state: GameState; controller: GameController }) {
  const world = WORLDS[worldId];
  const completed = Object.keys(state.completions).filter((key) => key.startsWith(`${worldId}:`)).length;
  return <section className="phase-book paper-panel selected-world-book" style={{ "--world": world.color, "--soft": world.accent } as CSSProperties}>
    <div className="phase-book-head"><div><span className="world-label">{world.name}</span><h2>Fases deste mundo</h2><p>Escolha uma página liberada. A pontuação de cada fase fica guardada no seu livro-mapa.</p></div><div className="phase-count"><b>{completed}</b><span>/ {PHASES_PER_WORLD}</span></div></div>
    <div className="phase-grid">
      {Array.from({ length: 7 }).map((_, phase) => {
        const complete = state.completions[`${worldId}:${phase}`];
        const open = controller.isPhaseOpen(worldId, phase);
        return <button key={phase} className={`phase-node ${complete ? "complete" : ""} ${!open ? "locked" : ""}`} disabled={!open} onClick={() => controller.startPhase(worldId, phase)} aria-label={`Fase ${phase + 1}${complete ? `, ${complete.score} de 8 pontos` : open ? ", liberada" : ", bloqueada"}`}>{complete ? <Check size={18} /> : !open ? <Lock size={16} /> : <Play size={16} fill="currentColor" />}<span>Fase {phase + 1}</span>{complete ? <small>{complete.score}/8 PONTOS</small> : <small>{open ? "LIBERADA" : "BLOQUEADA"}</small>}</button>;
      })}
      {(() => { const finalOpen = controller.isPhaseOpen(worldId, 7); const final = state.completions[`${worldId}:7`]; return <button className={`final-phase ${final ? "complete" : ""}`} disabled={!finalOpen} onClick={() => controller.startPhase(worldId, 7)}>{finalOpen ? <Star size={22} fill="currentColor" /> : <Lock size={19} />}<span>Desafio final</span><small>{final ? `${final.score}/8 PONTOS` : finalOpen ? "LIBERADO" : "COMPLETE AS 7 FASES"}</small></button>; })()}
    </div>
  </section>;
}

function Lesson({ state, controller }: Props) {
  const question = controller.currentQuestion();
  if (!question) return null;
  const world = WORLDS[state.activeWorld];
  // Até o Silábico-Alfabético, a Lumi pode narrar o enunciado completo.
  // No Alfabético e no Ortográfico, somente atividades com palavra-alvo
  // oferecem áudio — e nelas o áudio é apenas a palavra, nunca a pergunta.
  const audioAvailable = state.profile?.audioEnabled !== false;
  const wordAudioAvailable = audioAvailable && Boolean(question.targetWord ?? question.audioText);
  const playNarration = useQuestionNarration(question, audioAvailable);
  const playWord = useQuestionNarration(question, wordAudioAvailable, true);
  return <main className="lesson-page" style={{ "--world": world.color, "--soft": world.accent } as CSSProperties}>
    <Header state={state} controller={controller} back />
    <section className="lesson-layout">
      <aside className="lesson-sidebar"><div className="lesson-world-mark">{world.icon}</div><p>{world.name}</p><strong>{state.activePhase === 7 ? "Desafio final" : `Fase ${state.activePhase + 1}`}</strong><div className="question-dots">{Array.from({ length: 8 }).map((_, index) => <i key={index} className={index <= state.questionIndex ? "filled" : ""} />)}</div><Mascot label="Lumi" /><div className="sidebar-bubble">{state.feedback?.tone === "hint" ? "Uma dica: olhe com calma." : "Eu estou aqui para ajudar!"}</div></aside>
      <section className="question-card paper-panel">
        <div className="question-head"><span>DESCOBERTA {state.questionIndex + 1} DE 8</span><div>{audioAvailable && <button className="audio-button" onClick={playNarration} aria-label={audioLabel(question)}><Volume2 size={20} /> {audioLabel(question)}</button>}{wordAudioAvailable && <button className="audio-button word-audio-button" onClick={playWord} aria-label={audioLabel(question, true)}><Volume2 size={20} /> {audioLabel(question, true)}</button>}<span className="attempt-pill">{state.attempts === 0 ? "2 chances" : "Mais uma chance"}</span></div></div>
        <h2>{visiblePrompt(question)}</h2>
        <FigureIllustration question={question} />
        <QuestionInteraction question={question} disabled={Boolean(state.feedback)} onAnswer={(answer, drawing) => controller.answer(answer, drawing)} />
        {state.feedback && <div className={`feedback-card ${state.feedback.tone}`}><div>{state.feedback.tone === "success" ? <Check size={24} /> : <CircleHelp size={24} />}</div><p>{state.feedback.text}</p><button onClick={() => controller.next()}>{state.questionIndex === 7 ? "Abrir meu baú" : "Próxima descoberta"} <ChevronRight size={20} /></button></div>}
      </section>
    </section>
  </main>;
}

function WordBuilder({ question, disabled = false, onAnswer }: { question: GameQuestion; disabled?: boolean; onAnswer: (answer: string) => void }) {
  const options = question.options ?? [];
  const [slots, setSlots] = useState<Array<number | null>>(() => options.map(() => null));
  useEffect(() => { setSlots(options.map(() => null)); }, [question.id, options.length]);

  const pieceLabel = options.some((piece) => /\s|[.!?]$/.test(piece)) ? "PALAVRAS" : options.every((piece) => piece.length === 1) ? "LETRAS" : "SÍLABAS";
  const choose = (pieceIndex: number) => {
    if (disabled || slots.includes(pieceIndex)) return;
    const firstEmpty = slots.findIndex((slot) => slot === null);
    if (firstEmpty < 0) return;
    setSlots((current) => current.map((slot, index) => index === firstEmpty ? pieceIndex : slot));
  };
  const remove = (slotIndex: number) => {
    if (disabled || slots[slotIndex] === null) return;
    setSlots((current) => current.map((slot, index) => index === slotIndex ? null : slot));
  };
  const dropInSlot = (event: DragEvent<HTMLButtonElement>, slotIndex: number) => {
    event.preventDefault();
    const rawPieceIndex = event.dataTransfer.getData("application/x-aventura-piece");
    if (!rawPieceIndex) return;
    const pieceIndex = Number(rawPieceIndex);
    if (disabled || !Number.isInteger(pieceIndex) || !options[pieceIndex] || slots.includes(pieceIndex)) return;
    setSlots((current) => current.map((slot, index) => index === slotIndex ? pieceIndex : slot));
  };
  const complete = slots.length > 0 && slots.every((slot) => slot !== null);
  const built = slots.map((slot) => slot === null ? "" : options[slot]).join("");

  return <div className="word-builder" aria-label="Montagem interativa de palavra">
    <p className="builder-instruction"><strong>TOQUE</strong> OU <strong>ARRASTE</strong> AS {pieceLabel.toLowerCase()} PARA MONTAR A RESPOSTA.</p>
    <div className="word-dropzone" aria-live="polite" aria-label="Espaços para montar a resposta">
      {slots.map((pieceIndex, slotIndex) => <button key={`slot-${slotIndex}`} className={`builder-slot ${pieceIndex !== null ? "filled" : ""}`} onClick={() => remove(slotIndex)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropInSlot(event, slotIndex)} disabled={disabled} aria-label={pieceIndex === null ? `Espaço ${slotIndex + 1} vazio` : `Remover ${options[pieceIndex]} da posição ${slotIndex + 1}`}>
        {pieceIndex === null ? <span className="slot-placeholder">?</span> : options[pieceIndex]}
      </button>)}
    </div>
    <p className="tray-label">{pieceLabel} DISPONÍVEIS</p>
    <div className="letter-tray">
      {options.map((piece, index) => <button key={`${piece}-${index}`} className={slots.includes(index) ? "used" : ""} draggable={!disabled && !slots.includes(index)} onDragStart={(event) => event.dataTransfer.setData("application/x-aventura-piece", String(index))} disabled={disabled || slots.includes(index)} onClick={() => choose(index)}>{piece}</button>)}
    </div>
    <div className="builder-actions"><button className="soft-action" onClick={() => setSlots(options.map(() => null))} disabled={disabled || !slots.some((slot) => slot !== null)}><RotateCcw size={17} /> Limpar</button><button className="primary-action compact" disabled={disabled || !complete} onClick={() => onAnswer(built)}>Conferir <Check size={19} /></button></div>
  </div>;
}

function QuestionInteraction({ question, disabled, onAnswer }: { question: GameQuestion; disabled: boolean; onAnswer: (answer: string, drawing?: string) => void }) {
  if (question.kind === "draw") return <DrawingPad disabled={disabled} onSend={(drawing) => onAnswer("Desenho enviado", drawing)} />;
  if (question.kind === "order") return <WordBuilder question={question} disabled={disabled} onAnswer={onAnswer} />;
  return <div className="answer-grid">{question.options?.map((option) => <button key={option} className="answer-tile" disabled={disabled} onClick={() => onAnswer(option)}>{option}</button>)}</div>;
}

function DrawingPad({ disabled, onSend }: { disabled: boolean; onSend: (drawing: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasMarks, setHasMarks] = useState(false);
  const position = (event: PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height }; };
  const begin = (event: PointerEvent<HTMLCanvasElement>) => { if (disabled) return; const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return; const point = position(event); ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineCap = "round"; ctx.lineWidth = 12; ctx.strokeStyle = "#19765C"; setDrawing(true); setHasMarks(true); canvas.setPointerCapture(event.pointerId); };
  const paint = (event: PointerEvent<HTMLCanvasElement>) => { if (!drawing || disabled) return; const ctx = canvasRef.current?.getContext("2d"); if (!ctx) return; const point = position(event); ctx.lineTo(point.x, point.y); ctx.stroke(); };
  const clear = () => { const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx || disabled) return; ctx.clearRect(0, 0, canvas.width, canvas.height); setHasMarks(false); };
  return <div className="drawing-pad"><div className="drawing-canvas-wrap"><canvas ref={canvasRef} width="900" height="360" onPointerDown={begin} onPointerMove={paint} onPointerUp={() => setDrawing(false)} onPointerCancel={() => setDrawing(false)} aria-label="Área para desenhar" /><span className={hasMarks ? "drawing-placeholder hidden" : "drawing-placeholder"}>Desenhe aqui</span></div><div className="drawing-controls"><p>Use o dedo ou o mouse para desenhar. A Lumi vai guardar sua criação para o professor ver.</p><div><button className="soft-action" disabled={disabled || !hasMarks} onClick={clear}>Limpar</button><button className="primary-action compact" disabled={disabled || !hasMarks} onClick={() => onSend(canvasRef.current?.toDataURL("image/png") || "")}>Enviar meu desenho <ChevronRight size={19} /></button></div></div></div>;
}

function Reward({ state, controller }: Props) {
  const reward = state.reward;
  if (!reward) return null;
  return <main className="single-game-page reward-page"><section className="reward-card paper-panel"><p className="eyebrow"><Gift size={17} /> Baú encontrado</p><h1>{reward.title}!</h1><TreasureArt className="reward-treasure" /><p>Você cuidou muito bem da sua trilha. Veja o que o baú guardou para você.</p><div className="reward-row"><span><Coins size={21} /> +{reward.coins} moedas</span><span><Star size={21} fill="currentColor" /> +{reward.xp} XP</span>{reward.egg && <span><Sparkles size={21} /> Ovo surpresa</span>}</div><button className="primary-action" onClick={() => controller.goToMap()}>Voltar ao meu livro-mapa <BookOpen size={22} /></button></section></main>;
}

function Pets({ state, controller }: Props) {
  const profile = state.profile!;
  return <main className="pets-page"><Header state={state} controller={controller} back /><section className="pet-layout"><div className="pet-room paper-panel"><p className="eyebrow"><PawPrint size={16} /> Casa dos pets</p><h1>O cantinho da<br /><em>pequena Faísca.</em></h1><div className="pet-stage"><div className="pet-bubble">Nível {profile.petLevel}</div><div className="egg-pet">{profile.eggs > 0 ? "🥚" : "🐣"}</div><div className="pet-nameplate">Faísca <small>Pet de aventura</small></div></div><div className="care-meter"><span>Carinho e energia</span><div><i style={{ width: `${profile.petCare}%` }} /></div><b>{profile.petCare}%</b></div><div className="pet-actions"><button onClick={() => controller.careForPet("food")}><span>🍎</span> Alimentar <small>5 moedas</small></button><button onClick={() => controller.careForPet("care")}><span>♥</span> Carinho <small>grátis</small></button><button onClick={() => controller.careForPet("play")}><span>★</span> Brincar <small>3 moedas</small></button></div></div><aside className="pet-side"><section className="egg-inventory paper-panel"><TreasureArt className="inventory-treasure" /><h2>Sua mochila</h2><p><strong>{profile.eggs}</strong> ovo{profile.eggs === 1 ? "" : "s"} esperando cuidado</p><small>Quando Faísca ficar bem feliz, ela cresce e muda de aparência.</small></section><button className="back-map-button" onClick={() => controller.goToMap()}><ArrowLeft size={19} /> Voltar ao mapa</button></aside></section></main>;
}

function Teacher({ state, controller }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TeacherTab>("overview");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const profile = state.profile;
  if (!state.teacherAuthorized) return <main className="single-game-page"><section className="teacher-lock paper-panel"><Lock size={38} /><p className="eyebrow">Acesso orientador</p><h1>Área do professor</h1><p>Entre para acompanhar a trilha, as respostas e os desenhos de cada aluno neste dispositivo.</p><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" /><button className="primary-action" onClick={() => { if (!controller.authorizeTeacher(password)) setError("Senha não reconhecida. Para esta demonstração, use “professor”."); }}>Entrar <ChevronRight size={21} /></button>{error && <small className="login-error">{error}</small>}<button className="teacher-entry" onClick={() => controller.goToMap()}>Voltar ao jogo</button></section></main>;
  const openTab = (next: TeacherTab) => { setTab(next); if (next !== "answers" && next !== "drawings") setSelectedAnswer(null); };
  return <main className="teacher-page"><Header state={state} controller={controller} back /><section className="teacher-layout"><aside className="teacher-sidebar"><p className="eyebrow">Painel do professor</p><h2>Acompanhamento<br />da turma</h2><button className={tab === "overview" ? "active" : ""} onClick={() => openTab("overview")}><BookOpen size={18} /> Visão geral</button><button className={tab === "profiles" ? "active" : ""} onClick={() => openTab("profiles")}><PawPrint size={18} /> Perfis de alunos</button><button className={tab === "answers" ? "active" : ""} onClick={() => openTab("answers")}><CircleHelp size={18} /> Respostas</button><button className={tab === "drawings" ? "active" : ""} onClick={() => openTab("drawings")}><Paintbrush size={18} /> Desenhos</button><button className="back-sidebar" onClick={() => controller.goToMap()}><ArrowLeft size={18} /> Voltar ao mapa</button></aside><section className="teacher-content"><div className="teacher-welcome"><div><p className="eyebrow">Aluno em foco</p><h1>{profile?.name || "Nenhum aluno cadastrado"}</h1><p>Todos os registros ficam neste navegador e podem ser analisados resposta por resposta.</p></div><div className="student-badge"><Mascot label="Parceira Lumi" /><span>{profile?.partner || "Parceiro"}</span></div></div>{profile ? <TeacherDashboard state={state} controller={controller} tab={tab} onTabChange={openTab} selectedAnswer={selectedAnswer} onSelectAnswer={setSelectedAnswer} /> : <div className="empty-teacher paper-panel">Ainda não há aluno cadastrado. Crie uma aventura na tela inicial.</div>}</section></section></main>;
}

function TeacherDashboard({ state, controller, tab, onTabChange, selectedAnswer, onSelectAnswer }: Props & { tab: TeacherTab; onTabChange: (tab: TeacherTab) => void; selectedAnswer: number | null; onSelectAnswer: (index: number | null) => void }) {
  const profile = state.profile!;
  const accuracy = controller.worldAccuracy(profile.currentWorld);
  const world = WORLDS[profile.currentWorld];
  const entries = state.answers.map((answer, index) => ({ answer, index })).reverse();
  const drawings = entries.filter(({ answer }) => Boolean(answer.drawing));
  const visible = tab === "drawings" ? drawings : entries;
  const selected = visible.find((entry) => entry.index === selectedAnswer) ?? visible[0];
  const audioCard = <section className="audio-control paper-panel"><p className="eyebrow">Acessibilidade individual</p><h2>Leitura em voz alta</h2><p className="soft-note">{profile.audioEnabled ? "A LUMI PODE LER AS PERGUNTAS OU PALAVRAS DE REFERÊNCIA PARA ESTE ALUNO." : "A LEITURA POR ÁUDIO ESTÁ DESLIGADA. O ALUNO LERÁ AS ATIVIDADES SEM NARRAÇÃO."}</p><button className="primary-action compact" onClick={() => controller.setStudentAudio(!profile.audioEnabled)}>{profile.audioEnabled ? <><VolumeX size={18} /> Desativar áudio deste aluno</> : <><Volume2 size={18} /> Ativar áudio deste aluno</>}</button></section>;
  if (tab === "profiles") return <><section className="student-profile-card paper-panel"><div><p className="eyebrow">Perfil de aluno</p><h2>{profile.name}</h2><p>Parceiro: <strong>{profile.partner}</strong> · Nível {Math.max(1, Math.floor(profile.xp / 40) + 1)} · {profile.xp} XP</p></div><div className="profile-actions"><button className="soft-action" onClick={() => onTabChange("answers")}><CircleHelp size={17} /> Ver respostas</button><button className="soft-action" onClick={() => controller.goToMap()}><BookOpen size={17} /> Abrir livro-mapa</button></div></section>{audioCard}<WorldTeacherGrid state={state} controller={controller} onOpenAnswers={() => onTabChange("answers")} /></>;
  if (tab === "answers" || tab === "drawings") return <section className="analysis-workspace"><div className="analysis-list paper-panel"><div className="table-head"><div><p className="eyebrow">{tab === "drawings" ? "Portfólio visual" : "Resposta por resposta"}</p><h2>{tab === "drawings" ? "Desenhos enviados" : "Analisar tentativas"}</h2></div><span>{visible.length} registro(s)</span></div>{visible.length ? <div className="response-select-list">{visible.map(({ answer, index }) => <button key={`${answer.at}-${index}`} className={selected?.index === index ? "selected" : ""} onClick={() => onSelectAnswer(index)}><span className={answer.correct ? "status-correct" : "status-help"}>{answer.correct ? "ACERTO" : "COM DICA"}</span><strong>{WORLDS[answer.worldId]?.shortName || "Mundo"} · Fase {answer.phase + 1}</strong><small>{answer.question}</small></button>)}</div> : <p className="empty-note">Ainda não há registros para analisar.</p>}</div>{selected && <AnswerInspector answer={selected.answer} />}</section>;
  return <><section className="teacher-stat-grid"><article><span>Mundo atual</span><strong>{world.shortName}</strong><i style={{ background: world.color }} /></article><article><span>Acerto no mundo</span><strong>{accuracy}%</strong><i className="green" /></article><article><span>Respostas salvas</span><strong>{state.answers.length}</strong><i className="orange" /></article></section>{audioCard}<WorldTeacherGrid state={state} controller={controller} onOpenAnswers={() => onTabChange("answers")} /><section className="answer-history paper-panel"><div className="table-head"><div><p className="eyebrow">Portfólio de aprendizagem</p><h2>Últimas respostas</h2></div><button className="soft-action" onClick={() => onTabChange("answers")}>ANALISAR TUDO <ChevronRight size={17} /></button></div>{entries.length ? <div className="history-list">{entries.slice(0, 6).map(({ answer, index }) => <button key={`${answer.at}-${index}`} onClick={() => { onSelectAnswer(index); onTabChange("answers"); }}><span className={answer.correct ? "status-correct" : "status-help"}>{answer.correct ? "ACERTO" : "COM DICA"}</span><p>{answer.question}</p><strong>{answer.answer}</strong><small>{answer.at}</small></button>)}</div> : <p className="empty-note">AS RESPOSTAS DA CRIANÇA APARECERÃO AQUI DURANTE AS FASES.</p>}</section></>;
}

function WorldTeacherGrid({ state, controller, onOpenAnswers }: { state: GameState; controller: GameController; onOpenAnswers: () => void }) {
  return <section className="teacher-table paper-panel"><div className="table-head"><div><p className="eyebrow">Mundos e fases</p><h2>Progresso da trilha</h2></div><span>CLIQUE EM UM MUNDO PARA ABRIR AS RESPOSTAS</span></div><div className="world-teacher-grid">{WORLDS.map((world) => { const done = Object.keys(state.completions).filter((key) => key.startsWith(`${world.id}:`)).length; const accuracy = controller.worldAccuracy(world.id); return <button key={world.id} onClick={() => { controller.selectWorld(world.id); onOpenAnswers(); }} style={{ "--world": world.color } as CSSProperties}><span>{world.icon}</span><strong>{world.shortName}</strong><small>{done}/{PHASES_PER_WORLD} FASES · {accuracy}%</small><i style={{ width: `${(done / PHASES_PER_WORLD) * 100}%` }} /></button>; })}</div>{state.profile!.currentWorld < WORLDS.length - 1 && <button className="release-button" disabled={controller.worldAccuracy(state.profile!.currentWorld) < 70} onClick={() => controller.releaseNextWorld(state.profile!.currentWorld)}>{controller.worldAccuracy(state.profile!.currentWorld) >= 70 ? "LIBERAR PRÓXIMO MUNDO" : `FALTAM ${70 - controller.worldAccuracy(state.profile!.currentWorld)}% PARA O AVANÇO`} <ChevronRight size={19} /></button>}</section>;
}

function AnswerInspector({ answer }: { answer: GameState["answers"][number] }) {
  const world = WORLDS[answer.worldId];
  return <section className="answer-inspector paper-panel"><div className="table-head"><div><p className="eyebrow">Análise da resposta</p><h2>{world?.shortName || "Mundo"} · Fase {answer.phase + 1}</h2></div><span className={answer.correct ? "status-correct" : "status-help"}>{answer.correct ? "ACERTO" : "COM DICA"}</span></div><div className="inspector-section"><span>PERGUNTA</span><p>{answer.question}</p></div>{answer.visual && <div className="inspector-visual" aria-label="Ilustração da pergunta">{answer.visual}</div>}{answer.options?.length ? <div className="inspector-section"><span>ALTERNATIVAS</span><div className="inspector-options">{answer.options.map((option) => <b key={option} className={`${option === answer.answer ? "student-choice" : ""} ${option === answer.correctAnswer ? "correct-choice" : ""}`}>{option}{option === answer.answer && <small>ESCOLHA</small>}{option === answer.correctAnswer && <small>RESPOSTA</small>}</b>)}</div></div> : null}<div className="inspector-answer"><span>RESPOSTA DO ALUNO</span><strong>{answer.answer}</strong><small>{answer.hint ? `PISTA USADA: ${answer.hint}` : "SEM PISTA REGISTRADA"}</small></div>{answer.drawing && <div className="drawing-review"><span>DESENHO DO ALUNO</span><img src={answer.drawing} alt="Desenho enviado pelo aluno para esta resposta" /></div>}<small className="answer-time">REGISTRADO EM {answer.at}</small></section>;
}

export default function GameUI({ state, controller }: Props) {
  const content = useMemo(() => {
    const requiresProfile = ["map", "placement-result", "lesson", "reward", "pets"].includes(state.screen);
    if (requiresProfile && !state.profile) return <EntryMenu state={state} controller={controller} />;
    if (state.screen === "menu") return <EntryMenu state={state} controller={controller} />;
    if (state.screen === "welcome") return <Welcome state={state} controller={controller} />;
    if (state.screen === "placement") return <Placement state={state} controller={controller} />;
    if (state.screen === "placement-result") return <PlacementResult state={state} controller={controller} />;
    if (state.screen === "map") return <MapPage state={state} controller={controller} />;
    if (state.screen === "lesson") return <Lesson state={state} controller={controller} />;
    if (state.screen === "reward") return <Reward state={state} controller={controller} />;
    if (state.screen === "pets") return <Pets state={state} controller={controller} />;
    return <Teacher state={state} controller={controller} />;
  }, [state, controller]);
  return <div className="game-ui">{content}</div>;
}
