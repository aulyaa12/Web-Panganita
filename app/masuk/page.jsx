"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  Sprout,
  LoaderCircle,
  LockKeyhole,
  UserPlus,
  LogIn,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MasukPage() {
  const router = useRouter();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setNotice("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    if (password.length < 8) {
      setError("Password harus terdiri dari minimal 8 karakter.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) throw authError;

        setPassword("");
        setConfirmPassword("");

        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        setNotice(
          "Pendaftaran berhasil diproses. Jika konfirmasi email diwajibkan, buka email kamu terlebih dahulu sebelum masuk.",
        );
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (authError) throw authError;

        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Autentikasi gagal:", err);

      if (isRegister) {
        setError(
          err?.message ||
            "Pendaftaran gagal. Periksa email dan konfigurasi Supabase.",
        );
      } else {
        setError("Login gagal. Periksa email dan password, lalu coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        {/* Panel informasi PANGANITA */}
        <section className="auth-story">
          <div className="auth-story-glow auth-glow-one" />
          <div className="auth-story-glow auth-glow-two" />

          <Link
            href="/"
            className="auth-logo-wrap"
            aria-label="PANGANITA beranda"
          >
            <Image
              src="/logo-panganita.png"
              alt="Logo PANGANITA"
              width={190}
              height={68}
              priority
              className="auth-logo"
            />
          </Link>

          <div className="auth-story-copy">
            <span className="auth-kicker">
              <Sprout size={16} />
              PANEN TERENCANA, KELUARGA TERJAGA
            </span>

            <h1>
              Mulai dari panen, <span>jaga pangan keluarga.</span>
            </h1>

            <p>
              Masuk ke PANGANITA untuk menyiapkan profil keluarga dan
              merencanakan hasil panen dengan lebih terarah.
            </p>
          </div>

          <div className="auth-benefits">
            <div>
              <span className="auth-benefit-icon">
                <ShieldCheck size={19} />
              </span>
              <span>
                <strong>Data keluarga lebih teratur</strong>
                <small>Informasi keluarga membantu perencanaan pangan.</small>
              </span>
            </div>

            <div>
              <span className="auth-benefit-icon">
                <LockKeyhole size={19} />
              </span>
              <span>
                <strong>Login dengan password</strong>
                <small>Gunakan email dan password untuk masuk kembali.</small>
              </span>
            </div>
          </div>

          <div className="auth-story-foot">
            PANGANITA · Pangan dan gizi untuk keluarga
          </div>
        </section>

        {/* Formulir login dan pendaftaran */}
        <section className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-mobile-logo">
              <Image
                src="/logo-panganita.png"
                alt="Logo PANGANITA"
                width={160}
                height={58}
                priority
              />
            </div>

            <div className="auth-step-indicator">
              <span className="current">1</span>
              <i />
              <span>2</span>
            </div>

            <div className="auth-form-eyebrow">
              {isRegister ? "PENGGUNA BARU" : "SELAMAT DATANG"}
            </div>

            <h2>{isRegister ? "Buat akun Mama" : "Masuk ke PANGANITA"}</h2>

            <p className="auth-form-desc">
              {isRegister
                ? "Buat akun untuk mulai mengelola hasil panen dan profil keluarga."
                : "Gunakan email dan password untuk masuk ke akun PANGANITA."}
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <label htmlFor="email">Alamat email</label>

              <div className="phone-input-wrap">
                <span className="country-code">
                  <Mail size={18} />
                </span>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setNotice("");
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
              </div>

              <label htmlFor="password">Password</label>

              <div className="phone-input-wrap">
                <span className="country-code">
                  <LockKeyhole size={18} />
                </span>

                <input
                  id="password"
                  type="password"
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  minLength={8}
                  required
                  disabled={loading}
                />
              </div>

              {isRegister && (
                <>
                  <label htmlFor="confirmPassword">Konfirmasi password</label>

                  <div className="phone-input-wrap">
                    <span className="country-code">
                      <ShieldCheck size={18} />
                    </span>

                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Ulangi password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setError("");
                      }}
                      minLength={8}
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="auth-notice" role="alert">
                  {error}
                </div>
              )}

              {notice && (
                <div className="auth-notice" role="status">
                  {notice}
                </div>
              )}

              <button
                type="submit"
                className="button button-primary button-large button-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : isRegister ? (
                  <>
                    Buat akun
                    <UserPlus size={18} />
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-privacy">
              <ShieldCheck size={17} />
              <span>
                Gunakan email yang dapat kamu akses. Jangan bagikan password
                kepada orang lain.
              </span>
            </div>

            <div className="auth-bottom-link">
              {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}

              <button
                type="button"
                onClick={() => changeMode(isRegister ? "login" : "register")}
                disabled={loading}
                className="auth-mode-toggle"
              >
                {isRegister ? (
                  <>
                    <LogIn size={14} />
                    Masuk
                  </>
                ) : (
                  "Daftar sekarang"
                )}
              </button>
            </div>

            {/* Tombol kembali dengan styling dari globals.css */}
            <div className="auth-back-home-wrap">
              <Link href="/" className="auth-back-home">
                <ArrowLeft size={18} />
                <span>Kembali ke beranda</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="auth-page-foot">
        © PANGANITA · Mendampingi keluarga mengelola hasil panen
      </div>
    </main>
  );
}
