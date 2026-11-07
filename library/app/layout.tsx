import type { Metadata } from "next";
import { Courier_Prime, Libre_Caslon_Text, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import { Shelf } from "./shelf";
import { SiteFooter } from "./site-footer";
import { UserMenu } from "./user-menu";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
});

const libreCaslon = Libre_Caslon_Text({
  variable: "--font-libre-caslon",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Library Manager",
  description: "The church lending library: books, members and loans.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${libreCaslon.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-ink">
        <header className="bg-moss">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6 sm:py-5">
            <div>
              <h1 className="font-display text-2xl tracking-tight text-cream sm:text-3xl">
                Library Manager
              </h1>
              <p className="mt-0.5 text-[0.7rem] font-semibold tracking-[0.22em] text-brass uppercase">
                Church Lending Library
              </p>
            </div>
            <Suspense fallback={null}>
              <UserMenu />
            </Suspense>
          </div>
          <Shelf />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
