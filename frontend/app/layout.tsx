import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/hooks/useAuth";
import ViewportVars from "@/components/ViewportVars"; // <— add this

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "Qopchiq.uz - Your Financial & Health Buddy",
  description: "Track expenses and health habits with emoji-driven design for Uzbekistan users",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Qopchiq.uz" },
  generator: "akilhan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Load Telegram early */}
        <Script src="https://telegram.org/js/telegram-web-app.js?58" strategy="beforeInteractive" />
        {/* Pre-set CSS vars before hydration so layout is stable */}
        <Script id="tg-pre-vars" strategy="beforeInteractive">{`
          (function () {
            try {
              var w = window.Telegram && window.Telegram.WebApp;
              var h = (w && (w.viewportHeight || w.viewportStableHeight)) || window.innerHeight;
              var d = document.documentElement;
              d.style.setProperty('--tg-viewport-height', h + 'px');
              d.style.setProperty('--tg-viewport-stable-height', h + 'px');
            } catch (e) {}
          })();
        `}</Script>

        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ViewportVars /> {/* keep vars updated after mount */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
