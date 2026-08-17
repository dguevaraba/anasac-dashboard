import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function LivePanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
