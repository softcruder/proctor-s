import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UtilsWrapper from "@/context/UtilsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Proctor-s | Cheat-proof test proctoring",
  description: "Proctor tests with a cheat-proof provider",
  icons: ''
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <UtilsWrapper>
        <body className={inter.className}>{children}</body>
        </UtilsWrapper>
      </html>
  );
}
