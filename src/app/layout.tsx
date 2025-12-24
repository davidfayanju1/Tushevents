import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const roboto = Roboto({
  variable: "--font-geist-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tushevents",
  description: "Owned by Tushevents Inc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${roboto.variable}`}>
        {children}
        <Toaster position="top-right" expand={true} closeButton richColors />
      </body>
    </html>
  );
}
