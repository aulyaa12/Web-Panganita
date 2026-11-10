"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function ApiDocsPage() {
  useEffect(() => {
    // Inisialisasi Swagger UI setelah skrip CDN selesai dimuat
    const initSwagger = () => {
      if (typeof window !== "undefined" && window.SwaggerUIBundle) {
        window.SwaggerUIBundle({
          url: "/swagger.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            window.SwaggerUIBundle.presets.apis,
            window.SwaggerUIStandalonePreset || window.SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: "BaseLayout",
          docExpansion: "list",
          defaultModelsExpandDepth: 1,
        });
      }
    };

    if (window.SwaggerUIBundle) {
      initSwagger();
    } else {
      const checkInterval = setInterval(() => {
        if (window.SwaggerUIBundle) {
          clearInterval(checkInterval);
          initSwagger();
        }
      }, 150);
      return () => clearInterval(checkInterval);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "sans-serif" }}>
      {/* Link Stylesheet Swagger UI Resmi */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css"
      />

      {/* Script Swagger UI Bundle */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"
        strategy="afterInteractive"
      />

      {/* Header Dokumentasi PANGANITA */}
      <header
        style={{
          background: "#064e3b",
          color: "#ffffff",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🌱</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "800", letterSpacing: "0.5px" }}>
              PANGANITA API Documentation
            </h1>
            <p style={{ margin: 0, fontSize: "12px", opacity: 0.85 }}>
              OpenAPI 3.0 Specification • AI RAG Bu Nita & Core Endpoints
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a
            href="/swagger.json"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#ffffff",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Raw swagger.json ↗
          </a>
          <Link
            href="/"
            style={{
              background: "#10b981",
              color: "#ffffff",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              textDecoration: "none",
              fontWeight: "700",
            }}
          >
            ← Kembali ke Web
          </Link>
        </div>
      </header>

      {/* Banner Informasi Penjelasan Tim & Standar V9 */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "16px auto 0",
          padding: "12px 20px",
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: "8px",
          color: "#065f46",
          fontSize: "13px",
          lineHeight: "1.5",
        }}
      >
        <strong>📌 Catatan Integrasi Tim PANGANITA:</strong> Seluruh spesifikasi endpoint di bawah ini telah diselaraskan dengan rancangan database final <strong>Supabase V9 (Aulya)</strong>, skema OTP WhatsApp (<code>otp_codes</code>), skema Chatbot Bu Nita (<code>percakapan</code> & <code>pesan_chat</code>), serta endpoint Computer Vision YOLO26n.
      </div>

      {/* Kontainer Swagger UI */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
        <div id="swagger-ui" />
      </main>
    </div>
  );
}

