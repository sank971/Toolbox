"use client";

import { useState } from "react";

type Format = "mp3" | "mp4";

interface ConversionResult {
  downloadUrl: string;
  filename: string;
  title: string;
}

export default function YouTubePage() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<Format>("mp3");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConversionResult | null>(null);

  const isValidYoutubeUrl = (url: string) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+/.test(
      url
    );
  };

  const handleConvert = async () => {
    if (!url.trim()) {
      setError("Veuillez entrer une URL YouTube.");
      return;
    }
    if (!isValidYoutubeUrl(url)) {
      setError("URL YouTube invalide. Vérifiez le format.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la conversion.");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
      const filename =
        filenameMatch?.[1] || `video.${format}`;
      const title = decodeURIComponent(filename.replace(/\.[^.]+$/, ""));

      const downloadUrl = URL.createObjectURL(blob);
      setResult({ downloadUrl, filename, title });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-3xl mb-4">
          ▶
        </div>
        <h1 className="text-4xl font-bold mb-3">YouTube Converter</h1>
        <p className="text-neutral-400">
          Convertissez n&apos;importe quelle vidéo YouTube en MP3 ou MP4
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {/* URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-neutral-300">
            URL de la vidéo YouTube
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-white placeholder-neutral-600 focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-neutral-300">
            Format de sortie
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat("mp3")}
              className={`p-4 rounded-xl border text-center transition-all ${
                format === "mp3"
                  ? "border-[var(--accent)] bg-[var(--accent-glow)] text-white"
                  : "border-[var(--border)] text-neutral-400 hover:border-neutral-600"
              }`}
            >
              <div className="text-2xl mb-1">🎵</div>
              <div className="font-medium">MP3</div>
              <div className="text-xs text-neutral-500">Audio uniquement</div>
            </button>
            <button
              onClick={() => setFormat("mp4")}
              className={`p-4 rounded-xl border text-center transition-all ${
                format === "mp4"
                  ? "border-[var(--accent)] bg-[var(--accent-glow)] text-white"
                  : "border-[var(--border)] text-neutral-400 hover:border-neutral-600"
              }`}
            >
              <div className="text-2xl mb-1">🎬</div>
              <div className="font-medium">MP4</div>
              <div className="text-xs text-neutral-500">Vidéo + Audio</div>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Conversion en cours...
            </span>
          ) : (
            `Convertir en ${format.toUpperCase()}`
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10">
            <p className="font-medium text-[var(--success)] mb-1">
              Conversion réussie !
            </p>
            <p className="text-sm text-neutral-400 mb-3 truncate">
              {result.title}
            </p>
            <a
              href={result.downloadUrl}
              download={result.filename}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--success)] text-black font-medium text-sm hover:opacity-90 transition-opacity"
            >
              ⬇ Télécharger {format.toUpperCase()}
            </a>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: "🔗",
            title: "Collez l'URL",
            desc: "Copiez l'URL de la vidéo YouTube",
          },
          {
            icon: "⚙️",
            title: "Choisissez le format",
            desc: "MP3 pour l'audio, MP4 pour la vidéo",
          },
          {
            icon: "⬇️",
            title: "Téléchargez",
            desc: "Cliquez et téléchargez votre fichier",
          },
        ].map((step, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-center"
          >
            <div className="text-2xl mb-2">{step.icon}</div>
            <div className="font-medium text-sm mb-1">{step.title}</div>
            <div className="text-xs text-neutral-500">{step.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
