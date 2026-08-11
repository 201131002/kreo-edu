export type ParsedAikenQuestion = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
};

export type AikenParseError = {
  block: number;
  line?: number;
  message: string;
};

export type AikenParseResult = {
  questions: ParsedAikenQuestion[];
  errors: AikenParseError[];
};

const OPTION_PATTERN = /^([A-D])[\.\)]\s*(.+)$/i;
const ANSWER_PATTERN = /^ANSWER:\s*([A-D])\s*$/i;

function splitBlocks(content: string): { text: string; startLine: number }[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: { text: string; startLine: number }[] = [];
  let current: string[] = [];
  let blockStart = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    if (line.trim() === "") {
      if (current.length > 0) {
        blocks.push({ text: current.join("\n"), startLine: blockStart });
        current = [];
      }
      continue;
    }

    if (current.length === 0) {
      blockStart = lineNumber;
    }
    current.push(line);
  }

  if (current.length > 0) {
    blocks.push({ text: current.join("\n"), startLine: blockStart });
  }

  return blocks;
}

function parseBlock(
  blockText: string,
  blockIndex: number,
  startLine: number
): { question?: ParsedAikenQuestion; error?: AikenParseError } {
  const lines = blockText.split("\n").map((line) => line.trimEnd());
  const nonEmpty = lines
    .map((line, index) => ({ line, lineNumber: startLine + index }))
    .filter(({ line }) => line.trim() !== "");

  if (nonEmpty.length === 0) {
    return {
      error: {
        block: blockIndex,
        message: "Blok soal kosong",
      },
    };
  }

  let answerLineIndex = -1;
  let correctOption: "A" | "B" | "C" | "D" | null = null;

  for (let i = nonEmpty.length - 1; i >= 0; i--) {
    const match = nonEmpty[i].line.trim().match(ANSWER_PATTERN);
    if (match) {
      answerLineIndex = i;
      correctOption = match[1].toUpperCase() as "A" | "B" | "C" | "D";
      break;
    }
  }

  if (answerLineIndex === -1 || !correctOption) {
    return {
      error: {
        block: blockIndex,
        line: nonEmpty[nonEmpty.length - 1]?.lineNumber,
        message: "Baris ANSWER tidak ditemukan atau format salah (gunakan ANSWER: A/B/C/D)",
      },
    };
  }

  const body = nonEmpty.slice(0, answerLineIndex);
  const options: Partial<Record<"A" | "B" | "C" | "D", string>> = {};
  const questionLines: string[] = [];

  for (const { line, lineNumber } of body) {
    const trimmed = line.trim();
    const optionMatch = trimmed.match(OPTION_PATTERN);

    if (optionMatch) {
      const key = optionMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
      const text = optionMatch[2].trim();

      if (!text) {
        return {
          error: {
            block: blockIndex,
            line: lineNumber,
            message: `Opsi ${key} tidak boleh kosong`,
          },
        };
      }

      if (options[key]) {
        return {
          error: {
            block: blockIndex,
            line: lineNumber,
            message: `Opsi ${key} terduplikasi`,
          },
        };
      }

      options[key] = text;
    } else {
      questionLines.push(trimmed);
    }
  }

  const requiredOptions = ["A", "B", "C", "D"] as const;
  const missing = requiredOptions.filter((key) => !options[key]);

  if (missing.length > 0) {
    return {
      error: {
        block: blockIndex,
        message: `Opsi kurang: ${missing.join(", ")}`,
      },
    };
  }

  const questionText = questionLines.join(" ").trim();

  if (!questionText) {
    return {
      error: {
        block: blockIndex,
        line: body[0]?.lineNumber,
        message: "Teks pertanyaan tidak boleh kosong",
      },
    };
  }

  if (!options[correctOption]) {
    return {
      error: {
        block: blockIndex,
        line: nonEmpty[answerLineIndex].lineNumber,
        message: `ANSWER: ${correctOption} tidak cocok dengan opsi yang tersedia`,
      },
    };
  }

  return {
    question: {
      questionText,
      optionA: options.A!,
      optionB: options.B!,
      optionC: options.C!,
      optionD: options.D!,
      correctOption,
    },
  };
}

export function parseAikenFile(content: string): AikenParseResult {
  const normalized = content.replace(/^\uFEFF/, "").trim();

  if (!normalized) {
    return {
      questions: [],
      errors: [{ block: 0, message: "File kosong atau tidak berisi soal" }],
    };
  }

  const blocks = splitBlocks(normalized);

  if (blocks.length === 0) {
    return {
      questions: [],
      errors: [{ block: 0, message: "File kosong atau tidak berisi soal" }],
    };
  }

  const questions: ParsedAikenQuestion[] = [];
  const errors: AikenParseError[] = [];

  blocks.forEach((block, index) => {
    const blockNumber = index + 1;
    const result = parseBlock(block.text, blockNumber, block.startLine);

    if (result.error) {
      errors.push(result.error);
    } else if (result.question) {
      questions.push(result.question);
    }
  });

  return { questions, errors };
}