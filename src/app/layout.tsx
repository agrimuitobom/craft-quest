import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";
import { AppHeader } from "@/components/AppHeader";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "クラフトクエスト | マイクラEE プログラミング冒険",
  description: "Minecraft Education と一緒に使う、クエスト型プログラミング学習アプリ",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1e2126" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DotGothic16&family=M+PLUS+Rounded+1c:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ProgressProvider>
          <AuthGate>
            <AppHeader />
            <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4">{children}</main>
          </AuthGate>
        </ProgressProvider>
      </body>
    </html>
  );
}
