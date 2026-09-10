import { describe, expect, it } from "vitest";
import { deleteConfirmationFor } from "./classroom";
import { normalizeStudentName } from "./db";

describe("classroom safety rules", () => {
  it("normalizes case, accents and repeated spaces for unique names", () => {
    expect(normalizeStudentName("  João   da Silva ")).toBe("joao da silva");
    expect(normalizeStudentName("JOAO DA SILVA")).toBe("joao da silva");
  });

  it("requires the exact second confirmation phrase", () => {
    expect(deleteConfirmationFor("  Ana  ")).toBe("EXCLUIR Ana");
    expect(deleteConfirmationFor("Ana")).not.toBe("EXCLUIR ANA");
  });
});
