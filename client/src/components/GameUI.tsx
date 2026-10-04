/**
 * Design reminder — Livro-Mapa Encantado: papel recortado, trilhas costuradas,
 * leitura ampla e feedback que convida a tentar em vez de rotular erros.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type PointerEvent } from "react";
import { ArrowLeft, BookOpen, Bug, Check, ChevronLeft, ChevronRight, CircleHelp, Coins, Download, Droplets, Eye, EyeOff, FileText, Flashlight, Flower2, Gift, Hammer, Heart, Leaf, Lock, LogOut, PawPrint, Play, RotateCcw, Save, Shield, Sparkles, Sprout, Star, Volume2, VolumeX, Wheat, X } from "lucide-react";
import { getActivityDefinition, getQuestionBank, PLACEMENT_QUESTIONS, WORLDS, type GameQuestion } from "@/game/content";
import palmTreeAsset from "@/assets/pegadas-coqueiro.png";
import iceCreamAsset from "@/assets/sorvete-morango.png";
import cartoonTreeAsset from "@/assets/arvore-openclipart.png";
import publicBeehiveAsset from "@/assets/colmeia-openclipart.png";
import { type EggRarity, type GameController, type GameState, type WorldApproval } from "@/game/GameController";
import "./placement-fixes.css";
import "./activity.css";
import "./pet-expansion.css";
import "./profile-page.css";
import "./teacher-password.css";

type Props = { state: GameState; controller: GameController };
type TeacherTab = "overview" | "profiles" | "answers" | "teacher-profile";
type RemoteStudent = { id: string; profile: { name: string; currentWorld: number; recommendedWorld?: number; placementCompleted?: boolean; xp: number; petName: string }; completions: Record<string, unknown>; worldApprovals?: Record<string, WorldApproval>; answers: unknown[]; gameState?: Partial<GameState>; updatedAt: string };
const PHASES_PER_WORLD = 8;
const SCENE_ASSETS: Record<string, string> = { "pegadas-coqueiro": palmTreeAsset };
const normalizeStudentName = (name: string) => name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
const answerStatusLabel = (answer: GameState["answers"][number]) => answer.correct && answer.usedHint ? "CONSEGUIU COM DICA" : answer.usedHint ? "COM DICA" : answer.correct ? "ACERTO" : "ERRO";
const answerStatusClass = (answer: GameState["answers"][number]) => answer.correct && !answer.usedHint ? "status-correct" : "status-help";

function studentReportRow(student: RemoteStudent) {
  const answers = student.answers as GameState["answers"];
  const completed = Object.keys(student.completions ?? {}).filter((key) => key.startsWith(`${student.profile.currentWorld}:`)).length;
  const worldAnswers = answers.filter((answer) => answer.worldId === student.profile.currentWorld);
  const accuracy = worldAnswers.length ? Math.round((worldAnswers.filter((answer) => answer.correct).length / worldAnswers.length) * 100) : 0;
  return { name: student.profile.name, world: student.profile.currentWorld + 1, completed, accuracy, answers: answers.length, pet: student.profile.petName, updated: new Date(student.updatedAt).toLocaleString("pt-BR") };
}

function remoteStudentAccuracy(student: RemoteStudent) {
  const answers = student.answers as GameState["answers"];
  return answers.length ? Math.round((answers.filter((answer) => answer.correct).length / answers.length) * 100) : 0;
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

const FEMALE_VOICE_HINTS = ["female", "feminina", "francisca", "helena", "maria", "luciana", "camila", "ana", "bruna", "fernanda", "joana", "victoria", "vitória", "sofia", "sophia"];

function preferredBrazilianVoice() {
  if (!("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const portuguese = voices.filter((voice) => voice.lang.toLowerCase().startsWith("pt-br"));
  const candidates = portuguese.length ? portuguese : voices.filter((voice) => voice.lang.toLowerCase().startsWith("pt"));
  return candidates.find((voice) => FEMALE_VOICE_HINTS.some((hint) => voice.name.toLowerCase().includes(hint))) ?? candidates[0] ?? voices.find((voice) => FEMALE_VOICE_HINTS.some((hint) => voice.name.toLowerCase().includes(hint)));
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.voice = preferredBrazilianVoice() ?? null;
  utterance.rate = 0.88;
  utterance.pitch = 1.08;
  utterance.volume = 1;
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
      <button className="developer-entry" onClick={() => controller.openDeveloper()}>acesso de desenvolvimento</button>
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
      const currentId = state.profile?.studentId;
      const lookup = await fetch("/api/students/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: safeName }) });
      if (lookup.ok && (await lookup.json() as { id?: string }).id !== currentId) {
        const resumeError = await controller.resumeProfile(safeName);
        if (resumeError) setNameError(resumeError);
        return;
      }
      if (state.profile) {
        const error = await controller.updateProfileName(safeName);
        if (error) setNameError(error);
      }
      else {
        const error = await controller.beginProfile(safeName);
        if (error) setNameError(error);
      }
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
        <input id="child-name" className="name-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} placeholder="Escreva seu nome aqui" />
        <p className="input-label lumi-companion-note">A Lumi será sua única companheira de trilha e vai ajudar com dicas, leituras e descobertas.</p>
        <button className="primary-action" disabled={saving} onClick={saveName}>{state.profile ? "Salvar alterações" : "Começar a expedição"} <ChevronRight size={23} /></button>
        {state.profile && <button className="teacher-entry" onClick={() => controller.returnToMenu()}>Voltar ao menu</button>}
        {nameError && <small className="login-error">{nameError}</small>}
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
  return <main className="welcome-page"><div className="opening-book-spread" aria-hidden="true"><i className="book-spine" /><b>✦</b></div><section className="welcome-copy paper-panel"><span className="page-tab">CONTINUAR AVENTURA</span><p className="eyebrow"><BookOpen size={16} /> Retomar uma expedição</p><h1>Que bom<br /><em>ver você de novo.</em></h1><p className="welcome-description">Digite exatamente o nome usado na aventura anterior para voltar ao ponto em que você parou.</p><label className="input-label" htmlFor="resume-name">Nome do aluno</label><input id="resume-name" className="name-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} placeholder="Escreva seu nome aqui" onKeyDown={(event) => { if (event.key === "Enter") void resume(); }} /><button className="primary-action" disabled={loading} onClick={() => void resume()}>{loading ? "Procurando..." : "Continuar minha aventura"} <ChevronRight size={23} /></button><button className="teacher-entry" onClick={() => controller.startNewSave()}>Começar nova aventura</button><button className="teacher-entry" onClick={() => controller.returnToMenu()}>Voltar ao menu</button>{message && <small className="login-error">{message}</small>}</section><aside className="welcome-art" aria-label="Lumi espera pela criança"><span className="diorama-tab">ROTA 02</span><Mascot className="welcome-mascot" /><div className="welcome-note"><span>“Eu guardei seu mapa!”</span><small>— Lumi, sua parceira de trilha</small></div></aside></main>;
}


function LogoutConfirmModal({ role, onCancel, onConfirm }: { role: "aluno" | "professor"; onCancel: () => void; onConfirm: () => void }) {
  return <div className="logout-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section className="logout-modal paper-panel" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title"><LogOut size={30} className="logout-modal-icon" /><p className="eyebrow">Encerrar sessão</p><h2 id="logout-modal-title">Sair da aventura?</h2><p>O perfil do {role} será desconectado neste dispositivo. Será possível entrar novamente pelo nome ou pela senha.</p><div className="logout-modal-actions"><button className="soft-action" onClick={onCancel}>Continuar conectado</button><button className="logout-button" onClick={onConfirm}><LogOut size={17} /> Confirmar logout</button></div></section></div>;
}

function StudentProfile({ state, controller }: Props) {
  const profile = state.profile!;
  const [name, setName] = useState(profile.name);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [nameMessage, setNameMessage] = useState("");
  const level = Math.max(1, Math.floor(profile.xp / 40) + 1);
  const totalCompleted = Object.keys(state.completions).length;
  return <><main className="profile-page single-game-page"><Header state={state} controller={controller} back /><section className="profile-card paper-panel"><div className="profile-hero"><Mascot label="Lumi, parceira do aluno" /><div><p className="eyebrow"><PawPrint size={16} /> Perfil do aluno</p><h1>{profile.name}</h1><p>Acompanhe sua aventura e deixe seu nome sempre do seu jeito.</p></div></div><div className="profile-stats"><span><strong>{level}</strong><small>Nível</small></span><span><strong>{profile.xp}</strong><small>XP</small></span><span><strong>{profile.coins}</strong><small>Moedas</small></span><span><strong>{profile.petLevel}</strong><small>Nível do pet</small></span></div><label className="input-label" htmlFor="profile-name">Nome da criança</label><input id="profile-name" className="name-input" value={name} onChange={(event) => { setName(event.target.value); setNameMessage(""); }} maxLength={120} /><div className="profile-page-actions"><button className="primary-action" onClick={async () => setNameMessage((await controller.saveProfileName(name)) ?? "Nome atualizado com sucesso.")}>Salvar alterações <Check size={20} /></button>{nameMessage && <small className={nameMessage === "Nome atualizado com sucesso." ? "password-success" : "login-error"}>{nameMessage}</small>}<button className="soft-action" onClick={() => controller.continueSave()}><BookOpen size={18} /> Voltar para minha trilha</button><button className="logout-button" onClick={() => setShowLogoutConfirm(true)}><LogOut size={18} /> Logout</button></div><section className="profile-progress"><div className="profile-progress-heading"><div><p className="eyebrow"><BookOpen size={16} /> Livro-mapa</p><h2>Progresso da aventura</h2></div><strong>{totalCompleted} / {WORLDS.length * 8} fases</strong></div>{WORLDS.map((world) => { const phases = Array.from({ length: 8 }, (_, phase) => state.completions[`${world.id}:${phase}`]); const completed = phases.filter(Boolean).length; const points = phases.reduce((sum, item) => sum + (item?.score ?? 0), 0); return <article className="profile-world-progress" key={world.id}><div className="profile-world-heading"><span className="profile-world-icon">{world.icon}</span><div><strong>{world.name}</strong><small>{completed === 8 ? "MUNDO CONCLUÍDO" : completed ? `${completed} FASES CONCLUÍDAS` : "AINDA NÃO INICIADO"}</small></div><b>{completed}/8</b></div><div className="profile-progress-bar"><i style={{ width: `${(completed / 8) * 100}%`, background: world.color }} /></div><div className="profile-phase-list">{phases.map((completion, phase) => <span className={completion ? "done" : "pending"} key={phase}>{completion ? <Check size={13} /> : phase + 1}{completion && <small>{completion.score}/8</small>}</span>)}</div><small className="profile-world-score">{points} pontos conquistados neste mundo</small></article>; })}</section></section></main>{showLogoutConfirm && <LogoutConfirmModal role="aluno" onCancel={() => setShowLogoutConfirm(false)} onConfirm={() => controller.logout()} />}</>;
}

function Placement({ state, controller }: Props) {
  const placementQueue = state.placementQueue.length ? state.placementQueue : PLACEMENT_QUESTIONS;
  const question = placementQueue[state.placementIndex];
  const audioAvailable = state.profile?.audioEnabled !== false;
  const essentialAudioAvailable = Boolean(question?.targetWord ?? question?.audioText);
  const playNarration = useQuestionNarration(question, audioAvailable);
  const playWord = useQuestionNarration(question, essentialAudioAvailable, true);
  useFeedbackNarration(state.feedback, audioAvailable);
  usePlacementResultNarration(state.placementResults, audioAvailable);
  const attemptLabel = "1ª tentativa";
  if (!question) return null;
  return (
    <main className="single-game-page">
      <section className="placement-card paper-panel">
        <div className="placement-topline"><span>Nivelamento inteligente</span><span>{state.placementIndex + 1} de {placementQueue.length}</span></div>
        <div className="progress-track"><i style={{ width: `${((state.placementIndex + 1) / placementQueue.length) * 100}%` }} /></div>
        <Mascot className="mini-lumi" label="Lumi" />
        <p className="eyebrow">Olá, {state.profile?.name}! Vamos só descobrir por onde sua aventura pode começar.</p>
        <div className="placement-question-title"><h2>{visiblePrompt(question)}</h2><div className="placement-audio-actions">{audioAvailable && <button className="audio-button placement-audio" onClick={playNarration} aria-label={audioLabel(question)}><Volume2 size={20} /> {audioLabel(question)}</button>}{essentialAudioAvailable && <button className="audio-button word-audio-button placement-audio" onClick={playWord} aria-label={audioLabel(question, true)}><Volume2 size={20} /> {audioLabel(question, true)}</button>}</div></div>
        <FigureIllustration question={question} placement />
        <p className="placement-attempt-label">{attemptLabel} · esta resposta é usada apenas para o nivelamento</p>
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
      <section className="placement-results-list"><div className="table-head"><div><p className="eyebrow">Como foi o teste?</p><h2>Resposta por resposta</h2></div><span>{retries ? `${retries} questão(ões) refeita(s)` : "Todas na primeira tentativa"}</span></div>{state.placementResults.map((result, index) => <div className="placement-result-row" key={`${result.questionId}-${index}`}><span className={result.correct ? "result-check correct" : "result-check retry"}>{result.correct ? <Check size={17} /> : <X size={17} />}</span><p><strong>{index + 1}. {result.question}</strong><small>{result.attempts === 1 ? "1 tentativa" : `${result.attempts} tentativas`}</small></p><b>{result.correct ? "ACERTO" : "ERRO"}</b></div>)}</section>
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
      <footer className="map-footer"><button onClick={() => controller.openPets()}><PawPrint size={19} /> Casa dos pets</button></footer>
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
  const activity = getActivityDefinition(state.activeWorld, question.activity);
  // Até o Silábico-Alfabético, a Lumi pode narrar o enunciado completo.
  // No Alfabético e no Ortográfico, somente atividades com palavra-alvo
  // oferecem áudio — e nelas o áudio é apenas a palavra, nunca a pergunta.
  const audioAvailable = state.profile?.audioEnabled !== false;
  const essentialAudioAvailable = Boolean(question.targetWord ?? question.audioText);
  const playNarration = useQuestionNarration(question, audioAvailable);
  const playWord = useQuestionNarration(question, essentialAudioAvailable, true);
  useFeedbackNarration(state.feedback, audioAvailable);
  return <main className="lesson-page" style={{ "--world": world.color, "--soft": world.accent } as CSSProperties}>
    <Header state={state} controller={controller} back />
    <section className="lesson-layout">
      <aside className="lesson-sidebar"><div className="lesson-world-mark">{world.icon}</div><p>{world.name}</p><strong>{state.activePhase === 7 ? "Desafio final" : `Fase ${state.activePhase + 1}`}</strong><div className="question-dots">{Array.from({ length: 8 }).map((_, index) => <i key={index} className={index <= state.questionIndex ? "filled" : ""} />)}</div><Mascot label="Lumi" /><div className="sidebar-bubble">{state.feedback?.tone === "hint" ? "Uma dica: olhe com calma." : "Eu estou aqui para ajudar!"}</div></aside>
      <section className="question-card paper-panel">
        <div className="question-head"><span>DESCOBERTA {state.questionIndex + 1} DE 8</span><div>{audioAvailable && <button className="audio-button" onClick={playNarration} aria-label={audioLabel(question)}><Volume2 size={20} /> {audioLabel(question)}</button>}{essentialAudioAvailable && <button className="audio-button word-audio-button" onClick={playWord} aria-label={audioLabel(question, true)}><Volume2 size={20} /> {audioLabel(question, true)}</button>}<span className="attempt-pill">{state.attempts === 0 ? "2 chances" : "Mais uma chance"}</span></div></div>
        {state.activePhase === 7 && <div className="final-challenge-banner"><span><Sparkles size={16} /> FESTIVAL FINAL DA LUMI</span><strong>Complete as oito descobertas e leve a abelhinha até a colmeia final.</strong><small>Cada etapa reúne uma habilidade que você praticou nesta trilha.</small></div>}
        {activity && <div className="activity-chip"><span>ATIVIDADE</span><strong>{activity.title}</strong></div>}
        <h2>{visiblePrompt(question)}</h2>
        <FigureIllustration question={question} />
        <QuestionInteraction question={question} disabled={question.kind === "cookie-mold" ? Boolean(state.feedback) : Boolean(state.feedback && state.feedback.tone !== "hint")} onAnswer={(answer, drawing) => controller.answer(answer, drawing)} />
        {state.feedback && <div className={`feedback-card ${state.feedback.tone}`}><div>{state.feedback.tone === "success" ? <Check size={24} /> : <CircleHelp size={24} />}</div><p>{state.feedback.text}</p>{state.feedback.tone === "hint" && question.kind === "cookie-mold" ? <button className="retry-button" onClick={() => controller.retry()}><RotateCcw size={20} /> Tentar de novo</button> : state.feedback.tone !== "hint" && <button onClick={() => controller.next()}>{state.questionIndex === 7 ? "Abrir meu baú" : "Próxima descoberta"} <ChevronRight size={20} /></button>}</div>}
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
  if (question.kind === "seed-rain") return <SeedRainInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "lantern") return <LanternInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "sand-tracks") return <SandTracksInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "mosquito-sweep") return <MosquitoSweepInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "magnet-paint") return <MagnetPaintInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "ice-melt") return <IceMeltInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "paint-roller") return <PaintRollerInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "bee-flight") return <BeeFlightInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "cookie-mold") return <CookieMoldInteraction question={question} disabled={disabled} onAnswer={onAnswer} />;
  if (question.kind === "shield-magic") return <ShieldMagicInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "syllable-hammer") return <SyllableHammerInteraction question={question} disabled={disabled} onComplete={() => onAnswer(question.answer)} />;
  if (question.kind === "syllable-letter") return <SyllableLetterInteraction question={question} disabled={disabled} onAnswer={onAnswer} />;
  if (question.kind === "draw") return <DrawingPad disabled={disabled} onSend={(drawing) => onAnswer("Desenho enviado", drawing)} />;
  if (question.kind === "order") return <WordBuilder question={question} disabled={disabled} onAnswer={onAnswer} />;
  return <div className="answer-grid">{question.options?.map((option) => <button key={option} className="answer-tile" disabled={disabled} onClick={() => onAnswer(option)}>{option}</button>)}</div>;
}

function SyllableLetterInteraction({ question, disabled, onAnswer }: { question: GameQuestion; disabled: boolean; onAnswer: (answer: string) => void }) {
  const options = question.soundOptions ?? question.options ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => setSelected(null), [question.id]);
  useEffect(() => { setSpeaking(false); return () => { window.speechSynthesis?.cancel(); }; }, [question.id]);
  const listenToSyllable = () => {
    if (disabled || !window.speechSynthesis || !question.soundSyllable) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.soundSyllable);
    utterance.lang = "pt-BR";
    utterance.voice = preferredBrazilianVoice() ?? null;
    utterance.rate = 0.72;
    utterance.pitch = 1.08;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  const submit = () => { if (!disabled && selected) onAnswer(selected); };
  const [before, after] = (question.soundPattern ?? "_").split("_");
  return <div className={`syllable-letter-activity sound-layout-${question.soundLayout ?? "row"} sound-challenge-${question.soundChallenge ?? "direct"}`}>
    <div className="syllable-letter-toolbar"><div><span className="syllable-letter-kicker"><Volume2 size={15} /> PONTE DO SOM</span><strong>Sílaba + Letra</strong></div><div className="syllable-letter-counter"><b>{selected ? "1" : "0"}</b><span>letra escolhida</span></div></div>
    <div className="syllable-letter-scene">
      <div className="syllable-letter-word" aria-label={`Palavra ${question.soundWord ?? ""}`}><span>{before}</span><b className={selected ? "filled" : "empty"}>{selected ?? "?"}</b><span>{after}</span></div>
      <div className="syllable-letter-sound"><span>OUÇA E FALE</span><strong>{question.soundSyllable}</strong><button type="button" className={`syllable-letter-listen ${speaking ? "speaking" : ""}`} onClick={listenToSyllable} disabled={disabled} aria-label={`Ouvir a sílaba ${question.soundSyllable}`}><Volume2 size={18} /> {speaking ? "Ouvindo..." : "Ouvir sílaba"}</button><small>Esta sílaba precisa de uma letra.</small></div>
      <div className="syllable-letter-bridge" aria-hidden="true"><i /><i /><i /></div>
    </div>
    <p className="syllable-letter-instruction">Escolha a letra que combina com o som de <strong>{question.soundSyllable}</strong> para formar <strong>{question.soundWord}</strong>.</p>
    <div className="syllable-letter-options" role="radiogroup" aria-label="Letras disponíveis">{options.map((option, index) => <button key={`${option}-${index}`} type="button" className={selected === option ? "selected" : ""} onClick={() => !disabled && setSelected(option)} disabled={disabled} role="radio" aria-checked={selected === option}>{option}</button>)}</div>
    <button type="button" className="syllable-letter-confirm primary-action compact" onClick={submit} disabled={disabled || !selected}><Check size={18} /> Conferir letra</button>
  </div>;
}

function CookieMoldInteraction({ question, disabled, onAnswer }: { question: GameQuestion; disabled: boolean; onAnswer: (answer: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const target = question.cookieTarget ?? question.answer;
  const options = question.cookieOptions ?? question.options ?? [];
  useEffect(() => setSelected(null), [question.id]);
  const submit = () => { if (!disabled && selected) onAnswer(selected); };
  return <div className={`cookie-mold-activity cookie-layout-${question.cookieLayout ?? "row"} cookie-challenge-${question.cookieChallenge ?? "direct"}`}>
    <div className="cookie-mold-toolbar"><div><span className="cookie-mold-kicker"><Sparkles size={15} /> COZINHA DAS LETRAS</span><strong>Molde de Biscoito</strong></div><div className="cookie-mold-counter"><b>{selected ? "1" : "0"}</b><span>fôrma escolhida</span></div></div>
    <div className="cookie-mold-board">
      <div className="cookie-mold-target" aria-label={`Letra-alvo ${target}`}><span className="cookie-mold-label">LETRA-ALVO</span><strong>{target}</strong><i>copie o desenho</i></div>
      <div className="cookie-mold-divider" aria-hidden="true">→</div>
      <div className="cookie-mold-options" role="radiogroup" aria-label="Fôrmas de biscoito disponíveis">
        {options.map((option, index) => <button key={`${option}-${index}`} type="button" className={`cookie-mold-option ${selected === option ? "selected" : ""}`} onClick={() => !disabled && setSelected(option)} disabled={disabled} role="radio" aria-checked={selected === option}>
          <span className="cookie-mold-cookie"><b>{option}</b><i /><em /></span><small>FÔRMA {index + 1}</small>
        </button>)}
      </div>
    </div>
    <div className="cookie-mold-footer"><p>{selected ? `Você escolheu a fôrma ${selected}. Confira o desenho antes de assar.` : "Toque na fôrma que tem exatamente o mesmo desenho da letra-alvo."}</p><button className="primary-action compact" onClick={submit} disabled={disabled || !selected}>Assar fôrma <Check size={18} /></button></div>
  </div>;
}

function ShieldMagicInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const items = question.shieldItems ?? [];
  const target = question.shieldTarget ?? items.filter((item) => /^[A-ZÁÉÍÓÚÀÃÕÇ]$/i.test(item)).length;
  const [protectedItems, setProtectedItems] = useState<number[]>([]);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const completed = protectedItems.length >= target;
  useEffect(() => { setProtectedItems([]); setWrongIndex(null); }, [question.id]);
  const selectItem = (index: number) => {
    if (disabled || protectedItems.includes(index) || completed) return;
    const item = items[index] ?? "";
    if (!/^[A-ZÁÉÍÓÚÀÃÕÇ]$/i.test(item)) {
      setWrongIndex(index);
      window.setTimeout(() => setWrongIndex((current) => current === index ? null : current), 420);
      return;
    }
    const next = [...protectedItems, index];
    setProtectedItems(next);
    if (next.length >= target) onComplete();
  };
  return <div className={`shield-magic-activity shield-layout-${question.shieldLayout ?? "row"} shield-motion-${question.shieldMotion ?? "still"} ${completed ? "completed" : ""}`}>
    <div className="shield-magic-toolbar"><div><span className="shield-magic-kicker"><Shield size={15} /> GUARDA DAS LETRAS</span><strong>O Escudo Mágico</strong></div><div className="shield-magic-counter"><b>{protectedItems.length}</b><span>de {target} letras</span></div></div>
    <div className="shield-magic-scene">
      <div className="shield-magic-city" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="shield-magic-emblem" aria-hidden="true"><Shield size={42} /><span>{completed ? "ABERTO" : "PROTEJA"}</span></div>
      <div className="shield-magic-items" role="group" aria-label="Caracteres que chegam ao portão">
        {items.map((item, index) => { const isLetter = /^[A-ZÁÉÍÓÚÀÃÕÇ]$/i.test(item); const selected = protectedItems.includes(index); return <button key={`${item}-${index}`} type="button" className={`shield-magic-item ${isLetter ? "letter" : "decoy"} ${selected ? "protected" : ""} ${wrongIndex === index ? "wrong" : ""}`} onClick={() => selectItem(index)} disabled={disabled || selected} aria-label={isLetter ? `Proteger letra ${item}` : `Distração ${item}`} aria-pressed={selected}>{item}</button>; })}
      </div>
    </div>
    <div className="shield-magic-footer"><p>{completed ? "Portão aberto! Você separou letras de números e símbolos." : "Toque somente nas letras para protegê-las com o escudo."}</p><span><Shield size={17} /> {completed ? "CIDADE PROTEGIDA" : "LETRAS PROTEGIDAS"}</span></div>
  </div>;
}

function SyllableHammerInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const parts = question.syllableParts ?? [];
  const [hits, setHits] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const complete = hits >= parts.length;
  useEffect(() => setHits(0), [question.id]);
  useEffect(() => () => { void audioContextRef.current?.close(); }, []);
  const playHammerSound = () => {
    try {
      const AudioContextConstructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return;
      const context = audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = context;
      if (context.state === "suspended") void context.resume();
      const now = context.currentTime;
      const impact = context.createOscillator();
      const click = context.createOscillator();
      const impactGain = context.createGain();
      const clickGain = context.createGain();
      impact.type = "triangle";
      impact.frequency.setValueAtTime(190, now);
      impact.frequency.exponentialRampToValueAtTime(68, now + 0.11);
      impactGain.gain.setValueAtTime(0.0001, now);
      impactGain.gain.exponentialRampToValueAtTime(0.28, now + 0.008);
      impactGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      click.type = "square";
      click.frequency.setValueAtTime(720, now);
      click.frequency.exponentialRampToValueAtTime(130, now + 0.035);
      clickGain.gain.setValueAtTime(0.0001, now);
      clickGain.gain.exponentialRampToValueAtTime(0.06, now + 0.004);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      impact.connect(impactGain).connect(context.destination);
      click.connect(clickGain).connect(context.destination);
      impact.start(now); click.start(now);
      impact.stop(now + 0.14); click.stop(now + 0.05);
    } catch {
      // O jogo continua sem áudio caso o navegador bloqueie a Web Audio API.
    }
  };
  const strike = () => {
    if (disabled || complete) return;
    playHammerSound();
    const next = hits + 1;
    setHits(next);
    if (next >= parts.length) onComplete();
  };
  return <div className={`syllable-hammer-activity hammer-style-${question.hammerStyle ?? "steady"} hammer-tempo-${question.hammerTempo ?? "normal"} ${complete ? "completed" : ""}`}>
    <div className="syllable-hammer-toolbar"><div><span className="syllable-hammer-kicker"><Hammer size={15} /> OFICINA DOS PEDAÇOS</span><strong>O Martelo dos Pedaços</strong></div><div className="syllable-hammer-counter"><b>{hits}</b><span>de {parts.length} batidas</span></div></div>
    <div className="syllable-hammer-word" aria-label={`Palavra dividida em ${parts.length} partes`}>{parts.map((part, index) => <span key={`${part}-${index}`} className={index < hits ? "hit" : index === hits ? "current" : ""}>{part}</span>)}</div>
    <div className="syllable-hammer-scene">
      <div className="syllable-hammer-sky" aria-hidden="true"><i /><i /><i /></div>
      <button type="button" className="syllable-hammer-button" onClick={strike} disabled={disabled || complete} aria-label={complete ? "Palavra completa" : "Bater o martelo uma vez"}><Hammer size={52} /><strong>{complete ? "COMPLETO" : "BATER"}</strong></button>
      <div className="syllable-hammer-blocks" aria-hidden="true">{parts.map((part, index) => <i key={`${part}-block-${index}`} className={index < hits ? "filled" : ""}>{index < hits ? "✓" : index + 1}</i>)}</div>
    </div>
    <div className="syllable-hammer-footer"><p>{complete ? "Muito bem! Cada batida marcou uma parte falada." : "Fale a palavra devagar e bata uma vez para cada pedaço."}</p><span><Hammer size={17} /> {complete ? "PALAVRA MARCADA" : "UMA BATIDA POR SÍLABA"}</span></div>
  </div>;
}

function MosquitoSweepInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const [cleared, setCleared] = useState<number[]>([]);
  const [sweeping, setSweeping] = useState(false);
  const [activeBug, setActiveBug] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const buzzRef = useRef<HTMLAudioElement | null>(null);
  const target = question.mosquitoTarget ?? 8;
  const positions = useMemo(() => {
    const layouts = [
      [[10, 17], [25, 10], [43, 20], [62, 11], [80, 18], [92, 35], [84, 54], [94, 74], [77, 90], [57, 82], [39, 93], [19, 82], [7, 65], [15, 45], [46, 44], [70, 48], [34, 34], [61, 67], [27, 88], [51, 94], [74, 86]],
      [[16, 24], [34, 11], [55, 16], [75, 10], [91, 28], [84, 47], [93, 67], [77, 86], [57, 92], [35, 84], [13, 91], [6, 70], [18, 53], [30, 42], [52, 51], [71, 38], [42, 32], [65, 72], [24, 90], [49, 95], [78, 88]],
      [[8, 13], [28, 21], [48, 10], [68, 19], [88, 13], [95, 38], [82, 58], [90, 81], [66, 92], [46, 78], [27, 94], [9, 82], [5, 58], [21, 39], [55, 43], [73, 57], [37, 62], [64, 31], [22, 87], [52, 93], [76, 89]],
    ];
    return layouts[(question.activityIndex ?? 0) % layouts.length].slice(0, target);
  }, [question.activityIndex, question.id, target]);
  useEffect(() => {
    const buzz = new Audio("/assets/mosquito-buzz.mp3");
    buzz.loop = true;
    buzz.volume = 0.22;
    buzzRef.current = buzz;
    setCleared([]); setSweeping(false); setActiveBug(null); setCompleted(false); startPoint.current = null;
    return () => { buzz.pause(); buzz.currentTime = 0; buzzRef.current = null; };
  }, [question.id]);
  useEffect(() => {
    const buzz = buzzRef.current;
    if (!buzz) return;
    const remaining = Math.max(0, 1 - cleared.length / target);
    buzz.volume = 0.22 * remaining;
    if (remaining === 0) buzz.pause();
  }, [cleared.length, target]);
  useEffect(() => { if (!completed) return; const timer = window.setTimeout(onComplete, 520); return () => window.clearTimeout(timer); }, [completed, onComplete]);
  const pointFromEvent = (event: PointerEvent<HTMLDivElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 }; };
  const finishSweep = (point: { x: number; y: number }) => {
    if (activeBug === null || !startPoint.current) return;
    const distance = Math.hypot(point.x - startPoint.current.x, point.y - startPoint.current.y);
    if (distance < 18) return;
    const startFromFruit = Math.hypot(startPoint.current.x - 50, startPoint.current.y - 55);
    const endFromFruit = Math.hypot(point.x - 50, point.y - 55);
    const reachedEdge = point.x < 8 || point.x > 92 || point.y < 8 || point.y > 92;
    if (!reachedEdge && endFromFruit < startFromFruit + 8) return;
    setCleared((current) => { const next = current.includes(activeBug) ? current : [...current, activeBug]; if (next.length >= target) setCompleted(true); return next; });
  };
  const begin = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || completed) return;
    const point = pointFromEvent(event);
    const nearest = positions.findIndex(([x, y], index) => !cleared.includes(index) && Math.hypot(point.x - x, point.y - y) <= 12);
    if (nearest < 0) return;
    void buzzRef.current?.play().catch(() => undefined);
    startPoint.current = point; setActiveBug(nearest); setSweeping(true); event.currentTarget.setPointerCapture(event.pointerId);
  };
  const stop = (event: PointerEvent<HTMLDivElement>) => { if (sweeping) finishSweep(pointFromEvent(event)); setSweeping(false); setActiveBug(null); startPoint.current = null; };
  return <div className={`mosquito-sweep-activity ${completed ? "completed" : ""}`}>
    <div className="mosquito-toolbar"><div><span className="mosquito-kicker"><Bug size={15} /> POMAR EM ALERTA</span><strong>Espante os mosquitos</strong></div><div className="mosquito-counter"><b>{cleared.length}</b><span>/ {target} afastados</span></div></div>
    <div className="mosquito-scene" aria-label="Pomar interativo para espantar mosquitos" onPointerDown={begin} onPointerUp={stop} onPointerCancel={stop}>
      <div className={`mosquito-fruit fruit-${(question.activityIndex ?? 0) % 3}`} aria-hidden="true"><i /><b /></div><span className="mosquito-leaf leaf-one" /><span className="mosquito-leaf leaf-two" />
      {positions.map(([x, y], index) => <span className={`mosquito mosquito-flight-${index % 4} ${cleared.includes(index) ? "cleared" : ""} ${activeBug === index ? "active" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} key={`${x}-${y}`} aria-hidden="true"><span className="fly-sprite"><i className="fly-wing fly-wing-left" /><i className="fly-wing fly-wing-right" /><b className="fly-body" /></span></span>)}
      {completed && <span className="mosquito-clean-badge" aria-label="Pomar limpo"><Check size={24} /></span>}
      <span className="mosquito-instruction">Comece perto de um inseto e faça um gesto rápido para fora</span>
    </div>
    <div className="mosquito-footer"><p>{completed ? "Muito bem! A fruta está protegida e o pomar ficou tranquilo." : "Toque perto de um mosquito, arraste com rapidez e solte longe dele."}</p><div className="mosquito-progress" aria-label={`${cleared.length} de ${target} mosquitos afastados`}><i style={{ width: `${(cleared.length / target) * 100}%` }} /></div></div>
  </div>;
}
function MagnetPaintInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [painted, setPainted] = useState<number[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const target = question.magnetTarget ?? 8;
  const pointRef = useRef<{ x: number; y: number } | null>(null);
  const drawingRef = useRef(false);
  const paintedRef = useRef<number[]>([]);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const checkpoints = useMemo(() => {
    const layouts = [
      [[18, 26], [34, 17], [51, 28], [67, 18], [82, 30], [70, 57], [47, 72], [23, 58]],
      [[16, 66], [23, 45], [36, 28], [53, 19], [70, 27], [81, 46], [73, 70], [48, 82]],
      [[20, 29], [49, 19], [78, 29], [81, 65], [50, 80], [19, 65], [35, 48], [65, 48]],
    ];
    return layouts[(question.activityIndex ?? 0) % layouts.length].slice(0, target).map(([x, y]) => ({ x: (x / 100) * 900, y: (y / 100) * 330 }));
  }, [question.activityIndex, question.id, target]);
  useEffect(() => {
    setPainted([]); setDrawing(false); setCompleted(false); pointRef.current = { x: 450, y: 165 }; drawingRef.current = false; paintedRef.current = []; trailRef.current = [];
  }, [question.id]);
  useEffect(() => { if (!completed) return; const timer = window.setTimeout(onComplete, 520); return () => window.clearTimeout(timer); }, [completed, onComplete]);
  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return;
    const filings = Array.from({ length: 150 }, (_, index) => ({ x: 34 + ((index * 83) % 832), y: 24 + ((index * 47) % 282), length: 3 + (index % 5), phase: index * .71 }));
    let frame = 0;
    const render = (time: number) => {
      const gradient = ctx.createLinearGradient(0, 0, 900, 330); gradient.addColorStop(0, "#dff3df"); gradient.addColorStop(1, "#a8d8b2"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 900, 330);
      ctx.strokeStyle = "rgba(82, 131, 106, .1)"; ctx.lineWidth = 1; for (let x = 30; x < 900; x += 45) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 330); ctx.stroke(); } for (let y = 25; y < 330; y += 45) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(900, y); ctx.stroke(); }
      ctx.lineCap = "round"; trailRef.current.forEach((point, index) => { const next = trailRef.current[index + 1]; if (!next) return; ctx.strokeStyle = `rgba(42, 105, 91, ${Math.max(.05, index / trailRef.current.length * .34)})`; ctx.lineWidth = 2 + (index % 3); ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(next.x, next.y); ctx.stroke(); });
      ctx.save(); ctx.setLineDash([8, 10]); ctx.strokeStyle = "rgba(44, 120, 96, .28)"; ctx.lineWidth = 3; ctx.beginPath(); checkpoints.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)); ctx.closePath(); ctx.stroke(); ctx.restore();
      checkpoints.forEach((point, index) => { const active = paintedRef.current.includes(index); ctx.fillStyle = active ? "#efb84b" : "rgba(25, 118, 92, .32)"; ctx.strokeStyle = active ? "#c77d25" : "rgba(25, 118, 92, .7)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(point.x, point.y, active ? 15 : 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); if (active) { ctx.fillStyle = "#fff8df"; ctx.font = "bold 17px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("✦", point.x, point.y); } });
      filings.forEach((filing) => { let x = filing.x; let y = filing.y; const magnet = pointRef.current; if (magnet) { const dx = magnet.x - x; const dy = magnet.y - y; const distance = Math.hypot(dx, dy); if (distance < 145) { const pull = (1 - distance / 145) * 28; x += (dx / Math.max(distance, 1)) * pull; y += (dy / Math.max(distance, 1)) * pull; } } const wave = Math.sin(time / 500 + filing.phase) * 2; ctx.save(); ctx.translate(x, y + wave); ctx.rotate(Math.atan2(Math.sin(filing.phase), Math.cos(filing.phase)) + (magnet ? Math.atan2(magnet.y - y, magnet.x - x) : 0)); ctx.strokeStyle = "rgba(59, 101, 82, .55)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-filing.length, 0); ctx.lineTo(filing.length, 0); ctx.stroke(); ctx.restore(); });
      const magnet = pointRef.current; if (magnet) { ctx.save(); ctx.translate(magnet.x, magnet.y); ctx.rotate(-.16); ctx.strokeStyle = "#164c43"; ctx.lineWidth = 17; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(0, 0, 30, Math.PI * .18, Math.PI * .82, true); ctx.stroke(); ctx.strokeStyle = "#ed6f5b"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-25, 17); ctx.lineTo(-19, 29); ctx.stroke(); ctx.strokeStyle = "#5e9fd0"; ctx.beginPath(); ctx.moveTo(25, 17); ctx.lineTo(19, 29); ctx.stroke(); ctx.restore(); }
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render); return () => window.cancelAnimationFrame(frame);
  }, [checkpoints]);
  const position = (event: PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * 900, y: ((event.clientY - rect.top) / rect.height) * 330 }; };
  const mark = (point: { x: number; y: number }) => { const next = [...paintedRef.current]; checkpoints.forEach((checkpoint, index) => { if (!next.includes(index) && Math.hypot(point.x - checkpoint.x, point.y - checkpoint.y) < 55) next.push(index); }); if (next.length !== paintedRef.current.length) { paintedRef.current = next; setPainted(next); if (next.length >= target) { setCompleted(true); drawingRef.current = false; setDrawing(false); } } };
  const start = (event: PointerEvent<HTMLCanvasElement>) => { if (disabled || completed) return; const point = position(event); pointRef.current = point; trailRef.current = [point]; drawingRef.current = true; setDrawing(true); mark(point); event.currentTarget.setPointerCapture(event.pointerId); };
  const move = (event: PointerEvent<HTMLCanvasElement>) => { if (!drawingRef.current || disabled || completed) return; const point = position(event); pointRef.current = point; trailRef.current = [...trailRef.current.slice(-180), point]; mark(point); };
  const stop = () => { drawingRef.current = false; setDrawing(false); };
  return <div className={`magnet-paint-activity ${completed ? "completed" : ""}`}><div className="magnet-toolbar"><div><span className="magnet-kicker"><Sparkles size={15} /> ATELIÊ MAGNÉTICO</span><strong>Pinte com o ímã</strong></div><div className="magnet-counter"><b>{painted.length}</b><span>/ {target} pontos</span></div></div><div className="magnet-scene" aria-label="Tela interativa para pintar com um ímã"><canvas ref={canvasRef} width="900" height="330" onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} aria-label="Arraste a ferradura magnética pela tela" />{completed && <span className="magnet-complete-badge" aria-label="Forma magnética completa"><Check size={24} /></span>}</div><div className="magnet-footer"><p>{completed ? "Que desenho bonito! A limalha formou uma figura magnética." : drawing ? "Continue arrastando e observe as partículas acompanharem a ferradura." : "Toque na tela e arraste a ferradura para acender todos os pontos."}</p><div className="magnet-progress" aria-label={`${painted.length} de ${target} pontos magnéticos`}><i style={{ width: `${(painted.length / target) * 100}%` }} /></div></div></div>;
    }
function BeeFlightInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visited, setVisited] = useState<number[]>([]);
  const [flying, setFlying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const target = question.beeTarget ?? 9;
  const checkpoints = useMemo(() => [[78, 246], [164, 177], [238, 91], [330, 154], [422, 72], [515, 178], [615, 92], [730, 146], [826, 70]].slice(0, target).map(([x, y]) => ({ x, y })), [target, question.id]);
  const visitedRef = useRef<number[]>([]);
  const flyingRef = useRef(false);
  const beeRef = useRef(checkpoints[0] ?? { x: 78, y: 246 });
  const trailRef = useRef<Array<{ x: number; y: number }>>([]);
  useEffect(() => { visitedRef.current = []; trailRef.current = []; beeRef.current = checkpoints[0] ?? { x: 78, y: 246 }; flyingRef.current = false; setVisited([]); setFlying(false); setCompleted(false); }, [question.id, checkpoints]);
  useEffect(() => { if (!completed) return; const timer = window.setTimeout(onComplete, 560); return () => window.clearTimeout(timer); }, [completed, onComplete]);
  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return;
    let frame = 0;
    const treeImage = new Image(); treeImage.src = cartoonTreeAsset;
    const hiveImage = new Image(); hiveImage.src = publicBeehiveAsset;
    const drawTreeFallback = (x: number, y: number, scale: number) => { ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.fillStyle = "#8a5b3d"; ctx.fillRect(-8, -76, 16, 76); ctx.fillStyle = "#5eaa68"; [[-26, -76, 27], [5, -91, 32], [30, -70, 25], [0, -119, 25]].forEach(([leafX, leafY, radius]) => { ctx.beginPath(); ctx.arc(leafX, leafY, radius, 0, Math.PI * 2); ctx.fill(); }); ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.beginPath(); ctx.arc(-8, -101, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore(); };
    const drawTree = (x: number, y: number, scale: number) => { if (!treeImage.complete || !treeImage.naturalWidth) { drawTreeFallback(x, y, scale); return; } const width = 150 * scale; const height = 182 * scale; ctx.drawImage(treeImage, x - width / 2, y - height, width, height); };
    const drawHiveFallback = (x: number, y: number, active: boolean) => { ctx.save(); ctx.translate(x, y); ctx.fillStyle = active ? "#f2bd42" : "#d9a649"; ctx.strokeStyle = "#825432"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-24, 20); ctx.quadraticCurveTo(-27, -18, 0, -30); ctx.quadraticCurveTo(27, -18, 24, 20); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "rgba(130,84,50,.7)"; ctx.lineWidth = 5; [-12, 0, 12].forEach((stripe) => { ctx.beginPath(); ctx.moveTo(stripe - 7, -22); ctx.lineTo(stripe - 4, 20); ctx.stroke(); }); ctx.fillStyle = "#fff4cf"; ctx.beginPath(); ctx.arc(0, -4, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#825432"; ctx.beginPath(); ctx.arc(0, -4, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); };
    const drawHive = (x: number, y: number, active: boolean) => { if (!hiveImage.complete || !hiveImage.naturalWidth) { drawHiveFallback(x, y, active); return; } if (active) { ctx.save(); ctx.shadowColor = "rgba(255,208,74,.72)"; ctx.shadowBlur = 18; ctx.drawImage(hiveImage, x - 58, y - 36, 116, 72); ctx.restore(); } else ctx.drawImage(hiveImage, x - 58, y - 36, 116, 72); };
    const render = (time: number) => {
      const sky = ctx.createLinearGradient(0, 0, 0, 330); sky.addColorStop(0, "#bcecf0"); sky.addColorStop(.68, "#e7f7cf"); sky.addColorStop(1, "#8fc978"); ctx.fillStyle = sky; ctx.fillRect(0, 0, 900, 330);
      ctx.fillStyle = "rgba(255,255,255,.72)"; [[112, 46], [365, 34], [690, 42]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.arc(x + 20, y + 4, 13, 0, Math.PI * 2); ctx.arc(x - 19, y + 6, 12, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = "rgba(55,137,85,.2)"; ctx.fillRect(0, 278, 900, 52); drawTree(46, 278, .72); drawTree(170, 278, .58); drawTree(308, 278, .78); drawTree(604, 278, .62); drawTree(744, 278, .78); drawTree(875, 278, .56);
      ctx.save(); ctx.setLineDash([8, 10]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(40,126,93,.36)"; ctx.lineCap = "round"; ctx.beginPath(); checkpoints.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)); ctx.stroke(); ctx.restore();
      ctx.lineCap = "round"; trailRef.current.forEach((point, index) => { const next = trailRef.current[index + 1]; if (!next) return; ctx.strokeStyle = `rgba(245,185,61,${Math.max(.16, index / Math.max(1, trailRef.current.length) * .75)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(next.x, next.y); ctx.stroke(); });
      checkpoints.forEach((point, index) => { const active = visitedRef.current.includes(index); ctx.fillStyle = active ? "#f3bd4e" : "rgba(36,126,87,.25)"; ctx.strokeStyle = active ? "#d98232" : "rgba(36,126,87,.62)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(point.x, point.y, active ? 15 : 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); if (index === checkpoints.length - 1) drawHive(point.x, point.y - 22, active); });
      const bee = beeRef.current; const wingBeat = .62 + Math.abs(Math.sin(time / 62)) * .58; ctx.save(); ctx.translate(bee.x, bee.y + Math.sin(time / 180) * 3); ctx.rotate(-.08); ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.beginPath(); ctx.ellipse(-10, -13, 13, 8 * wingBeat, -.35, 0, Math.PI * 2); ctx.ellipse(10, -13, 13, 8 * wingBeat, .35, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#f2bd42"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#674e31"; ctx.lineWidth = 4; [-7, 2, 10].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x, 10); ctx.stroke(); }); ctx.fillStyle = "#674e31"; ctx.beginPath(); ctx.arc(17, -2, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(19, -4, 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = "rgba(34,101,75,.75)"; ctx.font = "900 13px Baloo 2, sans-serif"; ctx.fillText("ROTA DA LUMI", 24, 28); frame = window.requestAnimationFrame(render);
    }; frame = window.requestAnimationFrame(render); return () => window.cancelAnimationFrame(frame);
  }, [checkpoints]);
  const position = (event: PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * 900, y: ((event.clientY - rect.top) / rect.height) * 330 }; };
  const mark = (point: { x: number; y: number }) => { const nextIndex = visitedRef.current.length; const checkpoint = checkpoints[nextIndex]; if (!checkpoint || Math.hypot(point.x - checkpoint.x, point.y - checkpoint.y) > 58) return; const next = [...visitedRef.current, nextIndex]; visitedRef.current = next; setVisited(next); if (next.length >= checkpoints.length) { flyingRef.current = false; setFlying(false); setCompleted(true); } };
  const start = (event: PointerEvent<HTMLCanvasElement>) => { if (disabled || completed) return; const point = position(event); const first = checkpoints[0]; if (!first || Math.hypot(point.x - first.x, point.y - first.y) > 72) return; beeRef.current = point; trailRef.current = [point]; flyingRef.current = true; setFlying(true); mark(point); event.currentTarget.setPointerCapture(event.pointerId); };
  const move = (event: PointerEvent<HTMLCanvasElement>) => { if (!flyingRef.current || disabled || completed) return; const point = position(event); beeRef.current = point; trailRef.current = [...trailRef.current.slice(-180), point]; mark(point); };
  const stop = () => { flyingRef.current = false; setFlying(false); };
      return <div className={`bee-flight-activity ${completed ? "completed" : ""}`}><div className="bee-flight-toolbar"><div><span className="bee-flight-kicker"><Flower2 size={15} /> COMPANHEIRA DA LUMI</span><strong>Voo da Abelha</strong></div><div className="bee-flight-counter"><b>{visited.length}</b><span>/ {target} pontos</span></div></div><div className="bee-flight-scene" aria-label="Tela interativa para guiar a abelhinha da Lumi"><canvas ref={canvasRef} width="900" height="330" onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} aria-label="Siga a rota pontilhada até a colmeia final" />{completed && <span className="bee-flight-complete" aria-label="Voo completo"><Check size={25} /></span>}</div><div className="bee-flight-footer"><p>{completed ? "A abelhinha chegou! A colmeia final do Festival da Lumi foi encontrada." : flying ? "Continue seguindo os pontos dourados até a colmeia." : "Toque no primeiro ponto e guie a abelhinha pela rota até a colmeia."}</p><div className="bee-flight-progress" aria-label={`${visited.length} de ${target} pontos da rota`}><i style={{ width: `${(visited.length / target) * 100}%` }} /></div></div></div>;
}
function PaintRollerInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paintedCells, setPaintedCells] = useState<boolean[]>([]);
  const [painting, setPainting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rollerPoint, setRollerPoint] = useState<{ x: number; y: number } | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const paintingRef = useRef(false);
  const rows = question.rollerRows ?? 3;
  const columns = question.rollerColumns ?? 10;
  const ordered = question.rollerOrdered ?? false;
  const direction = question.rollerDirection ?? "left";
  const pattern = question.rollerPattern ?? "straight";
  const color = question.rollerColor ?? "#F6B84B";
  const totalCells = rows * columns;
  const top = 28;
  const height = 274;
  const laneHeight = height / rows;
  const activeRow = paintedCells.reduce((current, _, index) => { const row = Math.floor(index / columns); const start = row * columns; return ordered && paintedCells.slice(start, start + columns).every(Boolean) ? Math.max(current, row + 1) : current; }, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const wall = context.createLinearGradient(0, 0, 900, 330); wall.addColorStop(0, "#fff3ca"); wall.addColorStop(.52, "#f8d994"); wall.addColorStop(1, "#e9a86e"); context.fillStyle = wall; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, .2)"; for (let dot = 0; dot < 70; dot += 1) { const x = 18 + ((dot * 97) % 864); const y = 12 + ((dot * 53) % 306); context.beginPath(); context.arc(x, y, dot % 3 === 0 ? 2 : 1, 0, Math.PI * 2); context.fill(); }
    context.fillStyle = "rgba(255, 252, 238, .9)"; context.fillRect(24, top - 7, 852, height + 14);
    context.fillStyle = "rgba(122, 91, 61, .08)"; context.fillRect(32, top + 5, 836, height + 5);
    for (let row = 0; row < rows; row += 1) { const y = top + row * laneHeight + 7; const active = !ordered || row === activeRow; context.fillStyle = active ? "rgba(255, 247, 224, .94)" : "rgba(239, 224, 193, .62)"; context.fillRect(42, y, 816, laneHeight - 14); context.strokeStyle = active ? "rgba(255, 255, 255, .96)" : "rgba(194, 166, 122, .4)"; context.lineWidth = active ? 2 : 1; context.strokeRect(42, y, 816, laneHeight - 14); }
    context.lineWidth = 2; context.setLineDash([7, 10]); context.strokeStyle = "rgba(122, 91, 61, .25)";
    for (let row = 0; row <= rows; row += 1) { const y = top + row * laneHeight; context.beginPath(); context.moveTo(24, y); context.lineTo(876, y); context.stroke(); }
    context.setLineDash([9, 11]); context.strokeStyle = "rgba(122, 91, 61, .38)";
    for (let row = 0; row < rows; row += 1) {
      const y = top + row * laneHeight + laneHeight / 2;
      const fromLeft = direction === "left" || (direction === "alternate" && row % 2 === 0);
      context.setLineDash([9, 11]); context.beginPath();
      if (pattern === "zigzag") { for (let step = 0; step <= 12; step += 1) { const x = fromLeft ? 48 + step * 67 : 852 - step * 67; const offset = step % 2 ? -laneHeight * .16 : laneHeight * .16; step === 0 ? context.moveTo(x, y + offset) : context.lineTo(x, y + offset); } } else { context.moveTo(fromLeft ? 48 : 852, y); context.lineTo(fromLeft ? 852 : 48, y); }
      context.stroke();
      const badgeX = fromLeft ? 58 : 842; context.setLineDash([]); context.fillStyle = "rgba(122, 91, 61, .65)"; context.font = "800 15px sans-serif"; context.textAlign = fromLeft ? "left" : "right"; context.textBaseline = "middle"; context.fillText(`${row + 1}`, badgeX, y);
    }
    context.setLineDash([]);
    setPaintedCells(Array.from({ length: totalCells }, () => false)); setPainting(false); paintingRef.current = false; setCompleted(false); setRollerPoint(null); lastPoint.current = null;
  }, [question.id, rows, columns, direction, pattern, totalCells, laneHeight]);

  useEffect(() => {
    if (!completed) return;
    const timer = window.setTimeout(onComplete, 520);
    return () => window.clearTimeout(timer);
  }, [completed, onComplete]);

  const position = (event: PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height }; };
  const distanceToSegment = (point: { x: number; y: number }, start: { x: number; y: number }, end: { x: number; y: number }) => { const dx = end.x - start.x; const dy = end.y - start.y; const length = Math.max(1, dx * dx + dy * dy); const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length)); return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy)); };
  const expectedFromLeft = (row: number) => direction === "left" || (direction === "alternate" && row % 2 === 0);
  const paint = (point: { x: number; y: number }) => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d"); if (!canvas || !context) return;
    const previous = lastPoint.current ?? point;
    const row = Math.max(0, Math.min(rows - 1, Math.floor((point.y - top) / laneHeight)));
    context.save(); context.strokeStyle = color; context.globalAlpha = .86; context.shadowColor = "rgba(112, 73, 43, .22)"; context.shadowBlur = 5; context.lineWidth = Math.max(34, laneHeight * .62); context.lineCap = "round"; context.beginPath(); context.moveTo(previous.x, previous.y); context.lineTo(point.x, point.y); context.stroke(); context.shadowBlur = 0; context.strokeStyle = "rgba(255, 255, 255, .24)"; context.globalAlpha = .7; context.lineWidth = Math.max(4, laneHeight * .1); context.beginPath(); context.moveTo(previous.x, previous.y - laneHeight * .12); context.lineTo(point.x, point.y - laneHeight * .12); context.stroke(); context.restore();
    setPaintedCells((current) => { const next = [...current]; for (let column = 0; column < columns; column += 1) { const center = { x: 48 + (column + .5) * 804 / columns, y: top + row * laneHeight + laneHeight / 2 }; const index = row * columns + column; if ((!ordered || row === activeRow) && distanceToSegment(center, previous, point) <= laneHeight * .52) next[index] = true; } if (next.every(Boolean)) { setCompleted(true); setPainting(false); paintingRef.current = false; } return next; });
    lastPoint.current = point; setRollerPoint(point);
  };
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    if (disabled || completed) return;
    const point = position(event); const row = Math.max(0, Math.min(rows - 1, Math.floor((point.y - top) / laneHeight))); const fromLeft = expectedFromLeft(row); const validRow = !ordered || row === activeRow; const currentRowHasPaint = paintedCells.slice(activeRow * columns, (activeRow + 1) * columns).some(Boolean); const validSide = !ordered || currentRowHasPaint || (fromLeft ? point.x < 150 : point.x > 750);
    if (!validRow || !validSide) return;
    paintingRef.current = true; setPainting(true); lastPoint.current = point; paint(point); event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLCanvasElement>) => { if (!paintingRef.current || disabled || completed) return; paint(position(event)); };
  const stop = () => { paintingRef.current = false; setPainting(false); lastPoint.current = null; };
  const progress = Math.round((paintedCells.filter(Boolean).length / totalCells) * 100);
  return <div className={`paint-roller-activity ${completed ? "completed" : ""}`}>
    <div className="paint-roller-toolbar"><div><span className="paint-roller-kicker"><Sparkles size={15} /> PAREDE DE CORES</span><strong>Rolo de Pintura Gigante</strong></div><div className="paint-roller-counter"><b>{progress}%</b><span>pintado</span></div></div>
    <div className="paint-roller-scene" aria-label="Mural interativo para pintar com um rolo"><canvas ref={canvasRef} width="900" height="330" onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} aria-label="Arraste o rolo pelas faixas de pintura" />{rollerPoint && painting && <span className="paint-roller-cursor" style={{ left: `${(rollerPoint.x / 900) * 100}%`, top: `${(rollerPoint.y / 330) * 100}%`, borderColor: color }} aria-hidden="true"><i style={{ background: color }} /></span>}{completed && <span className="paint-roller-complete" aria-label="Mural completamente pintado"><Check size={24} /></span>}</div>
    <div className="paint-roller-footer"><p>{completed ? "Muito bem! O mural ficou colorido." : painting ? "Continue passando o rolo pela faixa." : ordered ? `Comece na faixa ${activeRow + 1} e siga a ordem indicada.` : "Toque em uma faixa e arraste o rolo de uma ponta à outra."}</p><div className="paint-roller-progress" aria-label={`${progress}% do mural pintado`}><i style={{ width: `${progress}%`, background: color }} /></div></div>
  </div>;
}

function IceMeltInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const artCanvasRef = useRef<HTMLCanvasElement>(null);
  const iceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(0);
  const [rubbing, setRubbing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const revealedCells = useRef<boolean[]>([]);
  const revealBox = question.revealRegion ?? { x: 315, y: 38, width: 270, height: 252, coordinateSpace: "900x330" as const };
  const grid = { columns: 18, rows: 14 };
  const cellCount = grid.columns * grid.rows;
  const revealLabel = question.revealLabel ?? "imagem escondida";

  useEffect(() => {
    const artCanvas = artCanvasRef.current;
    const iceCanvas = iceCanvasRef.current;
    const art = artCanvas?.getContext("2d");
    const ice = iceCanvas?.getContext("2d");
    if (!artCanvas || !iceCanvas || !art || !ice) return;
    art.clearRect(0, 0, artCanvas.width, artCanvas.height);
    const drawIceCream = () => {
      const size = Math.min(revealBox.width, revealBox.height);
      art.drawImage(iceCreamImage, revealBox.x + (revealBox.width - size) / 2, revealBox.y + (revealBox.height - size) / 2, size, size);
    };
    const iceCreamImage = new Image();
    iceCreamImage.onload = drawIceCream;
    iceCreamImage.src = iceCreamAsset;
    if (iceCreamImage.complete) drawIceCream();

    ice.clearRect(0, 0, iceCanvas.width, iceCanvas.height);
    ice.globalCompositeOperation = "source-over";
    ice.fillStyle = "rgba(218, 242, 250, .94)";
    ice.fillRect(0, 0, iceCanvas.width, iceCanvas.height);
    ice.strokeStyle = "rgba(255, 255, 255, .9)";
    ice.lineWidth = 3;
    ice.lineCap = "round";
    for (let index = 0; index < 20; index += 1) {
      const x = 34 + ((index * 173) % 830);
      const y = 27 + ((index * 97) % 276);
      for (let arm = 0; arm < 6; arm += 1) {
        const angle = (Math.PI / 3) * arm;
        ice.beginPath(); ice.moveTo(x, y); ice.lineTo(x + Math.cos(angle) * 13, y + Math.sin(angle) * 13); ice.stroke();
      }
    }
    ice.strokeStyle = "rgba(167, 216, 231, .44)"; ice.lineWidth = 8;
    ice.beginPath(); ice.arc(160, 130, 90, .2, 2.5); ice.stroke();
    ice.beginPath(); ice.arc(735, 207, 110, 3.4, 5.8); ice.stroke();
    revealedCells.current = Array.from({ length: cellCount }, () => false);
    setRevealed(0); setRubbing(false); setCompleted(false); lastPoint.current = null;
  }, [question.id, cellCount, revealBox.height, revealBox.width, revealBox.x, revealBox.y]);

  useEffect(() => {
    if (!completed) return;
    const timer = window.setTimeout(onComplete, 520);
    return () => window.clearTimeout(timer);
  }, [completed, onComplete]);

  const pointFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = iceCanvasRef.current!; const rect = canvas.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height };
  };
  const distanceToSegment = (point: { x: number; y: number }, start: { x: number; y: number }, end: { x: number; y: number }) => {
    const dx = end.x - start.x; const dy = end.y - start.y; const length = Math.max(1, dx * dx + dy * dy); const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length));
    return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
  };
  const erase = (point: { x: number; y: number }) => {
    const canvas = iceCanvasRef.current; const context = canvas?.getContext("2d"); if (!canvas || !context) return;
    const previous = lastPoint.current ?? point;
    context.save(); context.globalCompositeOperation = "destination-out"; context.lineWidth = 62; context.lineCap = "round"; context.beginPath(); context.moveTo(previous.x, previous.y); context.lineTo(point.x, point.y); context.stroke(); context.beginPath(); context.arc(point.x, point.y, 31, 0, Math.PI * 2); context.fill(); context.restore();
    const nextCells = [...revealedCells.current];
    for (let row = 0; row < grid.rows; row += 1) for (let column = 0; column < grid.columns; column += 1) {
      const index = row * grid.columns + column; if (nextCells[index]) continue;
      const center = { x: revealBox.x + (column + .5) * revealBox.width / grid.columns, y: revealBox.y + (row + .5) * revealBox.height / grid.rows };
      if (distanceToSegment(center, previous, point) <= 38) nextCells[index] = true;
    }
    revealedCells.current = nextCells;
    const progress = Math.round((nextCells.filter(Boolean).length / cellCount) * 100);
    setRevealed(progress); lastPoint.current = point;
    if (progress >= 100) { setCompleted(true); setRubbing(false); }
  };
  const start = (event: PointerEvent<HTMLCanvasElement>) => { if (disabled || completed) return; setRubbing(true); const point = pointFromEvent(event); lastPoint.current = point; erase(point); event.currentTarget.setPointerCapture(event.pointerId); };
  const move = (event: PointerEvent<HTMLCanvasElement>) => { if (!rubbing || disabled || completed) return; erase(pointFromEvent(event)); };
  const stop = () => { setRubbing(false); lastPoint.current = null; };

  return <div className={`ice-melt-activity ${completed ? "completed" : ""}`}>
    <div className="ice-melt-toolbar"><div><span className="ice-melt-kicker"><Sparkles size={15} /> JANELA CONGELADA</span><strong>Revele o {revealLabel.toLowerCase()}</strong></div><div className="ice-melt-counter"><b>{revealed}%</b><span>da imagem revelada</span></div></div>
    <div className="ice-melt-scene" data-reveal-asset={question.revealAsset} aria-label={`Janela congelada com ${revealLabel.toLowerCase()} escondido no centro`}><canvas ref={artCanvasRef} className="ice-melt-art-canvas" width="900" height="330" aria-hidden="true" /><canvas ref={iceCanvasRef} className="ice-melt-ice-canvas" width="900" height="330" onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} aria-label={`Esfregue toda a imagem do ${revealLabel.toLowerCase()} para revelar a figura`} />{completed && <span className="ice-melt-complete" aria-label={`${revealLabel} revelado`}><Check size={24} /></span>}</div>
    <div className="ice-melt-footer"><p>{completed ? "Muito bem! Você revelou o sorvete inteiro." : rubbing ? "Continue esfregando todas as partes do sorvete." : "O sorvete está no centro. Esfregue a imagem inteira para revelar tudo."}</p><div className="ice-melt-progress" aria-label={`${revealed}% da imagem do sorvete revelada`}><i style={{ width: `${revealed}%` }} /></div></div>
  </div>;
}
function SandTracksInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [walking, setWalking] = useState(false);
  const [tracks, setTracks] = useState<{ x: number; y: number; angle: number }[]>([]);
  const [completed, setCompleted] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const target = question.sandTarget ?? 5;
  const route = useMemo(() => Array.from({ length: target }, (_, index) => { const progress = target === 1 ? 1 : index / (target - 1); return { x: 155 + progress * 605, y: 235 + Math.sin(progress * Math.PI * 2.2) * 34 - progress * 8 }; }), [target, question.id]);
  const checkpointIndex = tracks.length;
  useEffect(() => { setWalking(false); setTracks([]); setCompleted(false); lastPoint.current = null; const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save(); ctx.setLineDash([7, 13]); ctx.lineWidth = 6; ctx.strokeStyle = "rgba(121, 82, 54, .3)"; ctx.lineCap = "round"; ctx.beginPath(); route.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)); ctx.stroke(); ctx.restore(); }, [question.id, route]);
  useEffect(() => { if (!completed) return; const timer = window.setTimeout(onComplete, 520); return () => window.clearTimeout(timer); }, [completed, onComplete]);
  const position = (event: PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height }; };
  const markCheckpoint = (point: { x: number; y: number }) => { const previous = lastPoint.current; const angle = previous ? Math.atan2(point.y - previous.y, point.x - previous.x) * (180 / Math.PI) : -8; setTracks((current) => { const next = [...current, { x: point.x, y: point.y, angle }]; if (next.length >= route.length) setCompleted(true); return next; }); lastPoint.current = point; };
  const begin = (event: PointerEvent<HTMLCanvasElement>) => { if (disabled || completed) return; const point = position(event); if (Math.hypot(point.x - route[0].x, point.y - route[0].y) > 105) return; const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return; ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineCap = "round"; ctx.lineWidth = 16; ctx.strokeStyle = "rgba(112, 74, 43, .48)"; setWalking(true); markCheckpoint(route[0]); canvas.setPointerCapture(event.pointerId); };
  const move = (event: PointerEvent<HTMLCanvasElement>) => { if (!walking || disabled || completed) return; const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return; const point = position(event); ctx.lineTo(point.x, point.y); ctx.stroke(); const nextPoint = route[checkpointIndex]; if (nextPoint && Math.hypot(point.x - nextPoint.x, point.y - nextPoint.y) <= 105) markCheckpoint(nextPoint); };
  const stop = () => { setWalking(false); lastPoint.current = null; };
  return <div className={`sand-tracks-activity ${completed ? "completed" : ""}`}>
    <div className="sand-toolbar"><div><span className="sand-kicker"><i className="sand-kicker-mark" /> PRAIA DAS MARCAS</span><strong>Faça pegadas até o coqueiro</strong></div><div className="sand-counter"><b>{tracks.length}</b><span>/ {target} marcas</span></div></div>
    <div className="sand-scene" aria-label="Praia interativa para criar pegadas"><div className="sand-sky"><span className="sand-sun" aria-hidden="true"><i /></span><span className="sand-sun-rays" /><span className="sand-cloud sand-cloud-one" /><span className="sand-cloud sand-cloud-two" /></div><div className="sand-beach"><span className="sand-wave-line" aria-hidden="true"><i /><i /><i /></span><span className="sand-dune dune-one" /><span className="sand-dune dune-two" /><span className="sand-palm-shadow" /><img className="sand-palm" src={SCENE_ASSETS[question.sceneAsset ?? "pegadas-coqueiro"] ?? palmTreeAsset} alt="Coqueiro tropical na praia" /><span className="sand-shell shell-one" /><span className="sand-shell shell-two" />{tracks.map((track, index) => <span className="sand-footprint" style={{ left: `${(track.x / 900) * 100}%`, top: `${(track.y / 330) * 100}%`, transform: `translate(-50%, -50%) rotate(${track.angle}deg)` }} key={`${track.x}-${track.y}-${index}`}><i /><i /></span>)}{completed && <span className="sand-goal-mark" aria-label="Trilha chegou ao coqueiro" />}<canvas ref={canvasRef} width="900" height="330" onPointerDown={begin} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} aria-label="Arraste para criar pegadas até o coqueiro" /></div></div>
    <div className="sand-footer"><p>{completed ? "Muito bem! Você seguiu a trilha até a sombra do coqueiro." : "Comece na primeira marca e siga os pontos da trilha até a sombra do coqueiro."}</p><div className="sand-progress" aria-label={`${tracks.length} de ${target} pontos da trilha`}><i style={{ width: `${Math.min(100, (tracks.length / target) * 100)}%` }} /></div></div>
  </div>;
}
function LanternInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<number[]>([]);
  const [lightPoint, setLightPoint] = useState<{ x: number; y: number } | null>(null);
  const target = question.lanternTarget ?? 2;
  const objectPositions = useMemo(() => (question.activityIndex ?? 0) % 2 === 0 ? [[18, 26], [78, 32], [42, 70], [87, 76]] : [[76, 22], [24, 39], [67, 61], [18, 78]], [question.id, question.activityIndex]);
  useEffect(() => { setFound([]); setSearching(false); setLightPoint(null); const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (canvas && ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "rgba(10, 20, 42, .92)"; ctx.fillRect(0, 0, canvas.width, canvas.height); } }, [question.id]);
  useEffect(() => { if (found.length < target) return; const timer = window.setTimeout(onComplete, 500); return () => window.clearTimeout(timer); }, [found.length, target, onComplete]);
  const drawMask = (point: { x: number; y: number } | null) => { const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "rgba(10, 20, 42, .92)"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.globalCompositeOperation = "destination-out"; ctx.shadowBlur = 18; ctx.shadowColor = "rgba(255, 224, 124, .8)"; found.forEach((index) => { const [x, y] = objectPositions[index]; ctx.beginPath(); ctx.arc((x / 100) * canvas.width, (y / 100) * canvas.height, 72, 0, Math.PI * 2); ctx.fill(); }); if (point) { ctx.beginPath(); ctx.arc(point.x, point.y, 82, 0, Math.PI * 2); ctx.fill(); } ctx.shadowBlur = 0; ctx.globalCompositeOperation = "source-over"; };
  const position = (event: PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height }; };
  const inspect = (point: { x: number; y: number }) => { const next = [...found]; objectPositions.forEach(([x, y], index) => { if (!next.includes(index) && Math.hypot(point.x - (x / 100) * 900, point.y - (y / 100) * 330) < 86) next.push(index); }); if (next.length !== found.length) setFound(next); };
  const move = (event: PointerEvent<HTMLCanvasElement>) => { if (disabled) return; const point = position(event); setLightPoint(point); drawMask(point); inspect(point); };
  const start = (event: PointerEvent<HTMLCanvasElement>) => { if (disabled) return; setSearching(true); event.currentTarget.setPointerCapture(event.pointerId); move(event); };
  const stop = () => { setSearching(false); setLightPoint(null); drawMask(null); };
  return <div className={`lantern-activity ${found.length >= target ? "completed" : ""}`}>
    <div className="lantern-toolbar"><div><span className="lantern-kicker"><Flashlight size={15} /> MISSÃO NOTURNA</span><strong>Acenda e descubra</strong></div><div className="lantern-counter"><b>{found.length}</b><span>/ {target} descobertas</span></div></div>
    <div className="lantern-scene" aria-label="Cena escura para explorar com uma lanterna"><div className="lantern-backdrop"><span className="lantern-moon" /><span className="lantern-star star-a" /><span className="lantern-star star-b" /><span className="lantern-hill hill-a" /><span className="lantern-hill hill-b" />{objectPositions.map(([x, y], index) => <span className={`lantern-object lantern-object-${index}`} style={{ left: `${x}%`, top: `${y}%`, opacity: found.includes(index) ? 1 : .16 }} key={`${x}-${y}`}><Star size={34} fill="currentColor" /></span>)}</div><canvas ref={canvasRef} width="900" height="330" onPointerDown={start} onPointerMove={searching ? move : undefined} onPointerUp={stop} onPointerCancel={stop} aria-label="Arraste a lanterna para procurar" />{lightPoint && <span className="lantern-glow" style={{ left: `${(lightPoint.x / 900) * 100}%`, top: `${(lightPoint.y / 330) * 100}%` }} />}</div>
    <div className="lantern-footer"><p>{found.length >= target ? "Você encontrou tudo. A noite ficou cheia de descobertas." : "Arraste a lanterna pela cena. Quando algo aparecer, você encontrou uma surpresa."}</p><div className="lantern-progress" aria-label={`${found.length} de ${target} descobertas`}><i style={{ width: `${(found.length / target) * 100}%` }} /></div></div>
  </div>;
}
function SeedRainInteraction({ question, disabled, onComplete }: { question: GameQuestion; disabled: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [coverage, setCoverage] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [plantCount, setPlantCount] = useState(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const coveredPoints = useRef<boolean[]>([]);
  const target = question.seedTarget ?? 5;
  const guidePoints = useMemo(() => {
    const paths = [
      [[90, 265], [170, 235], [250, 250], [330, 215], [410, 230], [490, 190], [570, 205], [650, 170], [740, 185], [820, 145]],
      [[115, 290], [185, 275], [255, 290], [325, 265], [395, 280], [465, 250], [535, 265], [605, 235], [675, 250], [745, 220]],
      [[180, 175], [240, 145], [300, 160], [360, 130], [420, 145], [480, 115], [540, 130], [600, 100], [660, 115], [720, 90]],
    ];
    return paths.flatMap((path) => path.flatMap(([x, y], index) => index === path.length - 1 ? [[x, y]] : Array.from({ length: 3 }, (_, step) => [x + ((path[index + 1][0] - x) * step) / 3, y + ((path[index + 1][1] - y) * step) / 3])));
  }, [question.id]);
  const guidePaths = useMemo(() => ["M90 265 C170 225 250 270 330 215 S490 225 570 205 S740 145 820 145", "M115 290 C185 265 255 305 325 265 S465 280 535 265 S675 220 745 220", "M180 175 C240 135 300 180 360 130 S480 150 540 130 S660 85 720 90"], []);
  const plantPositions = [{ left: "2%", bottom: "3%" }, { left: "24%", bottom: "48%" }, { left: "47%", bottom: "2%" }, { left: "69%", bottom: "50%" }, { left: "87%", bottom: "4%" }];
  useEffect(() => { coveredPoints.current = guidePoints.map(() => false); setCoverage(0); setPlantCount(0); setCompleted(false); setDrawing(false); lastPoint.current = null; const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); }, [question.id, guidePoints]);
  useEffect(() => { if (!completed) return; const timer = window.setTimeout(onComplete, 420); return () => window.clearTimeout(timer); }, [completed, onComplete]);
  const position = (event: PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height }; };
  const markCovered = (point: { x: number; y: number }) => { const radius = 30; const next = [...coveredPoints.current]; let changed = false; guidePoints.forEach(([x, y], index) => { if (!next[index] && Math.hypot(point.x - x, point.y - y) <= radius) { next[index] = true; changed = true; } }); if (!changed) return; coveredPoints.current = next; const percent = Math.round((next.filter(Boolean).length / next.length) * 100); setCoverage(percent); setPlantCount(Math.min(5, Math.floor(percent / 14))); if (percent >= 70) setCompleted(true); };
  const begin = (event: PointerEvent<HTMLCanvasElement>) => { if (disabled || completed) return; const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return; const point = position(event); ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 18; ctx.strokeStyle = "rgba(255, 207, 116, .92)"; lastPoint.current = point; setDrawing(true); markCovered(point); canvas.setPointerCapture(event.pointerId); };
  const paint = (event: PointerEvent<HTMLCanvasElement>) => { if (!drawing || disabled || completed) return; const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return; const point = position(event); ctx.lineTo(point.x, point.y); ctx.stroke(); markCovered(point); lastPoint.current = point; };
  const stop = () => { setDrawing(false); lastPoint.current = null; };
  return <div className={`seed-rain-activity ${completed ? "completed" : ""}`}>
    <div className="seed-rain-toolbar"><div><span className="seed-rain-kicker"><Droplets size={15} /> CANTEIRO VIVO</span><strong>Faça a terra florescer</strong></div><div className="seed-rain-counter"><b>{coverage}%</b><span>da trilha preenchida</span></div></div>
    <div className="seed-rain-scene" aria-label="Canteiro interativo para plantar sementes">
      <div className="seed-rain-sky"><span className="seed-rain-cloud cloud-one" /><span className="seed-rain-cloud cloud-two" /><span className="seed-rain-sun" /></div>
      <div className="seed-rain-soil"><svg className="seed-rain-guides" viewBox="0 0 900 330" aria-hidden="true">{guidePaths.map((path) => <path d={path} key={path} />)}</svg>{Array.from({ length: plantCount }).map((_, index) => <span className={`seed-rain-plant plant-${index + 1}`} style={plantPositions[index]} key={index}>{index % 3 === 0 ? <Sprout size={40 + index * 4} /> : index % 3 === 1 ? <Leaf size={38 + index * 5} /> : <Wheat size={42 + index * 4} />}</span>)}{completed && <span className="seed-rain-flower" style={{ left: "4%", bottom: "42%", right: "auto" }}><Flower2 size={62} /></span>}<canvas ref={canvasRef} width="900" height="330" onPointerDown={begin} onPointerMove={paint} onPointerUp={stop} onPointerCancel={stop} aria-label="Arraste o dedo sobre as linhas pontilhadas" /></div>
      <div className="seed-rain-instruction">Preencha as linhas pontilhadas</div>
    </div>
    <div className="seed-rain-footer"><p>{completed ? "Muito bem. Você preencheu a trilha e fez o canteiro florescer." : `Cubra as linhas pontilhadas. As plantas crescem aos poucos e a flor nasce aos 70%.`}</p><div className="seed-rain-progress" aria-label={`${coverage}% da trilha preenchida`}><i style={{ width: `${coverage}%` }} /></div></div>
  </div>;
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
  return <main className="pets-page"><Header state={state} controller={controller} back /><section className="pet-layout"><div className="pet-room paper-panel"><p className="eyebrow"><PawPrint size={16} /> Casa dos pets</p><h1>O cantinho de<br /><em>{profile.petName}.</em></h1><div className={`pet-stage ${profile.petStage === "evoluido" ? "pet-evolved" : ""}`}><div className="pet-bubble">Nível {profile.petLevel}{profile.petStage === "evoluido" ? " · EVOLUÍDO" : ""}</div><div className="egg-pet">{profile.petStage === "evoluido" ? "🦊✨" : "🐣"}</div><div className="pet-nameplate">{profile.petName} <small>{profile.petSpecies} · {profile.petStage === "evoluido" ? "forma evoluída" : "pet de aventura"}</small></div></div><div className="care-meter"><span>Energia para o próximo nível</span><div><i style={{ width: `${profile.petCare}%` }} /></div><b>{profile.petCare}%</b></div><div className="pet-actions"><button onClick={() => controller.careForPet("food")}><span>🍎</span> Alimentar <small>5 moedas</small></button><button onClick={() => controller.careForPet("care")}><span>♥</span> Cuidar <small>2 moedas</small></button><button onClick={() => controller.careForPet("play")}><span>★</span> Brincar <small>3 moedas</small></button></div><p className="pet-evolution-note">O pet evolui somente ao alcançar o nível 10. Cada cuidado custa moedas e ajuda a encher a energia.</p></div><aside className="pet-side"><section className="egg-inventory paper-panel"><TreasureArt className="inventory-treasure" /><h2>Ovos da aventura</h2><p><strong>{profile.eggs}</strong> ovo{profile.eggs === 1 ? "" : "s"} ainda não chocado{profile.eggs === 1 ? "" : "s"}</p><small>Complete missões para aquecer os ovos. Quando a barra chegar ao fim, escolha o nome do novo pet.</small>{eggs.map((egg, index) => <div className={`egg-card egg-${egg.rarity}`} key={egg.id}><span>{egg.hatched ? "🐣" : "🥚"}</span><div><strong>Ovo {rarityLabel[egg.rarity]}</strong><small>{egg.hatched ? "Já nasceu" : `${egg.progress}/${egg.required} missões`}</small></div>{!egg.hatched && egg.progress >= egg.required && <div className="hatch-form"><input value={eggName} onChange={(event) => setEggName(event.target.value)} placeholder="Nome do pet" maxLength={120} /><button onClick={() => { if (controller.hatchEgg(index, eggName)) setEggName(""); }}>Chocar</button></div>}</div>)}</section><button className="back-map-button" onClick={() => controller.goToMap()}><ArrowLeft size={19} /> Voltar ao mapa</button></aside></section></main>;
}

function Developer({ state, controller }: Props) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [worldId, setWorldId] = useState(0);
  const [phase, setPhase] = useState(0);
  const [variant, setVariant] = useState(0);
  const [testResult, setTestResult] = useState("");
  const questions = useMemo(() => getQuestionBank(worldId, phase), [worldId, phase]);
  const question = questions[variant];
  const activity = question ? getActivityDefinition(worldId, question.activity) : undefined;
  useEffect(() => { setVariant(0); setTestResult(""); }, [worldId, phase]);
  if (!state.developerAuthorized) return <main className="developer-login-page"><section className="developer-login-card"><aside className="developer-login-hero"><div className="developer-orbit developer-orbit-one" /><div className="developer-orbit developer-orbit-two" /><span className="developer-login-badge"><Bug size={15} /> ÁREA INTERNA</span><div className="developer-terminal-mark"><span>&gt;_</span></div><h1>Laboratório<br /><em>de aventura.</em></h1><p>Um espaço direto para validar o jogo, experimentar atividades e encontrar qualquer ponto da trilha.</p><div className="developer-login-checklist"><span><Check size={15} /> Todos os mundos</span><span><Check size={15} /> Todas as fases</span><span><Check size={15} /> Painel do professor</span></div></aside><section className="developer-login-form"><div className="developer-form-brand"><BrandMark /><div><strong>Aventura</strong><span>das Letras</span></div></div><p className="eyebrow"><Lock size={15} /> Entrada protegida</p><h2>Olá, desenvolvedor(a)</h2><p className="developer-form-intro">Informe a chave compartilhada para abrir o laboratório de testes.</p><label className="developer-key-label" htmlFor="developer-access-key">Chave de acesso</label><div className="developer-key-input password-input-wrap"><input id="developer-access-key" type={showKey ? "text" : "password"} value={key} onChange={(event) => { setKey(event.target.value); setError(""); }} placeholder="ADL-DEV-••••-••••" autoComplete="off" spellCheck={false} onKeyDown={(event) => { if (event.key === "Enter") void controller.authorizeDeveloper(key); }} /><button type="button" className="password-eye" onClick={() => setShowKey((visible) => !visible)} aria-label={showKey ? "Ocultar chave" : "Mostrar chave"}>{showKey ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><button className="primary-action developer-submit" onClick={async () => { if (!(await controller.authorizeDeveloper(key))) setError("Chave de desenvolvedor não reconhecida."); }}><span>Entrar no laboratório</span><ChevronRight size={21} /></button>{error && <small className="login-error developer-login-error">{error}</small>}<div className="developer-security-note"><Lock size={15} /><span>A sessão é temporária e não é gravada no save de nenhum aluno.</span></div><button className="developer-back-link" onClick={() => controller.exitDeveloper()}><ArrowLeft size={15} /> Voltar à tela inicial</button></section></section></main>;
  const markTested = () => setTestResult("Interação concluída. O modo de teste não altera o progresso de alunos.");
  return <main className="developer-page"><header className="developer-header"><div><p className="eyebrow"><Bug size={15} /> Laboratório interno</p><h1>Testes de atividades</h1><p>Selecione qualquer mundo, fase e descoberta para abrir o comportamento real da atividade.</p></div><div className="developer-header-actions"><button className="soft-action" onClick={() => controller.openTeacher()}><BookOpen size={17} /> Painel do professor</button><button className="logout-button" onClick={() => controller.exitDeveloper()}><LogOut size={17} /> Sair</button></div></header><section className="developer-layout"><aside className="developer-selector paper-panel"><label>Mundo<select value={worldId} onChange={(event) => setWorldId(Number(event.target.value))}>{WORLDS.map((world) => <option value={world.id} key={world.id}>{world.id + 1}. {world.name}</option>)}</select></label><label>Fase<select value={phase} onChange={(event) => setPhase(Number(event.target.value))}>{Array.from({ length: 8 }, (_, index) => <option value={index} key={index}>{index === 7 ? "Desafio final" : `Fase ${index + 1}`}</option>)}</select></label><label>Atividade / descoberta<select value={variant} onChange={(event) => { setVariant(Number(event.target.value)); setTestResult(""); }}>{questions.map((item, index) => <option value={index} key={item.id}>{index + 1}. {getActivityDefinition(worldId, item.activity)?.title ?? item.kind}</option>)}</select></label><div className="developer-note"><strong>Permissão ativa</strong><span>Todos os mundos e fases estão liberados somente neste laboratório.</span></div></aside><section className="developer-preview paper-panel">{question && <><div className="developer-preview-head"><div><p className="eyebrow">Prévia real · {question.kind}</p><h2>{activity?.title ?? "Atividade"}</h2></div><span>{worldId + 1}.{phase + 1}.{variant + 1}</span></div><h3>{question.prompt}</h3><FigureIllustration question={question} /><QuestionInteraction question={question} disabled={Boolean(testResult)} onAnswer={markTested} />{testResult && <div className="developer-result"><Check size={20} /> {testResult}</div>}</>}</section></section></main>;
}

function Teacher({ state, controller }: Props) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
  const [databaseSyncing, setDatabaseSyncing] = useState(false);
  const [databaseSyncMessage, setDatabaseSyncMessage] = useState("");
  const [studentPage, setStudentPage] = useState(0);
  useEffect(() => {
    if (!state.teacherAuthorized) return;
    const refresh = () => fetch("/api/teacher/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: state.teacherPassword }) }).then((response) => response.ok ? response.json() : []).then((students: RemoteStudent[]) => { const ordered = [...students].sort((a, b) => normalizeStudentName(a.profile.name).localeCompare(normalizeStudentName(b.profile.name), "pt-BR")); setRemoteStudents(ordered); setSelectedStudentId((current) => current || ordered[0]?.id || ""); }).catch(() => undefined);
    refresh();
    const timer = window.setInterval(refresh, 4000);
    return () => window.clearInterval(timer);
  }, [state.teacherAuthorized]);
  const sortedStudents = useMemo(() => [...remoteStudents].sort((a, b) => normalizeStudentName(a.profile.name).localeCompare(normalizeStudentName(b.profile.name), "pt-BR")), [remoteStudents]);
  const studentPageCount = Math.max(1, Math.ceil(sortedStudents.length / 10));
  const safeStudentPage = Math.min(studentPage, studentPageCount - 1);
  const visibleStudents = sortedStudents.slice(safeStudentPage * 10, safeStudentPage * 10 + 10);
  if (!state.teacherAuthorized) return <main className="single-game-page"><section className="teacher-lock paper-panel"><Lock size={38} /><p className="eyebrow">Acesso orientador</p><h1>Área do professor</h1><p>Entre para acompanhar a trilha, as respostas e os desenhos de cada aluno neste dispositivo.</p><div className="password-input-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" autoComplete="current-password" /><button type="button" className="password-eye" onClick={() => setShowPassword((visible) => !visible)} aria-pressed={showPassword} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div><button className="primary-action" onClick={async () => { if (!(await controller.authorizeTeacher(password))) setError("Senha não reconhecida."); }}>Entrar <ChevronRight size={21} /></button>{error && <small className="login-error">{error}</small>}<button className="teacher-entry" onClick={() => controller.returnToMenu()}>Voltar ao menu</button></section></main>;
  const selected = remoteStudents.find((student) => student.id === selectedStudentId);
  const deleteSelectedStudent = async () => {
    if (!selected) return;
    if (!window.confirm(`Excluir definitivamente o perfil de ${selected.profile.name}? Esta ação não pode ser desfeita.`)) return;
    const confirmation = window.prompt(`Para confirmar, digite exatamente o nome do aluno: ${selected.profile.name}`);
    if (normalizeStudentName(confirmation ?? "") !== normalizeStudentName(selected.profile.name)) { window.alert("Exclusão cancelada: o nome não confere."); return; }
    const response = await fetch(`/api/students/${encodeURIComponent(selected.id)}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmName: confirmation, password: state.teacherPassword }) });
    if (!response.ok) {
      const result = await response.json().catch(() => ({})) as { error?: string };
      window.alert(result.error ?? "Não foi possível excluir o perfil. Tente novamente.");
      return;
    }
    setRemoteStudents((items) => items.filter((item) => item.id !== selected.id));
    setSelectedStudentId("");
  };
  const resetSelectedStudent = async () => {
    if (!selected) return;
    const confirmation = window.prompt(`Digite RESETAR para apagar o progresso de ${selected.profile.name} e exigir o teste inicial novamente.`);
    if (confirmation !== "RESETAR") return;
    const response = await fetch(`/api/teacher/students/${encodeURIComponent(selected.id)}/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: state.teacherPassword }) });
    const result = await response.json().catch(() => ({})) as { student?: RemoteStudent; error?: string };
    if (!response.ok || !result.student) return window.alert(result.error ?? "Não foi possível resetar o aluno.");
    setRemoteStudents((items) => items.map((item) => item.id === selected.id ? result.student! : item));
    window.alert("Aluno resetado. O teste inicial será obrigatório na próxima entrada.");
  };
  const editSelectedStudent = async () => {
    if (!selected) return;
    const name = window.prompt("Novo nome do aluno:", selected.profile.name)?.trim();
    if (!name || name === selected.profile.name) return;
    const response = await fetch(`/api/teacher/students/${encodeURIComponent(selected.id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, password: state.teacherPassword }) });
    const result = await response.json().catch(() => ({})) as { student?: RemoteStudent; error?: string };
    if (!response.ok || !result.student) return window.alert(result.error ?? "Não foi possível editar o aluno.");
    setRemoteStudents((items) => items.map((item) => item.id === selected.id ? result.student! : item));
  };
  const clearDatabase = async () => {
    const first = window.confirm("ATENÇÃO: isto excluirá TODOS os alunos, status e saves. Deseja continuar?");
    if (!first) return;
    const teacherPassword = window.prompt("Digite a senha do professor:");
    if (teacherPassword === null) return;
    const serverIp = window.prompt("Digite o IP do computador que está executando o servidor:");
    if (serverIp === null) return;
    const finalPassword = window.prompt("Digite a senha final para confirmar a exclusão:");
    if (finalPassword === null) return;
    const response = await fetch("/api/teacher/database/clear", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: teacherPassword, serverIp, finalPassword }) });
    const result = await response.json().catch(() => ({})) as { message?: string; error?: string };
    if (!response.ok) return window.alert(result.error ?? "Não foi possível limpar o banco.");
    setRemoteStudents([]); setSelectedStudentId(""); window.alert(result.message ?? "Banco limpo.");
  };
  const openTab = (next: TeacherTab) => setTab(next);
  const updateSelected = async (student: RemoteStudent) => { const response = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...student, password: state.teacherPassword, teacherOverride: true }) }); if (response.ok) setRemoteStudents((items) => items.map((item) => item.id === student.id ? student : item)); };
  const registerStudent = async () => { setRegisteringStudent(true); setStudentMessage(""); const error = await controller.registerStudent(newStudentName); if (error) setStudentMessage(error); else { setStudentMessage("Aluno cadastrado. Na primeira entrada, ele fará o teste inicial antes de acessar o jogo."); setNewStudentName(""); } setRegisteringStudent(false); };
  const syncDatabase = async () => { setDatabaseSyncing(true); setDatabaseSyncMessage(""); try { const response = await fetch("/api/teacher/database/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: state.teacherPassword }) }); const result = await response.json().catch(() => ({})) as { message?: string; error?: string }; setDatabaseSyncMessage(result.message ?? result.error ?? "Não foi possível salvar o banco agora."); } catch { setDatabaseSyncMessage("O banco continua salvo neste computador, mas a sincronização não está disponível agora."); } finally { setDatabaseSyncing(false); } };
  const registrationPanel = <section className="teacher-profile-card paper-panel"><div><p className="eyebrow"><PawPrint size={15} /> Cadastro de aluno</p><h2>Adicionar aluno à turma</h2><p>Cadastre o nome uma vez. Na primeira entrada, o aluno fará o teste inicial; depois poderá continuar a aventura pelo menu usando esse mesmo nome.</p></div><div className="teacher-profile-edit"><input value={newStudentName} onChange={(event) => setNewStudentName(event.target.value)} placeholder="Nome do aluno" maxLength={120} onKeyDown={(event) => { if (event.key === "Enter") void registerStudent(); }} /><button className="primary-action compact" disabled={registeringStudent} onClick={() => void registerStudent()}>Cadastrar <Check size={17} /></button></div>{studentMessage && <small className={studentMessage.startsWith("Aluno cadastrado") ? "password-success" : "login-error"}>{studentMessage}</small>}</section>;
  const totalAnswers = remoteStudents.reduce((sum, student) => sum + student.answers.length, 0);
  const totalCorrect = remoteStudents.reduce((sum, student) => sum + (student.answers as GameState["answers"]).filter((answer) => answer.correct).length, 0);
  const averageAccuracy = totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
  const overviewPanel = <><section className="teacher-stat-grid"><article><span>Alunos cadastrados</span><strong>{remoteStudents.length}</strong><i /></article><article><span>Média de acertos</span><strong>{averageAccuracy}%</strong><i className="green" /></article><article><span>Respostas registradas</span><strong>{totalAnswers}</strong><i className="orange" /></article></section><section className="level-summary-grid paper-panel"><div className="table-head"><div><p className="eyebrow"><BookOpen size={15} /> Distribuição da turma</p><h2>Alunos por nível</h2></div></div><div className="level-summary-list">{WORLDS.map((world) => { const students = remoteStudents.filter((student) => student.profile.currentWorld === world.id); return <article key={world.id}><div className="level-summary-heading"><span style={{ background: world.color }}>{world.icon}</span><div><strong>{world.shortName}</strong><small>{students.length} aluno{students.length === 1 ? "" : "s"}</small></div></div><p>{students.length ? students.map((student) => student.profile.name).join(", ") : "Nenhum aluno neste nível"}</p></article>; })}</div></section></>;
  const profilePanel = <><section className="teacher-profile-card paper-panel"><div className="teacher-profile-heading"><div className="teacher-avatar"><Lock size={22} /></div><div><p className="eyebrow">Perfil do professor</p><h2>{state.teacherName}</h2><small>Área protegida deste dispositivo</small></div></div><div className="teacher-profile-edit"><input value={teacherName} onChange={(event) => setTeacherName(event.target.value)} placeholder="Nome do professor" maxLength={120} /><button className="soft-action" onClick={() => controller.updateTeacherProfile(teacherName)}>Salvar perfil <Check size={16} /></button></div><button className="logout-button teacher-exit-button" onClick={() => setShowLogoutConfirm(true)}><LogOut size={18} /> Logout</button></section><section className="teacher-password-card paper-panel"><div><p className="eyebrow"><Save size={15} /> Banco da turma</p><h2>Salvar banco agora</h2><p>O jogo salva automaticamente no computador. Este botão cria um commit e envia o arquivo atualizado ao GitHub imediatamente. Também existe uma tentativa automática a cada 15 minutos.</p></div><button className="primary-action compact" disabled={databaseSyncing} onClick={() => void syncDatabase()}>{databaseSyncing ? "Salvando..." : "Salvar banco no GitHub"} <Save size={18} /></button>{databaseSyncMessage && <small className={databaseSyncMessage.includes("não foi") || databaseSyncMessage.includes("não está") ? "login-error" : "password-success"}>{databaseSyncMessage}</small>}</section><section className="teacher-password-card paper-panel"><div><p className="eyebrow"><X size={15} /> Zona de segurança</p><h2>Limpar banco de dados</h2><p>Exclui todos os alunos, status e saves. A ação exige, nesta ordem, a senha do professor, o IP do servidor e a senha final.</p></div><button className="danger-action" onClick={() => void clearDatabase()}>Excluir todos os dados</button></section><section className="teacher-password-card paper-panel"><div><p className="eyebrow"><Lock size={15} /> Segurança</p><h2>Alterar senha de acesso</h2><p>Altere a senha usada sempre que o professor entrar nesta área.</p></div><div className="teacher-password-fields"><PasswordField value={currentPassword} setValue={setCurrentPassword} visible={showCurrentPassword} setVisible={setShowCurrentPassword} placeholder="Senha atual" /><PasswordField value={newPassword} setValue={setNewPassword} visible={showNewPassword} setVisible={setShowNewPassword} placeholder="Nova senha (mínimo 6 caracteres)" /><PasswordField value={confirmPassword} setValue={setConfirmPassword} visible={showConfirmPassword} setVisible={setShowConfirmPassword} placeholder="Confirmar nova senha" /></div><button className="primary-action compact" onClick={async () => { const message = await controller.changeTeacherPassword(currentPassword, newPassword, confirmPassword); setPasswordMessage(message ?? "Senha alterada com sucesso."); if (!message) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); } }}>Salvar nova senha <Check size={18} /></button>{passwordMessage && <small className={passwordMessage.includes("sucesso") ? "password-success" : "login-error"}>{passwordMessage}</small>}</section></>;
  return <><main className="teacher-page"><Header state={state} controller={controller} back /><section className="teacher-layout"><aside className="teacher-sidebar"><p className="eyebrow">Painel do professor</p><h2>Acompanhamento<br />da turma</h2><button className={tab === "overview" ? "active" : ""} onClick={() => openTab("overview")}><BookOpen size={18} /> Visão geral</button><button className={tab === "profiles" ? "active" : ""} onClick={() => openTab("profiles")}><PawPrint size={18} /> Perfis de alunos</button><button className={tab === "answers" ? "active" : ""} onClick={() => openTab("answers")}><CircleHelp size={18} /> Respostas</button><button className={tab === "teacher-profile" ? "active" : ""} onClick={() => openTab("teacher-profile")}><Lock size={18} /> Meu perfil</button><button className="back-sidebar" onClick={() => controller.exitTeacher()}><ArrowLeft size={18} /> Sair da área</button></aside><section className="teacher-content">{(tab === "profiles" || tab === "answers") && <div className="teacher-welcome"><div><p className="eyebrow">Aluno selecionado</p><h1>{selected?.profile.name || "Nenhum aluno selecionado"}</h1><p>Selecione um aluno para ver todas as atividades, respostas e desempenho.</p></div><div className="student-badge"><Mascot label="Parceira Lumi" /><span>{selected ? `Mundo ${selected.profile.currentWorld + 1}` : "Turma"}</span></div></div>}{tab === "teacher-profile" ? profilePanel : tab === "overview" ? overviewPanel : <>{tab === "profiles" && registrationPanel}<section className="local-students-card paper-panel"><div className="table-head"><div><p className="eyebrow"><PawPrint size={15} /> Turma conectada</p><h2>Selecione um aluno</h2></div><div className="report-actions"><span>{remoteStudents.length} aluno(s)</span><button className="soft-action compact" onClick={() => exportStudentsCsv(selected ? [selected] : sortedStudents, selected ? `relatorio-${selected.profile.name}.csv` : "relatorio-turma.csv")}><Download size={15} /> CSV</button><button className="soft-action compact" onClick={() => printStudentsPdf(selected ? [selected] : sortedStudents, selected ? `Relatório de ${selected.profile.name}` : "Relatório de desempenho da turma")}><FileText size={15} /> PDF</button></div></div>{remoteStudents.length ? <div className="local-students-grid">{visibleStudents.map((student) => { const completed = Object.keys(student.completions ?? {}).length; return <button className={`student-select-card ${selected?.id === student.id ? "selected" : ""}`} key={student.id} onClick={() => setSelectedStudentId(student.id)}><div className="student-mini-avatar"><PawPrint size={18} /></div><div><strong>{student.profile.name}</strong><small>Mundo {student.profile.currentWorld + 1} · {completed} fase(s) · {student.answers.length} resposta(s)</small><small>Pet: {student.profile.petName}</small></div></button>; })}</div> : <p className="empty-note">Os alunos aparecerão aqui assim que abrirem a aventura neste endereço.</p>}<nav className="teacher-pagination student-pagination" aria-label="Navegação dos alunos"><span>Página {safeStudentPage + 1} de {studentPageCount} · máximo de 10 alunos</span><button className="soft-action compact" disabled={safeStudentPage === 0} onClick={() => setStudentPage((page) => Math.max(0, page - 1))}><ChevronLeft size={15} /> Anterior</button><button className="soft-action compact" disabled={safeStudentPage >= studentPageCount - 1} onClick={() => setStudentPage((page) => Math.min(studentPageCount - 1, page + 1))}>Próxima <ChevronRight size={15} /></button></nav><small className="sync-note">Atualização automática a cada 4 segundos. Exibindo no máximo 10 alunos por página, em ordem alfabética.</small></section>{selected ? <RemoteTeacherDashboard student={selected} tab={tab} onUpdate={updateSelected} onReset={resetSelectedStudent} onEdit={editSelectedStudent} onDelete={deleteSelectedStudent} /> : <div className="empty-teacher paper-panel">Abra a aventura em outro dispositivo para o aluno aparecer nesta lista.</div>}</>}</section></section></main>{showLogoutConfirm && <LogoutConfirmModal role="professor" onCancel={() => setShowLogoutConfirm(false)} onConfirm={() => controller.exitTeacher()} />}</>;
}

function PasswordField({ value, setValue, visible, setVisible, placeholder }: { value: string; setValue: (value: string) => void; visible: boolean; setVisible: (value: boolean) => void; placeholder: string }) {
  return <div className="password-input-wrap"><input type={visible ? "text" : "password"} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} /><button type="button" className="password-eye" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>;
}

function RemoteTeacherDashboard({ student, tab, onUpdate, onReset, onEdit, onDelete }: { student: RemoteStudent; tab: TeacherTab; onUpdate: (student: RemoteStudent) => Promise<void>; onReset: () => Promise<void>; onEdit: () => Promise<void>; onDelete: () => Promise<void> }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answerPage, setAnswerPage] = useState(0);
  const entries = (student.answers as GameState["answers"]).map((answer, index) => ({ answer, index })).reverse();
  const answerPageCount = Math.max(1, Math.ceil(entries.length / 10));
  const safeAnswerPage = Math.min(answerPage, answerPageCount - 1);
  const visible = entries.slice(safeAnswerPage * 10, safeAnswerPage * 10 + 10);
  const selectedEntry = visible.find((entry) => entry.index === selectedIndex) ?? visible[0];
  const completed = Object.keys(student.completions ?? {}).filter((key) => key.startsWith(`${student.profile.currentWorld}:`)).length;
  const worldAnswers = entries.filter(({ answer }) => answer.worldId === student.profile.currentWorld);
  const accuracy = worldAnswers.length ? Math.round((worldAnswers.filter(({ answer }) => answer.correct).length / worldAnswers.length) * 100) : 0;
  const savedApproval = student.worldApprovals?.[String(student.profile.currentWorld)];
  const approval = savedApproval ?? (completed >= PHASES_PER_WORLD ? { status: "pending" as const, requestedAt: new Date().toISOString() } : undefined);
  const canAdvance = completed >= PHASES_PER_WORLD && student.profile.currentWorld < WORLDS.length - 1;
  const approveStudent = () => onUpdate({ ...student, worldApprovals: { ...student.worldApprovals, [String(student.profile.currentWorld)]: { status: "approved", requestedAt: approval?.requestedAt ?? new Date().toISOString(), approvedAt: new Date().toISOString(), approvedBy: "Professor(a)" }, }, profile: { ...student.profile, currentWorld: student.profile.currentWorld + 1, recommendedWorld: student.profile.currentWorld + 1 } });
  if (tab === "profiles" || tab === "overview") return <><section className="student-profile-card paper-panel">{approval?.status === "pending" && <div className="approval-request"><span className="approval-dot" /><div><strong>Pedido de aprovação recebido</strong><small>{student.profile.name} concluiu o mundo e aguarda sua avaliação.</small></div></div>}<p className="eyebrow">Perfil completo do aluno</p><h2>{student.profile.name}</h2><p>Mundo atual: <strong>{student.profile.currentWorld + 1}</strong> · {student.profile.xp} XP · Pet: <strong>{student.profile.petName}</strong></p><div className="remote-performance-grid"><span><b>{completed}/{PHASES_PER_WORLD}</b> fases no mundo</span><span><b>{accuracy}%</b> desempenho</span><span><b>{student.answers.length}</b> respostas</span></div><div className="profile-actions"><button className="soft-action" onClick={() => void onEdit()}>Editar nome</button><button className="danger-action" onClick={() => void onReset()}>Resetar progresso</button><button className="danger-action" onClick={() => void onDelete()}>Excluir perfil</button></div>{approval?.status === "pending" && canAdvance ? <button className="release-button" onClick={approveStudent}>Aprovar e liberar próximo mundo <ChevronRight size={19} /></button> : approval?.status === "approved" ? <small className="approval-confirmed">Aprovado; o aluno já pode abrir o próximo mundo.</small> : <small className="sync-note">O pedido aparecerá aqui após concluir todas as fases. A liberação depende da sua avaliação e de pelo menos 70% de acerto.</small>}</section><section className="teacher-table paper-panel"><div className="table-head"><div><p className="eyebrow">Desempenho detalhado</p><h2>Atividades concluídas</h2></div><span>{completed} de {PHASES_PER_WORLD}</span></div><div className="world-teacher-grid">{WORLDS.map((world) => { const done = Object.keys(student.completions ?? {}).filter((key) => key.startsWith(`${world.id}:`)).length; return <div className="remote-world-row" key={world.id}><strong>{world.icon} {world.shortName}</strong><small>{done}/{PHASES_PER_WORLD} fases</small><i style={{ width: `${Math.min(100, done / PHASES_PER_WORLD * 100)}%` }} /></div>; })}</div></section></>;
  return <div className="analysis-workspace"><Pagination current={safeAnswerPage} total={answerPageCount} count={entries.length} label="respostas" onChange={setAnswerPage} /><ResponseExplorer entries={visible} selectedIndex={selectedEntry?.index ?? null} onSelectAnswer={setSelectedIndex} tab={tab} />{selectedEntry && <AnswerInspector answer={selectedEntry.answer} />}</div>;
}
function TeacherDashboard({ state, controller, tab, onTabChange, selectedAnswer, onSelectAnswer }: Props & { tab: TeacherTab; onTabChange: (tab: TeacherTab) => void; selectedAnswer: number | null; onSelectAnswer: (index: number | null) => void }) {
  const profile = state.profile!;
  const accuracy = controller.worldAccuracy(profile.currentWorld);
  const world = WORLDS[profile.currentWorld];
  const entries = state.answers.map((answer, index) => ({ answer, index })).reverse();
  const [answerPage, setAnswerPage] = useState(0);
  const answerPageCount = Math.max(1, Math.ceil(entries.length / 10));
  const safeAnswerPage = Math.min(answerPage, answerPageCount - 1);
  const visible = entries.slice(safeAnswerPage * 10, safeAnswerPage * 10 + 10);
  const selected = visible.find((entry) => entry.index === selectedAnswer) ?? visible[0];
  const audioCard = <section className="audio-control paper-panel"><p className="eyebrow">Acessibilidade individual</p><h2>Leitura em voz alta</h2><p className="soft-note">{profile.audioEnabled ? "A LUMI PODE LER AS PERGUNTAS OU PALAVRAS DE REFERÊNCIA PARA ESTE ALUNO." : "A LEITURA POR ÁUDIO ESTÁ DESLIGADA. O ALUNO LERÁ AS ATIVIDADES SEM NARRAÇÃO."}</p><button className="primary-action compact" onClick={() => controller.setStudentAudio(!profile.audioEnabled)}>{profile.audioEnabled ? <><VolumeX size={18} /> Desativar áudio deste aluno</> : <><Volume2 size={18} /> Ativar áudio deste aluno</>}</button></section>;
  if (tab === "profiles") return <><section className="student-profile-card paper-panel"><div><p className="eyebrow">Perfil de aluno</p><h2>{profile.name}</h2><p>Parceiro: <strong>{profile.partner}</strong> · Nível {Math.max(1, Math.floor(profile.xp / 40) + 1)} · {profile.xp} XP</p></div><div className="profile-actions"><button className="soft-action" onClick={() => controller.openProfile()}><PawPrint size={17} /> Editar perfil</button><button className="soft-action" onClick={() => onTabChange("answers")}><CircleHelp size={17} /> Ver respostas</button><button className="soft-action" onClick={() => controller.goToMap()}><BookOpen size={17} /> Abrir livro-mapa</button></div></section>{audioCard}<WorldTeacherGrid state={state} controller={controller} onOpenAnswers={() => onTabChange("answers")} /></>;
  if (tab === "answers") return <div className="analysis-workspace"><Pagination current={safeAnswerPage} total={answerPageCount} count={entries.length} label="respostas" onChange={setAnswerPage} /><ResponseExplorer entries={visible} selectedIndex={selected?.index ?? null} onSelectAnswer={onSelectAnswer} tab={tab} />{selected && <AnswerInspector answer={selected.answer} />}</div>;
  return <><section className="teacher-stat-grid"><article><span>Mundo atual</span><strong>{world.shortName}</strong><i style={{ background: world.color }} /></article><article><span>Acerto no mundo</span><strong>{accuracy}%</strong><i className="green" /></article><article><span>Respostas salvas</span><strong>{state.answers.length}</strong><i className="orange" /></article></section>{audioCard}<WorldTeacherGrid state={state} controller={controller} onOpenAnswers={() => onTabChange("answers")} /><section className="answer-history paper-panel"><div className="table-head"><div><p className="eyebrow">Portfólio de aprendizagem</p><h2>Últimas respostas</h2></div><button className="soft-action" onClick={() => onTabChange("answers")}>ANALISAR TUDO <ChevronRight size={17} /></button></div>{entries.length ? <div className="history-list">{entries.slice(0, 6).map(({ answer, index }) => <button key={`${answer.at}-${index}`} onClick={() => { onSelectAnswer(index); onTabChange("answers"); }}><span className={answerStatusClass(answer)}>{answerStatusLabel(answer)}</span><p>{answer.question}</p><strong>{answer.answer}</strong><small>{answer.at}</small></button>)}</div> : <p className="empty-note">AS RESPOSTAS DA CRIANÇA APARECERÃO AQUI DURANTE AS FASES.</p>}</section></>;
}

function WorldTeacherGrid({ state, controller, onOpenAnswers }: { state: GameState; controller: GameController; onOpenAnswers: () => void }) {
  return <section className="teacher-table paper-panel"><div className="table-head"><div><p className="eyebrow">Mundos e fases</p><h2>Progresso da trilha</h2></div><span>CLIQUE EM UM MUNDO PARA ABRIR AS RESPOSTAS</span></div><div className="world-teacher-grid">{WORLDS.map((world) => { const done = Object.keys(state.completions).filter((key) => key.startsWith(`${world.id}:`)).length; const accuracy = controller.worldAccuracy(world.id); return <button key={world.id} onClick={() => { controller.selectWorld(world.id); onOpenAnswers(); }} style={{ "--world": world.color } as CSSProperties}><span>{world.icon}</span><strong>{world.shortName}</strong><small>{done}/{PHASES_PER_WORLD} FASES · {accuracy}%</small><i style={{ width: `${(done / PHASES_PER_WORLD) * 100}%` }} /></button>; })}</div>{state.profile!.currentWorld < WORLDS.length - 1 && <button className="release-button" disabled={controller.worldAccuracy(state.profile!.currentWorld) < 70} onClick={() => controller.releaseNextWorld(state.profile!.currentWorld)}>{controller.worldAccuracy(state.profile!.currentWorld) >= 70 ? "LIBERAR PRÓXIMO MUNDO" : `FALTAM ${70 - controller.worldAccuracy(state.profile!.currentWorld)}% PARA O AVANÇO`} <ChevronRight size={19} /></button>}</section>;
}

function AnswerInspector({ answer }: { answer: GameState["answers"][number] }) {
  const world = WORLDS[answer.worldId];
  return <section className="answer-inspector paper-panel"><div className="table-head"><div><p className="eyebrow">Análise da resposta</p><h2>{world?.shortName || "Mundo"} · Fase {answer.phase + 1}</h2></div><span className={answerStatusClass(answer)}>{answerStatusLabel(answer)}</span></div><div className="inspector-section"><span>PERGUNTA</span><p>{answer.question}</p></div>{answer.visual && <div className="inspector-visual" aria-label="Ilustração da pergunta">{answer.visual}</div>}{answer.options?.length ? <div className="inspector-section"><span>ALTERNATIVAS</span><div className="inspector-options">{answer.options.map((option) => <b key={option} className={`${option === answer.answer ? "student-choice" : ""} ${option === answer.correctAnswer ? "correct-choice" : ""}`}>{option}{option === answer.answer && <small>ESCOLHA</small>}{option === answer.correctAnswer && <small>RESPOSTA</small>}</b>)}</div></div> : null}<div className="inspector-answer"><span>RESPOSTA DO ALUNO</span><strong>{answer.answer}</strong><small>{answer.hint ? `PISTA USADA: ${answer.hint}` : "SEM PISTA REGISTRADA"}</small></div>{answer.drawing && <div className="drawing-review"><span>DESENHO DO ALUNO</span><img src={answer.drawing} alt="Desenho enviado pelo aluno para esta resposta" /></div>}<small className="answer-time">REGISTRADO EM {answer.at}</small></section>;
}

function Pagination({ current, total, count, label, onChange }: { current: number; total: number; count: number; label: string; onChange: (page: number) => void }) {
  if (count <= 10) return null;
  return <nav className="teacher-pagination" aria-label={`Navegação de ${label}`}><span>{count} {label} · página {current + 1} de {total}</span><button className="soft-action compact" disabled={current === 0} onClick={() => onChange(Math.max(0, current - 1))}><ChevronLeft size={15} /> Anterior</button><button className="soft-action compact" disabled={current >= total - 1} onClick={() => onChange(Math.min(total - 1, current + 1))}>Próxima <ChevronRight size={15} /></button></nav>;
}

function ResponseExplorer({ entries, selectedIndex, onSelectAnswer, tab }: { entries: Array<{ answer: GameState["answers"][number]; index: number }>; selectedIndex: number | null; onSelectAnswer: (index: number) => void; tab: TeacherTab }) {
  const firstWorld = entries[0]?.answer.worldId ?? null;
  const [expandedWorld, setExpandedWorld] = useState<number | null>(firstWorld);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(entries[0] ? `${entries[0].answer.worldId}:${entries[0].answer.phase}` : null);
  const grouped = WORLDS.map((world) => ({
    world,
    phases: Array.from(new Set(entries.filter(({ answer }) => answer.worldId === world.id).map(({ answer }) => answer.phase))).sort((a, b) => a - b),
  })).filter(({ phases }) => phases.length);
  return <section className="response-explorer paper-panel"><div className="table-head"><div><p className="eyebrow">Caderno de respostas</p><h2>Respostas por mundo e fase</h2><small className="soft-note">Abra um mundo, escolha a fase e depois a tentativa que deseja analisar.</small></div><span>{entries.length} registro(s)</span></div>{grouped.length ? <div className="response-world-list">{grouped.map(({ world, phases }) => <section className={`response-world-group ${expandedWorld === world.id ? "open" : ""}`} key={world.id}><button className="response-world-toggle" onClick={() => setExpandedWorld((current) => current === world.id ? null : world.id)}><span className="response-world-icon" style={{ background: world.accent, color: world.color }}>{world.icon}</span><span><strong>{world.name}</strong><small>{phases.length} fase(s) com respostas</small></span><ChevronRight size={18} /></button>{expandedWorld === world.id && <div className="response-phase-list">{phases.map((phase) => { const phaseKey = `${world.id}:${phase}`; const phaseEntries = entries.filter(({ answer }) => answer.worldId === world.id && answer.phase === phase); return <div className={`response-phase-group ${expandedPhase === phaseKey ? "open" : ""}`} key={phaseKey}><button className="response-phase-toggle" onClick={() => setExpandedPhase((current) => current === phaseKey ? null : phaseKey)}><span>Fase {phase + 1}</span><small>{phaseEntries.length} resposta(s)</small><ChevronRight size={16} /></button>{expandedPhase === phaseKey && <div className="response-attempt-list">{phaseEntries.map(({ answer, index }) => <button key={`${answer.at}-${index}`} className={`response-attempt ${selectedIndex === index ? "selected" : ""}`} onClick={() => onSelectAnswer(index)}><span className={answerStatusClass(answer)}>{answerStatusLabel(answer)}</span><span><strong>{answer.question}</strong><small>{answer.at}{answer.drawing ? " · DESENHO ANEXADO" : ""}</small></span><ChevronRight size={15} /></button>)}</div>}</div>; })}</div>}</section>)}</div> : <p className="empty-note">Ainda não há registros nesta categoria.</p>}</section>;
}

export default function GameUI({ state, controller }: Props) {
  const uiRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = uiRef.current;
    if (!root) return;
    const timers = new Map<HTMLButtonElement, number>();
    const handleClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest("button");
      if (!button || button.disabled) return;
      if (button.dataset.loading === "true") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      button.dataset.loading = "true";
      button.setAttribute("aria-busy", "true");
      button.setAttribute("aria-disabled", "true");
      const timer = window.setTimeout(() => {
        button.dataset.loading = "false";
        button.removeAttribute("aria-busy");
        button.removeAttribute("aria-disabled");
        timers.delete(button);
      }, 720);
      timers.set(button, timer);
    };
    root.addEventListener("click", handleClick, true);
    return () => { root.removeEventListener("click", handleClick, true); timers.forEach((timer) => window.clearTimeout(timer)); };
  }, []);
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
    if (state.screen === "developer") return <Developer state={state} controller={controller} />;
    return <Teacher state={state} controller={controller} />;
  }, [state, controller]);
  return <div ref={uiRef} className="game-ui">{content}</div>;
}
