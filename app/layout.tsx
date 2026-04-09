import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Serif_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";

/* ── next/font/local: NanumSquareNeo Heavy (weight 900 only) ── */
const nanumSquareNeo = localFont({
  src: "../public/fonts/NanumSquareNeo-eHv.woff2",
  weight: "900",
  variable: "--font-square-neo",
  display: "swap",
  preload: true,
});

/* ── next/font/google: Noto Serif KR (제목용 프리미엄 세리프) ── */
const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAYSON",
  description: "기능사부터 기능장까지, 전문가가 검증한 자격증 시험 플랫폼",
  openGraph: {
    title: "CAYSON",
    description: "기능사부터 기능장까지, 전문가가 검증한 자격증 시험 플랫폼",
    siteName: "CAYSON",
    url: "https://www.mycbt.xyz",
    images: [
      {
        url: "https://www.mycbt.xyz/og-v2.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  other: {
    'og:image:alt': 'CAYSON - 자격증 CBT 플랫폼',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${nanumSquareNeo.variable} ${notoSerifKR.variable}`}>
      <head>
        {/* Pretendard: 동적 서브셋 (body 기본 폰트) */}
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
