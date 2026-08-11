import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAnalyticsQueryString } from "@/components/guru/analytics-filters";

export function AnalyticsExportButtons({
  classId,
  quizId,
  from,
  to,
}: {
  classId: string;
  quizId: string;
  from: string;
  to: string;
}) {
  const query = buildAnalyticsQueryString({
    classId: classId || undefined,
    quizId: quizId || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`/api/guru/analitik/export/excel${query}`} download>
        <Button type="button" variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
      </a>
      <a href={`/api/guru/analitik/export/pdf${query}`} download>
        <Button type="button" variant="outline" size="sm">
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>
      </a>
    </div>
  );
}