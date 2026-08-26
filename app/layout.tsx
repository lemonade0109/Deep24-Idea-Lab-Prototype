import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deep24 Idea Lab | Idea to Build Spec",
  description:
    "A product exploration that turns a rough app idea into a clear, coding-agent-ready specification through a short AI-guided interview.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
