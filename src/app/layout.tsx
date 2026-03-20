import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Toolbox - Convertisseurs en ligne",
  description:
    "Convertissez vos vidéos YouTube en MP3/MP4 et vos images en différents formats gratuitement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-[var(--border)] mt-20 py-8 text-center text-sm text-neutral-500">
          <p>Toolbox &copy; {new Date().getFullYear()} — Tous droits réservés</p>
          <p className="mt-1">Aucune donnée n&apos;est stockée sur nos serveurs.</p>
        </footer>
      </body>
    </html>
  );
}
