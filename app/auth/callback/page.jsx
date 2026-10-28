"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function finishLogin() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
        const authError =
          url.searchParams.get("error_description") ||
          hashParams.get("error_description");

        if (authError) {
          throw new Error(authError);
        }

        // PKCE: tukarkan kode dari tautan menjadi sesi login.
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) throw exchangeError;
        }

        // Pastikan sesi benar-benar tersedia.
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          throw new Error(
            "Sesi login tidak ditemukan. Silakan minta tautan login baru.",
          );
        }

        // Cari profil milik pengguna yang sedang login.
        const { data: profile, error: profileError } = await supabase
          .from("profil_pengguna")
          .select("id")
          .eq("id_pengguna_auth", user.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(
            "Login berhasil, tetapi profil keluarga gagal diperiksa. " +
              "Periksa kolom id_pengguna_auth dan kebijakan RLS tabel profil_pengguna.",
          );
        }

        // Bersihkan kode autentikasi dari address bar.
        window.history.replaceState({}, document.title, "/auth/callback");

        if (profile) {
          router.replace("/dashboard");
        } else {
          router.replace("/keluarga");
        }

        router.refresh();
      } catch (err) {
        console.error("Callback autentikasi gagal:", err);
        setError(
          err?.message || "Login gagal diproses. Silakan minta tautan baru.",
        );
      }
    }

    finishLogin();
  }, [router]);

  return (
    <main className="auth-page">
      <section
        className="auth-form-panel"
        style={{
          maxWidth: "520px",
          margin: "60px auto",
          borderRadius: "20px",
        }}
      >
        <div className="auth-form-inner" style={{ textAlign: "center" }}>
          {error ? (
            <>
              <h2>Login belum berhasil</h2>
              <p className="auth-notice" role="alert">
                {error}
              </p>
              <a href="/masuk" className="button button-primary">
                Kembali ke halaman masuk
              </a>
            </>
          ) : (
            <>
              <LoaderCircle
                size={36}
                className="animate-spin"
                style={{ margin: "0 auto 20px" }}
              />
              <h2>Memverifikasi login</h2>
              <p className="auth-form-desc">
                Tunggu sebentar. Kami sedang memeriksa sesi akun dan profil
                keluarga kamu.
              </p>
              <ShieldCheck size={20} style={{ margin: "16px auto" }} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
