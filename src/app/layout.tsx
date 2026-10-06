import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "GENZ BLING NAVRATRI 2026 | Garba, Dandiya & Matchmaking",
  description: "Pune's most hyped Navratri festival on 17th October 2026 at Noupark Turf, Narhe. Garba, Dandiya, Live Music, DJ and secret 24-hour partner matchmaking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`font-sans antialiased min-h-screen`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
