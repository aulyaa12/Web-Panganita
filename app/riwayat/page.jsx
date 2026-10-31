"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  History,
  Info,
  Wheat,
  CalendarDays,
  Scale,
  Wallet,
  Leaf,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

const decisionLabels = {
  seimbang: "Seimbang",
  prioritas_gizi: "Prioritas Gizi",
  prioritas_uang: "Prioritas Uang",
};

const numberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 3,
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatWeight(value) {
  return `${numberFormatter.format(Number(value) || 0)} kg`;
}

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return "Belum tersedia";
  }

  return currencyFormatter.format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "Tanggal tidak tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export default function HistoryPage() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasProfile, setHasProfile] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setHistories([]);
        setErrorMessage(
          "Sesi login tidak ditemukan. Silakan masuk kembali untuk melihat riwayat panen.",
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profil_pengguna")
        .select("id")
        .eq("id_pengguna_auth", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setHasProfile(false);
        setHistories([]);
        return;
      }

      setHasProfile(true);

      const { data, error: historyError } = await supabase
        .from("riwayat_kalkulasi")
        .select(
          `
          id,
          nama_bahan_saat_hitung,
          total_panen_kg,
          lama_cadangan_hari,
          harga_per_kg,
          sumber_harga,
          data_input,
          ringkasan_kebutuhan_gizi,
          versi_rumus,
          dibuat_pada,
          keputusan_panen (
            id,
            jenis_keputusan,
            berat_simpan_kg,
            berat_jual_kg,
            perkiraan_pendapatan,
            energi_simpan_kkal,
            protein_simpan_g,
            penjelasan,
            dipilih_pengguna
          )
        `,
        )
        .eq("profil_id", profile.id)
        .order("dibuat_pada", { ascending: false });

      if (historyError) throw historyError;

      setHistories(data || []);
    } catch (error) {
      console.error("Gagal memuat riwayat panen:", error);

      setErrorMessage(
        error?.message ||
          "Riwayat panen gagal dimuat. Periksa koneksi dan pengaturan akses Supabase.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <>
      <Navbar />

      <main className="workflow-page">
        <div className="workflow-wrap">
          <div className="workflow-heading">
            <div className="eyebrow">
              <History size={15} />
              Riwayat panen
            </div>

            <h1>Catatan panen Ibu.</h1>

            <p>
              Lihat kembali hasil simulasi, pembagian panen, dan alternatif yang
              Ibu pilih sebelumnya.
            </p>
          </div>

          {loading && (
            <section className="form-card family-placeholder">
              <RefreshCw size={28} className="animate-spin" />
              <h2>Memuat riwayat panen...</h2>
              <p>Sedang mengambil catatan simulasi dari database PANGANITA.</p>
            </section>
          )}

          {!loading && errorMessage && (
            <section className="form-card family-placeholder">
              <div className="empty-state-icon">
                <AlertCircle size={28} />
              </div>

              <h2>Riwayat belum dapat ditampilkan</h2>
              <p>{errorMessage}</p>

              <div className="demo-notice">
                <Info size={17} />
                <p>
                  Pastikan akun sudah login, profil pengguna tersedia, dan
                  kebijakan akses database mengizinkan pengguna membaca riwayat
                  miliknya sendiri.
                </p>
              </div>

              <div className="history-actions">
                <button
                  type="button"
                  className="button button-primary button-large"
                  onClick={loadHistory}
                >
                  <RefreshCw size={17} />
                  Coba lagi
                </button>

                <Link
                  href="/masuk"
                  className="button button-secondary button-large"
                >
                  Masuk kembali
                </Link>
              </div>
            </section>
          )}

          {!loading && !errorMessage && !hasProfile && (
            <section className="form-card family-placeholder">
              <div className="empty-state-icon">
                <Leaf size={28} />
              </div>

              <h2>Lengkapi profil keluarga dahulu</h2>

              <p>
                Profil keluarga belum ditemukan untuk akun ini. Simpan profil
                keluarga sebelum memulai pencatatan panen.
              </p>

              <Link
                href="/keluarga"
                className="button button-primary button-large"
              >
                Buka profil keluarga
              </Link>
            </section>
          )}

          {!loading &&
            !errorMessage &&
            hasProfile &&
            histories.length === 0 && (
              <section className="form-card family-placeholder">
                <div className="empty-state-icon">
                  <History size={28} />
                </div>

                <h2>Belum ada riwayat tersimpan</h2>

                <p>
                  Setelah simulasi panen disimpan ke database, catatannya akan
                  muncul di halaman ini dan dapat dibuka kembali.
                </p>

                <div className="demo-notice">
                  <Info size={17} />
                  <p>
                    Jika sebelumnya muncul notifikasi berhasil menyimpan, tetapi
                    halaman ini masih kosong, periksa apakah proses penyimpanan
                    menggunakan tabel dan profil yang sama.
                  </p>
                </div>

                <Link
                  href="/pindai"
                  className="button button-primary button-large"
                >
                  Mulai simulasi panen
                </Link>
              </section>
            )}

          {!loading && !errorMessage && hasProfile && histories.length > 0 && (
            <section className="history-list">
              <div className="history-summary">
                <div>
                  <span className="history-summary-label">
                    Total simulasi tersimpan
                  </span>
                  <strong>{histories.length}</strong>
                </div>

                <div className="history-summary-icon">
                  <History size={25} />
                </div>
              </div>

              {histories.map((item) => {
                const decisions = item.keputusan_panen || [];

                const selectedDecision = decisions.find(
                  (decision) => decision.dipilih_pengguna,
                );

                return (
                  <article className="form-card history-card" key={item.id}>
                    <div className="history-card-heading">
                      <div className="history-card-icon">
                        <Wheat size={23} />
                      </div>

                      <div className="history-card-title">
                        <h2>{item.nama_bahan_saat_hitung}</h2>
                        <p>Simulasi #{item.id}</p>
                      </div>

                      {selectedDecision && (
                        <span className="history-selected-badge">
                          <CheckCircle2 size={14} />
                          Pilihan tersimpan
                        </span>
                      )}
                    </div>

                    <div className="history-meta">
                      <span>
                        <CalendarDays size={15} />
                        {formatDate(item.dibuat_pada)}
                      </span>

                      <span>
                        <Scale size={15} />
                        Total panen: {formatWeight(item.total_panen_kg)}
                      </span>
                    </div>

                    <div className="history-detail-grid">
                      <div className="history-detail">
                        <span>Lama cadangan</span>
                        <strong>
                          {Number(item.lama_cadangan_hari) || 0} hari
                        </strong>
                      </div>

                      <div className="history-detail">
                        <span>Harga per kg</span>
                        <strong>{formatCurrency(item.harga_per_kg)}</strong>
                      </div>
                    </div>

                    <h3 className="history-section-title">
                      Alternatif pembagian
                    </h3>

                    {decisions.length === 0 ? (
                      <div className="demo-notice">
                        <Info size={17} />
                        <p>
                          Catatan simulasi tersimpan, tetapi alternatif
                          pembagiannya belum tersedia.
                        </p>
                      </div>
                    ) : (
                      <div className="history-decision-list">
                        {decisions.map((decision) => (
                          <div
                            className={
                              decision.dipilih_pengguna
                                ? "history-decision history-decision-selected"
                                : "history-decision"
                            }
                            key={decision.id}
                          >
                            <div className="history-decision-heading">
                              <strong>
                                {decisionLabels[decision.jenis_keputusan] ||
                                  decision.jenis_keputusan}
                              </strong>

                              {decision.dipilih_pengguna && (
                                <span>Dipilih Ibu</span>
                              )}
                            </div>

                            <div className="history-detail-grid">
                              <div className="history-detail">
                                <span>Disimpan</span>
                                <strong>
                                  {formatWeight(decision.berat_simpan_kg)}
                                </strong>
                              </div>

                              <div className="history-detail">
                                <span>Dijual</span>
                                <strong>
                                  {formatWeight(decision.berat_jual_kg)}
                                </strong>
                              </div>

                              <div className="history-detail">
                                <span>Perkiraan pendapatan</span>
                                <strong>
                                  {formatCurrency(
                                    decision.perkiraan_pendapatan,
                                  )}
                                </strong>
                              </div>
                            </div>

                            {decision.penjelasan && (
                              <p className="history-decision-description">
                                {decision.penjelasan}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedDecision && (
                      <div className="history-selected-summary">
                        <Wallet size={18} />
                        <p>
                          Pilihan Ibu:{" "}
                          <strong>
                            {decisionLabels[selectedDecision.jenis_keputusan] ||
                              selectedDecision.jenis_keputusan}
                          </strong>
                          {" — "}disimpan{" "}
                          {formatWeight(selectedDecision.berat_simpan_kg)},
                          dijual {formatWeight(selectedDecision.berat_jual_kg)}.
                        </p>
                      </div>
                    )}

                    <p className="history-version">
                      Versi rumus: {item.versi_rumus || "v1"}
                    </p>
                  </article>
                );
              })}
            </section>
          )}

          {/* Navigasi bawah: tombol kiri dan kanan */}
          <table width="100%">
            <tbody>
              <tr>
                <td align="left">
                  <Link
                    href="/dashboard"
                    className="button button-primary button-large"
                  >
                    <ArrowLeft size={17} />
                    Kembali ke dashboard
                  </Link>
                </td>

                <td align="right">
                  <Link
                    href="/pindai"
                    className="button button-primary button-large"
                  >
                    <Wheat size={17} />
                    Buat simulasi baru
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
