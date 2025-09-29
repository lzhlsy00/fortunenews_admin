import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FortuneNews Admin",
  description: "Manage FortuneNews content",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
