import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/fonts.css"
import UtilsWrapper from "@/context/UtilsContext";
import { APPNAME } from "@/config";
import { capitalizeTheFirstLetter } from "@/utils";
import { AuthProvider } from "@/context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next"

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${capitalizeTheFirstLetter(APPNAME)} | Realtime test proctoring`,
  description: "Reliable online proctor, equipped with cheating detection mechanisms. Our platform ensures that students adhere to exam guidelines by monitoring their actions and flagging any irregularities, thereby maintaining the highest standards of academic honesty.",
  icons: ''
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-urban">
        <UtilsWrapper>
        <AuthProvider>
          <SpeedInsights />
          <main>
            {children}
          </main>
        </AuthProvider>
      </UtilsWrapper>
      </body>
    </html>
  );
}
