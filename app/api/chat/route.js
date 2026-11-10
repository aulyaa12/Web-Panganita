import { NextResponse } from "next/server";
import { searchKnowledgeBase, getFallbackResponse } from "@/lib/ragKnowledge";
import { normalizeDialectText } from "@/lib/dialectNormalizer";
import { formatRegionTime, extractLocationFromText } from "@/lib/regionTimezone";

/**
 * Endpoint RAG AI Chatbot Bu Nita
 * POST /api/chat
 * Integrasi Retrieval-Augmented Generation (RAG) resmi Panganita
 * dengan Google Gemini API, Pemahaman Multidialek Nusantara (38 Provinsi),
 * Dukungan Audio Voice Note Lintas Browser (Chrome, Firefox, Edge, Incognito),
 * Penyelarasan Zona Waktu Daerah (WIB, WITA, WIT),
 * serta Prinsip Transparansi & Disclaimer Medis IBM SkillsBuild
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawMessage = (body?.message || "").trim();
    const audioBase64 = body?.audioBase64 || "";
    const mimeType = body?.mimeType || "audio/webm";
    const duration = body?.duration || "";
    const extractedFromMessage = extractLocationFromText(rawMessage);
    const clientLocation =
      extractedFromMessage ||
      body?.location ||
      "Kota Surakarta, Jawa Tengah";

    // Tangani jika pesan kosong tapi ada audio
    let userMessage = rawMessage;
    if (!userMessage && audioBase64) {
      userMessage = "Tolong dengarkan pesan suara saya mengenai kesehatan dan gizi anak";
    }

    if (!userMessage && !audioBase64) {
      return NextResponse.json(
        { success: false, error: "Pesan atau rekaman suara tidak boleh kosong" },
        { status: 400 }
      );
    }

    // 1. TAHAP NORMALISASI DIALEK NUSANTARA (Papua, Sunda, Jawa, Minang, Makassar, Banjar, NTT, dll.)
    const dialectInfo = normalizeDialectText(userMessage);
    const searchTarget = dialectInfo.normalizedText || userMessage;

    const motherName = body?.userName?.trim() ? `Ibu ${body.userName.trim()}` : "Ibu";
    const apiKey = process.env.GEMINI_API_KEY || "";
    const modelName = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

    // 2. TAHAP RETRIEVAL: Cari 3 potongan dokumen paling relevan dari basis data 15 halaman
    const retrievedChunks = searchKnowledgeBase(searchTarget, 3);
    const contextText = retrievedChunks
      .map((c, i) => `[Kutipan Dokumen ${i + 1} - Halaman ${c.page}]:\n${c.text}`)
      .join("\n\n");

    const sourcePages = Array.from(new Set(retrievedChunks.map((c) => c.page))).sort((a, b) => a - b);

    // 3. TAHAP AUGMENTASI & PROMPT ENGINEERING (Persona Bu Nita AI - Multidialek Nusantara)
    const dialectNotes = dialectInfo.isDialectDetected
      ? `\nDETEKSI DIALEK DAERAH PENGGUNA:\n- Wilayah/Dialek Terdeteksi: ${dialectInfo.detectedDialects.join(", ")}\n- Kata Kunci Gizi Hasil Normalisasi: "${dialectInfo.normalizedText}"\n- Komoditas Disebut: ${dialectInfo.localCommodities.join(", ") || "Pangan pekarangan umum"}\n`
      : "";

    const systemPrompt = `Anda adalah Bu Nita AI, sahabat gizi keluarga terpercaya dari platform Panganita untuk lokus pencegahan stunting di Teluk Bintuni, Papua Barat, dan dapat mendampingi ibu-ibu di seluruh pelosok Indonesia.

LANDASAN PENGETAHUAN RESMI (RAG KNOWLEDGE BASE):
${contextText}
${dialectNotes}
PEDOMAN PEMAHAMAN DIALEK & BAHASA DAERAH NUSANTARA:
1. PEMAHAMAN MULTIDIALEK: Ibu-ibu pengguna Panganita berasal dari berbagai penjuru desa di Indonesia. Mereka mungkin berbicara dengan dialek Papua (Teluk Bintuni/Sorong), Sunda (Banten/Jabar), Jawa (Jateng/Jatim/Banyumas), Minang, Bugis/Makassar, Banjar, Batak, Bali, atau NTT.
2. PENERJEMAHAN ISTILAH LOKAL KE KONTEKS GIZI:
- Jika ibu mengeluh anak 'tra mau makan / embung tuang / mboten purun nedha / indak namuah / teai manre / kada hakun', pahami ini sebagai Gerakan Tutup Mulut (GTM) atau anak sedang kehilangan nafsu makan.
- Jika ibu menyebut 'panas tiris / awake anget / dingin manggigia / mamburisi / panas awak', pahami ini sebagai kondisi anak demam/meriang yang membutuhkan asupan cairan, sup hangat, dan elektrolit.
- Jika ibu menyebut pangan lokal pekarangan (lele, kembung, tongkol, kasbi/singkong, petatas/ubi, sagu/papeda, sayur lompong, daun kelor/marungga), sambut dengan penuh apresiasi dan jelaskan nilai gizinya.
3. GAYA BAHASA JAWABAN:
- Gunakan Bahasa Indonesia yang sangat hangat, santun, ramah, dan menenangkan (tanpa menghakimi / no victim-blaming).
- Awali dengan SATU kalimat sapaan hangat dan afirmasi positif singkat menggunakan emoji ramah (contoh: 'Halo Mama ${motherName}! Senang sekali bisa membersamai Mama merawat si kecil tercinta 🥰✨').
4. FORMAT STRUKTUR WAJIB:
- JEDA PARAGRAF WAJIB: Pisahkan setiap bagian paragraf dan langkah dengan DUA KALI ENTER / BARIS KOSONG (double newline).
- POIN DENGAN EMOJI: Setiap poin bahan atau langkah resep WAJIB diawali emoticon (🐟, 🥣, 🌿, 💡, 💧).
- DILARANG KERAS menggunakan tanda bintang (* atau **) untuk tebal/miring dan DILARANG menggunakan tanda pagar (#).
- RUJUKAN RESMI: Cantumkan rujukan resmi singkat dengan tulisan 'Halaman' lengkap, DILARANG menyingkat jadi Hlm (contoh: '📚 Rujukan: Buku Panduan Panganita Halaman ${sourcePages.join(", ")} & Standar AKG Kemenkes RI').
- PENAFIAN MEDIS DI AKHIR:
'⚠️ Penafian Medis: Bu Nita AI adalah asisten edukasi gizi dan bukan pengganti diagnosis dokter. Tindakan medis harus selalu dikonfirmasikan dengan tenaga kesehatan di fasilitas kesehatan setempat.'
5. BATASAN RUANG LINGKUP & GUARDRAIL ETIKA (OUT-OF-SCOPE REFUSAL):
- Jika pertanyaan pengguna di luar konteks gizi, kesehatan balita, pencegahan stunting 1.000 HPK, MPASI, atau ketahanan pangan pekarangan (contoh: siapa presiden korea/negara lain, politik, coding, hiburan, otomotif, keuangan umum, olahraga, ramalan):
Tolak dengan sangat santun dan hangat. Jelaskan bahwa fokus Bu Nita AI adalah mendampingi gizi dan pangan keluarga PANGANITA, lalu arahkan kembali ibu untuk berkonsultasi seputar pemenuhan gizi balita atau olahan hasil panen pekarangan.
6. PERTANYAAN DI LUAR 15 KOMODITAS PANGAN LOKAL:
- Jika ibu menanyakan bahan pangan di luar 15 komoditas pangan lokal pekarangan PANGANITA (misal: salmon impor, daging sapi, keju, apel, mie instan, boba):
Apresiasi pertanyaannya, jelaskan ringkas fakta gizinya untuk balita secara objektif, lalu prioritaskan dan hubungkan kembali ke keunggulan 15 komoditas pangan lokal pekarangan Panganita (seperti ikan kembung yang Omega-3 nya bahkan lebih tinggi dari salmon impor, atau lele, telur ayam, dan sayur pekarangan yang jauh lebih terjangkau, segar, dan padat gizi untuk pencegahan stunting).`;

    let reply = "";

    // 4. TAHAP GENERASI (Google Gemini API - Teks atau Multimodal Audio)
    if (apiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const parts = [{ text: systemPrompt }];

        // Jika ada input rekaman suara mentah (Multimodal Audio Gemini)
        if (audioBase64) {
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: audioBase64,
            },
          });
          parts.push({
            text: `[REKAMAN SUARA IBU]: Rekaman audio di atas adalah suara ibu pedesaan (${duration || "voice note"}). Dengarkan dan pahami bahasa/dialek daerah yang digunakannya, terjemahkan maksudnya ke dalam konteks panduan gizi Panganita, lalu berikan jawaban Bu Nita AI yang menenangkan dan solutif.`,
          });
        } else {
          parts.push({
            text: `Pertanyaan dari ${motherName}: "${userMessage}"\n\nJawaban Bu Nita AI:`,
          });
        }

        const payload = {
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1400,
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9500);

        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawReply && rawReply.trim()) {
            reply = rawReply.trim();
          }
        } else {
          console.warn("Gemini API HTTP Error:", geminiRes.status, await geminiRes.text());
        }
      } catch (geminiError) {
        console.warn("Gagal menghubungi Gemini API, mengaktifkan RAG Multidialek Fallback:", geminiError.message);
      }
    }

    // 5. JIKA GEMINI OFFLINE / GAGAL / KUOTA: Gunakan Fallback Cerdas Berbasis Dialek
    if (!reply) {
      reply = getFallbackResponse(userMessage, motherName);
    }

    // 6. PEMBERSIHAN FORMAT AKHIR: Pastikan nol tanda bintang, nol pagar, Hlm. diganti Halaman, jeda spasi rapi
    reply = reply
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/Hlm\./gi, "Halaman")
      .replace(/\bHlm\b/gi, "Halaman")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Waktu lokal respon sesuai zona waktu daerah profil pengguna (WIB, WITA, WIT)
    const currentTime = formatRegionTime(new Date(), clientLocation);

    return NextResponse.json({
      success: true,
      data: {
        reply,
        sender: "Bu Nita AI",
        time: currentTime,
        sources: sourcePages.map((p) => `Halaman ${p}`),
        retrievedCount: retrievedChunks.length,
        dialect: {
          detected: dialectInfo.detectedDialects,
          isDialect: dialectInfo.isDialectDetected,
          normalizedQuery: dialectInfo.normalizedText,
          commodities: dialectInfo.localCommodities,
        },
      },
    });
  } catch (error) {
    console.error("Chat API Critical Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memproses pesan konsultasi Bu Nita AI",
      },
      { status: 500 }
    );
  }
}

