import "./globals.css";

export const metadata = {
  title: "PANGANITA — Pangan dan Gizi untuk Keluarga",
  description: "Bantu keluarga mengelola hasil panen untuk kebutuhan pangan dan gizi."
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
