import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VidaRecord — Tu historial médico",
  description:
    "Organiza tu historial médico personal y familiar en un solo lugar. Tu historial médico. Siempre contigo.",
  appleWebApp: {
    capable: true,
    title: "VidaRecord",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E40AF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
