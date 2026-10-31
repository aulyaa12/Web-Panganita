"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Send,
  Settings2,
  Volume2,
  Plus,
  X,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VoiceWaveform() {
  const bars = [13, 22, 16, 27, 19, 30, 16, 25, 19, 29, 14, 23, 17, 27];

  return (
    <div className="flex h-8 flex-1 items-center justify-center gap-[3px]">
      {bars.map((height, index) => (
        <span
          key={index}
          className="w-[3px] rounded-full bg-[#659C83]"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

function NitaAvatar({ small = false }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-[#E7F5E9] ${
        small ? "h-9 w-9" : "h-14 w-14 sm:h-16 sm:w-16"
      }`}
    >
      <Image
        src="/images/bu-nita.png"
        alt="Ilustrasi Bu Nita"
        fill
        sizes={small ? "36px" : "64px"}
        className="object-contain p-0.5"
      />
    </div>
  );
}

export default function NitaChatScreen({ onSendMessage }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Assalamu'alaikum, Ibu! Saya Bu Nita, asisten gizi PANGANITA. Saya siap membantu Ibu memahami gizi keluarga, bahan pangan, dan pencegahan stunting. Yuk, kita belajar bersama. Ada yang ingin Ibu tanyakan?",
      time: formatTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingId, setSpeakingId] = useState(null);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(0.95);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const mountedRef = useRef(false);
  const speakingIdRef = useRef(null);

  // Memuat preferensi suara
  useEffect(() => {
    mountedRef.current = true;

    try {
      const savedVoice = localStorage.getItem("nita_voice_uri");
      const savedRate = localStorage.getItem("nita_voice_rate");
      const savedEnabled = localStorage.getItem("nita_voice_enabled");

      if (savedVoice) setVoiceURI(savedVoice);

      if (savedRate) {
        const value = Number(savedRate);
        if (value >= 0.75 && value <= 1.15) setRate(value);
      }

      if (savedEnabled !== null) {
        setVoiceEnabled(savedEnabled === "true");
      }
    } catch (err) {
      console.warn("Preferensi suara tidak dapat dimuat.");
    }

    return () => {
      mountedRef.current = false;
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Memuat daftar suara browser
  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();

      if (!mountedRef.current) return;

      setVoices(available);

      setVoiceURI((current) => {
        if (current && available.some((v) => v.voiceURI === current)) {
          return current;
        }

        return (
          available.find((v) => v.lang.toLowerCase() === "id-id")?.voiceURI ||
          ""
        );
      });
    };

    loadVoices();

    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Scroll otomatis
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // Menghentikan suara
  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    speakingIdRef.current = null;
    setSpeakingId(null);
    setPaused(false);
  }, []);

  // Membacakan jawaban Bu Nita
  const speakText = useCallback(
    (text, id) => {
      if (!window.speechSynthesis || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find((voice) => voice.voiceURI === voiceURI);

      utterance.lang = selectedVoice?.lang || "id-ID";
      utterance.voice = selectedVoice || null;
      utterance.rate = rate;
      utterance.pitch = 1.03;
      utterance.volume = 1;

      utterance.onstart = () => {
        if (!mountedRef.current) return;
        speakingIdRef.current = id;
        setSpeakingId(id);
        setPaused(false);
      };

      utterance.onend = () => {
        if (!mountedRef.current) return;
        speakingIdRef.current = null;
        setSpeakingId(null);
        setPaused(false);
      };

      utterance.onerror = () => {
        if (!mountedRef.current) return;
        speakingIdRef.current = null;
        setSpeakingId(null);
        setPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [voices, voiceURI, rate],
  );

  // Putar ulang jawaban
  const toggleAudio = (message) => {
    if (speakingIdRef.current === message.id) {
      stopSpeech();
      return;
    }

    speakText(message.content, message.id);
  };

  // Jeda dan lanjutkan suara
  const togglePause = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  // Pengaturan suara
  const changeVoice = (value) => {
    stopSpeech();
    setVoiceURI(value);

    localStorage.setItem("nita_voice_uri", value);
  };

  const changeRate = (value) => {
    const next = Number(value);
    setRate(next);
    localStorage.setItem("nita_voice_rate", String(next));
  };

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    localStorage.setItem("nita_voice_enabled", String(next));

    if (!next) stopSpeech();
  };

  // Contoh suara Bu Nita
  const playSample = () => {
    speakText(
      "Halo Ibu, apa kabar hari ini? Saya Bu Nita. Yuk, kita belajar bersama tentang gizi keluarga dengan cara yang sederhana dan mudah dipahami.",
      "sample",
    );
  };

  // Input suara melalui mikrofon
  const toggleMicrophone = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Browser belum mendukung pengenalan suara. Silakan gunakan Chrome atau Edge.",
      );
      return;
    }

    stopSpeech();
    setError("");

    const recognition = new SpeechRecognition();

    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error === "not-allowed") {
        setError("Izin penggunaan mikrofon belum diberikan.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError("Mikrofon mengalami gangguan.");
      }
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      setListening(false);
      setError("Mikrofon tidak dapat diaktifkan.");
    }
  };

  // Mengirim pesan ke integrasi RAG
  const sendMessage = async (event) => {
    event?.preventDefault();

    const text = input.trim();

    if (!text || loading) return;

    recognitionRef.current?.stop();
    setListening(false);
    stopSpeech();

    setInput("");
    setLoading(true);
    setError("");

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      time: formatTime(),
    };

    setMessages((previous) => [...previous, userMessage]);

    try {
      if (typeof onSendMessage !== "function") {
        throw new Error(
          "Chatbot RAG belum dihubungkan. Tampilan Bu Nita sudah siap untuk integrasi backend.",
        );
      }

      const result = await onSendMessage(text);

      const answer =
        typeof result === "string"
          ? result
          : result?.answer ||
            result?.reply ||
            result?.data?.answer ||
            result?.data?.reply;

      if (!answer) {
        throw new Error("Jawaban dari Bu Nita belum tersedia.");
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
        sources: result?.sources || result?.data?.sources || [],
        time: formatTime(),
      };

      setMessages((previous) => [...previous, assistantMessage]);

      if (voiceEnabled) {
        speakText(answer, assistantMessage.id);
      }
    } catch (err) {
      setError(err.message || "Tidak dapat menghubungi layanan Bu Nita.");
    } finally {
      setLoading(false);
    }
  };

  // Percakapan baru
  const newConversation = () => {
    stopSpeech();
    recognitionRef.current?.stop();

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content:
          "Assalamu'alaikum, Ibu! Saya Bu Nita. Ada yang ingin Ibu tanyakan tentang gizi keluarga hari ini?",
        time: formatTime(),
      },
    ]);

    setInput("");
    setError("");
    setListening(false);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#E5FFF0] text-[#173D30]">
      {/* HEADER */}


      <div className="mx-auto max-w-6xl px-3 pb-32 sm:px-6">
        {/* PROFIL BU NITA */}

        <section className="mb-6 flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-4 shadow-sm sm:px-6">
          <NitaAvatar />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-[#164532] sm:text-lg">
                Bu Nita AI
              </h1>

              <span className="rounded-full bg-[#D3F2E1] px-2.5 py-1 text-[10px] font-semibold text-[#176C4B]">
                Asisten Gizi RAG
              </span>
            </div>

            <p className="mt-1 text-xs text-[#718B7D]">
              Panduan Pangan & Gizi Keluarga
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={newConversation}
              title="Percakapan baru"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF9F2] text-[#26724E] transition hover:bg-[#DDF3E5]"
            >
              <Plus size={19} />
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              title="Pengaturan suara"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF9F2] text-[#26724E] transition hover:bg-[#DDF3E5]"
            >
              <Settings2 size={19} />
            </button>
          </div>
        </section>

        {/* PENGATURAN SUARA */}

        {showSettings && (
          <section className="mb-6 rounded-2xl border border-[#CFEBDC] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-[#164532]">Pengaturan Suara</h2>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-gray-500"
              >
                <X size={19} />
              </button>
            </div>

            <label className="mb-4 block text-sm font-medium">
              Pilih suara Bu Nita
              <select
                value={voiceURI}
                onChange={(event) => changeVoice(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#D3E8DB] bg-white p-3 text-sm outline-none focus:border-green-600"
              >
                <option value="">Suara bawaan browser</option>

                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </label>

            <div className="mb-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Kecepatan bicara</span>
                <span className="font-semibold text-[#176B49]">
                  {rate.toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                min="0.75"
                max="1.15"
                step="0.05"
                value={rate}
                onChange={(event) => changeRate(event.target.value)}
                className="w-full accent-green-700"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleVoice}
                className="rounded-xl bg-[#E5F6EB] px-4 py-2.5 text-sm font-semibold text-[#176B49]"
              >
                {voiceEnabled
                  ? "Matikan suara otomatis"
                  : "Aktifkan suara otomatis"}
              </button>

              <button
                type="button"
                onClick={playSample}
                className="rounded-xl bg-[#105A40] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <span className="flex items-center gap-2">
                  <Play size={15} />
                  Coba suara
                </span>
              </button>
            </div>
          </section>
        )}

        {/* AREA CHAT */}

        <section className="mx-auto flex max-w-[850px] flex-col gap-5">
          {messages.map((message) => {
            const isUser = message.role === "user";
            const active = speakingId === message.id;

            return (
              <div
                key={message.id}
                className={`flex w-full items-end gap-2.5 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && <NitaAvatar small />}

                <div
                  className={`max-w-[88%] sm:max-w-[78%] ${
                    isUser ? "order-1" : ""
                  }`}
                >
                  <p
                    className={`mb-1.5 px-1 text-[11px] font-medium ${
                      isUser ? "text-right text-[#327354]" : "text-[#54806B]"
                    }`}
                  >
                    {isUser ? "Ibu" : "Bu Nita"}
                  </p>

                  {/* BUBBLE CHAT */}

                  <div
                    className={`rounded-[20px] px-4 py-3.5 shadow-sm sm:px-5 sm:py-4 ${
                      isUser
                        ? "rounded-br-[5px] bg-[#105A40] text-white"
                        : "rounded-bl-[5px] border border-[#E4F0E8] bg-white text-[#294A3B]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-[13px] leading-7 sm:text-sm">
                      {message.content}
                    </p>

                    <p
                      className={`mt-2 text-right text-[10px] ${
                        isUser ? "text-green-100/80" : "text-[#9AAFA3]"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>

                  {/* TOMBOL DENGARKAN */}

                  {!isUser && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAudio(message)}
                        className="flex items-center gap-2 rounded-full border border-[#BBDDC9] bg-white px-3.5 py-2 text-xs font-semibold text-[#176B49] shadow-sm transition hover:bg-[#EAF8EF]"
                      >
                        {active ? (
                          <Square size={13} fill="currentColor" />
                        ) : (
                          <Play size={14} fill="currentColor" />
                        )}

                        {active ? "Hentikan" : "Dengarkan"}
                      </button>

                      {voiceEnabled && (
                        <span className="text-[10px] text-[#799889]">
                          <Volume2 size={12} className="mr-1 inline" />
                          Suara Bu Nita
                        </span>
                      )}

                      {message.sources?.length > 0 && (
                        <details className="text-xs text-[#54806B]">
                          <summary className="cursor-pointer">
                            Sumber informasi
                          </summary>
                          <div className="mt-2 space-y-1">
                            {message.sources.map((source, index) => (
                              <p key={index}>
                                {typeof source === "string"
                                  ? source
                                  : source.title ||
                                    source.name ||
                                    `Referensi ${index + 1}`}
                              </p>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* LOADING */}

          {loading && (
            <div className="flex items-center gap-3">
              <NitaAvatar small />

              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs text-[#54806B] shadow-sm">
                <LoaderCircle size={16} className="animate-spin" />
                Bu Nita sedang menyiapkan jawaban...
              </div>
            </div>
          )}

          
          {/* ERROR */}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />

              <p className="flex-1">{error}</p>

              <button type="button" onClick={() => setError("")}>
                <X size={14} />
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </section>
      </div>

      {/* KOLOM INPUT CHAT */}

      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#D0EBDD] bg-white/95 px-3 py-3 backdrop-blur-lg sm:px-6 sm:py-4">
        <form
          onSubmit={sendMessage}
          className="mx-auto flex max-w-[850px] items-center gap-2.5"
        >
          <div className="flex min-h-[52px] flex-1 items-center rounded-full border border-[#C3E7D2] bg-[#F7FCF8] px-4 transition focus-within:border-[#23845A] focus-within:ring-2 focus-within:ring-[#DDF4E6]">
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  sendMessage(event);
                }
              }}
              disabled={loading}
              placeholder="Ketik pesan atau tekan mikrofon untuk bicara..."
              aria-label="Tulis pesan untuk Bu Nita"
              className="max-h-24 min-h-[38px] flex-1 resize-none bg-transparent py-2.5 text-sm text-[#294A3B] outline-none placeholder:text-[#91AA9C]"
            />

            <button
              type="button"
              onClick={toggleMicrophone}
              disabled={loading}
              aria-label={listening ? "Hentikan mikrofon" : "Aktifkan mikrofon"}
              className={`ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                listening
                  ? "bg-red-100 text-red-600"
                  : "text-[#176B49] hover:bg-[#E3F5E9]"
              }`}
            >
              {listening ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Kirim pesan"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#105A40] text-white shadow-md transition hover:bg-[#0A4632] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>

        <p className="mt-2 text-center text-[10px] text-[#91AA9C]">
          Bu Nita AI • Asisten Gizi Keluarga PANGANITA
        </p>
      </footer>
    </main>
  );
}
