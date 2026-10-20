import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import PwaRegister from "./pwa-register";

export const metadata: Metadata = {
  title: "Réservations du terrain",
  description: "Gestion privée des réservations d'un terrain de football.",
  robots: { index: false, follow: false },
  applicationName: "Football Field Manager",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Football",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f172a" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
