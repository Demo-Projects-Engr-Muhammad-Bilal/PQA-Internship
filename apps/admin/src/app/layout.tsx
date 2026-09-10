import type { Metadata } from "next";
import { Inter, Geist, Raleway } from "next/font/google";
import { AuthProvider } from "@/contexts";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@repo/utils";

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'});

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "/api";

// Using Inter for a strict, highly professional administrative interface
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PQA ADMIN APP",
  description: "Administrative Operations Deck",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "light", inter.variable, "font-sans", raleway.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-foreground">
        <AuthProvider apiBaseUrl={ADMIN_API_URL} portal="admin">
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}



