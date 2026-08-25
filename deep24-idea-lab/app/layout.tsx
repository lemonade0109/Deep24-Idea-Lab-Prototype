import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deep24 Idea Lab",
  description: "Turn a rough app idea into a clear build specification.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
