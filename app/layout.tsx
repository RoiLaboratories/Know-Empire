import "../styles/global.css";
import { ReactNode } from "react";

export const metadata = {
  title: `Know Empire`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased min-h-screen`}>{children}</body>
    </html>
  );
}
