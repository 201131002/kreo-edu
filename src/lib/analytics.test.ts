import { describe, expect, it, vi } from "vitest";

// guru-analytics mengimpor prisma di level modul; fungsi yang dites murni,
// jadi modul prisma di-mock agar tidak butuh DATABASE_URL / koneksi DB.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { getWeekStartKey, parseAnalyticsFilters } from "@/lib/guru-analytics";
import { parseAnswersJson, type StoredAnswer } from "@/lib/quiz-attempt";
import { buildAnalyticsQueryString } from "@/components/guru/analytics-filters";

// Agustus 2026: 16 = Minggu, 19 = Rabu, 21 = Jumat, 22 = Sabtu, 23 = Minggu.
describe("getWeekStartKey", () => {
  it("memetakan hari apa pun dalam pekan ke awal pekan Minggu yang sama", () => {
    const wednesday = new Date(2026, 7, 19); // Rabu
    const friday = new Date(2026, 7, 21); // Jumat
    const sunday = new Date(2026, 7, 16); // Minggu

    expect(getWeekStartKey(wednesday)).toBe(getWeekStartKey(sunday));
    expect(getWeekStartKey(friday)).toBe(getWeekStartKey(sunday));
  });

  it("mengembalikan dirinya sendiri untuk hari Minggu", () => {
    const sundayMidnight = new Date(2026, 7, 16);
    const sundayEvening = new Date(2026, 7, 16, 20, 45);

    expect(getWeekStartKey(sundayEvening)).toBe(getWeekStartKey(sundayMidnight));
  });

  it("memisahkan tanggal dari pekan berbeda", () => {
    const saturday = new Date(2026, 7, 22); // akhir pekan sebelumnya
    const nextSunday = new Date(2026, 7, 23); // awal pekan baru

    expect(getWeekStartKey(saturday)).not.toBe(getWeekStartKey(nextSunday));
  });

  it("hasilnya bisa di-parse kembali ke Date tengah malam lokal pada hari Minggu", () => {
    const wednesday = new Date(2026, 7, 19, 14, 30);

    const restored = new Date(getWeekStartKey(wednesday));

    expect(restored.getHours()).toBe(0);
    expect(restored.getMinutes()).toBe(0);
    expect(restored.getSeconds()).toBe(0);
    expect(restored.getMilliseconds()).toBe(0);
    expect(restored.getDay()).toBe(0); // Minggu
  });
});

describe("parseAnswersJson", () => {
  it("mengembalikan array kosong untuk null, undefined, dan string kosong", () => {
    expect(parseAnswersJson(null)).toEqual([]);
    expect(parseAnswersJson(undefined)).toEqual([]);
    expect(parseAnswersJson("")).toEqual([]);
  });

  it("mengembalikan array kosong untuk string bukan JSON", () => {
    expect(parseAnswersJson("bukan json {{{")).toEqual([]);
  });

  it("mengembalikan array kosong untuk JSON non-array", () => {
    expect(parseAnswersJson('{"questionId": "q1"}')).toEqual([]);
    expect(parseAnswersJson('"string"')).toEqual([]);
    expect(parseAnswersJson("42")).toEqual([]);
  });

  it("mem-parse array valid menjadi StoredAnswer[]", () => {
    const raw = JSON.stringify([
      {
        questionId: "q1",
        selected: "B",
        correct: true,
        questionText: "2 + 2?",
        correctOption: "B",
      },
      {
        questionId: "q2",
        selected: null,
        correct: false,
        questionText: "3 + 3?",
      },
    ]);

    const result: StoredAnswer[] = parseAnswersJson(raw);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      questionId: "q1",
      selected: "B",
      correct: true,
    });
    expect(result[1].selected).toBeNull();
  });
});

describe("parseAnalyticsFilters", () => {
  it("mengembalikan objek kosong untuk searchParams kosong", () => {
    expect(parseAnalyticsFilters({})).toEqual({});
  });

  it("menyalin classId dan quizId apa adanya", () => {
    const filters = parseAnalyticsFilters({
      classId: "cls-1",
      quizId: "quiz-9",
    });

    expect(filters.classId).toBe("cls-1");
    expect(filters.quizId).toBe("quiz-9");
    expect(filters.dateFrom).toBeUndefined();
    expect(filters.dateTo).toBeUndefined();
  });

  it("mem-parse from/to valid menjadi Date", () => {
    const filters = parseAnalyticsFilters({
      from: "2026-08-01",
      to: "2026-08-31",
    });

    // from dinormalisasi ke tengah malam lokal (bukan UTC) agar batas awal
    // konsisten dengan batas akhir hari, apa pun zona waktu server.
    expect(filters.dateFrom?.getFullYear()).toBe(2026);
    expect(filters.dateFrom?.getMonth()).toBe(7);
    expect(filters.dateFrom?.getDate()).toBe(1);
    expect(filters.dateFrom?.getHours()).toBe(0);
    expect(filters.dateFrom?.getMinutes()).toBe(0);
    expect(filters.dateFrom?.getSeconds()).toBe(0);
    expect(filters.dateTo).toEqual(new Date("2026-08-31"));
  });

  it("mengabaikan from/to invalid", () => {
    const filters = parseAnalyticsFilters({
      classId: "cls-1",
      from: "not-a-date",
      to: "not-a-date",
    });

    expect(filters.classId).toBe("cls-1");
    expect(filters.dateFrom).toBeUndefined();
    expect(filters.dateTo).toBeUndefined();
  });
});

describe("buildAnalyticsQueryString", () => {
  it("mengembalikan string kosong saat semua parameter kosong", () => {
    expect(buildAnalyticsQueryString({})).toBe("");
    expect(
      buildAnalyticsQueryString({ classId: "", quizId: "", from: "", to: "" })
    ).toBe("");
  });

  it("hanya menyertakan parameter yang diisi, urut sesuai urutan set", () => {
    expect(buildAnalyticsQueryString({ classId: "x", from: "y" })).toBe(
      "?classId=x&from=y"
    );
    expect(buildAnalyticsQueryString({ quizId: "q1" })).toBe("?quizId=q1");
  });

  it("menyusun query lengkap dengan urutan classId, quizId, from, to", () => {
    expect(
      buildAnalyticsQueryString({
        classId: "cls-1",
        quizId: "quiz-1",
        from: "2026-08-01",
        to: "2026-08-31",
      })
    ).toBe("?classId=cls-1&quizId=quiz-1&from=2026-08-01&to=2026-08-31");
  });
});
