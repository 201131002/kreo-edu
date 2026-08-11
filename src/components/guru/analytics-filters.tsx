import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type ClassOption = { id: string; title: string };
type QuizOption = {
  id: string;
  title: string;
  class: { title: string };
};

export function AnalyticsFilters({
  classes,
  quizzes,
  currentClassId,
  currentQuizId,
  currentFrom,
  currentTo,
}: {
  classes: ClassOption[];
  quizzes: QuizOption[];
  currentClassId: string;
  currentQuizId: string;
  currentFrom: string;
  currentTo: string;
}) {
  return (
    <Card className="mb-8">
      <CardTitle>Filter Analitik</CardTitle>
      <CardDescription>
        Saring data berdasarkan kelas, kuis, dan rentang tanggal percobaan
      </CardDescription>

      <form method="get" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="classId">Kelas</Label>
          <select
            id="classId"
            name="classId"
            defaultValue={currentClassId}
            className="mt-1 w-full rounded-2xl border-2 border-primary/10 bg-white px-4 py-2.5 text-sm"
          >
            <option value="">Semua kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="quizId">Kuis</Label>
          <select
            id="quizId"
            name="quizId"
            defaultValue={currentQuizId}
            className="mt-1 w-full rounded-2xl border-2 border-primary/10 bg-white px-4 py-2.5 text-sm"
          >
            <option value="">Semua kuis</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.class.title} — {quiz.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="from">Dari tanggal</Label>
          <Input
            id="from"
            name="from"
            type="date"
            defaultValue={currentFrom}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="to">Sampai tanggal</Label>
          <Input
            id="to"
            name="to"
            type="date"
            defaultValue={currentTo}
            className="mt-1"
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
          <Button type="submit" size="sm">
            Terapkan Filter
          </Button>
          <Link href="/guru/analitik">
            <Button type="button" variant="outline" size="sm">
              Reset
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  );
}

export function buildAnalyticsQueryString(params: {
  classId?: string;
  quizId?: string;
  from?: string;
  to?: string;
}): string {
  const search = new URLSearchParams();
  if (params.classId) search.set("classId", params.classId);
  if (params.quizId) search.set("quizId", params.quizId);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  const str = search.toString();
  return str ? `?${str}` : "";
}