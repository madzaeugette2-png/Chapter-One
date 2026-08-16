import "./globals.css";

export const metadata = {
  title: "Chapter One: Meet people through intention.",
  description:
    "Chapter One helps people build genuine friendships and relationships through thoughtful applications and progressive trust.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
