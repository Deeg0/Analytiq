import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AnalytIQ - AI-Powered Scientific Study Analysis",
  description: "AI-powered analysis of scientific research credibility, bias, and reliability",
  icons: {
    icon: [
      { url: '/assets/AnalytIQlogo.png', sizes: 'any' },
      { url: '/assets/AnalytIQlogo.png', type: 'image/png' },
    ],
    apple: '/assets/AnalytIQlogo.png',
    shortcut: '/assets/AnalytIQlogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
