import { describe, expect, it } from "vitest";
import { parseAikenFile } from "./aiken-parser";

const VALID_SINGLE = `Berapa hasil dari 2 + 2?
A. 3
B. 4
C. 5
D. 6
ANSWER: B`;

const VALID_MULTIPLE = `${VALID_SINGLE}

Siapa penemu bola lampu?
A. Edison
B. Newton
C. Einstein
D. Darwin
ANSWER: A`;

describe("parseAikenFile", () => {
  it("parses a valid single question", () => {
    const result = parseAikenFile(VALID_SINGLE);

    expect(result.errors).toHaveLength(0);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0]).toEqual({
      questionText: "Berapa hasil dari 2 + 2?",
      optionA: "3",
      optionB: "4",
      optionC: "5",
      optionD: "6",
      correctOption: "B",
    });
  });

  it("parses multiple questions separated by blank lines", () => {
    const result = parseAikenFile(VALID_MULTIPLE);

    expect(result.errors).toHaveLength(0);
    expect(result.questions).toHaveLength(2);
    expect(result.questions[1].correctOption).toBe("A");
  });

  it("handles extra spaces around options and answer", () => {
    const content = `  Pertanyaan dengan spasi?  
A.   Opsi A  
B. Opsi B
C. Opsi C
D. Opsi D
ANSWER:   C  `;

    const result = parseAikenFile(content);

    expect(result.errors).toHaveLength(0);
    expect(result.questions[0].correctOption).toBe("C");
    expect(result.questions[0].optionA).toBe("Opsi A");
  });

  it("supports parenthesis option format", () => {
    const content = `Pilih jawaban benar
A) Satu
B) Dua
C) Tiga
D) Empat
ANSWER: D`;

    const result = parseAikenFile(content);

    expect(result.errors).toHaveLength(0);
    expect(result.questions[0].optionD).toBe("Empat");
  });

  it("reports missing ANSWER line", () => {
    const content = `Tanpa baris jawaban
A. Satu
B. Dua
C. Tiga
D. Empat`;

    const result = parseAikenFile(content);

    expect(result.questions).toHaveLength(0);
    expect(result.errors[0].message).toMatch(/ANSWER/i);
  });

  it("reports invalid ANSWER value", () => {
    const content = `Soal salah jawaban
A. Satu
B. Dua
C. Tiga
D. Empat
ANSWER: Z`;

    const result = parseAikenFile(content);

    expect(result.questions).toHaveLength(0);
    expect(result.errors[0].message).toMatch(/ANSWER/i);
  });

  it("reports missing options", () => {
    const content = `Soal tanpa opsi lengkap
A. Satu
B. Dua
ANSWER: A`;

    const result = parseAikenFile(content);

    expect(result.questions).toHaveLength(0);
    expect(result.errors[0].message).toMatch(/Opsi kurang/i);
  });

  it("reports empty file", () => {
    const result = parseAikenFile("   \n\n  ");

    expect(result.questions).toHaveLength(0);
    expect(result.errors[0].message).toMatch(/kosong/i);
  });

  it("strips UTF-8 BOM from content", () => {
    const result = parseAikenFile(`\uFEFF${VALID_SINGLE}`);

    expect(result.errors).toHaveLength(0);
    expect(result.questions).toHaveLength(1);
  });

  it("collects errors per block while parsing valid blocks", () => {
    const content = `${VALID_SINGLE}

Soal rusak
A. Satu
ANSWER: A

${VALID_SINGLE}`;

    const result = parseAikenFile(content);

    expect(result.questions).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].block).toBe(2);
  });

  it("reports empty question text", () => {
    const content = `A. Satu
B. Dua
C. Tiga
D. Empat
ANSWER: B`;

    const result = parseAikenFile(content);

    expect(result.questions).toHaveLength(0);
    expect(result.errors[0].message).toMatch(/pertanyaan/i);
  });
});