import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/context/cart-context";
import { LayoutWrapper } from "@/components/layout-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Studyium - Online Özel Ders Platformu",
  description: "Birebir online dersler, uzman eğitmenler ve gelişmiş randevu sistemi ile başarınızı artırın.",
  openGraph: {
    title: "Studyium - Online Özel Ders",
    description: "YKS, LGS ve okul derslerine yönelik profesyonel destek.",
    url: "https://studyium.com",
    siteName: "Studyium",
    images: [
      {
        url: "https://studyium.com/og-image.jpg", // dynamic/placeholder
        width: 1200,
        height: 630,
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
};

import { Footer } from "@/components/footer";

import VisitorTracker from "@/components/visitor-tracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <VisitorTracker />
            <div className="flex flex-col min-h-screen">
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <Footer />
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

