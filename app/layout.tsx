import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { THEME_COOKIE } from "@/lib/theme";

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
    default: "Scholars Drill | JAMB, WAEC, NECO and Post-UTME practice",
    template: "%s | Scholars Drill",
  },
  description:
    "Practise past questions by subject, topic and year, sit full CBT mocks, and get a worked explanation for every answer. Free to start.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  const theme = saved === "light" || saved === "dark" ? saved : undefined;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // A chosen theme is in the HTML from the server: no flash, no script.
      // Unset means System, and globals.css follows the device.
      data-theme={theme}
    >
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
