import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { buildAnswerDetails, buildStudentSummaries, formatReportDate, PHASES_PER_WORLD, type ReportStudent } from "./studentReports";
import { saveReportBlob } from "./reportDownloads";

function drawPdfPageHeader(doc: jsPDF, title: string, section: string, generatedAt: Date) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  doc.setFillColor(22, 79, 64);
  doc.rect(0, 0, width, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, 12, 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(section, 12, 19);
  doc.setTextColor(84, 114, 104);
  doc.setFontSize(8);
  doc.text(`Gerado em ${formatReportDate(generatedAt)}`, width - 12, 19, { align: "right" });
  doc.setDrawColor(225, 235, 229);
  doc.line(12, height - 10, width - 12, height - 10);
  doc.setTextColor(84, 114, 104);
  doc.text("Aventura das Letras · Relatório pedagógico", 12, height - 5);
  doc.text(`Página ${doc.getNumberOfPages()}`, width - 12, height - 5, { align: "right" });
}

export function createStudentsPdf(students: ReportStudent[], worldNames: string[], generatedAt = new Date()): jsPDF {
  const title = students.length === 1 ? `Relatório de ${students[0].profile.name || "aluno"}` : "Relatório da turma";
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setProperties({ title, subject: "Acompanhamento de aprendizagem da turma", creator: "Aventura das Letras" });

  const summaries = buildStudentSummaries(students, worldNames);
  autoTable(doc, {
    head: [["Aluno", "Mundo atual", "Fases", "Aproveitamento", "Respostas", "Pet", "XP", "Atualização"]],
    body: summaries.length ? summaries.map((item) => [item.name, `${item.worldName} (${item.worldNumber})`, `${item.completedPhases}/${PHASES_PER_WORLD}`, `${item.accuracy}%`, String(item.answerCount), item.pet, String(item.xp), formatReportDate(item.updatedAt)]) : [["Nenhum aluno conectado.", "-", "-", "-", "-", "-", "-", "-"]],
    startY: 32,
    margin: { top: 32, bottom: 15, left: 12, right: 12 },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5, overflow: "linebreak", textColor: [43, 65, 57] },
    headStyles: { fillColor: [29, 107, 83], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 247, 243] },
    columnStyles: { 0: { cellWidth: 37 }, 1: { cellWidth: 42 }, 2: { cellWidth: 18 }, 3: { cellWidth: 25 }, 4: { cellWidth: 21 }, 5: { cellWidth: 27 }, 6: { cellWidth: 15 }, 7: { cellWidth: "auto" } },
    didDrawPage: () => drawPdfPageHeader(doc, title, `Resumo da turma · ${students.length} aluno(s)`, generatedAt),
  });

  doc.addPage();
  const details = buildAnswerDetails(students, worldNames);
  autoTable(doc, {
    head: [["Aluno", "Mundo / fase", "Pergunta", "Resposta da criança", "Resposta esperada", "Resultado", "Dica", "Data e hora"]],
    body: details.length ? details.map((item) => [item.student, `${item.world} / ${item.phase}`, item.question, item.response, item.expectedAnswer, item.result, item.usedHint, formatReportDate(item.answeredAt)]) : [["Sem respostas registradas.", "-", "-", "-", "-", "-", "-", "-"]],
    startY: 32,
    margin: { top: 32, bottom: 15, left: 12, right: 12 },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, overflow: "linebreak", textColor: [43, 65, 57] },
    headStyles: { fillColor: [29, 107, 83], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 247, 243] },
    columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 30 }, 2: { cellWidth: 48 }, 3: { cellWidth: 36 }, 4: { cellWidth: 36 }, 5: { cellWidth: 25 }, 6: { cellWidth: 13 }, 7: { cellWidth: "auto" } },
    didDrawPage: () => drawPdfPageHeader(doc, title, "Histórico de respostas", generatedAt),
  });
  return doc;
}

export function downloadStudentsPdf(students: ReportStudent[], worldNames: string[]) {
  const blob = createStudentsPdf(students, worldNames).output("blob");
  saveReportBlob(blob, "relatorio-da-turma.pdf");
}
