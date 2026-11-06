import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Library Manager",
  description: "The church lending library: books, members and loans.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-stone-100">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <h1 className="text-lg font-bold text-stone-900">Library Manager</h1>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
