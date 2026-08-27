import type { AdminAnalyticsSummary } from "@/lib/admin-analytics";

export const ADMIN_EXPORT_FILENAME_BASE = "analitik-admin-kreo";

export {
  getAuthorizedAdminAnalytics,
} from "@/lib/guru-analytics-export-auth";

export type AdminExportContext = {
  summary: AdminAnalyticsSummary;
  adminName: string;
};
