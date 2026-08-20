/**
 * Design reminder — Livro-Mapa Encantado: papel recortado, trilhas costuradas,
 * leitura ampla e feedback que convida a tentar em vez de rotular erros.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowLeft, BookOpen, Check, ChevronRight, CircleHelp, Coins, Gift, Heart, Lock, Paintbrush, PawPrint, Play, RotateCcw, Sparkles, Star, Volume2, X } from "lucide-react";
import { PLACEMENT_QUESTIONS, WORLDS, type GameQuestion } from "@/game/content";
import { type GameController, type GameState } from "@/game/GameController";

type Props = { state: GameState; controller: GameController };
type Animal = { name: string; emoji: string; note: string };

const animals: Animal[] = [
  { name: "Raposa", emoji: "🦊", note: "curiosa e esperta" },
  { name: "Coruja", emoji: "🦉", note: "atenta às palavras" },
  { name: "Panda", emoji: "🐼", note: "calmo e gentil" },
  { name: "Coelho", emoji: "🐰", note: "rápido nas descobertas" },
];

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

function Welcome({ controller }: { controller: GameController }) {
  const [name, setName] = useState("");
  const [animal, setAnimal] = useState("Raposa");
  return (
    <main className="welcome-page">
      <section className="welcome-copy paper-panel">
        <p className="eyebrow"><Sparkles size={16} /> Uma expedição para aprender brincando</p>
        <h1>As letras estão<br /><em>chamando você.</em></h1>
        <p className="welcome-description">Aqui, cada pergunta abre um pedacinho de um grande livro de aventuras. Vamos descobrir letras, palavras, números e formas?</p>
        <label className="input-label" htmlFor="child-name">Como podemos te chamar?</label>
        <input id="child-name" className="name-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={18} placeholder="Digite seu nome" />
        <p className="input-label">Escolha quem vai caminhar com você</p>
        <div className="animal-picker">
          {animals.map((item) => <button key={item.name} className={`animal-choice ${animal === item.name ? "selected" : ""}`} onClick={() => setAnimal(item.name)}><span>{item.emoji}</span><small>{item.name}</small></button>)}
        </div>
        <button className="primary-action" onClick={() => controller.beginProfile(name, animal)}>Começar a expedição <ChevronRight size={23} /></button>
        <button className="teacher-entry" onClick={() => controller.openTeacher()}>Sou professor(a)</button>
      </section>
      <aside className="welcome-art" aria-label="Lumi, a raposa parceira, em uma floresta de papel">
        <div className="paper-sun">A</div>
        <div className="welcome-note"><span>“Eu vou com você!”</span><small>— Lumi, sua parceira de trilha</small></div>
        <Mascot className="welcome-mascot" />
        <div className="floating-letters"><b>A</b><b>3</b><b>△</b><b>O</b></div>
      </aside>
    </main>
  );
}

function Placement({ state, controller }: Props) {
  const question = PLACEMENT_QUESTIONS[state.placementIndex];
  return (
    <main className="single-game-page">
      <section className="placement-card paper-panel">
        <div className="placement-topline"><span>Nivelamento inteligente</span><span>{state.placementIndex + 1} de {PLACEMENT_QUESTIONS.length}</span></div>
        <div className="progress-track"><i style={{ width: `${((state.placementIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}%` }} /></div>
        <Mascot className="mini-lumi" label="Lumi" />
        <p className="eyebrow">Olá, {state.profile?.name}! Vamos só descobrir por onde sua aventura pode começar.</p>
        <h2>{question.prompt}</h2>
        <div className="answer-grid placement-grid">
          {question.options?.map((option) => <button key={option} className="answer-tile" onClick={() => controller.submitPlacement(option)}>{option}</button>)}
        </div>
        <p className="soft-note">Não é prova. Cada resposta ajuda a Lumi a escolher a melhor trilha para você.</p>
      </section>
    </main>
  );
}

function MapPage({ state, controller }: Props) {
  const profile = state.profile!;
  const activeWorld = WORLDS[profile.currentWorld];
  const totalDone = Object.keys(state.completions).length;
  return (
    <main className="map-page">
      <Header state={state} controller={controller} />
      <section className="map-hero">
        <div className="map-intro"><p className="eyebrow"><BookOpen size={16} /> Seu livro-mapa está aberto</p><h1>Olá, {profile.name}.<br />Qual trilha vamos <em>explorar?</em></h1><p>Você está no <strong>{activeWorld.name}</strong>. Conquiste carimbos e ajude a Lumi a encontrar as palavras escondidas.</p></div>
        <div className="profile-stamp"><span>Expedição</span><strong>Nível {Math.max(1, Math.floor(profile.xp / 40) + 1)}</strong><small>{totalDone} carimbos coletados</small></div>
      </section>
      <section className="world-trail" aria-label="Trilha dos mundos de alfabetização">
        <div className="trail-line" />
        {WORLDS.map((world, index) => {
          const open = controller.isWorldOpen(world.id);
          const current = world.id === profile.currentWorld;
          return <button key={world.id} className={`world-stop ${open ? "open" : "locked"} ${current ? "current" : ""}`} style={{ "--world": world.color, "--soft": world.accent } as CSSProperties} onClick={() => open && controller.startPhase(world.id, 0)}>
            <span className="world-icon">{open ? world.icon : <Lock size={19} />}</span><span className="world-number">0{index + 1}</span><strong>{world.shortName}</strong><small>{open ? world.theme : "Aventura bloqueada"}</small>{current && <i>VOCÊ ESTÁ AQUI</i>}
          </button>;
        })}
      </section>
      <section className="map-lower">
        <PhaseBook worldId={profile.currentWorld} state={state} controller={controller} />
        <aside className="lumi-tip-card"><Mascot label="Lumi" /><div><span>Dica da Lumi</span><p>“Quando uma letra parece difícil, nós podemos ouvir seu som bem devagar.”</p></div></aside>
      </section>
      <footer className="map-footer"><button onClick={() => controller.openPets()}><PawPrint size={19} /> Casa dos pets</button><button onClick={() => controller.openTeacher()}><BookOpen size={19} /> Área do professor</button></footer>
    </main>
  );
}

function PhaseBook({ worldId, state, controller }: { worldId: number; state: GameState; controller: GameController }) {
  const world = WORLDS[worldId];
  return <section className="phase-book paper-panel" style={{ "--world": world.color } as CSSProperties}>
    <div className="phase-book-head"><div><span className="world-label">{world.name}</span><h2>Escolha uma página da aventura</h2></div><div className="phase-count"><b>{Object.keys(state.completions).filter((key) => key.startsWith(`${worldId}:`)).length}</b><span>/ 8</span></div></div>
    <div className="phase-grid">
      {Array.from({ length: 7 }).map((_, phase) => {
        const complete = state.completions[`${worldId}:${phase}`];
        const open = controller.isPhaseOpen(worldId, phase);
        return <button key={phase} className={`phase-node ${complete ? "complete" : ""} ${!open ? "locked" : ""}`} disabled={!open} onClick={() => controller.startPhase(worldId, phase)}>{complete ? <Check size={18} /> : !open ? <Lock size={16} /> : <Play size={16} fill="currentColor" />}<span>Fase {phase + 1}</span>{complete && <small>{complete.score}/8</small>}</button>;
      })}
      {(() => { const finalOpen = controller.isPhaseOpen(worldId, 7); const final = state.completions[`${worldId}:7`]; return <button className={`final-phase ${final ? "complete" : ""}`} disabled={!finalOpen} onClick={() => controller.startPhase(worldId, 7)}>{finalOpen ? <Star size={22} fill="currentColor" /> : <Lock size={19} />}<span>Desafio final</span>{final && <small>{final.score}/8</small>}</button>; })()}
    </div>
  </section>;
}

function Lesson({ state, controller }: Props) {
  const question = controller.currentQuestion();
  if (!question) return null;
  const world = WORLDS[state.activeWorld];
  const audioAvailable = state.activeWorld < 4;
  return <main className="lesson-page" style={{ "--world": world.color, "--soft": world.accent } as CSSProperties}>
    <Header state={state} controller={controller} back />
    <section className="lesson-layout">
      <aside className="lesson-sidebar"><div className="lesson-world-mark">{world.icon}</div><p>{world.name}</p><strong>{state.activePhase === 7 ? "Desafio final" : `Fase ${state.activePhase + 1}`}</strong><div className="question-dots">{Array.from({ length: 8 }).map((_, index) => <i key={index} className={index <= state.questionIndex ? "filled" : ""} />)}</div><Mascot label="Lumi" /><div className="sidebar-bubble">{state.feedback?.tone === "hint" ? "Uma dica: olhe com calma." : "Eu estou aqui para ajudar!"}</div></aside>
      <section className="question-card paper-panel">
        <div className="question-head"><span>DESCOBERTA {state.questionIndex + 1} DE 8</span><div>{audioAvailable && <button className="audio-button" onClick={() => speak(question.prompt)}><Volume2 size={20} /> Ouvir</button>}<span className="attempt-pill">{state.attempts === 0 ? "2 chances" : "Mais uma chance"}</span></div></div>
        {question.visual && <div className="question-visual">{question.visual}</div>}
        <h2>{question.prompt}</h2>
        <QuestionInteraction question={question} disabled={Boolean(state.feedback)} onAnswer={(answer, drawing) => controller.answer(answer, drawing)} />
        {state.feedback && <div className={`feedback-card ${state.feedback.tone}`}><div>{state.feedback.tone === "success" ? <Check size={24} /> : <CircleHelp size={24} />}</div><p>{state.feedback.text}</p><button onClick={() => controller.next()}>{state.questionIndex === 7 ? "Abrir meu baú" : "Próxima descoberta"} <ChevronRight size={20} /></button></div>}
      </section>
    </section>
  </main>;
}

function QuestionInteraction({ question, disabled, onAnswer }: { question: GameQuestion; disabled: boolean; onAnswer: (answer: string, drawing?: string) => void }) {
  const [built, setBuilt] = useState("");
  const [used, setUsed] = useState<string[]>([]);
  useEffect(() => { setBuilt(""); setUsed([]); }, [question.id]);
  if (question.kind === "draw") return <DrawingPad disabled={disabled} onSend={(drawing) => onAnswer("Desenho enviado", drawing)} />;
  if (question.kind === "order") {
    const choose = (piece: string, index: number) => { if (disabled || used.includes(`${piece}-${index}`)) return; setBuilt((word) => word + piece); setUsed((items) => [...items, `${piece}-${index}`]); };
    return <div className="word-builder"><div className="word-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const piece = event.dataTransfer.getData("text/plain"); if (piece && !disabled) setBuilt((word) => word + piece); }}>{built || <span>Monte a palavra aqui</span>}</div><div className="letter-tray">{question.options?.map((piece, index) => <button key={`${piece}-${index}`} draggable={!disabled} onDragStart={(event) => event.dataTransfer.setData("text/plain", piece)} disabled={disabled || used.includes(`${piece}-${index}`)} onClick={() => choose(piece, index)}>{piece}</button>)}</div><div className="builder-actions"><button className="soft-action" onClick={() => { setBuilt(""); setUsed([]); }} disabled={disabled}><RotateCcw size={17} /> Limpar</button><button className="primary-action compact" disabled={disabled || !built} onClick={() => onAnswer(built)}>Conferir <Check size={19} /></button></div></div>;
  }
  return <div className="answer-grid">{question.options?.map((option) => <button key={option} className="answer-tile" disabled={disabled} onClick={() => onAnswer(option)}>{option}</button>)}</div>;
}

function DrawingPad({ disabled, onSend }: { disabled: boolean; onSend: (drawing: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const position = (event: PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height }; };
  const begin = (event: PointerEvent<HTMLCanvasElement>) => { if (disabled) return; const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return; const point = position(event); ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineCap = "round"; ctx.lineWidth = 12; ctx.strokeStyle = "#19765C"; setDrawing(true); canvas.setPointerCapture(event.pointerId); };
  const paint = (event: PointerEvent<HTMLCanvasElement>) => { if (!drawing || disabled) return; const ctx = canvasRef.current?.getContext("2d"); if (!ctx) return; const point = position(event); ctx.lineTo(point.x, point.y); ctx.stroke(); };
  return <div className="drawing-pad"><canvas ref={canvasRef} width="900" height="360" onPointerDown={begin} onPointerMove={paint} onPointerUp={() => setDrawing(false)} onPointerLeave={() => setDrawing(false)} aria-label="Área para desenhar" /><div><p>Use o dedo ou o mouse para desenhar. A Lumi vai guardar sua criação para o professor ver.</p><button className="primary-action compact" disabled={disabled} onClick={() => onSend(canvasRef.current?.toDataURL("image/png") || "")}>Enviar meu desenho <ChevronRight size={19} /></button></div></div>;
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
  const profile = state.profile;
  if (!state.teacherAuthorized) return <main className="single-game-page"><section className="teacher-lock paper-panel"><Lock size={38} /><p className="eyebrow">Acesso orientador</p><h1>Área do professor</h1><p>Entre para acompanhar a trilha, as respostas e os desenhos de cada aluno neste dispositivo.</p><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" /><button className="primary-action" onClick={() => { if (!controller.authorizeTeacher(password)) setError("Senha não reconhecida. Para esta demonstração, use “professor”."); }}>Entrar <ChevronRight size={21} /></button>{error && <small className="login-error">{error}</small>}<button className="teacher-entry" onClick={() => controller.goToMap()}>Voltar ao jogo</button></section></main>;
  return <main className="teacher-page"><Header state={state} controller={controller} back /><section className="teacher-layout"><aside className="teacher-sidebar"><p className="eyebrow">Painel do professor</p><h2>Acompanhamento<br />da turma</h2><button className="active"><BookOpen size={18} /> Visão geral</button><button><PawPrint size={18} /> Perfis de alunos</button><button><Paintbrush size={18} /> Desenhos</button><button className="back-sidebar" onClick={() => controller.goToMap()}><ArrowLeft size={18} /> Voltar ao mapa</button></aside><section className="teacher-content"><div className="teacher-welcome"><div><p className="eyebrow">Aluno em foco</p><h1>{profile?.name || "Nenhum aluno cadastrado"}</h1><p>Os dados abaixo são salvos localmente neste navegador para demonstração do fluxo pedagógico.</p></div><div className="student-badge"><Mascot label="Parceira Lumi" /><span>{profile?.partner || "Parceiro"}</span></div></div>{profile ? <TeacherDashboard state={state} controller={controller} /> : <div className="empty-teacher paper-panel">Ainda não há aluno cadastrado. Crie uma aventura na tela inicial.</div>}</section></section></main>;
}

function TeacherDashboard({ state, controller }: Props) {
  const profile = state.profile!;
  const accuracy = controller.worldAccuracy(profile.currentWorld);
  const world = WORLDS[profile.currentWorld];
  const drawings = state.answers.filter((answer) => Boolean(answer.drawing));
  return <><section className="teacher-stat-grid"><article><span>Mundo atual</span><strong>{world.shortName}</strong><i style={{ background: world.color }} /></article><article><span>Acerto no mundo</span><strong>{accuracy}%</strong><i className="green" /></article><article><span>Respostas salvas</span><strong>{state.answers.length}</strong><i className="orange" /></article></section><section className="teacher-table paper-panel"><div className="table-head"><div><p className="eyebrow">Fases e desafios</p><h2>Progresso detalhado</h2></div><span>Regra de avanço: 70% + liberação docente</span></div><div className="teacher-progress-list">{Array.from({ length: 8 }).map((_, phase) => { const item = state.completions[`${profile.currentWorld}:${phase}`]; return <div key={phase}><span>{phase === 7 ? "Desafio final" : `Fase ${phase + 1}`}</span>{item ? <><div className="mini-bar"><i style={{ width: `${(item.score / 8) * 100}%` }} /></div><b>{item.score}/8</b></> : <small>Aguardando</small>}</div>; })}</div>{profile.currentWorld < WORLDS.length - 1 && <button className="release-button" disabled={accuracy < 70} onClick={() => controller.releaseNextWorld(profile.currentWorld)}>{accuracy >= 70 ? "Liberar próximo mundo" : `Faltam ${70 - accuracy}% para a análise de avanço`} <ChevronRight size={19} /></button>}</section><section className="answer-history paper-panel"><div><p className="eyebrow">Portfólio de aprendizagem</p><h2>Últimas respostas e desenhos</h2></div>{state.answers.length ? <div className="history-list">{state.answers.slice().reverse().slice(0, 8).map((answer, index) => <article key={`${answer.at}-${index}`}><span className={answer.correct ? "status-correct" : "status-help"}>{answer.correct ? "Acerto" : "Com dica"}</span><p>{answer.question}</p><strong>{answer.answer}</strong>{answer.drawing && <img src={answer.drawing} alt="Desenho enviado pelo aluno" />}<small>{answer.at}</small></article>)}</div> : <p className="empty-note">As respostas da criança aparecerão aqui durante as fases.</p>}{drawings.length > 0 && <p className="drawing-count"><Paintbrush size={18} /> {drawings.length} desenho(s) disponível(is) para avaliação.</p>}</section></>;
}

export default function GameUI({ state, controller }: Props) {
  const content = useMemo(() => {
    if (state.screen === "welcome") return <Welcome controller={controller} />;
    if (state.screen === "placement") return <Placement state={state} controller={controller} />;
    if (state.screen === "map") return <MapPage state={state} controller={controller} />;
    if (state.screen === "lesson") return <Lesson state={state} controller={controller} />;
    if (state.screen === "reward") return <Reward state={state} controller={controller} />;
    if (state.screen === "pets") return <Pets state={state} controller={controller} />;
    return <Teacher state={state} controller={controller} />;
  }, [state, controller]);
  return <div className="game-ui">{content}</div>;
}
