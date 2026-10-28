"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  UserRound,
  Mail,
  ShieldCheck,
  Users,
  Pencil,
  LayoutDashboard,
  LoaderCircle,
  CircleAlert,
  Baby,
  Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

function normalizeChildCounts(value) {
  if (!value) return {};

  // Kolom jumlah_anak disimpan sebagai objek JSON dari formulir keluarga.
  if (typeof value === "object" && !Array.isArray(value)) return value;

  // Dukungan untuk data JSON yang tersimpan sebagai string.
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
}

function countChildren(value) {
  return Object.values(normalizeChildCounts(value)).reduce(
    (total, count) => total + Math.max(0, Number(count) || 0),
    0,
  );
}

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [childCounts, setChildCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user) {
          router.replace("/masuk");
          return;
        }

        const currentUser = session.user;
        if (active) setUser(currentUser);

        // Gunakan kolom yang benar-benar disimpan oleh halaman /keluarga.
        const { data: profileData, error: profileError } = await supabase
          .from("profil_pengguna")
          .select("id, nama_lengkap, ibu_hamil, ibu_menyusui, jumlah_anak")
          .eq("id_pengguna_auth", currentUser.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!active) return;

        if (!profileData) {
          setProfile(null);
          setChildCounts({});
          return;
        }

        setProfile(profileData);
        setChildCounts(normalizeChildCounts(profileData.jumlah_anak));
      } catch (err) {
        console.error("Gagal memuat akun:", err);

        if (active) {
          setError(
            "Informasi akun belum berhasil dimuat. Periksa koneksi, nama kolom, dan kebijakan akses Supabase.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, [router]);

  const emailVerified = Boolean(user?.email_confirmed_at);
  const childCount = countChildren(childCounts);
  // Mama dihitung satu orang dewasa. Kehamilan/menyusui adalah kondisi Mama,
  // bukan anggota keluarga tambahan.
  const adultCount = profile ? 1 : 0;
  const memberCount = profile ? adultCount + childCount : null;

  return (
    <>
      <Navbar />

      <main className="workflow-page">
        <div className="workflow-wrap">
          <Link href="/dashboard" className="back-link">
            <ArrowLeft size={17} />
            Kembali ke dashboard
          </Link>

          <section className="workflow-heading">
            <div className="eyebrow">
              <UserRound size={16} />
              PENGATURAN AKUN
            </div>

            <h1>Akun Mama.</h1>
            <p>
              Lihat informasi akun dan profil keluarga yang terhubung dengan
              PANGANITA.
            </p>
          </section>

          {loading ? (
            <section className="form-card" aria-live="polite">
              <LoaderCircle size={24} className="animate-spin" />
              <p>Memuat informasi akun...</p>
            </section>
          ) : (
            <>
              {error && (
                <div className="demo-notice" role="alert">
                  <CircleAlert size={19} />
                  <p>{error}</p>
                </div>
              )}

              <section className="form-card">
                <div className="empty-state-icon">
                  <UserRound size={28} />
                </div>

                <h2>Informasi akun</h2>
                <p>
                  Identitas yang digunakan untuk masuk ke aplikasi PANGANITA.
                </p>

                <div className="account-detail-list">
                  <div className="account-detail">
                    <Mail size={20} />
                    <div>
                      <strong>Email login</strong>
                      <p>{user?.email || "Tidak tersedia"}</p>
                    </div>
                  </div>

                  <div className="account-detail">
                    <ShieldCheck size={20} />
                    <div>
                      <strong>Status email</strong>
                      <p>
                        {emailVerified
                          ? "Terverifikasi"
                          : "Belum terverifikasi"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="demo-notice">
                  <ShieldCheck size={18} />
                  <p>
                    Informasi email berasal dari Supabase Auth. Jangan
                    membagikan tautan login kepada orang lain.
                  </p>
                </div>
              </section>

              <section className="form-card">
                <div className="empty-state-icon">
                  <Users size={28} />
                </div>

                <h2>Profil keluarga</h2>

                {profile ? (
                  <>
                    <div className="account-detail-list">
                      <div className="account-detail">
                        <UserRound size={20} />
                        <div>
                          <strong>Nama Mama</strong>
                          <p>{profile.nama_lengkap || "Belum diisi"}</p>
                        </div>
                      </div>

                      <div className="account-detail">
                        <Users size={20} />
                        <div>
                          <strong>Anggota keluarga terdata</strong>
                          <p>{memberCount} orang</p>
                          <small>
                            {adultCount} dewasa dan {childCount} anak
                          </small>
                        </div>
                      </div>

                      <div className="account-detail">
                        <Baby size={20} />
                        <div>
                          <strong>Rincian kelompok usia anak</strong>
                          {Object.keys(childCounts).length > 0 ? (
                            <ul className="account-child-counts">
                              {Object.entries(childCounts).map(
                                ([group, count]) => (
                                  <li key={group}>
                                    {group}: {Math.max(0, Number(count) || 0)}{" "}
                                    anak
                                  </li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <p>Belum ada anak yang tercatat.</p>
                          )}
                        </div>
                      </div>

                      <div className="account-detail">
                        <Heart size={20} />
                        <div>
                          <strong>Kondisi Mama</strong>
                          <p>
                            {profile.ibu_hamil && profile.ibu_menyusui
                              ? "Hamil dan menyusui"
                              : profile.ibu_hamil
                                ? "Ibu hamil"
                                : profile.ibu_menyusui
                                  ? "Ibu menyusui"
                                  : "Tidak memilih kondisi hamil/menyusui"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/keluarga"
                      className="button button-primary button-large"
                    >
                      <Pencil size={17} />
                      Perbarui profil keluarga
                    </Link>
                  </>
                ) : (
                  <>
                    <p>
                      Profil keluarga belum ditemukan untuk akun ini. Lengkapi
                      profil agar perencanaan panen dapat menggunakan data
                      keluarga Mama.
                    </p>

                    <Link
                      href="/keluarga"
                      className="button button-primary button-large"
                    >
                      Lengkapi profil keluarga
                      <ArrowRight size={17} />
                    </Link>
                  </>
                )}
              </section>

              <section className="form-card">
                <div className="empty-state-icon">
                  <LayoutDashboard size={28} />
                </div>

                <h2>Lanjutkan aktivitas</h2>
                <p>
                  Kembali ke dashboard untuk mengelola hasil panen dan melihat
                  ringkasan aktivitas keluarga.
                </p>

                <Link
                  href="/dashboard"
                  className="button button-primary button-large"
                >
                  Buka dashboard
                  <ArrowRight size={17} />
                </Link>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
