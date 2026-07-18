import "./globals.css";

export const metadata = {
  title: "ScaleCraft | System Design Mentor",
  description: "Learn scalable system design from your own codebase."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
