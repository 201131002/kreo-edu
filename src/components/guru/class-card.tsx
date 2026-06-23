import Link from "next/link";
import { BookOpen, FileText, Gamepad2, Users } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ClassCard({
  id,
  title,
  description,
  enrollments,
  materials,
  quizzes,
}: {
  id: string;
  title: string;
  description: string | null;
  enrollments: number;
  materials: number;
  quizzes: number;
}) {
  return (
    <Card className="flex flex-col transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tertiary/10">
          <BookOpen className="h-5 w-5 text-tertiary" />
        </div>
        <Badge variant="tertiary">{quizzes} Kuis</Badge>
      </div>

      <CardTitle className="line-clamp-1">{title}</CardTitle>
      <CardDescription className="mt-1 line-clamp-2">
        {description ?? "Belum ada deskripsi"}
      </CardDescription>

      <div className="mt-4 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {enrollments} siswa
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {materials} materi
        </span>
        <span className="flex items-center gap-1">
          <Gamepad2 className="h-3.5 w-3.5" />
          {quizzes} kuis
        </span>
      </div>

      <Link href={`/guru/kelas/${id}`} className="mt-5">
        <Button variant="tertiary" size="sm" className="w-full">
          Kelola Kelas
        </Button>
      </Link>
    </Card>
  );
}