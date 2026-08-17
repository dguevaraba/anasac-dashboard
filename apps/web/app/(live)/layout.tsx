import { AppProviders } from "@/lib/auth/providers";

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders basePath="" authMode="live">
      {children}
    </AppProviders>
  );
}
