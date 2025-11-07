import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import ShellGuard from "../components/layout/ShellGuard";
import { AuthProvider } from "@/lib/auth/authContext";
import { AuthMiddleware } from "@/lib/auth/authMiddleware";

export const metadata: Metadata = {
  title: "FinWave | Fisheries Operations Platform",
  description:
    "Manage fisheries operations, inventory, orders, and clients with FinWave.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <AuthProvider>
          <AuthMiddleware>
            <ShellGuard>{children}</ShellGuard>
          </AuthMiddleware>
        </AuthProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}