import assert from "node:assert/strict";
import { test } from "node:test";
import ExcelJS from "exceljs";
import { buildAnswerDetails, buildStudentSummaries, type ReportStudent } from "../client/src/components/studentReports.ts";
import { createStudentsWorkbook } from "../client/src/components/studentsExcel.ts";
import { createStudentsPdf } from "../client/src/components/studentsPdf.ts";

const worlds = ["Mundo da Garatuja", "Mundo das Sílabas"];
const students: ReportStudent[] = [
  {
    id: "aluno-ana",
    profile: { name: "Ana Júlia", currentWorld: 0, xp: 84, petName: "Lumi" },
    completions: { "0:0": { score: 7, total: 8, date: "2026-10-20T12:00:00.000Z" }, "0:1": { score: 6, total: 8, date: "2026-10-21T12:00:00.000Z" } },
    answers: [
      { question: "Qual letra começa a palavra?", answer: "A", correct: true, worldId: 0, phase: 0, at: "2026-10-27T12:00:00.000Z", correctAnswer: "A" },
      { question: "Qual letra termina a palavra?", answer: "B", correct: false, usedHint: true, worldId: 0, phase: 1, at: "2026-10-27T12:05:00.000Z", correctAnswer: "C" },
      { question: "Separe em sílabas", answer: "CA-SA", correct: true, worldId: 1, phase: 0, at: "2026-10-27T12:10:00.000Z", correctAnswer: "CA-SA" },
    ],
    updatedAt: "2026-10-27T12:15:00.000Z",
  },
  {
    id: "aluno-joao",
    profile: { name: "João", currentWorld: 1, xp: 32, petName: "Pipoca" },
    completions: { "1:0": { score: 5, total: 8, date: "2026-10-22T12:00:00.000Z" } },
    answers: [],
    updatedAt: "data inválida",
  },
];

test("gera resumo de cada aluno com conclusão e aproveitamento do mundo atual", () => {
  const [ana, joao] = buildStudentSummaries(students, worlds);
  assert.equal(ana.name, "Ana Júlia");
  assert.equal(ana.worldName, "Mundo da Garatuja");
  assert.equal(ana.completedPhases, 2);
  assert.equal(ana.accuracy, 50);
  assert.equal(ana.answerCount, 3);
  assert.equal(ana.updatedAt?.toISOString(), "2026-10-27T12:15:00.000Z");
  assert.equal(joao.completedPhases, 1);
  assert.equal(joao.accuracy, 0);
  assert.equal(joao.updatedAt, null);
});

test("organiza o histórico de respostas com resultado, dica e horário", () => {
  const details = buildAnswerDetails(students, worlds);
  assert.equal(details.length, 3);
  assert.equal(details[0].student, "Ana Júlia");
  assert.equal(details[0].result, "Acerto");
  assert.equal(details[1].result, "Erro com dica");
  assert.equal(details[1].usedHint, "Sim");
  assert.equal(details[2].world, "Mundo das Sílabas");
  assert.equal(details[2].expectedAnswer, "CA-SA");
});

test("cria XLSX válido com abas, cabeçalhos, registros e filtros", async () => {
  const bytes = await createStudentsWorkbook(students, worlds, new Date("2026-10-27T12:20:00.000Z"));
  assert.ok(bytes.length > 2_000);
  assert.equal(String.fromCharCode(...bytes.subarray(0, 2)), "PK");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(bytes));
  assert.deepEqual(workbook.worksheets.map((sheet) => sheet.name), ["Resumo da turma", "Respostas"]);

  const summary = workbook.getWorksheet("Resumo da turma")!;
  assert.equal(summary.getCell("A4").value, "Aluno");
  assert.equal(summary.getCell("D4").value, "Aproveitamento no mundo atual");
  assert.equal(summary.getCell("A5").value, "Ana Júlia");
  assert.equal(summary.getCell("D5").value, 50);
  assert.equal(summary.autoFilter, "A4:H6");
  assert.equal(summary.views[0]?.state, "frozen");

  const answers = workbook.getWorksheet("Respostas")!;
  assert.equal(answers.getCell("A5").value, "Ana Júlia");
  assert.equal(answers.getCell("G6").value, "Erro com dica");
  assert.equal(answers.rowCount, 7);
});

test("cria PDF válido com resumo e seção de respostas, inclusive sem dados", () => {
  const pdf = createStudentsPdf(students, worlds, new Date("2026-10-27T12:20:00.000Z"));
  const output = new Uint8Array(pdf.output("arraybuffer"));
  assert.equal(new TextDecoder().decode(output.subarray(0, 5)), "%PDF-");
  assert.ok(pdf.internal.getNumberOfPages() >= 2);

  const emptyPdf = createStudentsPdf([], worlds, new Date("2026-10-27T12:20:00.000Z"));
  assert.equal(new TextDecoder().decode(new Uint8Array(emptyPdf.output("arraybuffer")).subarray(0, 5)), "%PDF-");
});
