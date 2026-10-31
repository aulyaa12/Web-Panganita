"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function GlobalNavbar() {
  const pathname = usePathname();

  const pagesWithOwnNavbar = ["/dashboard", "/keluarga", "/pindai", "/riwayat"];

  const hasOwnNavbar = pagesWithOwnNavbar.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (hasOwnNavbar) {
    return null;
  }

  return <Navbar />;
}
