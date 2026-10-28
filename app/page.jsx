import Link from "next/link";
import { 
  ArrowRight, 
  Camera, 
  Sprout, 
  Scale, 
  HeartHandshake, 
  MessageCircle, 
  ShieldCheck, 
  Leaf, 
  Fish, 
  Carrot,
  TrendingUp,
  Clock,
  Zap
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" /> 
                Pendamping pangan dan gizi keluarga
              </div>
              <h1>
                Hasil panen untuk keluarga, 
                <span> lebih terencana.</span>
              </h1>
              <p className="hero-lead">
                PANGANITA membantu Mama menentukan hasil panen yang bisa disimpan 
                untuk makan keluarga dan yang dapat dijual untuk kebutuhan sehari-hari.
              </p>
              <div className="hero-actions">
                <Link 
                  href="/pindai" 
                  className="button button-primary button-large"
                  title="Mulai pindai dan analisis hasil panen Anda"
                >
                  <Camera size={18} /> 
                  Mulai Pindai Panen 
                  <ArrowRight size={18} />
                </Link>
                <Link 
                  href="#cara-kerja" 
                  className="button button-secondary button-large"
                  title="Pelajari cara kerja PANGANITA"
                >
                  Lihat Cara Kerja
                </Link>
              </div>
              <div className="trust-row">
                <span>
                  <ShieldCheck size={16} /> 
                  Mulai tanpa login
                </span>
                <span>
                  <Leaf size={16} /> 
                  Utamakan pangan lokal
                </span>
              </div>
            </div>

            {/* Visual Demo Card */}
            <div 
              className="hero-visual" 
              aria-label="Contoh hasil analisis panen dengan pembagian simpan dan penjualan"
            >
              <div className="visual-topline">
                <span className="status-dot" /> 
                Contoh hasil panen
              </div>
              <div className="visual-title">Panen hari ini</div>
              
              <div className="produce-row">
                <div className="produce-icon fish-icon">
                  <Fish size={28} />
                </div>
                <div className="produce-info">
                  <strong>Ikan segar</strong>
                  <span>Contoh bahan pangan</span>
                </div>
                <strong className="produce-weight">5 kg</strong>
              </div>

              <div className="split-preview">
                <div className="split-item save">
                  <span>Disimpan</span>
                  <strong>3 kg</strong>
                  <small>Untuk keluarga</small>
                </div>
                <div className="split-item sell">
                  <span>Dijual</span>
                  <strong>2 kg</strong>
                  <small>Untuk kebutuhan</small>
                </div>
              </div>

              <div className="visual-note">
                <HeartHandshake size={16} />
                <span>
                  Contoh pembagian saja. Hasil sebenarnya dihitung setelah data 
                  panen diisi lengkap.
                </span>
              </div>

              <Link 
                href="/pindai" 
                className="visual-link"
                title="Coba dengan hasil panen Anda sendiri"
              >
                Coba dengan hasil panen sendiri 
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-section section-wrap" id="cara-kerja">
          <div className="section-heading">
            <div className="eyebrow">Tidak perlu rumit</div>
            <h2>Tiga langkah sederhana</h2>
            <p>
              Mulai dari hasil panen yang Mama punya. Isi seperlunya, 
              lalu bandingkan pilihan yang tersedia.
            </p>
          </div>
          
          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Camera size={26} />
              </div>
              <h3>Masukkan hasil panen</h3>
              <p>
                Pilih bahan pangan dan masukkan beratnya. Fitur foto AI akan 
                dihubungkan pada tahap integrasi berikutnya.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Scale size={26} />
              </div>
              <h3>Bandingkan pilihan</h3>
              <p>
                Lihat tiga alternatif pengelolaan: Seimbang, Prioritas Gizi, 
                dan Prioritas Uang.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Sprout size={26} />
              </div>
              <h3>Tentukan sesuai kondisi</h3>
              <p>
                Pahami bagian yang disimpan untuk keluarga dan bagian yang 
                bisa dijual sesuai kebutuhan.
              </p>
            </article>
          </div>
        </section>

        {/* Purpose Section */}
        <section className="purpose-section">
          <div className="purpose-inner">
            <div className="purpose-mark">
              <Sprout size={32} />
            </div>
            <div className="purpose-copy">
              <div className="eyebrow eyebrow-light">
                Mengapa menyisihkan hasil panen?
              </div>
              <h2>Pangan bergizi juga bagian dari hasil panen.</h2>
              <p>
                Menjual hasil panen membantu memenuhi kebutuhan uang. Menyisihkan 
                sebagian pangan yang sesuai juga dapat membantu keluarga menyediakan 
                lauk dan bahan makanan di rumah. Besarnya bagian simpan tetap perlu 
                disesuaikan dengan kondisi keluarga.
              </p>
            </div>
            <Link 
              href="/pindai" 
              className="button button-light"
              title="Mulai hitung pembagian hasil panen Anda"
            >
              Mulai hitung 
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section section-wrap">
          <div className="section-heading">
            <div className="eyebrow">Dukungan untuk keluarga</div>
            <h2>Lebih dari sekadar mencatat panen</h2>
            <p>
              Fitur pendamping dikembangkan bertahap agar tetap mudah dipahami 
              dan sesuai kebutuhan keluarga Anda.
            </p>
          </div>
          
          <div className="service-grid">
            <article className="service-card">
              <div className="service-icon">
                <Carrot size={24} />
              </div>
              <h3>Pangan lokal</h3>
              <p>
                Kenali bahan pangan di sekitar dan manfaatnya untuk menu 
                keluarga sehari-hari.
              </p>
              <span className="service-status">Dikembangkan bertahap</span>
            </article>

            <article className="service-card">
              <div className="service-icon">
                <MessageCircle size={24} />
              </div>
              <h3>Bu Nita</h3>
              <p>
                Asisten informasi untuk pertanyaan seputar pangan, gizi, 
                dan ide olahan.
              </p>
              <span className="service-status">Dikembangkan bertahap</span>
            </article>

            <article className="service-card">
              <div className="service-icon">
                <HeartHandshake size={24} />
              </div>
              <h3>Profil keluarga</h3>
              <p>
                Informasi keluarga membantu menyesuaikan perencanaan pangan 
                dengan kebutuhan spesifik.
              </p>
              <span className="service-status">Dikembangkan bertahap</span>
            </article>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>PANGANITA</strong>
            <p>Pangan dan gizi untuk keluarga.</p>
          </div>
          <span>
            Dirancang dengan ❤️ untuk membantu keluarga mengelola hasil panen 
            dengan lebih terencana dan bijaksana.
          </span>
        </div>
      </footer>
    </>
  );
}
