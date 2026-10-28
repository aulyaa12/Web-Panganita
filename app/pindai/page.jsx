"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CircleHelp,
  ImagePlus,
  Leaf,
  Minus,
  Plus,
  Scale,
  Sprout,
  Upload,
  Wallet,
  Wheat,
  LoaderCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "panganita-family-draft";

const familyKeyMap = {
  bayi_6_11: "bayi_6_11_bulan",
  anak_1_3: "anak_1_3_tahun",
  anak_4_6: "anak_4_6_tahun",
  anak_7_9: "anak_7_9_tahun",
  anak_l_10_12: "anak_laki_10_12_tahun",
  anak_p_10_12: "anak_perempuan_10_12_tahun",
};

const scenarioInfo = {
  prioritas_gizi: {
    title: "Prioritas Gizi",
    summary: "Mengutamakan persediaan pangan untuk keluarga.",
    icon: Leaf,
    tone: "green",
  },
  seimbang: {
    title: "Seimbang",
    summary: "Menyeimbangkan persediaan keluarga dan hasil penjualan.",
    icon: Scale,
    tone: "mint",
  },
  prioritas_uang: {
    title: "Prioritas Uang",
    summary: "Mengutamakan penjualan dengan tetap menyisihkan pangan.",
    icon: Wallet,
    tone: "gold",
  },
};

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const kg = (value) =>
  `${Number(value || 0).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} kg`;

function explainError(message = "") {
  const text = message.toLowerCase();

  if (text.includes("login wajib")) {
    return "Silakan masuk terlebih dahulu sebelum menyimpan simulasi. Perhitungan langsung belum memerlukan penyimpanan akun.";
  }
  if (
    text.includes("data gizi tidak lengkap") ||
    text.includes("acuan kebutuhan keluarga belum lengkap")
  ) {
    return "Acuan gizi keluarga belum lengkap. Hasil belum dapat dihitung dengan aman.";
  }
  if (text.includes("acuan gizi belum tersedia")) {
    return "Acuan kebutuhan gizi untuk salah satu kelompok keluarga belum tersedia.";
  }
  if (text.includes("bdd") || text.includes("bahan mentah")) {
    return "Data bagian pangan yang dapat dimakan (BDD) belum tersedia atau perlu diperiksa.";
  }
  if (text.includes("protein keluarga") || text.includes("protein bahan")) {
    return "Data protein keluarga atau bahan pangan belum memadai untuk perhitungan.";
  }
  if (text.includes("energi keluarga") || text.includes("energi bahan")) {
    return "Data energi keluarga atau bahan pangan belum memadai untuk perhitungan.";
  }
  if (text.includes("target konsumsi buah")) {
    return "Perhitungan target penyimpanan buah belum tersedia. Pilih bahan pangan lain untuk simulasi ini.";
  }
  if (text.includes("hamil dan menyusui sekaligus")) {
    return "Versi perhitungan saat ini belum mendukung pilihan ibu hamil dan menyusui sekaligus.";
  }
  if (text.includes("tidak ada anggota keluarga")) {
    return "Lengkapi profil keluarga terlebih dahulu agar kebutuhan pangan dapat dihitung.";
  }
  if (text.includes("bahan pangan aktif tidak ditemukan")) {
    return "Bahan pangan ini tidak tersedia. Muat ulang daftar bahan dan pilih kembali.";
  }

  return (
    message || "Terjadi kendala saat menghitung simulasi. Silakan coba kembali."
  );
}

export default function PindaiPage() {
  const [foods, setFoods] = useState([]);
  const [foodId, setFoodId] = useState("");
  const [weight, setWeight] = useState("5");
  const [price, setPrice] = useState("");
  const [days, setDays] = useState(3);
  const [imageUrl, setImageUrl] = useState("");
  const [step, setStep] = useState(1);
  const [choice, setChoice] = useState("seimbang");
  const [family, setFamily] = useState(null);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedHistoryId, setSavedHistoryId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      setLoadingFoods(true);

      try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw) {
          const saved = JSON.parse(raw);
          if (active) setFamily(saved);
        }

        const { data, error: queryError } = await supabase
          .from("bahan_pangan")
          .select(
            "id, nama, nama_kelas, kategori, harga_perkiraan_kg, sumber_harga",
          )
          .eq("aktif", true)
          .order("nama");

        if (queryError) throw queryError;

        if (active) {
          setFoods(data || []);

          if (data?.length) {
            setFoodId(String(data[0].id));
            setPrice(
              data[0].harga_perkiraan_kg == null
                ? ""
                : String(data[0].harga_perkiraan_kg),
            );
          }
        }
      } catch (err) {
        if (active) {
          setError(
            "Daftar bahan pangan belum dapat dimuat. Periksa koneksi Supabase dan kebijakan akses data.",
          );
        }
        console.error("Gagal memuat bahan pangan:", err);
      } finally {
        if (active) setLoadingFoods(false);
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const selectedFood = useMemo(
    () => foods.find((food) => String(food.id) === String(foodId)),
    [foods, foodId],
  );

  const options = useMemo(() => {
    if (!result?.keputusan) return [];

    return result.keputusan.map((item) => ({
      ...item,
      ...(scenarioInfo[item.jenis_keputusan] || {}),
    }));
  }, [result]);

  const activeOption =
    options.find(
      (option) => option.id === choice || option.jenis_keputusan === choice,
    ) || options[0];

  function handleFoodChange(value) {
    setFoodId(value);
    const food = foods.find((item) => String(item.id) === value);

    setPrice(
      food?.harga_perkiraan_kg == null ? "" : String(food.harga_perkiraan_kg),
    );

    setResult(null);
    setSelected(false);
    setSavedHistoryId(null);
    setError("");
  }

  function handleImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Pilih berkas foto dengan format gambar.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Ukuran foto maksimal 8 MB.");
      return;
    }

    setImageUrl(URL.createObjectURL(file));
    setError("");
  }

  function buildFamilyInput() {
    if (!family) {
      throw new Error(
        "Profil keluarga belum ditemukan. Isi dan simpan profil keluarga terlebih dahulu.",
      );
    }

    const counts = family.counts || {};
    const jumlahAnak = {};

    for (const [sourceKey, targetKey] of Object.entries(familyKeyMap)) {
      jumlahAnak[targetKey] = Math.max(0, Number(counts[sourceKey]) || 0);
    }

    const input = {
      lama_pemenuhan_hari: days,
      kondisi_ibu: {
        hamil: Boolean(family.ibuHamil),
        menyusui: Boolean(family.ibuMenyusui),
      },
      jumlah_anak: jumlahAnak,
    };

    const hasMember =
      input.kondisi_ibu.hamil ||
      input.kondisi_ibu.menyusui ||
      Object.values(jumlahAnak).some((count) => count > 0);

    if (!hasMember) {
      throw new Error(
        "Profil keluarga belum memiliki anggota yang dipilih. Lengkapi profil keluarga terlebih dahulu.",
      );
    }

    if (input.kondisi_ibu.hamil && input.kondisi_ibu.menyusui) {
      throw new Error(
        "Versi perhitungan saat ini belum mendukung pilihan ibu hamil dan menyusui sekaligus.",
      );
    }

    return input;
  }

  async function calculateHarvest(event) {
    event.preventDefault();
    setError("");
    setSelected(false);
    setSavedHistoryId(null);

    const total = Number(weight);
    const unitPrice = price.trim() === "" ? null : Number(price);

    if (!selectedFood) {
      setError("Pilih bahan pangan terlebih dahulu.");
      return;
    }

    if (!Number.isFinite(total) || total <= 0 || total > 999999999) {
      setError("Berat panen harus lebih besar dari 0 kg.");
      return;
    }

    if (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice < 0)) {
      setError("Harga jual tidak boleh negatif.");
      return;
    }

    if (
      selectedFood.kategori === "sayur_buah" &&
      ["pisang", "buah_naga"].includes(selectedFood.nama_kelas)
    ) {
      setError(
        "Target konsumsi untuk bahan buah ini belum ditetapkan dalam aturan simulasi. Pilih bahan pangan lain.",
      );
      return;
    }

    let input;

    try {
      input = buildFamilyInput();
    } catch (err) {
      setError(err.message);
      return;
    }

    setCalculating(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "hitung_simulasi_panen_v1",
        {
          p_bahan_pangan_id: Number(foodId),
          p_total_panen_kg: total,
          p_data_input: input,
          p_harga_per_kg: unitPrice,
        },
      );

      if (rpcError) throw rpcError;

      if (!data || !Array.isArray(data.keputusan)) {
        throw new Error("Format hasil perhitungan dari server tidak sesuai.");
      }

      if (data.status === "data_gizi_tidak_lengkap") {
        throw new Error(
          "Acuan gizi belum lengkap. Simulasi tidak dapat ditampilkan sebagai hasil yang valid.",
        );
      }

      if (data.kebutuhan_keluarga?.status === "input_kosong") {
        throw new Error(
          "Belum ada anggota keluarga yang dapat dihitung. Periksa profil keluarga.",
        );
      }

      setResult(data);
      setChoice("seimbang");
      setStep(2);
    } catch (err) {
      console.error("Simulasi panen gagal:", err);
      setError(explainError(err.message));
    } finally {
      setCalculating(false);
    }
  }

  async function saveSelectedHarvest() {
    if (!result || !activeOption || saving || savedHistoryId) return;

    setError("");
    setSaving(true);

    try {
      // Pastikan ada sesi login Supabase.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) {
        throw new Error(
          "Login wajib untuk menyimpan simulasi. Silakan masuk terlebih dahulu.",
        );
      }

      // Ambil profil yang benar-benar dimiliki pengguna yang sedang login.
      const { data: profile, error: profileError } = await supabase
        .from("profil_pengguna")
        .select("id")
        .eq("id_pengguna_auth", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        throw new Error(
          "Profil keluarga belum tersimpan di database. Profil browser saja belum cukup untuk menyimpan riwayat.",
        );
      }

      // Simpan seluruh alternatif melalui fungsi SQL yang sudah tersedia.
      const { data: savedResult, error: saveError } = await supabase.rpc(
        "simpan_simulasi_panen_v1",
        {
          p_profil_id: profile.id,
          p_bahan_pangan_id: Number(foodId),
          p_total_panen_kg: Number(weight),
          p_data_input: buildFamilyInput(),
          p_harga_per_kg: price.trim() === "" ? null : Number(price),
        },
      );

      if (saveError) throw saveError;
      if (!savedResult?.tersimpan || !savedResult?.riwayat_kalkulasi_id) {
        throw new Error("Database belum mengonfirmasi penyimpanan riwayat.");
      }

      const historyId = savedResult.riwayat_kalkulasi_id;
      // Simpan ID segera: jika penandaan pilihan gagal, jangan membuat duplikat riwayat.
      setSavedHistoryId(historyId);

      // Tandai alternatif yang dipilih. Jika kebijakan RLS menolak update,
      // riwayat tetap sudah tersimpan dan ID-nya tetap ditampilkan.
      const { data: updatedRows, error: updateError } = await supabase
        .from("keputusan_panen")
        .update({ dipilih_pengguna: true })
        .eq("riwayat_kalkulasi_id", historyId)
        .eq("jenis_keputusan", activeOption.jenis_keputusan)
        .select("id");

      if (updateError) {
        throw new Error(
          `Riwayat sudah tersimpan dengan ID ${historyId}, tetapi pilihan belum berhasil ditandai. Periksa kebijakan akses tabel keputusan_panen. Detail: ${updateError.message}`,
        );
      }
      if (!updatedRows?.length) {
        throw new Error(
          `Riwayat sudah tersimpan dengan ID ${historyId}, tetapi tidak ada baris keputusan yang berhasil ditandai.`,
        );
      }

      setSelected(true);
    } catch (err) {
      console.error("Penyimpanan simulasi gagal:", err);
      setError(explainError(err?.message || ""));
    } finally {
      setSaving(false);
    }
  }

  function changeDays(amount) {
    setDays((previous) => Math.max(1, Math.min(365, previous + amount)));
    setResult(null);
    setSelected(false);
    setSavedHistoryId(null);
  }

  return (
    <>
      <Navbar />

      <main className="workflow-page">
        <div className="workflow-wrap">
          <Link href="/keluarga" className="back-link">
            <ArrowLeft size={17} /> Profil keluarga
          </Link>

          <div className="workflow-heading">
            <div className="eyebrow">
              <Camera size={15} /> Pindai Panen
            </div>
            <h1>Mari rencanakan hasil panen, Mama.</h1>
            <p>
              Masukkan data panen dan kebutuhan keluarga. PANGANITA akan
              menghitung alternatif pembagian berdasarkan aturan simulasi.
            </p>
          </div>

          <div className="progress-line">
            <div className={step >= 1 ? "progress-step done" : "progress-step"}>
              <span>1</span>
              <div>
                <strong>Data panen</strong>
                <small>Isi hasil panen</small>
              </div>
            </div>
            <div className="progress-connector" />
            <div className={step >= 2 ? "progress-step done" : "progress-step"}>
              <span>2</span>
              <div>
                <strong>Pilihan</strong>
                <small>Bandingkan hasil</small>
              </div>
            </div>
          </div>

          {error && (
            <div className="demo-notice" role="alert">
              <CircleHelp size={18} />
              <p>{error}</p>
            </div>
          )}

          {step === 1 ? (
            <div className="form-layout">
              <form className="form-card" onSubmit={calculateHarvest}>
                <div className="card-heading">
                  <div className="heading-icon">
                    <Wheat size={22} />
                  </div>
                  <div>
                    <h2>Hasil panen Mama</h2>
                    <p>
                      Foto boleh dilewati. Mama bisa mengisi data secara manual.
                    </p>
                  </div>
                </div>

                <label className="field-label" htmlFor="harvest-photo">
                  Foto hasil panen <span className="optional">Opsional</span>
                </label>

                <label
                  htmlFor="harvest-photo"
                  className={imageUrl ? "upload-box has-image" : "upload-box"}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="Pratinjau hasil panen" />
                  ) : (
                    <>
                      <span className="upload-icon">
                        <ImagePlus size={27} />
                      </span>
                      <strong>Ambil foto atau pilih dari galeri</strong>
                      <span>JPG, PNG, atau WebP · maksimal 8 MB</span>
                      <span className="upload-button">
                        <Upload size={16} /> Pilih foto
                      </span>
                    </>
                  )}
                </label>

                <input
                  id="harvest-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImage}
                  className="visually-hidden"
                />

                {imageUrl && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setImageUrl("")}
                  >
                    Hapus foto
                  </button>
                )}

                <div className="demo-notice">
                  <CircleHelp size={17} />
                  <p>
                    Foto belum dianalisis oleh Vision AI. Nama bahan dan berat
                    masih perlu dikonfirmasi secara manual.
                  </p>
                </div>

                <div className="form-divider" />

                <label className="field-label" htmlFor="food">
                  Bahan pangan
                </label>

                <select
                  id="food"
                  className="input-control"
                  value={foodId}
                  onChange={(event) => handleFoodChange(event.target.value)}
                  disabled={loadingFoods || foods.length === 0}
                  required
                >
                  {loadingFoods && (
                    <option value="">Memuat bahan pangan...</option>
                  )}
                  {!loadingFoods && foods.length === 0 && (
                    <option value="">Bahan pangan tidak tersedia</option>
                  )}
                  {foods.map((food) => (
                    <option key={food.id} value={String(food.id)}>
                      {food.nama}
                    </option>
                  ))}
                </select>

                {selectedFood && (
                  <p className="form-footnote">
                    Kategori: {selectedFood.kategori.replaceAll("_", " ")}
                  </p>
                )}

                <div className="two-fields">
                  <div>
                    <label className="field-label" htmlFor="weight">
                      Berat panen (kg)
                    </label>
                    <input
                      id="weight"
                      className="input-control"
                      type="number"
                      min="0.001"
                      max="999999999"
                      step="0.001"
                      value={weight}
                      onChange={(event) => {
                        setWeight(event.target.value);
                        setResult(null);
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor="price">
                      Harga jual per kg (Rp)
                    </label>
                    <input
                      id="price"
                      className="input-control"
                      type="number"
                      min="0"
                      step="500"
                      value={price}
                      placeholder="Opsional"
                      onChange={(event) => setPrice(event.target.value)}
                    />
                  </div>
                </div>

                <label className="field-label">
                  Berapa hari bahan pangan ingin disediakan?
                </label>

                <div className="day-picker">
                  <div>
                    <strong>{days} hari</strong>
                    <span>Rencanakan lama persediaan pangan keluarga.</span>
                  </div>
                  <div className="stepper">
                    <button
                      type="button"
                      aria-label="Kurangi hari"
                      onClick={() => changeDays(-1)}
                      disabled={days <= 1}
                    >
                      <Minus size={17} />
                    </button>
                    <span>{days}</span>
                    <button
                      type="button"
                      aria-label="Tambah hari"
                      onClick={() => changeDays(1)}
                      disabled={days >= 365}
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>

                <div className="demo-notice">
                  <CircleHelp size={17} />
                  <p>
                    {family
                      ? "Profil keluarga ditemukan di browser. Pastikan datanya masih sesuai."
                      : "Profil keluarga belum ditemukan. Simpan profil keluarga sebelum menghitung."}{" "}
                    <Link href="/keluarga">Periksa profil keluarga</Link>
                  </p>
                </div>

                <button
                  className="button button-primary button-full button-large"
                  type="submit"
                  disabled={loadingFoods || calculating || foods.length === 0}
                >
                  {calculating ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Menghitung...
                    </>
                  ) : (
                    <>
                      Hitung pembagian panen <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="form-footnote">
                  Perhitungan menggunakan aturan prototipe yang perlu
                  diverifikasi. Harga awal dari database hanya perkiraan.
                </p>
              </form>

              <aside className="side-note">
                <div className="side-illustration">
                  <Sprout size={38} />
                </div>
                <h3>Mengapa perlu menyisihkan hasil panen?</h3>
                <p>
                  Hasil panen dapat membantu memenuhi kebutuhan uang sekaligus
                  menjadi sumber pangan keluarga. Pembagian perlu disesuaikan
                  dengan kondisi keluarga dan jumlah panen yang tersedia.
                </p>
                <div className="side-tip">
                  <Check size={17} />
                  <span>Berat simpan dan jual dihitung dari data panen.</span>
                </div>
                <div className="side-tip">
                  <Check size={17} />
                  <span>Keputusan akhir tetap berada pada Mama.</span>
                </div>
              </aside>
            </div>
          ) : (
            <section className="results-layout">
              <div className="results-main">
                <div className="result-summary">
                  <div>
                    <span className="result-label">Total panen</span>
                    <strong>{kg(result?.total_panen_kg)}</strong>
                    <span>{result?.nama_bahan}</span>
                  </div>
                  <div className="result-food-icon">
                    <Wheat size={31} />
                  </div>
                </div>

                <div className="results-title">
                  <div>
                    <h2>Pilih yang paling sesuai</h2>
                    <p>
                      Tiga alternatif dihitung oleh database. Hasil masih
                      berstatus prototipe dan belum merupakan rekomendasi gizi
                      tervalidasi.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                    }}
                  >
                    <ArrowLeft size={15} /> Ubah data
                  </button>
                </div>

                {result?.status && (
                  <div className="demo-notice">
                    <CircleHelp size={17} />
                    <p>
                      Status: {result.status.replaceAll("_", " ")}.{" "}
                      {result.catatan}
                    </p>
                  </div>
                )}

                <div className="option-list">
                  {options.map((option) => {
                    const Icon = option.icon || Scale;
                    const isSelected = choice === option.jenis_keputusan;

                    return (
                      <button
                        type="button"
                        key={option.jenis_keputusan}
                        className={`option-card ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setChoice(option.jenis_keputusan);
                          setSelected(false);
                        }}
                      >
                        <div className={`option-icon ${option.tone || "mint"}`}>
                          <Icon size={22} />
                        </div>

                        <div className="option-content">
                          <div className="option-name-row">
                            <h3>{option.title || option.jenis_keputusan}</h3>
                            {isSelected && (
                              <span className="selected-label">
                                <Check size={13} /> Dipilih
                              </span>
                            )}
                          </div>

                          <p>{option.summary || option.penjelasan}</p>

                          <div className="weight-split">
                            <div>
                              <span>Disimpan</span>
                              <strong>{kg(option.berat_simpan_kg)}</strong>
                            </div>
                            <div>
                              <span>Dijual</span>
                              <strong>{kg(option.berat_jual_kg)}</strong>
                            </div>
                          </div>

                          <div className="split-bar">
                            <span
                              style={{
                                width: `${
                                  Number(result.total_panen_kg) > 0
                                    ? Math.min(
                                        100,
                                        (Number(option.berat_simpan_kg) /
                                          Number(result.total_panen_kg)) *
                                          100,
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeOption && (
                  <div className="selected-detail">
                    <h3>
                      Ringkasan pilihan:{" "}
                      {activeOption.title || activeOption.jenis_keputusan}
                    </h3>

                    <div className="detail-row">
                      <span>Disimpan untuk keluarga</span>
                      <strong>{kg(activeOption.berat_simpan_kg)}</strong>
                    </div>

                    <div className="detail-row">
                      <span>Berat yang dijual</span>
                      <strong>{kg(activeOption.berat_jual_kg)}</strong>
                    </div>

                    <div className="detail-row">
                      <span>Target simpan</span>
                      <strong>{kg(activeOption.target_simpan_kg)}</strong>
                    </div>

                    <div className="detail-row">
                      <span>Kekurangan target</span>
                      <strong>{kg(activeOption.kekurangan_target_kg)}</strong>
                    </div>

                    <div className="detail-row">
                      <span>Perkiraan hasil penjualan</span>
                      <strong>
                        {activeOption.perkiraan_pendapatan == null
                          ? "Harga belum diisi"
                          : rupiah(activeOption.perkiraan_pendapatan)}
                      </strong>
                    </div>

                    <p className="form-footnote">{activeOption.penjelasan}</p>

                    <div className="demo-notice">
                      <CircleHelp size={17} />
                      <p>
                        Nilai target berasal dari aturan prototipe. Periksa
                        status verifikasi gizi sebelum menggunakan hasil untuk
                        keputusan nyata.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="button button-primary button-full button-large"
                  onClick={saveSelectedHarvest}
                  disabled={!activeOption || saving || Boolean(savedHistoryId)}
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Menyimpan riwayat...
                    </>
                  ) : savedHistoryId ? (
                    <>
                      <Check size={18} /> Riwayat berhasil disimpan
                    </>
                  ) : (
                    <>
                      <Check size={18} /> Simpan pilihan &amp; riwayat
                    </>
                  )}
                </button>

                {savedHistoryId && (
                  <div className="success-message" role="status">
                    <Check size={18} />
                    <span>
                      ID riwayat: {savedHistoryId}. Simulasi tersimpan di
                      database.
                      {selected
                        ? " Alternatif pilihan Mama juga berhasil ditandai."
                        : " Periksa pesan di atas jika penandaan alternatif belum berhasil."}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  className="button button-secondary button-full button-large"
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                    setSelected(false);
                    setSavedHistoryId(null);
                    setError("");
                  }}
                >
                  Hitung ulang
                </button>
              </div>

              <aside className="side-note results-side">
                <div className="side-illustration">
                  <Leaf size={38} />
                </div>
                <h3>Keputusan tetap di tangan Mama</h3>
                <p>
                  Pertimbangkan kebutuhan pangan keluarga, hasil panen, dan
                  kebutuhan uang. Jika target belum tercukupi, kekurangannya
                  perlu dipenuhi dari sumber pangan lain.
                </p>
              </aside>
            </section>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>PANGANITA</strong>
            <p>Pangan dan gizi untuk keluarga.</p>
          </div>
          <span>Simulasi panen · Hasil prototipe perlu diverifikasi.</span>
        </div>
      </footer>
    </>
  );
}
