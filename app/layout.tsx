import "./global.css";
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
      <body>{children}</body>
    </html>
  );
}
