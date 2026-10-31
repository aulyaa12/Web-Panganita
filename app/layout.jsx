import "./globals.css";
import GlobalNavbar from "@/components/GlobalNavbar";

export const metadata = {
  title: "PANGANITA — Pangan dan Gizi untuk Keluarga",
  description:
    "Bantu keluarga mengelola hasil panen untuk kebutuhan pangan dan gizi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <GlobalNavbar />
        {children}
      </body>
    </html>
  );
}
