import { getQuestionBank } from "./content";

export type VoiceSegmentKind = "prompt" | "hint" | "word";
export type FeedbackTone = "success" | "hint" | "continue";

const questionVariantCache = new Map<string, Map<string, number>>();

function getQuestionVariant(
  worldId: number,
  phase: number,
  questionIndex: number | undefined,
  questionId: string | undefined,
): number | undefined {
  if (questionId) {
    const key = `${worldId}:${phase}`;
    let variants = questionVariantCache.get(key);
    if (!variants) {
      variants = new Map(
        getQuestionBank(worldId, phase).map((question, index) => [question.id, index + 1]),
      );
      questionVariantCache.set(key, variants);
    }
    const stableVariant = variants.get(questionId);
    if (stableVariant !== undefined) return stableVariant;

    const suffix = questionId.match(/-(\d+)$/)?.[1];
    const idVariant = suffix ? Number(suffix) : undefined;
    if (idVariant !== undefined && idVariant >= 1 && idVariant <= 8) return idVariant;
  }

  if (questionIndex !== undefined && questionIndex >= 0 && questionIndex < 8) {
    return questionIndex + 1;
  }
  return undefined;
}

/** Resolve uma faixa Leda individual pela pergunta original, mesmo após embaralhar a fila. */
export function voicePackPath(
  worldId: number | undefined,
  phase: number | undefined,
  questionIndex: number | undefined,
  kind: VoiceSegmentKind,
  questionId?: string,
): string | undefined {
  if (
    worldId === undefined || worldId < 0 || worldId > 6 ||
    phase === undefined || phase < 0 || phase > 7
  ) return undefined;
  if ((worldId === 5 || worldId === 6) && kind === "prompt") return undefined;

  const variant = getQuestionVariant(worldId, phase, questionIndex, questionId);
  if (variant === undefined) return undefined;

  const legacyWav =
    (phase === 0 && (worldId === 3 || worldId === 4) && kind !== "word") ||
    (phase === 0 && (worldId === 5 || worldId === 6) && kind !== "prompt");
  const extension = legacyWav ? "wav" : "mp3";
  return `/assets/voicepacks/w${worldId}-phase${phase + 1}/${kind}-${variant}.${extension}`;
}

/** Faixas globais de feedback Leda, compartilhadas por todas as fases e telas. */
export function feedbackVoicePath(
  _worldId: number | undefined,
  _phase: number | undefined,
  tone: FeedbackTone,
): string | undefined {
  if (tone === "success") return "/assets/voicepacks/feedback/success.wav";
  if (tone === "continue") return "/assets/voicepacks/feedback/encouragement.wav";
  return undefined;
}
