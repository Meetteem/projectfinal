import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Secure Notes Vault",
  description: "Encrypted notes, reminders, and notifications with AI summarization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" style={{
      "--font-body": "'Segoe UI', ui-sans-serif, system-ui, sans-serif",
      "--font-display": "'Trebuchet MS', ui-sans-serif, system-ui, sans-serif",
    } as React.CSSProperties}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
