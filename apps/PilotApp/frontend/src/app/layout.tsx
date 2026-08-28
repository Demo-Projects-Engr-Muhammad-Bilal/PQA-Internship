import type { Metadata } from "next";
import { Raleway, Roboto } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider, ModeToggle, AuthProvider } from "@repo/ui";
import "./globals.css";

const PILOT_API_URL = process.env.NEXT_PUBLIC_PILOT_API_URL || "http://localhost:5000";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
      className={`${raleway.variable} ${roboto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Removed bg-background and added the background image properties here */}
      <body className="min-h-full flex flex-col text-foreground bg-custom-image bg-cover bg-center bg-no-repeat bg-fixed">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider apiBaseUrl={PILOT_API_URL} portal="pilot">
            <div className="fixed top-4 right-4 z-50">
              <ModeToggle />
            </div>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}