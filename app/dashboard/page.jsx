"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  Users,
  Wheat,
  Heart,
  Wallet,
  ClipboardList,
  Sprout,
  ShieldCheck,
  CircleHelp,
  LoaderCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "panganita-family-draft";

export default function DashboardPage() {
  const router = useRouter();

  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [harvestStats, setHarvestStats] = useState({
    count: null,
    income: null,
    error: false,
  });

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      // Baca draf lokal sebagai cadangan.
      let localDraft = null;

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) localDraft = JSON.parse(saved);
      } catch (err) {
        console.warn("Draf keluarga lokal tidak dapat dibaca:", err);
      }

      try {
        // Periksa sesi lokal Supabase tanpa menganggap
        // ketiadaan sesi sebagai error aplikasi.
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!active) return;

        const user = session?.user ?? null;

        // Belum login: gunakan draf lokal saja.
        // Jangan menjalankan query ke tabel privat.
        if (!user) {
          setFamily(localDraft ? { ...localDraft, source: "local" } : null);
          setHarvestStats({ count: null, income: null, error: false });
          return;
        }

        // Ambil profil memakai kolom yang tersedia di skema database.
        const { data: profile, error: profileError } = await supabase
          .from("profil_pengguna")
          .select("id, nama_lengkap, jumlah_dewasa, lokasi")
          .eq("id_pengguna_auth", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!active) return;

        // Pengguna baru diarahkan ke formulir keluarga.
        if (!profile) {
          setHarvestStats({ count: 0, income: 0, error: false });
          router.replace("/keluarga");
          return;
        }

        // Tabel data_anak menyimpan satu baris untuk setiap anak.
        const { data: children, error: childrenError } = await supabase
          .from("data_anak")
          .select("id")
          .eq("profil_id", profile.id);

        if (childrenError) throw childrenError;
        if (!active) return;

        // Formulir saat ini mengelompokkan anak berdasarkan usia.
        // Jika belum ada baris individual di data_anak, gunakan jumlah
        // kelompok dari draf browser sebagai fallback yang ditandai jelas.
        const localCounts =
          localDraft?.counts && typeof localDraft.counts === "object"
            ? localDraft.counts
            : {};

        const localChildCount = Object.values(localCounts).reduce(
          (total, value) => total + Math.max(0, Number(value) || 0),
          0,
        );

        const databaseChildCount = children?.length ?? 0;
        const useLocalChildCounts =
          databaseChildCount === 0 && localChildCount > 0;

        setFamily({
          nama: profile.nama_lengkap || "",
          jumlahDewasa: Math.max(0, Number(profile.jumlah_dewasa) || 1),
          jumlahAnak: useLocalChildCounts
            ? localChildCount
            : databaseChildCount,
          counts: useLocalChildCounts ? localCounts : {},
          lokasi: profile.lokasi || "",
          source: "database",
          childCountSource: useLocalChildCounts ? "local" : "database",
        });

        // Ambil riwayat simulasi milik profil ini untuk ringkasan dashboard.
        // Kegagalan query riwayat tidak menggagalkan tampilan profil keluarga.
        try {
          const { data: historyRows, error: historyError } = await supabase
            .from("riwayat_kalkulasi")
            .select(
              `
              id,
              keputusan_panen (
                perkiraan_pendapatan,
                dipilih_pengguna
              )
            `,
            )
            .eq("profil_id", profile.id);

          if (historyError) throw historyError;
          if (!active) return;

          const rows = historyRows || [];
          const selectedIncome = rows.reduce((total, history) => {
            const decisions = Array.isArray(history.keputusan_panen)
              ? history.keputusan_panen
              : history.keputusan_panen
                ? [history.keputusan_panen]
                : [];

            const selected = decisions.find(
              (decision) => decision.dipilih_pengguna,
            );
            return (
              total +
              (selected
                ? Math.max(0, Number(selected.perkiraan_pendapatan) || 0)
                : 0)
            );
          }, 0);

          setHarvestStats({
            count: rows.length,
            income: selectedIncome,
            error: false,
          });
        } catch (historyErr) {
          console.error("Gagal memuat ringkasan riwayat panen:", historyErr);
          if (active)
            setHarvestStats({ count: null, income: null, error: true });
        }
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);

        if (active) {
          setError(
            "Data dashboard belum berhasil dimuat. " +
              "Periksa struktur tabel dan kebijakan akses Supabase.",
          );

          // Jika query database gagal, tampilkan draf lokal
          // hanya sebagai cadangan, bukan sebagai data tersimpan.
          setFamily(localDraft ? { ...localDraft, source: "local" } : null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  const counts = family?.counts || {};

  const localChildCount = Object.values(counts).reduce(
    (sum, value) => sum + Math.max(0, Number(value) || 0),
    0,
  );

  const childCount =
    family?.source === "database"
      ? Math.max(0, Number(family.jumlahAnak) || 0)
      : localChildCount;

  // Mama adalah satu orang dewasa. Status hamil/menyusui adalah
  // kondisi Mama, bukan anggota keluarga tambahan.
  const adultCount = family ? Math.max(0, Number(family.jumlahDewasa) || 1) : 0;
  const memberCount = adultCount + childCount;

  const hasFamily =
    family?.source === "database" ||
    (family?.source === "local" && memberCount > 0);

  const displayName = family?.nama?.trim() || "Mama";

  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <div className="dashboard-container">
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">
                <Sprout size={16} />
                DASHBOARD PANGANITA
              </span>

              <h1>
                Selamat datang, <span>{displayName}!</span>
              </h1>

              <p>
                Kelola hasil panen dan rencanakan pangan bergizi untuk keluarga,
                satu langkah demi satu langkah.
              </p>
            </div>

            <div className="dashboard-welcome-icon">
              <Wheat size={48} />
            </div>
          </section>

          {error && (
            <div className="dashboard-note" role="alert">
              <ShieldCheck size={20} />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <section className="dashboard-overview" aria-live="polite">
              <LoaderCircle size={24} className="animate-spin" />
              <p>Memuat data keluarga...</p>
            </section>
          ) : (
            <>
              <section className="dashboard-section">
                <div className="dashboard-section-heading">
                  <div>
                    <h2>Mulai dari sini</h2>
                    <p>Pilih kegiatan yang ingin Mama lakukan.</p>
                  </div>
                </div>

                <div className="dashboard-action-grid">
                  <Link
                    href="/pindai"
                    className="dashboard-action-card dashboard-action-primary"
                  >
                    <div className="dashboard-action-icon">
                      <Camera size={27} />
                    </div>

                    <span className="dashboard-card-label">KELOLA PANEN</span>

                    <h3>Hitung Pembagian Panen</h3>

                    <p>
                      Masukkan jenis dan berat panen untuk melihat pilihan
                      simpan dan jual.
                    </p>

                    <span className="dashboard-action-link">
                      Mulai sekarang <ArrowRight size={17} />
                    </span>
                  </Link>

                  <Link href="/keluarga" className="dashboard-action-card">
                    <div className="dashboard-action-icon">
                      <Users size={27} />
                    </div>

                    <span className="dashboard-card-label">
                      KENALI KELUARGA
                    </span>

                    <h3>Profil Keluarga</h3>

                    <p>
                      Atur data anggota keluarga sebagai dasar perencanaan
                      kebutuhan pangan.
                    </p>

                    <span className="dashboard-action-link">
                      {hasFamily ? "Perbarui profil" : "Isi profil"}
                      <ArrowRight size={17} />
                    </span>
                  </Link>

                  <Link href="/riwayat" className="dashboard-action-card">
                    <div className="dashboard-action-icon">
                      <ClipboardList size={27} />
                    </div>

                    <span className="dashboard-card-label">CATATAN PANEN</span>

                    <h3>Riwayat Simulasi</h3>

                    <p>
                      Buka kembali catatan simulasi panen yang pernah dilakukan.
                    </p>

                    <span className="dashboard-action-link">
                      Lihat riwayat <ArrowRight size={17} />
                    </span>
                  </Link>
                </div>
              </section>

              <section className="dashboard-overview">
                <div className="dashboard-overview-heading">
                  <div>
                    <h2>Ringkasan keluarga</h2>

                    <p>
                      {family?.source === "database"
                        ? "Data profil keluarga dari Supabase."
                        : family?.source === "local"
                          ? "Draf keluarga dari browser ini; belum dipastikan tersimpan di database."
                          : "Belum ada data keluarga yang tersedia."}
                    </p>
                  </div>

                  <Heart size={24} />
                </div>

                <div className="dashboard-stats">
                  <div className="dashboard-stat">
                    <span className="dashboard-stat-icon">
                      <Users size={21} />
                    </span>

                    <span className="dashboard-stat-label">
                      Anggota terdata
                    </span>

                    <strong>{family ? memberCount : "—"}</strong>

                    <small>
                      {family?.source === "database"
                        ? `${adultCount} dewasa, ${childCount} anak${
                            family.childCountSource === "local"
                              ? " (jumlah anak dari draf browser)"
                              : ""
                          }`
                        : family
                          ? "Berdasarkan draf browser"
                          : "Profil belum tersedia"}
                    </small>
                  </div>

                  <div className="dashboard-stat">
                    <span className="dashboard-stat-icon">
                      <Wheat size={21} />
                    </span>

                    <span className="dashboard-stat-label">Catatan panen</span>

                    <strong>
                      {harvestStats.count === null ? "—" : harvestStats.count}
                    </strong>

                    <small>
                      {harvestStats.error
                        ? "Riwayat belum dapat dimuat"
                        : harvestStats.count === null
                          ? "Login untuk melihat ringkasan"
                          : "Simulasi tersimpan di database"}
                    </small>
                  </div>

                  <div className="dashboard-stat">
                    <span className="dashboard-stat-icon">
                      <Wallet size={21} />
                    </span>

                    <span className="dashboard-stat-label">
                      Pendapatan panen
                    </span>

                    <strong>
                      {harvestStats.income === null
                        ? "—"
                        : new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(harvestStats.income)}
                    </strong>

                    <small>
                      {harvestStats.error
                        ? "Pendapatan belum dapat dihitung"
                        : harvestStats.income === null
                          ? "Login untuk melihat ringkasan"
                          : "Total pilihan panen yang tersimpan"}
                    </small>
                  </div>
                </div>

                <div className="dashboard-note">
                  <ShieldCheck size={20} />

                  <p>
                    <strong>Catatan:</strong>{" "}
                    {family?.source === "database"
                      ? family.childCountSource === "local"
                        ? "Profil Mama berasal dari Supabase, tetapi tabel data_anak belum memiliki baris anak. Jumlah anak sementara dibaca dari draf browser; simpanan ini belum tersimpan permanen di database."
                        : "Data profil dan anak berasal dari Supabase. Ringkasan panen dan pendapatan belum terhubung."
                      : "Data yang ditampilkan berasal dari draf lokal atau belum tersedia. Data ini bukan bukti bahwa profil telah tersimpan di Supabase."}
                  </p>
                </div>
              </section>

              <section className="dashboard-tip">
                <div className="dashboard-tip-icon">
                  <CircleHelp size={25} />
                </div>

                <div>
                  <h3>
                    {hasFamily
                      ? "Siap merencanakan hasil panen?"
                      : "Baru pertama menggunakan PANGANITA?"}
                  </h3>

                  <p>
                    {hasFamily
                      ? "Gunakan data keluarga sebagai dasar simulasi pembagian hasil panen."
                      : "Lengkapi profil keluarga terlebih dahulu, kemudian masukkan hasil panen untuk memulai simulasi."}
                  </p>

                  <Link href={hasFamily ? "/pindai" : "/keluarga"}>
                    {hasFamily
                      ? "Mulai simulasi panen"
                      : "Mulai dari profil keluarga"}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
