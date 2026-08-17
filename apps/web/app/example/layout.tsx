import { AppProviders } from "@/lib/auth/providers";

export default function ExampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders basePath="/example" authMode="mock">
      {children}
    </AppProviders>
  );
}
