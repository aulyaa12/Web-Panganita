"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  Sprout,
  LoaderCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MasukPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function requestMagicLink(event) {
    event.preventDefault();
    setNotice("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });

      if (authError) throw authError;

      setEmail(normalizedEmail);
      setNotice(
        "Tautan login sudah diminta. Buka email kamu dan klik tautan masuk dari Supabase. Periksa folder spam jika belum terlihat.",
      );
    } catch (err) {
      console.error("Permintaan Magic Link gagal:", err);
      setError(
        err?.message ||
          "Tautan login gagal dikirim. Periksa konfigurasi Email di Supabase.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="auth-back">
        <ArrowLeft size={17} />
        Kembali ke beranda
      </Link>

      <div className="auth-shell">
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
                <Mail size={19} />
              </span>
              <span>
                <strong>Praktis dengan email</strong>
                <small>Masuk melalui tautan verifikasi dari Supabase.</small>
              </span>
            </div>
          </div>

          <div className="auth-story-foot">
            PANGANITA · Pangan dan gizi untuk keluarga
          </div>
        </section>

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

            <div className="auth-form-eyebrow">SELAMAT DATANG</div>
            <h2>Masuk ke akun Mama</h2>

            <p className="auth-form-desc">
              Masukkan email aktif. Kami akan mengirimkan tautan untuk masuk ke
              akun PANGANITA.
            </p>

            <form onSubmit={requestMagicLink} className="auth-form">
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
                    Mengirim tautan...
                  </>
                ) : (
                  <>
                    Kirim tautan login
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-privacy">
              <ShieldCheck size={17} />
              <span>
                Gunakan email yang bisa kamu akses. Jangan bagikan tautan login
                kepada orang lain.
              </span>
            </div>

            <div className="auth-bottom-link">
              Baru menggunakan PANGANITA?{" "}
              <Link href="/keluarga">Siapkan profil keluarga</Link>
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
