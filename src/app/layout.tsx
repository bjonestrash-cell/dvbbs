import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // `template: "%s"` means each page's own title is the entire tab title —
  // no "Page. DVBBS HQ" suffix. The default kicks in for /, 404, etc.
  title: {
    default: "dvbbs",
    template: "%s",
  },
  description: "Internal artist operations.",
  robots: { index: false, follow: false },
};

// Inlined as a script tag so it runs synchronously on first paint and the
// viewer never sees a light/dark flash. Reads the stored preference, falls
// back to prefers-color-scheme.
const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.getItem("dvbbs.theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored === "dark" || stored === "light"
      ? stored
      : (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full bg-page text-fg">{children}</body>
    </html>
  );
}
