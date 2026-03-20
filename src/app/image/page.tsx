"use client";

import { useState, useRef } from "react";

type OutputFormat = "jpeg" | "png" | "webp" | "ico";

const formats: { value: OutputFormat; label: string; desc: string }[] = [
  { value: "jpeg", label: "JPEG", desc: "Photo compressée" },
  { value: "png", label: "PNG", desc: "Sans perte, transparent" },
  { value: "webp", label: "WebP", desc: "Web optimisé" },
  { value: "ico", label: "Favicon (.ico)", desc: "Icône de site web" },
];

export default function ImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState(85);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Veuillez sélectionner un fichier image valide.");
      return;
    }

    setFile(selected);
    setError("");
    setResultUrl(null);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith("image/")) {
      const input = fileInputRef.current;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(dropped);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      setFile(dropped);
      setError("");
      setResultUrl(null);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(dropped);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    setLoading(true);
    setError("");
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", outputFormat);
      formData.append("quality", quality.toString());

      const res = await fetch("/api/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la conversion.");
      }

      const blob = await res.blob();
      const ext = outputFormat === "ico" ? "ico" : outputFormat;
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const filename = `${baseName}.${ext}`;

      const downloadUrl = URL.createObjectURL(blob);
      setResultUrl(downloadUrl);
      setResultFilename(filename);
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-3xl mb-4">
          🖼
        </div>
        <h1 className="text-4xl font-bold mb-3">Image Converter</h1>
        <p className="text-neutral-400">
          Convertissez vos images en JPEG, PNG, WebP ou Favicon
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mb-6 p-8 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] bg-[var(--background)] text-center cursor-pointer transition-colors"
        >
          {preview ? (
            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Aperçu"
                className="max-h-48 rounded-lg mb-3"
              />
              <p className="text-sm text-neutral-400">{file?.name}</p>
              <p className="text-xs text-neutral-600 mt-1">
                Cliquez pour changer d&apos;image
              </p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">📁</div>
              <p className="text-neutral-400 mb-1">
                Glissez-déposez une image ici
              </p>
              <p className="text-sm text-neutral-600">
                ou cliquez pour sélectionner
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Output Format */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-neutral-300">
            Format de sortie
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {formats.map((f) => (
              <button
                key={f.value}
                onClick={() => setOutputFormat(f.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  outputFormat === f.value
                    ? "border-[var(--accent)] bg-[var(--accent-glow)] text-white"
                    : "border-[var(--border)] text-neutral-400 hover:border-neutral-600"
                }`}
              >
                <div className="font-medium text-sm">{f.label}</div>
                <div className="text-xs text-neutral-500 mt-1">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider (not for PNG/ICO) */}
        {outputFormat !== "png" && outputFormat !== "ico" && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-neutral-300">
              Qualité : {quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs text-neutral-600 mt-1">
              <span>Légère (10%)</span>
              <span>Maximale (100%)</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={loading || !file}
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
            `Convertir en ${outputFormat.toUpperCase()}`
          )}
        </button>

        {/* Result */}
        {resultUrl && (
          <div className="mt-6 p-4 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10">
            <p className="font-medium text-[var(--success)] mb-3">
              Conversion réussie !
            </p>
            <a
              href={resultUrl}
              download={resultFilename}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--success)] text-black font-medium text-sm hover:opacity-90 transition-opacity"
            >
              ⬇ Télécharger {resultFilename}
            </a>
          </div>
        )}
      </div>

      {/* Supported Formats */}
      <div className="mt-8 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <h3 className="font-semibold mb-4">Formats supportés</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            {
              label: "Entrée",
              value: "PNG, JPEG, WebP, GIF, BMP, TIFF, SVG",
            },
            {
              label: "Sortie",
              value: "JPEG, PNG, WebP, Favicon (.ico)",
            },
            {
              label: "Taille max",
              value: "50 MB par fichier",
            },
            {
              label: "Favicon",
              value: "Génère un .ico multi-tailles (16x16, 32x32, 48x48)",
            },
          ].map((item) => (
            <div key={item.label} className="flex gap-2">
              <span className="text-neutral-500 font-medium">
                {item.label} :
              </span>
              <span className="text-neutral-400">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
