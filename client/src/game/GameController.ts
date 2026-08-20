/**
 * Design reminder — Livro-Mapa Encantado: a lógica nunca pune a criança;
 * cada erro inicial vira uma pista de exploração e cada avanço ganha um carimbo.
 */

import { getQuestionBank, PLACEMENT_QUESTIONS, type GameQuestion, WORLDS } from "./content";

export type Screen = "welcome" | "placement" | "map" | "lesson" | "reward" | "pets" | "teacher";

export type Profile = {
  name: string;
  partner: string;
  currentWorld: number;
  coins: number;
  xp: number;
  eggs: number;
  petLevel: number;
  petCare: number;
  audioEnabled: boolean;
  recommendedWorld: number;
};

export type Feedback = {
  tone: "success" | "hint" | "continue";
  text: string;
} | null;

export type Completion = {
  score: number;
  total: number;
  date: string;
};

export type AnswerLog = {
  questionId?: string;
  question: string;
  answer: string;
  correct: boolean;
  worldId: number;
  phase: number;
  kind?: "choice" | "order" | "draw";
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
  title: string;
};

export type GameState = {
  screen: Screen;
  profile: Profile | null;
  placementIndex: number;
  placementScore: number;
  activeWorld: number;
  selectedWorld: number;
  activePhase: number;
  queue: GameQuestion[];
  questionIndex: number;
  attempts: number;
  roundScore: number;
  feedback: Feedback;
  completions: Record<string, Completion>;
  answers: AnswerLog[];
  reward: Reward | null;
  teacherAuthorized: boolean;
};

const STORAGE_KEY = "aventura-das-letras-v2";
const LEGACY_STORAGE_KEY = "aventura-das-letras-v1";
const positiveHints = ["Quase! Você está quase lá!", "Tente de novo, eu acredito em você!", "Vamos olhar com calma. A Lumi tem uma pista!"];

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
    screen: "welcome",
    profile: null,
    placementIndex: 0,
    placementScore: 0,
    activeWorld: 0,
    selectedWorld: 0,
    activePhase: 0,
    queue: [],
    questionIndex: 0,
    attempts: 0,
    roundScore: 0,
    feedback: null,
    completions: {},
    answers: [],
    reward: null,
    teacherAuthorized: false,
  };
}

export class GameController {
  private state: GameState;
  private listeners = new Set<(state: GameState) => void>();

  constructor(demo = false) {
    this.state = this.load();
    if (demo) this.seedDemo();
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
      const shiftWorld = (worldId: number) => Math.max(0, Math.min(WORLDS.length - 1, legacy ? worldId + 1 : worldId));
      const completions = Object.fromEntries(Object.entries(saved.completions ?? {}).map(([key, completion]) => {
        const [worldId, phase] = key.split(":");
        return [`${shiftWorld(Number(worldId))}:${phase}`, completion];
      }));
      const answers = (saved.answers ?? []).map((answer) => ({ ...answer, worldId: shiftWorld(answer.worldId) }));
      const profile = saved.profile ? {
        ...saved.profile,
        currentWorld: shiftWorld(saved.profile.currentWorld),
        recommendedWorld: shiftWorld(saved.profile.recommendedWorld ?? saved.profile.currentWorld),
        audioEnabled: saved.profile.audioEnabled !== false,
      } : null;
      const selectedWorld = profile ? shiftWorld(saved.selectedWorld ?? saved.activeWorld ?? profile.currentWorld) : 0;
      const hydrated = { ...initialState(), ...saved, activeWorld: shiftWorld(saved.activeWorld ?? 0), selectedWorld, profile, completions, answers };
      const requiresProfile = ["map", "lesson", "reward", "pets"].includes(hydrated.screen);
      return requiresProfile && !hydrated.profile ? initialState() : hydrated;
    } catch {
      return initialState();
    }
  }

  private emit() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // O jogo continua funcionando mesmo se o navegador bloquear armazenamento local.
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
      profile: { name: "Clara", partner: "Raposa", currentWorld: 2, recommendedWorld: 2, coins: 145, xp: 86, eggs: 1, petLevel: 2, petCare: 62, audioEnabled: true },
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

  beginProfile(name: string, partner: string) {
    const safeName = name.trim() || "Exploradora";
    this.state = {
      ...initialState(),
      screen: "placement",
      profile: { name: safeName, partner, currentWorld: 0, recommendedWorld: 0, coins: 20, xp: 0, eggs: 0, petLevel: 1, petCare: 30, audioEnabled: true },
    };
    this.emit();
  }

  submitPlacement(answer: string) {
    const question = PLACEMENT_QUESTIONS[this.state.placementIndex];
    if (!question) return;
    const correct = answer === question.answer;
    const nextScore = this.state.placementScore + (correct ? 1 : 0);
    if (this.state.placementIndex === PLACEMENT_QUESTIONS.length - 1) {
      const recommendedWorld = nextScore <= 3 ? 0 : nextScore <= 6 ? 1 : nextScore <= 9 ? 2 : nextScore <= 12 ? 3 : nextScore <= 15 ? 4 : nextScore <= 18 ? 5 : 6;
      if (this.state.profile) {
        this.state.profile.currentWorld = 0;
        this.state.profile.recommendedWorld = recommendedWorld;
      }
      this.state.placementScore = nextScore;
      this.state.activeWorld = 0;
      this.state.selectedWorld = 0;
      this.state.screen = "map";
      this.state.feedback = null;
    } else {
      this.state.placementIndex += 1;
      this.state.placementScore = nextScore;
    }
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
    if (!question || this.state.feedback) return;
    const correct = question.kind === "draw" ? Boolean(drawing) : value === question.answer;
    const attempts = this.state.attempts + 1;
    this.state.answers = [
      ...this.state.answers,
      { questionId: question.id, question: question.prompt, answer: value || "DESENHO ENVIADO", correct, worldId: this.state.activeWorld, phase: this.state.activePhase, kind: question.kind, options: question.options, correctAnswer: question.answer, hint: question.hint, visual: question.visual, drawing, at: new Date().toLocaleString("pt-BR") },
    ].slice(-120);

    if (correct) {
      this.state.roundScore += 1;
      this.state.feedback = { tone: "success", text: "Muito bem! Sua trilha ganhou uma nova pegada." };
    } else if (attempts === 1) {
      this.state.attempts = attempts;
      this.state.feedback = { tone: "hint", text: `${positiveHints[Math.floor(Math.random() * positiveHints.length)]} ${question.hint}` };
    } else {
      this.state.attempts = attempts;
      this.state.feedback = { tone: "continue", text: `A Lumi guardou uma dica para você: ${question.hint} Vamos para a próxima descoberta!` };
    }
    this.emit();
  }

  next() {
    if (!this.state.feedback) return;
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
    const egg = this.state.roundScore >= 6 || finalChallenge;
    const reward = { coins: 10 + this.state.roundScore * 2, xp: 8 + this.state.roundScore * 3, egg, title: finalChallenge ? "Desafio final concluído" : `Fase ${this.state.activePhase + 1} concluída` };
    if (this.state.profile) {
      this.state.profile.coins += reward.coins;
      this.state.profile.xp += reward.xp;
      if (egg) this.state.profile.eggs += 1;
    }
    this.state.reward = reward;
    this.state.screen = "reward";
    this.emit();
  }

  goToMap() {
    this.state.screen = this.state.profile ? "map" : "welcome";
    if (this.state.profile) this.state.selectedWorld = this.state.activeWorld;
    this.state.feedback = null;
    this.emit();
  }

  openPets() {
    this.state.screen = this.state.profile ? "pets" : "welcome";
    this.emit();
  }

  careForPet(action: "food" | "care" | "play") {
    if (!this.state.profile) return;
    const cost = action === "food" ? 5 : action === "play" ? 3 : 0;
    if (this.state.profile.coins < cost) return;
    this.state.profile.coins -= cost;
    this.state.profile.petCare = Math.min(100, this.state.profile.petCare + (action === "care" ? 12 : 9));
    if (this.state.profile.petCare >= 80) {
      this.state.profile.petLevel = Math.min(9, this.state.profile.petLevel + 1);
      this.state.profile.petCare = 35;
    }
    this.emit();
  }

  setStudentAudio(enabled: boolean) {
    if (!this.state.profile) return;
    this.state.profile.audioEnabled = enabled;
    this.emit();
  }

  openTeacher() {
    this.state.screen = "teacher";
    this.emit();
  }

  authorizeTeacher(password: string) {
    this.state.teacherAuthorized = password.toLowerCase() === "professor";
    this.emit();
    return this.state.teacherAuthorized;
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
    this.state.profile.currentWorld = Math.max(this.state.profile.currentWorld, nextWorld);
    this.state.selectedWorld = nextWorld;
    this.emit();
  }
}
