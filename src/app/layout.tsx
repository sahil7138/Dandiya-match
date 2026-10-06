import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Dandiya Match | Event Registration",
  description: "One Night. One Random Partner. One Dandiya Memory.",
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
