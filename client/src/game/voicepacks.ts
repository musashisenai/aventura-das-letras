export type VoiceSegmentKind = "prompt" | "hint" | "word";
export type FeedbackTone = "success" | "hint" | "continue";

const phaseOneFolders: Record<number, string> = {
  3: "w3-phase1",
  4: "w4-phase1",
  5: "w5-phase1",
  6: "w6-phase1",
};

/** Resolve uma faixa individual pelo identificador estável da descoberta. */
export function voicePackPath(
  worldId: number | undefined,
  phase: number | undefined,
  questionIndex: number | undefined,
  kind: VoiceSegmentKind,
  questionId?: string,
): string | undefined {
  const idVariant = questionId?.match(/-(\d+)$/)?.[1];
  const variant = idVariant ? Number(idVariant) : questionIndex !== undefined ? questionIndex + 1 : undefined;
  if (phase !== 0 || variant === undefined || variant < 1 || variant > 8) return undefined;

  const folder = phaseOneFolders[worldId ?? -1];
  if (!folder) return undefined;
  if ((worldId === 5 || worldId === 6) && kind === "prompt") return undefined;
  if ((worldId === 3 || worldId === 4) && kind === "word") return undefined;

  return `/assets/voicepacks/${folder}/${kind}-${variant}.wav`;
}

/** Faixas globais de feedback já gravadas pela voz Leda. */
export function feedbackVoicePath(
  worldId: number | undefined,
  phase: number | undefined,
  tone: FeedbackTone,
): string | undefined {
  if (phase !== 0 || ![3, 5, 6].includes(worldId ?? -1)) return undefined;
  if (tone === "success") return "/assets/voicepacks/feedback/success.wav";
  if (tone === "continue") return "/assets/voicepacks/feedback/encouragement.wav";
  return undefined;
}
