"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sprout,
  Smartphone,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const OTP_LENGTH = 6;
const emptyDigits = () => Array(OTP_LENGTH).fill("");

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default function MasukPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState(emptyDigits);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  // Hitung mundur tombol "Kirim ulang"
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Kirim otomatis begitu 6 digit terisi
  const code = digits.join("");
  useEffect(() => {
    if (step === 2 && code.length === OTP_LENGTH && !loading) verifyOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, step]);

  async function requestOtp(e) {
    e?.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/auth/whatsapp/request-otp", {
        phone,
      });
      if (!ok) {
        if (data.retryAfter) setCooldown(data.retryAfter);
        setError(data.error || "Gagal mengirim kode. Coba lagi.");
        return;
      }
      setDigits(emptyDigits());
      setCooldown(data.resendAfter ?? 60);
      setStep(2);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi internetmu.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError("");
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/auth/whatsapp/verify-otp", {
        phone,
        code,
      });
      if (!ok) {
        setError(data.error || "Kode tidak valid.");
        setDigits(emptyDigits());
        inputsRef.current[0]?.focus();
        setLoading(false);
        return;
      }
      // Tukar token dari server menjadi sesi Supabase di browser
      const { error: sbError } = await supabase.auth.verifyOtp({
        token_hash: data.tokenHash,
        type: "email",
      });
      if (sbError) {
        setError("Gagal membuat sesi. Minta kode baru dan coba lagi.");
        setDigits(emptyDigits());
        setLoading(false);
        return;
      }
      router.replace(data.redirectTo || "/dashboard");
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi internetmu.");
      setLoading(false);
    }
  }

  function changeDigit(i, value) {
    const v = value.replace(/\D/g, "").slice(-1);
    setDigits((d) => d.map((x, idx) => (idx === i ? v : x)));
    if (v && i < OTP_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function keyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1)
      inputsRef.current[i + 1]?.focus();
  }

  function paste(e) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    setDigits(Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? ""));
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  function backToPhone() {
    setStep(1);
    setError("");
    setDigits(emptyDigits());
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
                <MessageCircle size={19} />
              </span>
              <span>
                <strong>Masuk lewat WhatsApp</strong>
                <small>
                  Tanpa password. Cukup kode OTP yang dikirim ke nomor Ibu.
                </small>
              </span>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                paddingTop: "16px",
              }}
            >
              <span
                className="auth-benefit-icon"
                style={{ background: "#f5c451", color: "#14452f" }}
              >
                <UserPlus size={19} />
              </span>
              <span>
                <strong>Belum punya akun? Langsung masuk</strong>
                <small>Akun dibuat otomatis saat pertama kali masuk.</small>
              </span>
            </div>
          </div>
        </section>

        {/* Formulir login OTP WhatsApp */}
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
              <span className={step === 1 ? "current" : undefined}>1</span>
              <i />
              <span className={step === 2 ? "current" : undefined}>2</span>
            </div>

            <div className="auth-form-eyebrow">SELAMAT DATANG</div>

            <h2>{step === 1 ? "Masuk ke PANGANITA" : "Masukkan kode OTP"}</h2>

            <p className="auth-form-desc">
              {step === 1
                ? "Masukkan nomor WhatsApp Ibu. Kami kirim kode verifikasi 6 digit."
                : `Kode 6 digit sudah dikirim ke WhatsApp ${phone}.`}
            </p>

            {step === 1 ? (
              <form onSubmit={requestOtp} className="auth-form" noValidate>
                <label htmlFor="phone">Nomor WhatsApp</label>

                <div className="phone-input-wrap">
                  <span className="country-code">
                    <Phone size={18} />
                  </span>

                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="08123456789"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
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

                <button
                  type="submit"
                  className="button button-primary button-large button-full"
                  disabled={loading || phone.replace(/\D/g, "").length < 9}
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Kirim kode ke WhatsApp
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="auth-form">
                <label htmlFor="otp-0">Kode OTP</label>

                <div className="flex justify-between gap-2" onPaste={paste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      ref={(el) => (inputsRef.current[i] = el)}
                      value={d}
                      onChange={(e) => changeDigit(i, e.target.value)}
                      onKeyDown={(e) => keyDown(i, e)}
                      onFocus={(e) => e.target.select()}
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      disabled={loading}
                      aria-label={`Digit ${i + 1} dari ${OTP_LENGTH}`}
                      className="h-12 w-full max-w-[3.25rem] rounded-xl border border-slate-200 bg-white text-center text-xl font-bold text-[#14452f] outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:opacity-60"
                    />
                  ))}
                </div>

                {error && (
                  <div className="auth-notice" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={verifyOtp}
                  className="button button-primary button-large button-full"
                  disabled={loading || code.length < OTP_LENGTH}
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="flex justify-center text-xs">
                  {cooldown > 0 ? (
                    <span className="text-slate-500" aria-live="polite">
                      Kirim ulang dalam {cooldown} dtk
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={requestOtp}
                      disabled={loading}
                      className="auth-mode-toggle"
                    >
                      Kirim ulang kode
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="auth-privacy">
              <ShieldCheck size={17} />
              <span>
                Gunakan nomor WhatsApp aktif milik Ibu. Jangan bagikan kode OTP
                kepada siapa pun.
              </span>
            </div>

            {step === 2 && (
              <div className="auth-bottom-link">
                <button
                  type="button"
                  onClick={backToPhone}
                  disabled={loading}
                  className="auth-mode-toggle"
                >
                  <Smartphone size={14} />
                  Login dengan nomor lain
                </button>
              </div>
            )}

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
        © PANGANITA · Pangan dan gizi untuk keluarga
      </div>
    </main>
  );
}