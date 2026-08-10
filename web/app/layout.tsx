import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";
import type { ReactNode } from "react";
import content from "../content/site-content.json";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const deploymentHost =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_VERCEL_URL;

export const metadata: Metadata = {
  metadataBase: new URL(deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000"),
  title: content.meta.title,
  description: content.meta.description,
  applicationName: content.meta.title,
  category: "portfolio",
  openGraph: {
    title: content.meta.title,
    description: content.meta.description,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: content.meta.title,
    description: content.meta.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${archivo.variable} ${inter.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
