import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RProviders from "./RProvider";
import { Toaster } from "react-hot-toast";
import SesstionProvider from "./SessionProvider";
import Protection from "@/components/auth/Redisautofill";
import { Suspense } from "react";
import Loading from "@/components/loading";
import Footer from "@/components/header/footer";
// import Protaction from '@/components/auth/Redisautofill'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Edu-learning",
  description: "Edu-learning",
  icons: {
    icon: "./favicone.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}>
        <SesstionProvider>
          <RProviders>
            <Protection>
              <Toaster position="top-right" />
              <Suspense fallback={<Loading />}>
                {
                  <>
                    {children}
                    <Footer />
                  </>
                }
              </Suspense>
            </Protection>
          </RProviders>
        </SesstionProvider>
      </body>
    </html>
  );
}
