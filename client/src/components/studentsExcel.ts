import ExcelJS from "exceljs";
import { buildAnswerDetails, buildStudentSummaries, formatReportDate, type ReportStudent } from "./studentReports";
import { saveReportBlob } from "./reportDownloads";

function styleWorksheetHeader(sheet: ExcelJS.Worksheet, rowNumber: number, columnCount: number) {
  const row = sheet.getRow(rowNumber);
  row.height = 28;
  row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
    if (columnNumber > columnCount) return;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D6B53" } };
    cell.font = { name: "Aptos", bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = { bottom: { style: "medium", color: { argb: "FFFFC857" } } };
  });
}

function prepareWorksheet(sheet: ExcelJS.Worksheet, title: string, generatedAt: Date, headers: string[]) {
  const lastColumn = headers.length;
  sheet.mergeCells(1, 1, 1, lastColumn);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF164F40" } };
  titleCell.font = { name: "Aptos Display", bold: true, color: { argb: "FFFFFFFF" }, size: 16 };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 34;

  sheet.mergeCells(2, 1, 2, lastColumn);
  const metadataCell = sheet.getCell(2, 1);
  metadataCell.value = `Gerado em ${formatReportDate(generatedAt)} · Acurácia calculada sobre as respostas do mundo atual.`;
  metadataCell.font = { name: "Aptos", italic: true, color: { argb: "FF547268" }, size: 10 };
  metadataCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(2).height = 22;
  sheet.addRow([]);
  sheet.addRow(headers);
  styleWorksheetHeader(sheet, 4, lastColumn);
  sheet.views = [{ state: "frozen", ySplit: 4 }];
  sheet.properties.defaultRowHeight = 20;
}

export async function createStudentsWorkbook(students: ReportStudent[], worldNames: string[], generatedAt = new Date()): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Aventura das Letras";
  workbook.subject = "Relatório de acompanhamento da turma";
  workbook.title = "Relatório da turma";
  workbook.created = generatedAt;
  workbook.modified = generatedAt;

  const summaries = buildStudentSummaries(students, worldNames);
  const summaryHeaders = ["Aluno", "Mundo atual", "Fases concluídas no mundo atual", "Aproveitamento no mundo atual", "Respostas registradas", "Pet", "XP", "Última atualização"];
  const summary = workbook.addWorksheet("Resumo da turma");
  prepareWorksheet(summary, "Relatório da turma", generatedAt, summaryHeaders);
  [28, 22, 25, 25, 22, 20, 12, 23].forEach((width, index) => { summary.getColumn(index + 1).width = width; });
  if (!summaries.length) {
    summary.mergeCells(5, 1, 5, summaryHeaders.length);
    summary.getCell(5, 1).value = "Nenhum aluno conectado.";
    summary.getCell(5, 1).font = { italic: true, color: { argb: "FF547268" } };
  } else {
    for (const item of summaries) {
      summary.addRow([item.name, `${item.worldName} (${item.worldNumber})`, item.completedPhases, item.accuracy, item.answerCount, item.pet, item.xp, item.updatedAt]);
    }
    for (let rowIndex = 5; rowIndex <= summary.rowCount; rowIndex += 1) {
      const row = summary.getRow(rowIndex);
      row.alignment = { vertical: "middle", wrapText: true };
      if (rowIndex % 2 === 0) row.eachCell({ includeEmpty: true }, (cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F7F3" } }; });
      row.getCell(4).numFmt = '0"%"';
      row.getCell(8).numFmt = "dd/mm/yyyy hh:mm";
    }
  }
  summary.autoFilter = { from: "A4", to: `H${Math.max(4, summary.rowCount)}` };

  const answerRows = buildAnswerDetails(students, worldNames);
  const answerHeaders = ["Aluno", "Mundo", "Fase", "Pergunta", "Resposta da criança", "Resposta esperada", "Resultado", "Dica usada", "Data e hora"];
  const answerSheet = workbook.addWorksheet("Respostas");
  prepareWorksheet(answerSheet, "Histórico de respostas", generatedAt, answerHeaders);
  [24, 20, 10, 42, 28, 28, 19, 13, 23].forEach((width, index) => { answerSheet.getColumn(index + 1).width = width; });
  if (!answerRows.length) {
    answerSheet.mergeCells(5, 1, 5, answerHeaders.length);
    answerSheet.getCell(5, 1).value = "Nenhuma resposta registrada.";
    answerSheet.getCell(5, 1).font = { italic: true, color: { argb: "FF547268" } };
  } else {
    for (const item of answerRows) {
      answerSheet.addRow([item.student, item.world, item.phase, item.question, item.response, item.expectedAnswer, item.result, item.usedHint, item.answeredAt]);
    }
    for (let rowIndex = 5; rowIndex <= answerSheet.rowCount; rowIndex += 1) {
      const row = answerSheet.getRow(rowIndex);
      row.alignment = { vertical: "top", wrapText: true };
      row.height = 32;
      if (rowIndex % 2 === 0) row.eachCell({ includeEmpty: true }, (cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F7F3" } }; });
      row.getCell(9).numFmt = "dd/mm/yyyy hh:mm";
    }
  }
  answerSheet.autoFilter = { from: "A4", to: `I${Math.max(4, answerSheet.rowCount)}` };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}

export async function downloadStudentsExcel(students: ReportStudent[], worldNames: string[]) {
  const bytes = await createStudentsWorkbook(students, worldNames);
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveReportBlob(blob, "relatorio-da-turma.xlsx");
}
