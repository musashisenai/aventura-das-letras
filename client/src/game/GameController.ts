/**
 * Design reminder — Livro-Mapa Encantado: a lógica nunca pune a criança;
 * cada erro inicial vira uma pista de exploração e cada avanço ganha um carimbo.
 */

import { getPlacementWorld, getQuestionBank, PLACEMENT_QUESTIONS, type GameQuestion, WORLDS } from "./content";

export type Screen = "menu" | "welcome" | "continue" | "profile" | "placement" | "placement-result" | "map" | "lesson" | "reward" | "pets" | "teacher" | "developer";

export type Profile = {
  studentId?: string;
  sessionToken?: string;
  placementCompleted: boolean;
  name: string;
  partner: string;
  currentWorld: number;
  coins: number;
  xp: number;
  eggs: number;
  eggCollection: Egg[];
  petLevel: number;
  petCare: number;
  petName: string;
  petStage: "filhote" | "evoluido";
  petSpecies: string;
  audioEnabled: boolean;
  recommendedWorld: number;
};

export type EggRarity = "comum" | "raro" | "epico" | "lendario";
export type Egg = { id: string; rarity: EggRarity; progress: number; required: number; hatched: boolean };

export type Feedback = {
  tone: "success" | "hint" | "continue";
  text: string;
} | null;

export type Completion = {
  score: number;
  total: number;
  date: string;
};

export type WorldApproval = {
  status: "pending" | "approved";
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
};

export type PlacementResult = {
  questionId: string;
  question: string;
  correct: boolean;
  attempts: number;
  drawing?: string;
};

export type AnswerLog = {
  questionId?: string;
  question: string;
  answer: string;
  correct: boolean;
  usedHint?: boolean;
  worldId: number;
  phase: number;
  kind?: "choice" | "order" | "draw" | "seed-rain" | "lantern" | "sand-tracks" | "mosquito-sweep" | "magnet-paint" | "ice-melt" | "paint-roller" | "bee-flight" | "cookie-mold";
  options?: string[];
  correctAnswer?: string;
  hint?: string;
  visual?: string;
  drawing?: string;
  at: string;
};

export type Reward = {
  coins: number;
  xp: number;
  egg: boolean;
  eggRarity?: EggRarity;
  title: string;
};

export type GameState = {
  screen: Screen;
  profile: Profile | null;
  setupAudioEnabled: boolean;
  placementIndex: number;
  placementScore: number;
  placementAttempts: number;
  placementResults: PlacementResult[];
  placementQueue: GameQuestion[];
  activeWorld: number;
  selectedWorld: number;
  activePhase: number;
  queue: GameQuestion[];
  questionIndex: number;
  attempts: number;
  roundScore: number;
  feedback: Feedback;
  completions: Record<string, Completion>;
  worldApprovals: Record<string, WorldApproval>;
  answers: AnswerLog[];
  reward: Reward | null;
  teacherAuthorized: boolean;
  developerAuthorized: boolean;
  teacherPassword: string;
  teacherName: string;
  worldOrderVersion: number;
  questionBankVersion: number;
};

const STORAGE_KEY = "aventura-das-letras-v2";
const LEGACY_STORAGE_KEY = "aventura-das-letras-v1";
const QUESTION_BANK_VERSION = 5;
const positiveHints = ["Quase! Você está quase lá!", "Tente de novo, eu acredito em você!", "Vamos olhar com calma. A Lumi tem uma pista!"];
const safeActivityHints = [
  "Observe todas as opções com calma e compare os sons.",
  "Pense no que a pergunta está pedindo e elimine a opção que não combina.",
  "Olhe para a figura e preste atenção ao começo e ao final.",
  "Fale as opções devagar e escolha a que combina melhor.",
];
const activityHint = () => safeActivityHints[Math.floor(Math.random() * safeActivityHints.length)];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function initialState(): GameState {
  return {
    screen: "menu",
    profile: null,
    setupAudioEnabled: true,
    placementIndex: 0,
    placementScore: 0,
    placementAttempts: 0,
    placementResults: [],
    placementQueue: [],
    activeWorld: 0,
    selectedWorld: 0,
    activePhase: 0,
    queue: [],
    questionIndex: 0,
    attempts: 0,
    roundScore: 0,
    feedback: null,
    completions: {},
    worldApprovals: {},
    answers: [],
    reward: null,
    teacherAuthorized: false,
    developerAuthorized: false,
    teacherPassword: "7391846205",
    teacherName: "Professor(a)",
    worldOrderVersion: 2,
    questionBankVersion: QUESTION_BANK_VERSION,
  };
}

export class GameController {
  private state: GameState;
  private listeners = new Set<(state: GameState) => void>();
  private syncQueue: Promise<void> = Promise.resolve();
  private sessionRelease: Promise<void> = Promise.resolve();

  constructor(demo = false, previewMenu = false) {
    this.state = this.load();
    if (demo) this.seedDemo();
    else if (previewMenu) this.state = initialState();
  }

  getState = () => this.state;

  subscribe(listener: (state: GameState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private load(): GameState {
    try {
      const rawV2 = window.localStorage.getItem(STORAGE_KEY);
      const raw = rawV2 ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return initialState();
      const legacy = !rawV2;
      const saved = JSON.parse(raw) as GameState;
      const questionBankChanged = saved.questionBankVersion !== QUESTION_BANK_VERSION;
      const reordered = !legacy && saved.worldOrderVersion !== 2;
      const shiftWorld = (worldId: number) => {
        const migrated = legacy ? worldId + 1 : reordered && worldId < 2 ? 1 - worldId : worldId;
        return Math.max(0, Math.min(WORLDS.length - 1, migrated));
      };
      const completions = Object.fromEntries(Object.entries(saved.completions ?? {}).map(([key, completion]) => {
        const [worldId, phase] = key.split(":");
        return [`${shiftWorld(Number(worldId))}:${phase}`, completion];
      }));
      const answers = (saved.answers ?? []).map((answer) => ({ ...answer, worldId: shiftWorld(answer.worldId) }));
      const profile = saved.profile ? {
        ...saved.profile,
        studentId: saved.profile.studentId ?? `${saved.profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-legacy`,
        placementCompleted: saved.profile.placementCompleted ?? true,
        partner: "Lumi",
        eggCollection: saved.profile.eggCollection ?? [],
        petName: saved.profile.petName ?? "Faísca",
        petStage: saved.profile.petStage ?? (saved.profile.petLevel >= 10 ? "evoluido" : "filhote"),
        petSpecies: saved.profile.petSpecies ?? "raposa",
        currentWorld: shiftWorld(saved.profile.currentWorld),
        recommendedWorld: shiftWorld(saved.profile.recommendedWorld ?? saved.profile.currentWorld),
        audioEnabled: saved.profile.audioEnabled !== false,
      } : null;
      const selectedWorld = profile ? shiftWorld(saved.selectedWorld ?? saved.activeWorld ?? profile.currentWorld) : 0;
      const placementQueue = saved.placementQueue?.length ? saved.placementQueue : (saved.screen === "placement" ? shuffle(PLACEMENT_QUESTIONS).map((question) => ({ ...question, options: question.options ? shuffle(question.options) : undefined })) : []);
      const setupAudioEnabled = saved.setupAudioEnabled ?? profile?.audioEnabled ?? true;
      const worldApprovals = Object.fromEntries(Object.entries(saved.worldApprovals ?? {}).map(([worldId, approval]) => [`${shiftWorld(Number(worldId))}`, approval]));
      const hydrated = { ...initialState(), ...saved, screen: "menu" as const, teacherAuthorized: false, developerAuthorized: false, teacherPassword: "7391846205", teacherName: saved.teacherName || "Professor(a)", worldOrderVersion: 2, questionBankVersion: QUESTION_BANK_VERSION, queue: questionBankChanged ? [] : (saved.queue ?? []), questionIndex: questionBankChanged ? 0 : (saved.questionIndex ?? 0), attempts: questionBankChanged ? 0 : (saved.attempts ?? 0), feedback: questionBankChanged ? null : (saved.feedback ?? null), setupAudioEnabled, placementQueue, activeWorld: shiftWorld(saved.activeWorld ?? 0), selectedWorld, profile, completions, worldApprovals, answers };
      try {
        const { teacherAuthorized: _teacherAuthorized, developerAuthorized: _developerAuthorized, teacherPassword: _teacherPassword, ...safeSaved } = saved;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSaved));
      } catch { /* a limpeza é melhor esforço quando o armazenamento está bloqueado */ }
      const requiresProfile = ["profile", "map", "placement-result", "lesson", "reward", "pets"].includes(hydrated.screen);
      return requiresProfile && !hydrated.profile ? initialState() : hydrated;
    } catch {
      return initialState();
    }
  }

  private emit() {
    try {
      const { teacherAuthorized: _teacherAuthorized, developerAuthorized: _developerAuthorized, teacherPassword: _teacherPassword, ...persistedState } = this.state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    } catch {
      // O jogo continua funcionando mesmo se o navegador bloquear armazenamento local.
    }
    this.listeners.forEach((listener) => listener({ ...this.state }));
    if (this.state.profile) void this.syncCurrentStudent();
  }

  private syncCurrentStudent() {
    const { teacherAuthorized: _teacherAuthorized, developerAuthorized: _developerAuthorized, teacherPassword: _teacherPassword, ...gameState } = this.state;
    const payload = { id: this.state.profile?.studentId, profile: this.state.profile, sessionToken: this.state.profile?.sessionToken, completions: this.state.completions, worldApprovals: this.state.worldApprovals, answers: this.state.answers, gameState };
    this.syncQueue = this.syncQueue.then(async () => {
      try {
        await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } catch {
        // O jogo continua funcionando offline; a sincronização volta na próxima alteração.
      }
    });
    return this.syncQueue;
  }

  async pullTeacherDecision() {
    const studentId = this.state.profile?.studentId;
    if (!studentId) return;
    try {
      const response = await fetch(`/api/students/${encodeURIComponent(studentId)}`);
      if (response.status === 404) { this.logout(); return; }
      if (!response.ok) return;
      const remote = await response.json() as { profile?: Profile; worldApprovals?: Record<string, WorldApproval> };
      if (!remote.profile || remote.profile.currentWorld <= this.state.profile!.currentWorld) return;
      this.state.profile = { ...this.state.profile!, currentWorld: remote.profile.currentWorld, recommendedWorld: remote.profile.recommendedWorld ?? remote.profile.currentWorld };
      this.state.worldApprovals = remote.worldApprovals ?? this.state.worldApprovals;
      this.state.selectedWorld = this.state.profile.currentWorld;
      this.emit();
    } catch {
      // O jogo continua funcionando offline; a decisão será consultada novamente.
    }
  }

  async keepStudentSession() {
    const studentId = this.state.profile?.studentId;
    const sessionToken = this.state.profile?.sessionToken;
    if (!studentId || !sessionToken) return;
    const response = await fetch(`/api/students/${encodeURIComponent(studentId)}/session`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionToken }) }).catch(() => undefined);
    if (response?.status === 404) this.logout();
  }

  releaseStudentSession() {
    const studentId = this.state.profile?.studentId;
    const sessionToken = this.state.profile?.sessionToken;
    if (!studentId || !sessionToken) return Promise.resolve();
    return this.syncQueue.then(() => fetch(`/api/students/${encodeURIComponent(studentId)}/session`, { method: "DELETE", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ sessionToken }) })).then(() => undefined).catch(() => undefined);
  }

  logout() {
    this.sessionRelease = this.releaseStudentSession();
    const setupAudioEnabled = this.state.setupAudioEnabled;
    this.state = { ...initialState(), setupAudioEnabled, screen: "menu" };
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // O logout continua válido mesmo se o navegador bloquear o armazenamento.
    }
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  private completionKey(worldId: number, phase: number) {
    return `${worldId}:${phase}`;
  }

  private seedDemo() {
    this.state = {
      ...initialState(),
      screen: "map",
      profile: { placementCompleted: true, name: "Clara", partner: "Lumi", currentWorld: 2, recommendedWorld: 2, coins: 145, xp: 86, eggs: 1, eggCollection: [{ id: "demo-egg", rarity: "raro", progress: 1, required: 3, hatched: false }], petLevel: 2, petCare: 62, petName: "Faísca", petStage: "filhote", petSpecies: "raposa", audioEnabled: true },
      selectedWorld: 1,
      completions: {
        "0:0": { score: 7, total: 8, date: new Date().toISOString() },
        "0:1": { score: 6, total: 8, date: new Date().toISOString() },
        "1:0": { score: 7, total: 8, date: new Date().toISOString() },
      },
    };
    this.emit();
  }

  reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    this.state = initialState();
    this.emit();
  }

  async beginProfile(name: string, _partner?: string) {
    await this.sessionRelease;
    const safeName = name.trim() || "Exploradora";
    const audioEnabled = this.state.setupAudioEnabled;
    const sessionToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const profile: Profile = { placementCompleted: false, sessionToken, studentId: `${safeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`, name: safeName, partner: "Lumi", currentWorld: 0, recommendedWorld: 0, coins: 20, xp: 0, eggs: 0, eggCollection: [], petLevel: 1, petCare: 30, petName: "Faísca", petStage: "filhote", petSpecies: "raposa", audioEnabled };
    try {
      const response = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: profile.studentId, profile, sessionToken, completions: {}, worldApprovals: {}, answers: [] }) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        return result.error ?? "Não foi possível iniciar essa aventura.";
      }
    } catch {
      return "Servidor indisponível para iniciar a aventura.";
    }
    this.state = {
      ...initialState(),
      screen: "placement",
      setupAudioEnabled: audioEnabled,
      profile,
      placementQueue: shuffle(PLACEMENT_QUESTIONS).map((question) => ({ ...question, options: question.options ? shuffle(question.options) : undefined })),
    };
    this.emit();
    return null;
  }

  async resumeProfile(name: string) {
    await this.sessionRelease;
    const normalized = name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
    if (!normalized) return "Digite o nome usado no cadastro.";
    try {
      const response = await fetch("/api/students/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!response.ok) return "Não encontramos uma aventura com esse nome. Confira a escrita ou peça ao professor para cadastrar o aluno.";
      const saved = await response.json() as { id: string; profile: Profile; completions?: GameState["completions"]; worldApprovals?: GameState["worldApprovals"]; answers?: GameState["answers"]; gameState?: Partial<GameState> };
      const sessionToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const claim = await fetch(`/api/students/${encodeURIComponent(saved.id)}/session`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionToken }) });
      if (!claim.ok) {
        const result = await claim.json().catch(() => ({})) as { error?: string };
        return result.error ?? "Este aluno já está em jogo em outro dispositivo.";
      }
      const audioEnabled = saved.profile.audioEnabled !== false;
      const profile = { ...saved.profile, studentId: saved.id, sessionToken, audioEnabled, placementCompleted: saved.profile.placementCompleted ?? false };
      const savedGameState = saved.gameState;
      const freshPlacement = () => ({ placementIndex: 0, placementScore: 0, placementAttempts: 0, placementResults: [], placementQueue: shuffle(PLACEMENT_QUESTIONS).map((question) => ({ ...question, options: question.options ? shuffle(question.options) : undefined })) });
      const resumed = profile.placementCompleted && savedGameState ? { ...initialState(), ...savedGameState } : { ...initialState(), ...freshPlacement() };
      this.state = { ...resumed, screen: profile.placementCompleted ? (savedGameState?.screen && savedGameState.screen !== "placement" ? savedGameState.screen : "map") : "placement", setupAudioEnabled: audioEnabled, profile, completions: saved.completions ?? {}, worldApprovals: saved.worldApprovals ?? {}, answers: saved.answers ?? [], activeWorld: savedGameState?.activeWorld ?? profile.currentWorld, selectedWorld: savedGameState?.selectedWorld ?? profile.currentWorld, teacherAuthorized: false, developerAuthorized: false, teacherPassword: "7391846205" };
      this.emit();
      return null;
    } catch {
      return "Não foi possível continuar a aventura agora. Tente novamente.";
    }
  }

  async registerStudent(name: string) {
    const safeName = name.trim();
    if (!safeName) return "Digite o nome do aluno.";
    const slug = safeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "aluno";
    const profile: Profile = { placementCompleted: false, studentId: `student-${slug}-${Date.now()}`, name: safeName, partner: "Lumi", currentWorld: 0, recommendedWorld: 0, coins: 20, xp: 0, eggs: 0, eggCollection: [], petLevel: 1, petCare: 30, petName: "Faísca", petStage: "filhote", petSpecies: "raposa", audioEnabled: this.state.setupAudioEnabled };
    try {
      const response = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: profile.studentId, profile, completions: {}, worldApprovals: {}, answers: [] }) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        return result.error ?? "Não foi possível cadastrar o aluno.";
      }
      return null;
    } catch {
      return "Servidor indisponível para cadastrar o aluno.";
    }
  }

  openPlayerSetup() {
    this.state.screen = "welcome";
    this.state.teacherAuthorized = false;
    this.emit();
  }

  openContinueSetup() {
    this.state.screen = "continue";
    this.state.teacherAuthorized = false;
    this.emit();
  }

  continueSave() {
    if (!this.state.profile) return this.openPlayerSetup();
    this.state.screen = "map";
    this.state.selectedWorld = this.state.activeWorld;
    this.emit();
  }

  editProfile() {
    if (!this.state.profile) return this.openPlayerSetup();
    this.state.screen = "welcome";
    this.emit();
  }

  openProfile() {
    if (!this.state.profile) return this.openPlayerSetup();
    this.state.screen = "profile";
    this.emit();
  }

  private async changeProfileName(name: string, screen: GameState["screen"]): Promise<string | null> {
    if (!this.state.profile) return "Nenhum perfil de aluno está conectado.";
    const safeName = name.trim();
    if (!safeName) return "Digite um nome para continuar.";
    const currentProfile = this.state.profile;
    const nextProfile = { ...currentProfile, name: safeName };
    const { teacherAuthorized: _teacherAuthorized, developerAuthorized: _developerAuthorized, teacherPassword: _teacherPassword, ...gameState } = this.state;
    try {
      const response = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: currentProfile.studentId, profile: nextProfile, sessionToken: currentProfile.sessionToken, completions: this.state.completions, worldApprovals: this.state.worldApprovals, answers: this.state.answers, gameState }) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        return result.error ?? "Não foi possível alterar o nome.";
      }
      this.state.profile = nextProfile;
      this.state.screen = screen;
      this.emit();
      return null;
    } catch {
      return "Não foi possível verificar o nome no servidor.";
    }
  }

  saveProfileName(name: string) { return this.changeProfileName(name, "profile"); }

  updateProfileName(name: string) {
    if (!this.state.profile) return this.beginProfile(name);
    return this.changeProfileName(name, "map");
  }

  startNewSave() {
    this.logout();
    this.state.screen = "welcome";
    this.emit();
  }

  returnToMenu() {
    this.logout();
  }

  setSetupAudio(enabled: boolean) {
    this.state.setupAudioEnabled = enabled;
    this.emit();
  }

  submitPlacement(answer: string, drawing?: string) {
    const placementQueue = this.state.placementQueue.length ? this.state.placementQueue : PLACEMENT_QUESTIONS;
    const question = placementQueue[this.state.placementIndex];
    if (!question) return;
    const attempts = this.state.placementAttempts + 1;
    const correct = question.kind === "draw" ? Boolean(drawing) : answer === question.answer;
    if (question.kind === "draw" && !drawing) return;
    const result: PlacementResult = {
      questionId: question.id,
      question: question.displayPrompt ?? question.prompt,
      correct,
      attempts,
      drawing,
    };
    const placementResults = [...this.state.placementResults, result];
    const nextScore = this.state.placementScore + (correct ? 1 : 0);
    this.state.placementResults = placementResults;
    this.state.placementScore = nextScore;
    this.state.placementAttempts = 0;
    this.state.feedback = null;

    if (this.state.placementIndex === placementQueue.length - 1) {
      const retryPenalty = placementResults.filter(({ attempts: questionAttempts }) => questionAttempts > 1).length * 0.5;
      const evaluatedScore = Math.max(0, Math.round(nextScore - retryPenalty));
      const recommendedWorld = getPlacementWorld(evaluatedScore, placementQueue.length);
      if (this.state.profile) {
        this.state.profile.placementCompleted = true;
        this.state.profile.currentWorld = recommendedWorld;
        this.state.profile.recommendedWorld = recommendedWorld;
      }
      this.state.activeWorld = recommendedWorld;
      this.state.selectedWorld = recommendedWorld;
      this.state.placementQueue = [];
      this.state.screen = "placement-result";
    } else {
      this.state.placementIndex += 1;
    }
    this.emit();
  }

  openMapFromPlacement() {
    if (this.state.screen !== "placement-result") return;
    this.state.screen = "map";
    this.state.feedback = null;
    this.emit();
  }

  isWorldOpen(worldId: number) {
    return !!this.state.profile && worldId <= this.state.profile.currentWorld;
  }

  selectWorld(worldId: number) {
    if (!WORLDS[worldId]) return;
    this.state.selectedWorld = worldId;
    this.emit();
  }

  isPhaseOpen(worldId: number, phase: number) {
    if (!this.isWorldOpen(worldId)) return false;
    if (phase === 7) return Array.from({ length: 7 }).every((_, index) => !!this.state.completions[this.completionKey(worldId, index)]);
    return phase === 0 || !!this.state.completions[this.completionKey(worldId, phase - 1)];
  }

  startPhase(worldId: number, phase: number) {
    if (!this.isPhaseOpen(worldId, phase)) return;
    const queue = shuffle(getQuestionBank(worldId, phase)).slice(0, 8).map((question) => ({
      ...question,
      options: question.options ? shuffle(question.options) : undefined,
    }));
    this.state.activeWorld = worldId;
    this.state.selectedWorld = worldId;
    this.state.activePhase = phase;
    this.state.queue = queue;
    this.state.questionIndex = 0;
    this.state.attempts = 0;
    this.state.roundScore = 0;
    this.state.feedback = null;
    this.state.reward = null;
    this.state.screen = "lesson";
    this.emit();
  }

  currentQuestion() {
    return this.state.queue[this.state.questionIndex] ?? null;
  }

  answer(value: string, drawing?: string) {
    const question = this.currentQuestion();
    if (!question || (this.state.feedback && !(this.state.feedback.tone === "hint" && this.state.attempts === 1))) return;
    const correct = question.kind === "draw" ? Boolean(drawing) : value === question.answer;
    const attempts = this.state.attempts + 1;
    const usedHint = attempts > 1;
    const hint = usedHint ? question.kind === "cookie-mold" ? question.hint : activityHint() : undefined;
    this.state.answers = [
      ...this.state.answers,
      { questionId: question.id, question: question.prompt, answer: value || "DESENHO ENVIADO", correct, usedHint, worldId: this.state.activeWorld, phase: this.state.activePhase, kind: question.kind, options: question.options, correctAnswer: question.answer, hint, visual: question.visual, drawing, at: new Date().toLocaleString("pt-BR") },
    ].slice(-120);

    if (correct) {
      this.state.roundScore += 1;
      this.state.feedback = { tone: "success", text: "Parabéns! Muito bem! Sua trilha ganhou uma nova pegada." };
    } else if (question.kind === "cookie-mold") {
      this.state.attempts = attempts;
      this.state.feedback = { tone: "hint", text: `A Lumi dá uma pista: ${question.hint ?? "compare o desenho da letra com calma."}` };
    } else if (attempts === 1) {
      this.state.attempts = attempts;
      this.state.feedback = { tone: "hint", text: `Tente novamente, não desista! ${positiveHints[Math.floor(Math.random() * positiveHints.length)]} ${activityHint()}` };
    } else {
      this.state.attempts = attempts;
      this.state.feedback = { tone: "continue", text: `Tente novamente, não desista! A Lumi guardou uma dica para você: ${hint} Vamos para a próxima descoberta!` };
    }
    this.emit();
  }

  retry() {
    if (this.state.feedback?.tone !== "hint") return;
    this.state.feedback = null;
    this.emit();
  }

  next() {
    if (!this.state.feedback || this.state.feedback.tone === "hint") return;
    if (this.state.questionIndex >= 7) {
      this.finishPhase();
      return;
    }
    this.state.questionIndex += 1;
    this.state.attempts = 0;
    this.state.feedback = null;
    this.emit();
  }

  private finishPhase() {
    const key = this.completionKey(this.state.activeWorld, this.state.activePhase);
    this.state.completions[key] = { score: this.state.roundScore, total: 8, date: new Date().toISOString() };
    const finalChallenge = this.state.activePhase === 7;
    if (finalChallenge && this.state.activeWorld < WORLDS.length - 1) {
      this.state.worldApprovals[String(this.state.activeWorld)] = { status: "pending", requestedAt: new Date().toISOString() };
    }
    const egg = this.state.roundScore >= 6 || finalChallenge;
    const eggRarity: EggRarity = finalChallenge ? "lendario" : this.state.roundScore >= 8 ? "epico" : this.state.roundScore >= 7 ? "raro" : "comum";
    const reward = { coins: 10 + this.state.roundScore * 2, xp: 8 + this.state.roundScore * 3, egg, eggRarity, title: finalChallenge ? "Desafio final concluído" : `Fase ${this.state.activePhase + 1} concluída` };
    if (this.state.profile) {
      this.state.profile.coins += reward.coins;
      this.state.profile.xp += reward.xp;
      const collection = (this.state.profile.eggCollection ?? []).map((item) => item.hatched ? item : { ...item, progress: Math.min(item.required, item.progress + 1) });
      if (egg) collection.push({ id: `egg-${Date.now()}`, rarity: eggRarity, progress: 0, required: eggRarity === "lendario" ? 5 : eggRarity === "epico" ? 4 : eggRarity === "raro" ? 3 : 2, hatched: false });
      this.state.profile.eggCollection = collection;
      this.state.profile.eggs = collection.filter((item) => !item.hatched).length;
    }
    this.state.reward = reward;
    this.state.screen = "reward";
    this.emit();
  }

  goToMap() {
    this.state.screen = this.state.profile ? "map" : "menu";
    if (this.state.profile) this.state.selectedWorld = this.state.activeWorld;
    this.state.feedback = null;
    this.emit();
  }

  openPets() {
    this.state.screen = this.state.profile ? "pets" : "menu";
    this.emit();
  }

  careForPet(action: "food" | "care" | "play") {
    if (!this.state.profile) return;
    const cost = action === "food" ? 5 : action === "play" ? 3 : 2;
    if (this.state.profile.coins < cost) return;
    this.state.profile.coins -= cost;
    this.state.profile.petCare = Math.min(100, this.state.profile.petCare + (action === "care" ? 12 : 9));
    if (this.state.profile.petCare >= 100) {
      this.state.profile.petLevel = Math.min(10, this.state.profile.petLevel + 1);
      this.state.profile.petCare = 35;
      if (this.state.profile.petLevel === 10) {
        this.state.profile.petStage = "evoluido";
        this.state.profile.petSpecies = "raposa guardiã";
      }
    }
    this.emit();
  }

  hatchEgg(index: number, name: string) {
    if (!this.state.profile) return false;
    const egg = this.state.profile.eggCollection?.[index];
    const safeName = name.trim().slice(0, 18);
    if (!egg || egg.hatched || egg.progress < egg.required || !safeName) return false;
    this.state.profile.eggCollection = this.state.profile.eggCollection.map((item, itemIndex) => itemIndex === index ? { ...item, hatched: true } : item);
    this.state.profile.eggs = this.state.profile.eggCollection.filter((item) => !item.hatched).length;
    this.state.profile.petName = safeName;
    this.state.profile.petSpecies = egg.rarity === "lendario" ? "dragão-lumi" : egg.rarity === "epico" ? "grifo-lumi" : egg.rarity === "raro" ? "gato-lumi" : "raposa";
    this.emit();
    return true;
  }

  setStudentAudio(enabled: boolean) {
    if (!this.state.profile) return;
    this.state.profile.audioEnabled = enabled;
    this.emit();
  }

  openTeacher() {
    if (this.state.profile) return;
    this.state.screen = "teacher";
    if (!this.state.developerAuthorized) this.state.teacherAuthorized = false;
    this.emit();
  }

  exitTeacher() {
    if (this.state.developerAuthorized) this.state.screen = "developer";
    else {
      this.state.teacherAuthorized = false;
      this.state.screen = "menu";
    }
    this.emit();
  }

  openDeveloper() {
    if (this.state.profile) return;
    this.state.screen = "developer";
    this.state.developerAuthorized = false;
    this.state.teacherAuthorized = false;
    this.emit();
  }

  exitDeveloper() {
    this.state.developerAuthorized = false;
    this.state.teacherAuthorized = false;
    this.state.teacherPassword = "7391846205";
    this.state.screen = "menu";
    this.emit();
  }

  updateTeacherProfile(name: string) {
    this.state.teacherName = name.trim() || this.state.teacherName;
    this.emit();
  }

  async authorizeTeacher(password: string) {
    try {
      const response = await fetch("/api/teacher/authorize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      this.state.teacherAuthorized = response.ok;
      if (response.ok) this.state.teacherPassword = password;
    } catch {
      this.state.teacherAuthorized = false;
    }
    this.emit();
    return this.state.teacherAuthorized;
  }

  async authorizeDeveloper(key: string) {
    try {
      const response = await fetch("/api/developer/authorize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
      this.state.developerAuthorized = response.ok;
      this.state.teacherAuthorized = response.ok;
      if (response.ok) this.state.teacherPassword = key;
    } catch {
      this.state.developerAuthorized = false;
      this.state.teacherAuthorized = false;
    }
    this.emit();
    return this.state.developerAuthorized;
  }

  async changeTeacherPassword(current: string, next: string, confirmation: string) {
    if (!this.state.teacherAuthorized || current !== this.state.teacherPassword) return "A senha atual não confere.";
    if (next.trim().length < 6) return "A nova senha precisa ter pelo menos 6 caracteres.";
    if (next !== confirmation) return "A confirmação não confere.";
    try {
      const response = await fetch("/api/teacher/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current, next }) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        return result.error ?? "Não foi possível alterar a senha no servidor.";
      }
    } catch {
      return "Servidor indisponível para alterar a senha.";
    }
    this.state.teacherPassword = next;
    this.emit();
    return null;
  }

  worldAccuracy(worldId: number) {
    const entries = Array.from({ length: 8 })
      .map((_, phase) => this.state.completions[this.completionKey(worldId, phase)])
      .filter((item): item is Completion => Boolean(item));
    if (!entries.length) return 0;
    const hits = entries.reduce((total, item) => total + item.score, 0);
    const total = entries.reduce((sum, item) => sum + item.total, 0);
    return Math.round((hits / total) * 100);
  }

  releaseNextWorld(worldId: number) {
    if (!this.state.profile || this.worldAccuracy(worldId) < 70) return;
    const nextWorld = Math.min(worldId + 1, WORLDS.length - 1);
    this.state.worldApprovals[String(worldId)] = { status: "approved", requestedAt: this.state.worldApprovals[String(worldId)]?.requestedAt ?? new Date().toISOString(), approvedAt: new Date().toISOString(), approvedBy: this.state.teacherName };
    this.state.profile.currentWorld = Math.max(this.state.profile.currentWorld, nextWorld);
    this.state.selectedWorld = nextWorld;
    this.emit();
  }
}
