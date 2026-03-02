import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Riyan's Dash - Medical Exam Prep Dashboard",
  description: "Personal medical exam preparation dashboard for MBBS students. Track progress, manage study schedules, and ace your exams.",
  keywords: ["Medical Exam", "MBBS", "Study Dashboard", "Exam Preparation", "Medical Student"],
  authors: [{ name: "Riyan" }],
  icons: {
    icon: "/robot-logo.png",
  },
  openGraph: {
    title: "Riyan's Dash",
    description: "Medical Exam Preparation Dashboard",
    url: "https://riyans-dash.app",
    siteName: "Riyan's Dash",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Riyan's Dash",
    description: "Medical Exam Preparation Dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
