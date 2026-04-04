import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "전기짱",
  description: "전기 박사와 기술사들이 검증한 CBT 문제",
  openGraph: {
    title: "전기짱",
    description: "전기 박사와 기술사들이 검증한 CBT 문제",
    siteName: "전기짱",
    url: "https://www.mycbt.xyz",
    images: [
      {
        url: "https://www.mycbt.xyz/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* DdakDanDan 히어로 폰트: preload로 최우선 다운로드 */}
        <link
          rel="preload"
          href="/fonts/ddakdandan.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {/* Pretendard: preload + stylesheet */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* KaTeX CSS: 비동기 로드 (수학 표기가 없는 페이지에서 렌더 블로킹 방지) */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.28/dist/katex.min.css"
          as="style"
          crossOrigin="anonymous"
        />
        <Script
          id="katex-css-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var l = document.createElement('link');
              l.rel = 'stylesheet';
              l.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.28/dist/katex.min.css';
              l.crossOrigin = 'anonymous';
              document.head.appendChild(l);
            `,
          }}
        />
        {/* Google Fonts: preconnect + display=swap */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&family=Nanum+Pen+Script&display=swap"
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
