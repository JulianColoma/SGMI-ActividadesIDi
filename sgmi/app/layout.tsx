import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SGMI",
  description: "SISTEMA DE GESTIÓN DE MEMORIAS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/x-icon" href="/images/logo.svg"></link>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}