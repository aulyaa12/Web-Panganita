"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogIn, UserRound, LogOut, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const publicLinks = [{ href: "/", label: "Beranda" }];

const privateLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pindai", label: "Pindai Panen" },
  { href: "/bu-nita", label: "Bu Nita", icon: MessageCircle },
  { href: "/keluarga", label: "Keluarga" },
  { href: "/riwayat", label: "Riwayat" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Gagal memuat sesi navbar:", error);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setCheckingAuth(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isLoggedIn = Boolean(user);

  function closeMenu() {
    setOpen(false);
  }

  function isActive(href) {
    if (href === "/") return pathname === "/";
    if (href === "/dashboard") return pathname === "/dashboard";

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    if (loggingOut) return;

    closeMenu();
    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout gagal:", error);
      alert("Gagal keluar dari akun. Silakan coba lagi.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link
          href={isLoggedIn ? "/dashboard" : "/"}
          className="brand"
          aria-label="PANGANITA - Pangan dan Gizi untuk Keluarga"
          onClick={closeMenu}
        >
          <Image
            src="/logo-panganita.png"
            alt="Logo PANGANITA"
            width={160}
            height={56}
            priority
            style={{
              objectFit: "contain",
              width: "auto",
              height: "100%",
            }}
          />
        </Link>

        <button
          type="button"
          className="mobile-menu"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav
          className={open ? "nav-links nav-open" : "nav-links"}
          aria-label="Navigasi utama"
        >
          {checkingAuth ? (
            <span className="nav-login" aria-live="polite">
              Memuat...
            </span>
          ) : isLoggedIn ? (
            <>
              {privateLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={
                      isActive(link.href) ? "nav-link active" : "nav-link"
                    }
                  >
                    {Icon && <Icon size={17} />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <Link
                href="/akun"
                className={isActive("/akun") ? "nav-login active" : "nav-login"}
                onClick={closeMenu}
                title="Lihat informasi akun"
              >
                <UserRound size={17} />
                <span>Akun Saya</span>
              </Link>

              <button
                type="button"
                className="nav-login"
                onClick={handleLogout}
                disabled={loggingOut}
                title="Keluar dari akun"
              >
                <LogOut size={17} />
                <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
              </button>
            </>
          ) : (
            <>
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={
                    isActive(link.href) ? "nav-link active" : "nav-link"
                  }
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/masuk"
                className="nav-login"
                onClick={closeMenu}
                title="Masuk ke akun PANGANITA"
              >
                <LogIn size={17} />
                <span>Masuk</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
