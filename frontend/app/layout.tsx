import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { LayoutWrapper } from "@/components/common/layout-wrapper";


const fontSans = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans", // Khai báo biến CSS
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Stayzy - Đặt Phòng Khách Sạn Thông Minh",
    template: "%s | Stayzy",
  },
  description: "Stayzy - Nền tảng đặt phòng khách sạn thông minh hàng đầu Việt Nam. Tìm kiếm và đặt phòng khách sạn với giá tốt nhất, trải nghiệm ấm áp như ở nhà.",
  keywords: ["đặt phòng khách sạn", "hotel booking", "khách sạn việt nam", "du lịch", "Stayzy", "đặt phòng online"],
  authors: [{ name: "Stayzy Team" }],
  creator: "Stayzy",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://stayzy.vn",
    siteName: "Stayzy",
    title: "Stayzy - Đặt Phòng Khách Sạn Thông Minh",
    description: "Nền tảng đặt phòng khách sạn thông minh hàng đầu Việt Nam",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Stayzy Logo" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${fontSans.variable} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

