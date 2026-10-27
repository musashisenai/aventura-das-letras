import type { AnswerLog, Completion } from "../game/GameController";

export const PHASES_PER_WORLD = 8;

export type ReportStudent = {
  id: string;
  profile: {
    name: string;
    currentWorld: number;
    xp: number;
    petName: string;
  };
  completions: Record<string, Completion>;
  answers: AnswerLog[];
  updatedAt: string;
};

export type StudentSummary = {
  name: string;
  worldNumber: number;
  worldName: string;
  completedPhases: number;
  accuracy: number;
  answerCount: number;
  pet: string;
  xp: number;
  updatedAt: Date | null;
};

export type AnswerDetail = {
  student: string;
  world: string;
  phase: number;
  question: string;
  response: string;
  expectedAnswer: string;
  result: string;
  usedHint: string;
  answeredAt: Date | null;
};

export function validReportDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatReportDate(value: Date | null): string {
  return value ? value.toLocaleString("pt-BR") : "Não informado";
}

function reportAnswers(student: ReportStudent): AnswerLog[] {
  return Array.isArray(student.answers) ? student.answers : [];
}

export function buildStudentSummaries(students: ReportStudent[], worldNames: string[]): StudentSummary[] {
  return students.map((student) => {
    const currentWorld = Number.isInteger(student.profile.currentWorld) ? student.profile.currentWorld : 0;
    const answers = reportAnswers(student);
    const worldAnswers = answers.filter((answer) => answer.worldId === currentWorld);
    const accuracy = worldAnswers.length
      ? Math.round((worldAnswers.filter((answer) => answer.correct).length / worldAnswers.length) * 100)
      : 0;

    return {
      name: student.profile.name || "Sem nome",
      worldNumber: currentWorld + 1,
      worldName: worldNames[currentWorld] ?? `Mundo ${currentWorld + 1}`,
      completedPhases: Object.keys(student.completions ?? {}).filter((key) => key.startsWith(`${currentWorld}:`)).length,
      accuracy,
      answerCount: answers.length,
      pet: student.profile.petName || "Não informado",
      xp: Number.isFinite(student.profile.xp) ? student.profile.xp : 0,
      updatedAt: validReportDate(student.updatedAt),
    };
  });
}

export function buildAnswerDetails(students: ReportStudent[], worldNames: string[]): AnswerDetail[] {
  return students.flatMap((student) => reportAnswers(student).map((answer) => ({
    student: student.profile.name || "Sem nome",
    world: worldNames[answer.worldId] ?? `Mundo ${answer.worldId + 1}`,
    phase: answer.phase + 1,
    question: answer.question || "Não informada",
    response: answer.answer || "Não informada",
    expectedAnswer: answer.correctAnswer || "Não registrada",
    result: answer.correct ? (answer.usedHint ? "Acerto com dica" : "Acerto") : (answer.usedHint ? "Erro com dica" : "Erro"),
    usedHint: answer.usedHint ? "Sim" : "Não",
    answeredAt: validReportDate(answer.at),
  }))).sort((a, b) => a.student.localeCompare(b.student, "pt-BR") || (a.answeredAt?.getTime() ?? 0) - (b.answeredAt?.getTime() ?? 0));
}
