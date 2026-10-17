import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Dwell — Find your next place", description: "A little less searching. A lot more belonging. Your intelligent apartment hunting workspace.", icons: { icon: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
