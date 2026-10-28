"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Plus,
  Minus,
  Save,
  CheckCircle2,
  Info,
  LoaderCircle,
  LogIn,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "panganita-family-draft";

const groups = [
  {
    key: "bayi_6_11",
    dbKey: "bayi_6_11_bulan",
    label: "Bayi 6–11 bulan",
    description: "Usia 6 sampai 11 bulan",
  },
  {
    key: "anak_1_3",
    dbKey: "anak_1_3_tahun",
    label: "Anak 1–3 tahun",
    description: "Usia 1 sampai 3 tahun",
  },
  {
    key: "anak_4_6",
    dbKey: "anak_4_6_tahun",
    label: "Anak 4–6 tahun",
    description: "Usia 4 sampai 6 tahun",
  },
  {
    key: "anak_7_9",
    dbKey: "anak_7_9_tahun",
    label: "Anak 7–9 tahun",
    description: "Usia 7 sampai 9 tahun",
  },
  {
    key: "anak_l_10_12",
    dbKey: "anak_laki_10_12_tahun",
    label: "Anak laki-laki 10–12 tahun",
    description: "Usia 10 sampai 12 tahun",
  },
  {
    key: "anak_p_10_12",
    dbKey: "anak_perempuan_10_12_tahun",
    label: "Anak perempuan 10–12 tahun",
    description: "Usia 10 sampai 12 tahun",
  },
];

const initialCounts = Object.fromEntries(groups.map((group) => [group.key, 0]));

function toDatabaseCounts(counts = {}) {
  return Object.fromEntries(
    groups.map((group) => [
      group.dbKey,
      Math.max(
        0,
        Math.min(50, Number(counts[group.key] ?? counts[group.dbKey]) || 0),
      ),
    ]),
  );
}

function toFormCounts(counts = {}) {
  return Object.fromEntries(
    groups.map((group) => [
      group.key,
      Math.max(
        0,
        Math.min(50, Number(counts[group.dbKey] ?? counts[group.key]) || 0),
      ),
    ]),
  );
}

function parseDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    const draft = JSON.parse(raw);

    return {
      nama: draft.nama || "",
      ibuHamil: Boolean(draft.ibuHamil),
      ibuMenyusui: Boolean(draft.ibuMenyusui),
      counts: toFormCounts(draft.counts || {}),
    };
  } catch {
    return null;
  }
}

export default function FamilyPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [ibuHamil, setIbuHamil] = useState(false);
  const [ibuMenyusui, setIbuMenyusui] = useState(false);
  const [counts, setCounts] = useState(initialCounts);

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const childCount = Object.values(counts).reduce(
    (total, value) => total + Math.max(0, Number(value) || 0),
    0,
  );

  const memberCount = childCount + Number(ibuHamil) + Number(ibuMenyusui);

  const showMessage = useCallback((text) => {
    setMessage(text);
    setError("");
  }, []);

  const applyDraft = useCallback((draft) => {
    if (!draft) return;

    setNama(draft.nama || "");
    setIbuHamil(Boolean(draft.ibuHamil));
    setIbuMenyusui(Boolean(draft.ibuMenyusui));
    setCounts(toFormCounts(draft.counts || {}));
  }, []);

  const saveDraft = useCallback((draft) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nama: draft.nama.trim(),
        ibuHamil: draft.ibuHamil,
        ibuMenyusui: draft.ibuMenyusui,
        counts: draft.counts,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, []);

  const getFormData = useCallback(
    () => ({
      nama,
      ibuHamil,
      ibuMenyusui,
      counts,
    }),
    [nama, ibuHamil, ibuMenyusui, counts],
  );

  // Menyimpan profil berdasarkan ID akun Supabase.
  const saveToSupabase = useCallback(async (user, draft) => {
    if (!user?.id) {
      throw new Error("Sesi pengguna tidak ditemukan.");
    }

    if (!draft.nama?.trim()) {
      throw new Error("Nama Mama belum diisi.");
    }

    if (draft.ibuHamil && draft.ibuMenyusui) {
      throw new Error(
        "Versi perhitungan saat ini belum mendukung ibu hamil dan menyusui sekaligus.",
      );
    }

    const { error: upsertError } = await supabase
      .from("profil_pengguna")
      .upsert(
        {
          id_pengguna_auth: user.id,
          nama_lengkap: draft.nama.trim(),
          ibu_hamil: Boolean(draft.ibuHamil),
          ibu_menyusui: Boolean(draft.ibuMenyusui),
          jumlah_anak: toDatabaseCounts(draft.counts),
        },
        {
          onConflict: "id_pengguna_auth",
        },
      );

    if (upsertError) throw upsertError;
  }, []);

  // Memuat profil hanya milik akun yang sedang login.
  // Akun baru tidak menggunakan draf lokal milik akun lain.
  const loadProfileForUser = useCallback(
    async (user) => {
      const { data, error: profileError } = await supabase
        .from("profil_pengguna")
        .select("nama_lengkap, ibu_hamil, ibu_menyusui, jumlah_anak")
        .eq("id_pengguna_auth", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (data) {
        const databaseDraft = {
          nama: data.nama_lengkap || "",
          ibuHamil: Boolean(data.ibu_hamil),
          ibuMenyusui: Boolean(data.ibu_menyusui),
          counts: toFormCounts(data.jumlah_anak || {}),
        };

        applyDraft(databaseDraft);
        saveDraft(databaseDraft);

        return "Profil keluarga berhasil dimuat dari Supabase.";
      }

      // Profil belum ada: mulai dengan formulir kosong.
      localStorage.removeItem(STORAGE_KEY);

      const emptyDraft = {
        nama: "",
        ibuHamil: false,
        ibuMenyusui: false,
        counts: { ...initialCounts },
      };

      applyDraft(emptyDraft);

      return "Selamat datang! Silakan lengkapi profil keluarga Mama.";
    },
    [applyDraft, saveDraft],
  );

  // Memeriksa sesi sebelum memutuskan data mana yang akan dimuat.
  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) throw authError;
        if (!active) return;

        const user = session?.user || null;

        setLoggedIn(Boolean(user));

        if (user) {
          // Pengguna login: ambil data dari profil akun sendiri.
          const result = await loadProfileForUser(user);

          if (active && result) {
            showMessage(result);
          }
        } else {
          // Pengguna belum login boleh menggunakan draf lokal.
          const draft = parseDraft();

          const emptyDraft = {
            nama: "",
            ibuHamil: false,
            ibuMenyusui: false,
            counts: { ...initialCounts },
          };

          if (active) {
            applyDraft(draft || emptyDraft);
          }
        }
      } catch (err) {
        console.error("Gagal memuat profil keluarga:", err);

        if (active) {
          setError(
            err?.message ||
              "Profil belum berhasil dimuat. Periksa koneksi dan izin database.",
          );
        }
      } finally {
        if (active) setLoaded(true);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      const user = session?.user || null;

      setLoggedIn(Boolean(user));

      // Bersihkan draf ketika pengguna logout.
      if (event === "SIGNED_OUT") {
        localStorage.removeItem(STORAGE_KEY);

        applyDraft({
          nama: "",
          ibuHamil: false,
          ibuMenyusui: false,
          counts: { ...initialCounts },
        });

        setSaved(false);
        setMessage("");
        setError("");
      }

      // Setelah login, muat profil berdasarkan ID akun.
      if (event === "SIGNED_IN" && user) {
        Promise.resolve().then(async () => {
          if (!active) return;

          try {
            const result = await loadProfileForUser(user);

            if (active) showMessage(result);
          } catch (err) {
            console.error("Gagal memuat profil setelah login:", err);

            if (active) {
              setError(
                err?.message ||
                  "Profil belum berhasil dimuat. Silakan coba lagi.",
              );
            }
          }
        });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applyDraft, loadProfileForUser, showMessage]);

  function changeCount(key, amount) {
    setCounts((previous) => ({
      ...previous,
      [key]: Math.max(0, Math.min(50, (Number(previous[key]) || 0) + amount)),
    }));

    setSaved(false);
    setMessage("");
    setError("");
  }

  async function saveProfile(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaved(false);

    const draft = getFormData();

    if (!draft.nama.trim()) {
      setError("Masukkan nama Mama terlebih dahulu.");
      return;
    }

    if (draft.ibuHamil && draft.ibuMenyusui) {
      setError(
        "Versi perhitungan saat ini belum mendukung ibu hamil dan menyusui sekaligus.",
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError) throw authError;

      const user = session?.user || null;

      if (!user) {
        // Hanya simpan sebagai draf jika belum login.
        saveDraft(draft);

        setLoggedIn(false);
        setSaved(true);

        showMessage(
          "Draf tersimpan di browser ini. Masuk menggunakan akun Supabase untuk menyimpan profil secara permanen.",
        );

        return;
      }

      // Profil pengguna login disimpan permanen ke Supabase.
      await saveToSupabase(user, draft);

      // Draf lokal diperbarui hanya setelah penyimpanan berhasil.
      saveDraft(draft);

      setLoggedIn(true);
      setSaved(true);

      showMessage("Profil keluarga berhasil disimpan ke Supabase.");
    } catch (err) {
      console.error("Gagal menyimpan profil keluarga:", err);

      setError(
        err?.message ||
          "Profil belum berhasil disimpan. Periksa koneksi dan konfigurasi Supabase.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="workflow-page">
        <div className="workflow-wrap">
          <Link href={loggedIn ? "/dashboard" : "/"} className="back-link">
            <ArrowLeft size={17} />
            {loggedIn ? "Kembali ke dashboard" : "Kembali ke beranda"}
          </Link>

          <div className="workflow-heading">
            <div className="eyebrow">
              <Users size={15} />
              Profil keluarga
            </div>

            <h1>Kenali keluarga Mama.</h1>

            <p>
              Informasi ini membantu PANGANITA merencanakan pangan berdasarkan
              anggota keluarga. Isi jumlah anggota pada setiap kelompok yang
              sesuai.
            </p>
          </div>

          <form className="form-card" onSubmit={saveProfile}>
            <div className="card-heading">
              <div className="heading-icon">
                <Users size={22} />
              </div>

              <div>
                <h2>Data Mama</h2>
                <p>Nama ini digunakan untuk profil keluarga.</p>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="nama-mama">Nama Mama</label>

              <input
                id="nama-mama"
                className="form-input"
                type="text"
                value={nama}
                onChange={(event) => {
                  setNama(event.target.value);
                  setSaved(false);
                  setMessage("");
                  setError("");
                }}
                placeholder="Contoh: Nur"
                maxLength={100}
                required
              />
            </div>

            <div className="form-divider" />

            <div className="card-heading">
              <div className="heading-icon">
                <Users size={22} />
              </div>

              <div>
                <h2>Kondisi ibu</h2>
                <p>Pilih jika sesuai dengan kondisi saat ini.</p>
              </div>
            </div>

            <div className="family-choice-list">
              <label className="family-choice">
                <input
                  type="checkbox"
                  checked={ibuHamil}
                  onChange={(event) => {
                    setIbuHamil(event.target.checked);
                    setSaved(false);
                    setMessage("");
                    setError("");
                  }}
                />

                <span className="family-choice-copy">
                  <strong>Ibu hamil</strong>
                  <small>Tidak perlu memilih trimester.</small>
                </span>
              </label>

              <label className="family-choice">
                <input
                  type="checkbox"
                  checked={ibuMenyusui}
                  onChange={(event) => {
                    setIbuMenyusui(event.target.checked);
                    setSaved(false);
                    setMessage("");
                    setError("");
                  }}
                />

                <span className="family-choice-copy">
                  <strong>Ibu menyusui</strong>
                  <small>Tidak perlu memilih bulan menyusui.</small>
                </span>
              </label>
            </div>

            <div className="form-divider" />

            <div className="card-heading">
              <div className="heading-icon">
                <Users size={22} />
              </div>

              <div>
                <h2>Anak dalam keluarga</h2>
                <p>
                  Gunakan tombol tambah atau kurang sesuai jumlah anak pada
                  setiap kelompok usia.
                </p>
              </div>
            </div>

            <div className="family-counter-list">
              {groups.map((group) => (
                <div className="family-counter" key={group.key}>
                  <div className="family-counter-copy">
                    <strong>{group.label}</strong>
                    <small>{group.description}</small>
                  </div>

                  <div className="stepper">
                    <button
                      type="button"
                      aria-label={`Kurangi ${group.label}`}
                      onClick={() => changeCount(group.key, -1)}
                      disabled={(Number(counts[group.key]) || 0) <= 0}
                    >
                      <Minus size={17} />
                    </button>

                    <span aria-live="polite">{counts[group.key] || 0}</span>

                    <button
                      type="button"
                      aria-label={`Tambah ${group.label}`}
                      onClick={() => changeCount(group.key, 1)}
                      disabled={(Number(counts[group.key]) || 0) >= 50}
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="family-total">
              <div>
                <span>Total anggota yang terdata</span>
                <small>Ibu dan anak pada kelompok yang dipilih</small>
              </div>

              <strong>{memberCount} orang</strong>
            </div>

            <div className="demo-notice">
              <Info size={18} />

              <p>
                {loggedIn
                  ? "Profil akan disimpan ke akun Mama di Supabase."
                  : "Mama bisa mengisi profil sekarang. Draf disimpan di browser dan belum menjadi profil permanen."}
              </p>
            </div>

            {!loggedIn && (
              <Link
                href="/masuk"
                className="button button-secondary button-full button-large"
              >
                <LogIn size={18} />
                Masuk ke PANGANITA
              </Link>
            )}

            <button
              className="button button-primary button-full button-large"
              type="submit"
              disabled={!loaded || saving}
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Menyimpan profil...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan profil keluarga
                </>
              )}
            </button>

            {error && (
              <div className="demo-notice" role="alert">
                <Info size={18} />
                <p>{error}</p>
              </div>
            )}

            {saved && (
              <div className="success-message" role="status">
                <CheckCircle2 size={19} />
                <span>{message}</span>
              </div>
            )}

            <Link
              href="/pindai"
              className="button button-secondary button-full button-large family-next-link"
            >
              Lanjut ke Pindai Panen
              <ArrowRight size={18} />
            </Link>

            {loggedIn && (
              <button
                type="button"
                className="button button-secondary button-full"
                onClick={() => router.push("/dashboard")}
              >
                Ke Dashboard
                <ArrowRight size={18} />
              </button>
            )}
          </form>
        </div>
      </main>
    </>
  );
}
