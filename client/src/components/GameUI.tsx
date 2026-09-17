/**
 * Design reminder — Livro-Mapa Encantado: papel recortado, trilhas costuradas,
 * leitura ampla e feedback que convida a tentar em vez de rotular erros.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type PointerEvent } from "react";
import { ArrowLeft, BookOpen, Check, ChevronRight, CircleHelp, Coins, Download, Eye, EyeOff, FileText, Gift, Heart, Lock, PawPrint, Play, RotateCcw, Sparkles, Star, Volume2, VolumeX, X } from "lucide-react";
import { PLACEMENT_QUESTIONS, WORLDS, type GameQuestion } from "@/game/content";
import { type EggRarity, type GameController, type GameState, type WorldApproval } from "@/game/GameController";
import "./placement-fixes.css";
import "./pet-expansion.css";
import "./profile-page.css";
import "./teacher-password.css";

type Props = { state: GameState; controller: GameController };
type TeacherTab = "overview" | "profiles" | "answers" | "teacher-profile";
type RemoteStudent = { id: string; profile: { name: string; currentWorld: number; recommendedWorld?: number; xp: number; petName: string }; completions: Record<string, unknown>; worldApprovals?: Record<string, WorldApproval>; answers: unknown[]; updatedAt: string };
const PHASES_PER_WORLD = 8;
const normalizeStudentName = (name: string) => name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");

function studentReportRow(student: RemoteStudent) {
  const answers = student.answers as GameState["answers"];
  const completed = Object.keys(student.completions ?? {}).filter((key) => key.startsWith(`${student.profile.currentWorld}:`)).length;
  const worldAnswers = answers.filter((answer) => answer.worldId === student.profile.currentWorld);
  const accuracy = worldAnswers.length ? Math.round((worldAnswers.filter((answer) => answer.correct).length / worldAnswers.length) * 100) : 0;
  return { name: student.profile.name, world: student.profile.currentWorld + 1, completed, accuracy, answers: answers.length, pet: student.profile.petName, updated: new Date(student.updatedAt).toLocaleString("pt-BR") };
}

function exportStudentsCsv(students: RemoteStudent[], filename = "relatorio-turma.csv") {
  const header = ["Aluno", "Mundo atual", "Fases concluídas no mundo", "Desempenho", "Respostas", "Pet", "Última atualização"];
  const rows = students.map((student) => Object.values(studentReportRow(student)));
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href);
}

function printStudentsPdf(students: RemoteStudent[], title = "Relatório de desempenho da turma") {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer"); if (!reportWindow) return;
  const rows = students.map((student) => { const row = studentReportRow(student); return `<tr><td>${row.name}</td><td>${row.world}</td><td>${row.completed}/${PHASES_PER_WORLD}</td><td>${row.accuracy}%</td><td>${row.answers}</td><td>${row.pet}</td><td>${row.updated}</td></tr>`; }).join("");
  reportWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;color:#193f36;padding:32px}h1{color:#19765c}p{color:#607c72}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #c9e2d2;padding:10px;text-align:left;font-size:12px}th{background:#e9f7ef;color:#19765c}@media print{button{display:none}}</style></head><body><h1>${title}</h1><p>Gerado em ${new Date().toLocaleString("pt-BR")}. Este relatório apresenta o mundo atual, conclusão, desempenho e respostas registradas.</p><table><thead><tr><th>Aluno</th><th>Mundo</th><th>Fases</th><th>Desempenho</th><th>Respostas</th><th>Pet</th><th>Atualização</th></tr></thead><tbody>${rows || "<tr><td colspan=\"7\">Nenhum aluno conectado.</td></tr>"}</tbody></table><button onclick="window.print()">Imprimir ou salvar como PDF</button></body></html>`); reportWindow.document.close(); reportWindow.focus(); reportWindow.setTimeout(() => reportWindow.print(), 250);
}

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

function useFeedbackNarration(feedback: GameState["feedback"] | null, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !feedback?.text) return;
    const timer = window.setTimeout(() => speak(feedback.text), 180);
    return () => window.clearTimeout(timer);
  }, [enabled, feedback?.text, feedback?.tone]);
}

function usePlacementResultNarration(results: GameState["placementResults"], enabled: boolean) {
  useEffect(() => {
    const last = results[results.length - 1];
    if (!enabled || !last?.correct) return;
    const timer = window.setTimeout(() => speak("Parabéns! Muito bem! Você conseguiu."), 180);
    return () => window.clearTimeout(timer);
  }, [enabled, results.length]);
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
  const assets: Record<string, string> = { MESA: "/manus-storage/figura-mesa_e5788eb5.png", BOLO: "/manus-storage/figura-bolo_16fdeb17.png", LIVRO: "/manus-storage/figura-livro_4d73ec4c.png", FLOR: "/manus-storage/figura-flor_26e87e70.png" };
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
          <button className="partner-chip" onClick={() => controller.openProfile()} aria-label="Abrir perfil da criança"><Mascot label="Lumi, parceira do jogo" /> <span>{profile.name}</span></button>
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
        <button className="entry-path child-path" onClick={() => controller.startNewSave()}><i className="entry-stop-tag" aria-hidden="true">NOVA TRILHA</i><span className="entry-icon"><Sparkles size={25} /></span><span><strong>Começar nova aventura</strong><small>Escolher um nome e iniciar</small></span><ChevronRight size={24} /></button>
        <button className="entry-path" onClick={() => controller.openContinueSetup()}><i className="entry-stop-tag" aria-hidden="true">CONTINUAR</i><span className="entry-icon"><Play size={25} fill="currentColor" /></span><span><strong>Continuar aventura</strong><small>Voltar usando seu nome</small></span><ChevronRight size={24} /></button>
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
  const [name, setName] = useState(state.profile?.name ?? "");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const saveName = async () => {
    const safeName = name.trim();
    if (!safeName) return setNameError("Digite um nome para continuar.");
    setSaving(true); setNameError("");
    try {
      const students = await fetch("/api/students").then((response) => response.ok ? response.json() : []) as RemoteStudent[];
      const currentId = state.profile?.studentId;
      if (students.some((student) => student.id !== currentId && normalizeStudentName(student.profile.name) === normalizeStudentName(safeName))) return setNameError("Esse nome já está sendo usado por outro aluno. Escolha outro nome.");
      if (state.profile) controller.updateProfileName(safeName); else controller.beginProfile(safeName);
    } catch { setNameError("Não foi possível verificar o nome agora. Tente novamente."); }
    finally { setSaving(false); }
  };
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
        <button className="primary-action" disabled={saving} onClick={saveName}>{state.profile ? "Salvar alterações" : "Começar a expedição"} <ChevronRight size={23} /></button>
        {state.profile && <button className="teacher-entry" onClick={() => controller.returnToMenu()}>Voltar ao menu</button>}
        <button className="teacher-entry" onClick={() => controller.openTeacher()}>Sou professor(a)</button>{nameError && <small className="login-error">{nameError}</small>}
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

function ContinueAdventure({ controller }: Props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const resume = async () => {
    setLoading(true);
    setMessage("");
    const error = await controller.resumeProfile(name);
    if (error) setMessage(error);
    setLoading(false);
  };
  return <main className="welcome-page"><div className="opening-book-spread" aria-hidden="true"><i className="book-spine" /><b>✦</b></div><section className="welcome-copy paper-panel"><span className="page-tab">CONTINUAR AVENTURA</span><p className="eyebrow"><BookOpen size={16} /> Retomar uma expedição</p><h1>Que bom<br /><em>ver você de novo.</em></h1><p className="welcome-description">Digite exatamente o nome usado na aventura anterior para voltar ao ponto em que você parou.</p><label className="input-label" htmlFor="resume-name">Nome do aluno</label><input id="resume-name" className="name-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={18} placeholder="Escreva seu nome aqui" onKeyDown={(event) => { if (event.key === "Enter") void resume(); }} /><button className="primary-action" disabled={loading} onClick={() => void resume()}>{loading ? "Procurando..." : "Continuar minha aventura"} <ChevronRight size={23} /></button><button className="teacher-entry" onClick={() => controller.startNewSave()}>Começar nova aventura</button><button className="teacher-entry" onClick={() => controller.returnToMenu()}>Voltar ao menu</button>{message && <small className="login-error">{message}</small>}</section><aside className="welcome-art" aria-label="Lumi espera pela criança"><span className="diorama-tab">ROTA 02</span><Mascot className="welcome-mascot" /><div className="welcome-note"><span>“Eu guardei seu mapa!”</span><small>— Lumi, sua parceira de trilha</small></div></aside></main>;
}

function StudentProfile({ state, controller }: Props) {
  const profile = state.profile!;
  const [name, setName] = useState(profile.name);
  const level = Math.max(1, Math.floor(profile.xp / 40) + 1);
  const totalCompleted = Object.keys(state.completions).length;
  return <main className="profile-page single-game-page"><Header state={state} controller={controller} back /><section className="profile-card paper-panel"><div className="profile-hero"><Mascot label="Lumi, parceira do aluno" /><div><p className="eyebrow"><PawPrint size={16} /> Perfil do aluno</p><h1>{profile.name}</h1><p>Acompanhe sua aventura e deixe seu nome sempre do seu jeito.</p></div></div><div className="profile-stats"><span><strong>{level}</strong><small>Nível</small></span><span><strong>{profile.xp}</strong><small>XP</small></span><span><strong>{profile.coins}</strong><small>Moedas</small></span><span><strong>{profile.petLevel}</strong><small>Nível do pet</small></span></div><label className="input-label" htmlFor="profile-name">Nome da criança</label><input id="profile-name" className="name-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={18} /><div className="profile-page-actions"><button className="primary-action" onClick={() => controller.saveProfileName(name)}>Salvar alterações <Check size={20} /></button><button className="soft-action" onClick={() => controller.continueSave()}><BookOpen size={18} /> Voltar para minha trilha</button><button className="teacher-entry" onClick={() => controller.returnToMenu()}>Voltar ao menu</button></div><section className="profile-progress"><div className="profile-progress-heading"><div><p className="eyebrow"><BookOpen size={16} /> Livro-mapa</p><h2>Progresso da aventura</h2></div><strong>{totalCompleted} / {WORLDS.length * 8} fases</strong></div>{WORLDS.map((world) => { const phases = Array.from({ length: 8 }, (_, phase) => state.completions[`${world.id}:${phase}`]); const completed = phases.filter(Boolean).length; const points = phases.reduce((sum, item) => sum + (item?.score ?? 0), 0); return <article className="profile-world-progress" key={world.id}><div className="profile-world-heading"><span className="profile-world-icon">{world.icon}</span><div><strong>{world.name}</strong><small>{completed === 8 ? "MUNDO CONCLUÍDO" : completed ? `${completed} FASES CONCLUÍDAS` : "AINDA NÃO INICIADO"}</small></div><b>{completed}/8</b></div><div className="profile-progress-bar"><i style={{ width: `${(completed / 8) * 100}%`, background: world.color }} /></div><div className="profile-phase-list">{phases.map((completion, phase) => <span className={completion ? "done" : "pending"} key={phase}>{completion ? <Check size={13} /> : phase + 1}{completion && <small>{completion.score}/8</small>}</span>)}</div><small className="profile-world-score">{points} pontos conquistados neste mundo</small></article>; })}</section></section></main>;
}

function Placement({ state, controller }: Props) {
  const placementQueue = state.placementQueue.length ? state.placementQueue : PLACEMENT_QUESTIONS;
  const question = placementQueue[state.placementIndex];
  const audioAvailable = state.profile?.audioEnabled !== false;
  const wordAudioAvailable = audioAvailable && Boolean(question?.targetWord ?? question?.audioText);
  const playNarration = useQuestionNarration(question, audioAvailable);
  const playWord = useQuestionNarration(question, wordAudioAvailable, true);
  useFeedbackNarration(state.feedback, audioAvailable);
  usePlacementResultNarration(state.placementResults, audioAvailable);
  const attemptLabel = state.placementAttempts === 0 ? "1ª tentativa" : "2ª tentativa";
  if (!question) return null;
  return (
    <main className="single-game-page">
      <section className="placement-card paper-panel">
        <div className="placement-topline"><span>Nivelamento inteligente</span><span>{state.placementIndex + 1} de {placementQueue.length}</span></div>
        <div className="progress-track"><i style={{ width: `${((state.placementIndex + 1) / placementQueue.length) * 100}%` }} /></div>
        <Mascot className="mini-lumi" label="Lumi" />
        <p className="eyebrow">Olá, {state.profile?.name}! Vamos só descobrir por onde sua aventura pode começar.</p>
        <div className="placement-question-title"><h2>{visiblePrompt(question)}</h2><div className="placement-audio-actions">{audioAvailable && <button className="audio-button placement-audio" onClick={playNarration} aria-label={audioLabel(question)}><Volume2 size={20} /> {audioLabel(question)}</button>}{wordAudioAvailable && <button className="audio-button word-audio-button placement-audio" onClick={playWord} aria-label={audioLabel(question, true)}><Volume2 size={20} /> {audioLabel(question, true)}</button>}</div></div>
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
  useFeedbackNarration(state.feedback, audioAvailable);
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
  const rarity = reward.eggRarity;
  return <main className="single-game-page reward-page"><section className="reward-card paper-panel"><p className="eyebrow"><Gift size={17} /> Baú encontrado</p><h1>{reward.title}!</h1><TreasureArt className="reward-treasure" /><p>Você cuidou muito bem da sua trilha. Veja o que o baú guardou para você.</p><div className="reward-row"><span><Coins size={21} /> +{reward.coins} moedas</span><span><Star size={21} fill="currentColor" /> +{reward.xp} XP</span>{reward.egg && <span><Sparkles size={21} /> Ovo {rarity}</span>}</div><div className="rarity-strip">{rarity && <><strong>Raridade: {rarity}</strong><small>{rarity === "lendario" ? "Uma descoberta quase impossível!" : "Leve este ovo para a casa dos pets."}</small></>}</div><button className="primary-action" onClick={() => controller.openPets()}>Ver meus pets <PawPrint size={22} /></button><button className="teacher-entry" onClick={() => controller.goToMap()}>Voltar ao meu livro-mapa <BookOpen size={19} /></button></section></main>;
}

function Pets({ state, controller }: Props) {
  const profile = state.profile!;
  const [eggName, setEggName] = useState("");
  const rarityLabel: Record<EggRarity, string> = { comum: "Comum", raro: "Raro", epico: "Épico", lendario: "Lendário" };
  const eggs = profile.eggCollection ?? [];
  return <main className="pets-page"><Header state={state} controller={controller} back /><section className="pet-layout"><div className="pet-room paper-panel"><p className="eyebrow"><PawPrint size={16} /> Casa dos pets</p><h1>O cantinho de<br /><em>{profile.petName}.</em></h1><div className={`pet-stage ${profile.petStage === "evoluido" ? "pet-evolved" : ""}`}><div className="pet-bubble">Nível {profile.petLevel}{profile.petStage === "evoluido" ? " · EVOLUÍDO" : ""}</div><div className="egg-pet">{profile.petStage === "evoluido" ? "🦊✨" : "🐣"}</div><div className="pet-nameplate">{profile.petName} <small>{profile.petSpecies} · {profile.petStage === "evoluido" ? "forma evoluída" : "pet de aventura"}</small></div></div><div className="care-meter"><span>Energia para o próximo nível</span><div><i style={{ width: `${profile.petCare}%` }} /></div><b>{profile.petCare}%</b></div><div className="pet-actions"><button onClick={() => controller.careForPet("food")}><span>🍎</span> Alimentar <small>5 moedas</small></button><button onClick={() => controller.careForPet("care")}><span>♥</span> Cuidar <small>2 moedas</small></button><button onClick={() => controller.careForPet("play")}><span>★</span> Brincar <small>3 moedas</small></button></div><p className="pet-evolution-note">O pet evolui somente ao alcançar o nível 10. Cada cuidado custa moedas e ajuda a encher a energia.</p></div><aside className="pet-side"><section className="egg-inventory paper-panel"><TreasureArt className="inventory-treasure" /><h2>Ovos da aventura</h2><p><strong>{profile.eggs}</strong> ovo{profile.eggs === 1 ? "" : "s"} ainda não chocado{profile.eggs === 1 ? "" : "s"}</p><small>Complete missões para aquecer os ovos. Quando a barra chegar ao fim, escolha o nome do novo pet.</small>{eggs.map((egg, index) => <div className={`egg-card egg-${egg.rarity}`} key={egg.id}><span>{egg.hatched ? "🐣" : "🥚"}</span><div><strong>Ovo {rarityLabel[egg.rarity]}</strong><small>{egg.hatched ? "Já nasceu" : `${egg.progress}/${egg.required} missões`}</small></div>{!egg.hatched && egg.progress >= egg.required && <div className="hatch-form"><input value={eggName} onChange={(event) => setEggName(event.target.value)} placeholder="Nome do pet" maxLength={18} /><button onClick={() => { if (controller.hatchEgg(index, eggName)) setEggName(""); }}>Chocar</button></div>}</div>)}</section><button className="back-map-button" onClick={() => controller.goToMap()}><ArrowLeft size={19} /> Voltar ao mapa</button></aside></section></main>;
}

function Teacher({ state, controller }: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TeacherTab>("overview");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [teacherName, setTeacherName] = useState(state.teacherName);
  const [remoteStudents, setRemoteStudents] = useState<RemoteStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [studentMessage, setStudentMessage] = useState("");
  const [registeringStudent, setRegisteringStudent] = useState(false);
  useEffect(() => {
    if (!state.teacherAuthorized) return;
    const refresh = () => fetch("/api/students").then((response) => response.ok ? response.json() : []).then((students: RemoteStudent[]) => { setRemoteStudents(students); setSelectedStudentId((current) => current || students[0]?.id || ""); }).catch(() => undefined);
    refresh();
    const timer = window.setInterval(refresh, 4000);
    return () => window.clearInterval(timer);
  }, [state.teacherAuthorized]);
  if (!state.teacherAuthorized) return <main className="single-game-page"><section className="teacher-lock paper-panel"><Lock size={38} /><p className="eyebrow">Acesso orientador</p><h1>Área do professor</h1><p>Entre para acompanhar a trilha, as respostas e os desenhos de cada aluno neste dispositivo.</p><div className="password-input-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" autoComplete="current-password" /><button type="button" className="password-eye" onClick={() => setShowPassword((visible) => !visible)} aria-pressed={showPassword} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div><button className="primary-action" onClick={async () => { if (!(await controller.authorizeTeacher(password))) setError("Senha não reconhecida."); }}>Entrar <ChevronRight size={21} /></button>{error && <small className="login-error">{error}</small>}<button className="teacher-entry" onClick={() => controller.returnToMenu()}>Voltar ao menu</button></section></main>;
  const selected = remoteStudents.find((student) => student.id === selectedStudentId);
  const deleteSelectedStudent = async () => {
    if (!selected) return;
    if (!window.confirm(`Excluir definitivamente o perfil de ${selected.profile.name}? Esta ação não pode ser desfeita.`)) return;
    const confirmation = window.prompt(`Para confirmar, digite exatamente o nome do aluno: ${selected.profile.name}`);
    if (normalizeStudentName(confirmation ?? "") !== normalizeStudentName(selected.profile.name)) { window.alert("Exclusão cancelada: o nome não confere."); return; }
    const response = await fetch(`/api/students/${encodeURIComponent(selected.id)}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmName: confirmation }) });
    if (!response.ok) {
      const result = await response.json().catch(() => ({})) as { error?: string };
      window.alert(result.error ?? "Não foi possível excluir o perfil. Tente novamente.");
      return;
    }
    setRemoteStudents((items) => items.filter((item) => item.id !== selected.id));
    setSelectedStudentId("");
  };
  const openTab = (next: TeacherTab) => setTab(next);
  const updateSelected = async (student: RemoteStudent) => { await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(student) }); setRemoteStudents((items) => items.map((item) => item.id === student.id ? student : item)); };
  const registerStudent = async () => { setRegisteringStudent(true); setStudentMessage(""); const error = await controller.registerStudent(newStudentName); if (error) setStudentMessage(error); else { setStudentMessage("Aluno cadastrado. Ele já pode continuar a aventura usando esse nome."); setNewStudentName(""); } setRegisteringStudent(false); };
  const registrationPanel = <section className="teacher-profile-card paper-panel"><div><p className="eyebrow"><PawPrint size={15} /> Cadastro de aluno</p><h2>Adicionar aluno à turma</h2><p>Cadastre o nome uma vez. Depois, o aluno poderá escolher “Continuar aventura” no menu e informar esse mesmo nome.</p></div><div className="teacher-profile-edit"><input value={newStudentName} onChange={(event) => setNewStudentName(event.target.value)} placeholder="Nome do aluno" maxLength={18} onKeyDown={(event) => { if (event.key === "Enter") void registerStudent(); }} /><button className="primary-action compact" disabled={registeringStudent} onClick={() => void registerStudent()}>Cadastrar <Check size={17} /></button></div>{studentMessage && <small className={studentMessage.startsWith("Aluno cadastrado") ? "password-success" : "login-error"}>{studentMessage}</small>}</section>;
  const profilePanel = <>{registrationPanel}<section className="teacher-profile-card paper-panel"><div className="teacher-profile-heading"><div className="teacher-avatar"><Lock size={22} /></div><div><p className="eyebrow">Perfil do professor</p><h2>{state.teacherName}</h2><small>Área protegida deste dispositivo</small></div></div><div className="teacher-profile-edit"><input value={teacherName} onChange={(event) => setTeacherName(event.target.value)} placeholder="Nome do professor" maxLength={32} /><button className="soft-action" onClick={() => controller.updateTeacherProfile(teacherName)}>Salvar perfil <Check size={16} /></button></div><button className="teacher-entry teacher-exit-button" onClick={() => controller.exitTeacher()}>Sair da área do professor</button></section><section className="teacher-password-card paper-panel"><div><p className="eyebrow"><Lock size={15} /> Segurança</p><h2>Alterar senha de acesso</h2><p>Altere a senha usada sempre que o professor entrar nesta área.</p></div><div className="teacher-password-fields"><PasswordField value={currentPassword} setValue={setCurrentPassword} visible={showCurrentPassword} setVisible={setShowCurrentPassword} placeholder="Senha atual" /><PasswordField value={newPassword} setValue={setNewPassword} visible={showNewPassword} setVisible={setShowNewPassword} placeholder="Nova senha (mínimo 6 caracteres)" /><PasswordField value={confirmPassword} setValue={setConfirmPassword} visible={showConfirmPassword} setVisible={setShowConfirmPassword} placeholder="Confirmar nova senha" /></div><button className="primary-action compact" onClick={async () => { const message = await controller.changeTeacherPassword(currentPassword, newPassword, confirmPassword); setPasswordMessage(message ?? "Senha alterada com sucesso."); if (!message) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); } }}>Salvar nova senha <Check size={18} /></button>{passwordMessage && <small className={passwordMessage.includes("sucesso") ? "password-success" : "login-error"}>{passwordMessage}</small>}</section></>;
  return <main className="teacher-page"><Header state={state} controller={controller} back /><section className="teacher-layout"><aside className="teacher-sidebar"><p className="eyebrow">Painel do professor</p><h2>Acompanhamento<br />da turma</h2><button className={tab === "overview" ? "active" : ""} onClick={() => openTab("overview")}><BookOpen size={18} /> Visão geral</button><button className={tab === "profiles" ? "active" : ""} onClick={() => openTab("profiles")}><PawPrint size={18} /> Perfis de alunos</button><button className={tab === "answers" ? "active" : ""} onClick={() => openTab("answers")}><CircleHelp size={18} /> Respostas</button><button className={tab === "teacher-profile" ? "active" : ""} onClick={() => openTab("teacher-profile")}><Lock size={18} /> Meu perfil</button><button className="back-sidebar" onClick={() => controller.exitTeacher()}><ArrowLeft size={18} /> Sair da área</button></aside><section className="teacher-content"><div className="teacher-welcome"><div><p className="eyebrow">Aluno selecionado</p><h1>{selected?.profile.name || "Nenhum aluno selecionado"}</h1><p>Selecione um aluno para ver todas as atividades, respostas e desempenho.</p></div><div className="student-badge"><Mascot label="Parceira Lumi" /><span>{selected ? `Mundo ${selected.profile.currentWorld + 1}` : "Turma"}</span></div></div>{tab === "teacher-profile" ? profilePanel : <><section className="local-students-card paper-panel"><div className="table-head"><div><p className="eyebrow"><PawPrint size={15} /> Turma conectada</p><h2>Selecione um aluno</h2></div><div className="report-actions"><span>{remoteStudents.length} aluno(s)</span>{selected && <button className="danger-action compact" onClick={deleteSelectedStudent}>Excluir perfil</button>}<button className="soft-action compact" onClick={() => exportStudentsCsv(selected ? [selected] : remoteStudents, selected ? `relatorio-${selected.profile.name}.csv` : "relatorio-turma.csv")}><Download size={15} /> CSV</button><button className="soft-action compact" onClick={() => printStudentsPdf(selected ? [selected] : remoteStudents, selected ? `Relatório de ${selected.profile.name}` : "Relatório de desempenho da turma")}><FileText size={15} /> PDF</button></div></div>{remoteStudents.length ? <div className="local-students-grid">{remoteStudents.map((student) => { const completed = Object.keys(student.completions ?? {}).length; return <button className={`student-select-card ${selected?.id === student.id ? "selected" : ""}`} key={student.id} onClick={() => setSelectedStudentId(student.id)}><div className="student-mini-avatar"><PawPrint size={18} /></div><div><strong>{student.profile.name}</strong><small>Mundo {student.profile.currentWorld + 1} · {completed} fase(s) · {student.answers.length} resposta(s)</small><small>Pet: {student.profile.petName}</small></div></button>; })}</div> : <p className="empty-note">Os alunos aparecerão aqui assim que abrirem a aventura neste endereço.</p>}<small className="sync-note">Atualização automática a cada 4 segundos.</small></section>{selected ? <RemoteTeacherDashboard student={selected} tab={tab} onUpdate={updateSelected} /> : <div className="empty-teacher paper-panel">Abra a aventura em outro dispositivo para o aluno aparecer nesta lista.</div>}</>}</section></section></main>;
}

function PasswordField({ value, setValue, visible, setVisible, placeholder }: { value: string; setValue: (value: string) => void; visible: boolean; setVisible: (value: boolean) => void; placeholder: string }) {
  return <div className="password-input-wrap"><input type={visible ? "text" : "password"} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} /><button type="button" className="password-eye" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>;
}

function RemoteTeacherDashboard({ student, tab, onUpdate }: { student: RemoteStudent; tab: TeacherTab; onUpdate: (student: RemoteStudent) => Promise<void> }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const entries = (student.answers as GameState["answers"]).map((answer, index) => ({ answer, index })).reverse();
  const visible = entries;
  const selectedEntry = visible.find((entry) => entry.index === selectedIndex) ?? visible[0];
  const completed = Object.keys(student.completions ?? {}).filter((key) => key.startsWith(`${student.profile.currentWorld}:`)).length;
  const worldAnswers = entries.filter(({ answer }) => answer.worldId === student.profile.currentWorld);
  const accuracy = worldAnswers.length ? Math.round((worldAnswers.filter(({ answer }) => answer.correct).length / worldAnswers.length) * 100) : 0;
  const savedApproval = student.worldApprovals?.[String(student.profile.currentWorld)];
  const approval = savedApproval ?? (completed >= PHASES_PER_WORLD ? { status: "pending" as const, requestedAt: new Date().toISOString() } : undefined);
  const canAdvance = completed >= PHASES_PER_WORLD && student.profile.currentWorld < WORLDS.length - 1;
  const approveStudent = () => onUpdate({ ...student, worldApprovals: { ...student.worldApprovals, [String(student.profile.currentWorld)]: { status: "approved", requestedAt: approval?.requestedAt ?? new Date().toISOString(), approvedAt: new Date().toISOString(), approvedBy: "Professor(a)" }, }, profile: { ...student.profile, currentWorld: student.profile.currentWorld + 1, recommendedWorld: student.profile.currentWorld + 1 } });
  if (tab === "profiles" || tab === "overview") return <><section className="student-profile-card paper-panel">{approval?.status === "pending" && <div className="approval-request"><span className="approval-dot" /><div><strong>Pedido de aprovação recebido</strong><small>{student.profile.name} concluiu o mundo e aguarda sua avaliação.</small></div></div>}<p className="eyebrow">Perfil completo do aluno</p><h2>{student.profile.name}</h2><p>Mundo atual: <strong>{student.profile.currentWorld + 1}</strong> · {student.profile.xp} XP · Pet: <strong>{student.profile.petName}</strong></p><div className="remote-performance-grid"><span><b>{completed}/{PHASES_PER_WORLD}</b> fases no mundo</span><span><b>{accuracy}%</b> desempenho</span><span><b>{student.answers.length}</b> respostas</span></div>{approval?.status === "pending" && canAdvance ? <button className="release-button" onClick={approveStudent}>Aprovar e liberar próximo mundo <ChevronRight size={19} /></button> : approval?.status === "approved" ? <small className="approval-confirmed">Aprovado; o aluno já pode abrir o próximo mundo.</small> : <small className="sync-note">O pedido aparecerá aqui após concluir todas as fases. A liberação depende da sua avaliação e de pelo menos 70% de acerto.</small>}</section><section className="teacher-table paper-panel"><div className="table-head"><div><p className="eyebrow">Desempenho detalhado</p><h2>Atividades concluídas</h2></div><span>{completed} de {PHASES_PER_WORLD}</span></div><div className="world-teacher-grid">{WORLDS.map((world) => { const done = Object.keys(student.completions ?? {}).filter((key) => key.startsWith(`${world.id}:`)).length; return <div className="remote-world-row" key={world.id}><strong>{world.icon} {world.shortName}</strong><small>{done}/{PHASES_PER_WORLD} fases</small><i style={{ width: `${Math.min(100, done / PHASES_PER_WORLD * 100)}%` }} /></div>; })}</div></section></>;
  return <div className="analysis-workspace"><ResponseExplorer entries={visible} selectedIndex={selectedEntry?.index ?? null} onSelectAnswer={setSelectedIndex} tab={tab} />{selectedEntry && <AnswerInspector answer={selectedEntry.answer} />}</div>;
}
function TeacherDashboard({ state, controller, tab, onTabChange, selectedAnswer, onSelectAnswer }: Props & { tab: TeacherTab; onTabChange: (tab: TeacherTab) => void; selectedAnswer: number | null; onSelectAnswer: (index: number | null) => void }) {
  const profile = state.profile!;
  const accuracy = controller.worldAccuracy(profile.currentWorld);
  const world = WORLDS[profile.currentWorld];
  const entries = state.answers.map((answer, index) => ({ answer, index })).reverse();
  const visible = entries;
  const selected = visible.find((entry) => entry.index === selectedAnswer) ?? visible[0];
  const audioCard = <section className="audio-control paper-panel"><p className="eyebrow">Acessibilidade individual</p><h2>Leitura em voz alta</h2><p className="soft-note">{profile.audioEnabled ? "A LUMI PODE LER AS PERGUNTAS OU PALAVRAS DE REFERÊNCIA PARA ESTE ALUNO." : "A LEITURA POR ÁUDIO ESTÁ DESLIGADA. O ALUNO LERÁ AS ATIVIDADES SEM NARRAÇÃO."}</p><button className="primary-action compact" onClick={() => controller.setStudentAudio(!profile.audioEnabled)}>{profile.audioEnabled ? <><VolumeX size={18} /> Desativar áudio deste aluno</> : <><Volume2 size={18} /> Ativar áudio deste aluno</>}</button></section>;
  if (tab === "profiles") return <><section className="student-profile-card paper-panel"><div><p className="eyebrow">Perfil de aluno</p><h2>{profile.name}</h2><p>Parceiro: <strong>{profile.partner}</strong> · Nível {Math.max(1, Math.floor(profile.xp / 40) + 1)} · {profile.xp} XP</p></div><div className="profile-actions"><button className="soft-action" onClick={() => controller.openProfile()}><PawPrint size={17} /> Editar perfil</button><button className="soft-action" onClick={() => onTabChange("answers")}><CircleHelp size={17} /> Ver respostas</button><button className="soft-action" onClick={() => controller.goToMap()}><BookOpen size={17} /> Abrir livro-mapa</button></div></section>{audioCard}<WorldTeacherGrid state={state} controller={controller} onOpenAnswers={() => onTabChange("answers")} /></>;
  if (tab === "answers") return <div className="analysis-workspace"><ResponseExplorer entries={visible} selectedIndex={selected?.index ?? null} onSelectAnswer={onSelectAnswer} tab={tab} />{selected && <AnswerInspector answer={selected.answer} />}</div>;
  return <><section className="teacher-stat-grid"><article><span>Mundo atual</span><strong>{world.shortName}</strong><i style={{ background: world.color }} /></article><article><span>Acerto no mundo</span><strong>{accuracy}%</strong><i className="green" /></article><article><span>Respostas salvas</span><strong>{state.answers.length}</strong><i className="orange" /></article></section>{audioCard}<WorldTeacherGrid state={state} controller={controller} onOpenAnswers={() => onTabChange("answers")} /><section className="answer-history paper-panel"><div className="table-head"><div><p className="eyebrow">Portfólio de aprendizagem</p><h2>Últimas respostas</h2></div><button className="soft-action" onClick={() => onTabChange("answers")}>ANALISAR TUDO <ChevronRight size={17} /></button></div>{entries.length ? <div className="history-list">{entries.slice(0, 6).map(({ answer, index }) => <button key={`${answer.at}-${index}`} onClick={() => { onSelectAnswer(index); onTabChange("answers"); }}><span className={answer.correct ? "status-correct" : "status-help"}>{answer.correct ? "ACERTO" : "COM DICA"}</span><p>{answer.question}</p><strong>{answer.answer}</strong><small>{answer.at}</small></button>)}</div> : <p className="empty-note">AS RESPOSTAS DA CRIANÇA APARECERÃO AQUI DURANTE AS FASES.</p>}</section></>;
}

function WorldTeacherGrid({ state, controller, onOpenAnswers }: { state: GameState; controller: GameController; onOpenAnswers: () => void }) {
  return <section className="teacher-table paper-panel"><div className="table-head"><div><p className="eyebrow">Mundos e fases</p><h2>Progresso da trilha</h2></div><span>CLIQUE EM UM MUNDO PARA ABRIR AS RESPOSTAS</span></div><div className="world-teacher-grid">{WORLDS.map((world) => { const done = Object.keys(state.completions).filter((key) => key.startsWith(`${world.id}:`)).length; const accuracy = controller.worldAccuracy(world.id); return <button key={world.id} onClick={() => { controller.selectWorld(world.id); onOpenAnswers(); }} style={{ "--world": world.color } as CSSProperties}><span>{world.icon}</span><strong>{world.shortName}</strong><small>{done}/{PHASES_PER_WORLD} FASES · {accuracy}%</small><i style={{ width: `${(done / PHASES_PER_WORLD) * 100}%` }} /></button>; })}</div>{state.profile!.currentWorld < WORLDS.length - 1 && <button className="release-button" disabled={controller.worldAccuracy(state.profile!.currentWorld) < 70} onClick={() => controller.releaseNextWorld(state.profile!.currentWorld)}>{controller.worldAccuracy(state.profile!.currentWorld) >= 70 ? "LIBERAR PRÓXIMO MUNDO" : `FALTAM ${70 - controller.worldAccuracy(state.profile!.currentWorld)}% PARA O AVANÇO`} <ChevronRight size={19} /></button>}</section>;
}

function AnswerInspector({ answer }: { answer: GameState["answers"][number] }) {
  const world = WORLDS[answer.worldId];
  return <section className="answer-inspector paper-panel"><div className="table-head"><div><p className="eyebrow">Análise da resposta</p><h2>{world?.shortName || "Mundo"} · Fase {answer.phase + 1}</h2></div><span className={answer.correct ? "status-correct" : "status-help"}>{answer.correct ? "ACERTO" : "COM DICA"}</span></div><div className="inspector-section"><span>PERGUNTA</span><p>{answer.question}</p></div>{answer.visual && <div className="inspector-visual" aria-label="Ilustração da pergunta">{answer.visual}</div>}{answer.options?.length ? <div className="inspector-section"><span>ALTERNATIVAS</span><div className="inspector-options">{answer.options.map((option) => <b key={option} className={`${option === answer.answer ? "student-choice" : ""} ${option === answer.correctAnswer ? "correct-choice" : ""}`}>{option}{option === answer.answer && <small>ESCOLHA</small>}{option === answer.correctAnswer && <small>RESPOSTA</small>}</b>)}</div></div> : null}<div className="inspector-answer"><span>RESPOSTA DO ALUNO</span><strong>{answer.answer}</strong><small>{answer.hint ? `PISTA USADA: ${answer.hint}` : "SEM PISTA REGISTRADA"}</small></div>{answer.drawing && <div className="drawing-review"><span>DESENHO DO ALUNO</span><img src={answer.drawing} alt="Desenho enviado pelo aluno para esta resposta" /></div>}<small className="answer-time">REGISTRADO EM {answer.at}</small></section>;
}

function ResponseExplorer({ entries, selectedIndex, onSelectAnswer, tab }: { entries: Array<{ answer: GameState["answers"][number]; index: number }>; selectedIndex: number | null; onSelectAnswer: (index: number) => void; tab: TeacherTab }) {
  const firstWorld = entries[0]?.answer.worldId ?? null;
  const [expandedWorld, setExpandedWorld] = useState<number | null>(firstWorld);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(entries[0] ? `${entries[0].answer.worldId}:${entries[0].answer.phase}` : null);
  const grouped = WORLDS.map((world) => ({
    world,
    phases: Array.from(new Set(entries.filter(({ answer }) => answer.worldId === world.id).map(({ answer }) => answer.phase))).sort((a, b) => a - b),
  })).filter(({ phases }) => phases.length);
  return <section className="response-explorer paper-panel"><div className="table-head"><div><p className="eyebrow">Caderno de respostas</p><h2>Respostas por mundo e fase</h2><small className="soft-note">Abra um mundo, escolha a fase e depois a tentativa que deseja analisar.</small></div><span>{entries.length} registro(s)</span></div>{grouped.length ? <div className="response-world-list">{grouped.map(({ world, phases }) => <section className={`response-world-group ${expandedWorld === world.id ? "open" : ""}`} key={world.id}><button className="response-world-toggle" onClick={() => setExpandedWorld((current) => current === world.id ? null : world.id)}><span className="response-world-icon" style={{ background: world.accent, color: world.color }}>{world.icon}</span><span><strong>{world.name}</strong><small>{phases.length} fase(s) com respostas</small></span><ChevronRight size={18} /></button>{expandedWorld === world.id && <div className="response-phase-list">{phases.map((phase) => { const phaseKey = `${world.id}:${phase}`; const phaseEntries = entries.filter(({ answer }) => answer.worldId === world.id && answer.phase === phase); return <div className={`response-phase-group ${expandedPhase === phaseKey ? "open" : ""}`} key={phaseKey}><button className="response-phase-toggle" onClick={() => setExpandedPhase((current) => current === phaseKey ? null : phaseKey)}><span>Fase {phase + 1}</span><small>{phaseEntries.length} resposta(s)</small><ChevronRight size={16} /></button>{expandedPhase === phaseKey && <div className="response-attempt-list">{phaseEntries.map(({ answer, index }) => <button key={`${answer.at}-${index}`} className={`response-attempt ${selectedIndex === index ? "selected" : ""}`} onClick={() => onSelectAnswer(index)}><span className={answer.correct ? "status-correct" : "status-help"}>{answer.correct ? "ACERTO" : "COM DICA"}</span><span><strong>{answer.question}</strong><small>{answer.at}{answer.drawing ? " · DESENHO ANEXADO" : ""}</small></span><ChevronRight size={15} /></button>)}</div>}</div>; })}</div>}</section>)}</div> : <p className="empty-note">Ainda não há registros nesta categoria.</p>}</section>;
}

export default function GameUI({ state, controller }: Props) {
  const content = useMemo(() => {
    const requiresProfile = ["profile", "map", "placement-result", "lesson", "reward", "pets"].includes(state.screen);
    if (requiresProfile && !state.profile) return <EntryMenu state={state} controller={controller} />;
    if (state.screen === "menu") return <EntryMenu state={state} controller={controller} />;
    if (state.screen === "welcome") return <Welcome state={state} controller={controller} />;
    if (state.screen === "continue") return <ContinueAdventure state={state} controller={controller} />;
    if (state.screen === "profile") return <StudentProfile state={state} controller={controller} />;
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
