import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import AgeGateModal from "@/components/AgeGateModal";

export const metadata: Metadata = {
  title: "CineVault - Review Phim & Nhận Code",
  description: "Trang review phim chất lượng cao, chia sẻ đánh giá phim và cung cấp mã bí mật nhận ưu đãi affiliate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* Google Analytics placeholder - Replace GA_MEASUREMENT_ID with real ID */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>
        <AgeGateModal />
        <header className="header glass" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/">
              <h1>CineVault</h1>
            </Link>
            <nav>
              <Link href="/" className="nav-link">Trang Chủ</Link>
            </nav>
          </div>
        </header>
        <main className="container" style={{ paddingBottom: '60px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
