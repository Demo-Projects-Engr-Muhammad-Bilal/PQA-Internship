import type { Metadata } from "next";
import { Inter, Geist, Raleway } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts"; // Removed ThemeProvider and ModeToggle
import "./globals.css";
import { cn } from "@repo/utils";

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'});

const PILOT_API_URL = process.env.NEXT_PUBLIC_PILOT_API_URL || "/api";

// Using Inter for a highly professional, clean, and modern UI
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PQA PILOT APP",
  description: "Pilot Flight Operations Portal",
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
      <body className="min-h-full flex flex-col text-foreground bg-background">
        <AuthProvider apiBaseUrl={PILOT_API_URL} portal="pilot">
          {/* ModeToggle has been completely removed */}
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}



