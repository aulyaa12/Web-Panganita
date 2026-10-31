import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  const backendUrl =
    process.env.PANGANITA_VISION_API_URL || "http://127.0.0.1:8000";

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, detail: "Pilih foto terlebih dahulu." },
        { status: 400 },
      );
    }

    const outgoing = new FormData();
    outgoing.append("file", file, file.name || "pangan.jpg");

    const response = await fetch(`${backendUrl}/detect`, {
      method: "POST",
      body: outgoing,
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Vision API proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        detail:
          "Layanan deteksi belum dapat dihubungi. Pastikan backend AI sedang berjalan.",
      },
      { status: 502 },
    );
  }
}
