"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadPhotoAction } from "@/app/actions/photos";
import type { Category } from "@/lib/types";

const MAX_DIMENSION = 2000; // langste zijde na verkleinen
const TARGET_QUALITY = 0.82;

/**
 * Verkleint een foto in de browser tot een handzame JPEG. Telefoonfoto's zijn
 * vaak 3-5 MB; dat is te groot om te versturen. Lukt het verkleinen niet
 * (bijvoorbeeld een formaat dat de browser niet kan tekenen), dan gebruiken we
 * het originele bestand.
 */
async function shrinkImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", TARGET_QUALITY)
    );
    if (!blob) return file;
    // Alleen gebruiken als het echt kleiner is.
    if (blob.size >= file.size) return file;
    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export default function UploadForm({
  remainingCategories,
  currentDay,
}: {
  remainingCategories: Category[];
  currentDay: number;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      const data = new FormData(e.currentTarget);
      const file = data.get("photo");

      if (file instanceof File && file.size > 0) {
        setStatus("Foto voorbereiden…");
        const shrunk = await shrinkImage(file);
        if (shrunk.size > 8 * 1024 * 1024) {
          setBusy(false);
          setStatus("");
          setMsg({
            type: "err",
            text: "Deze foto is te groot om te versturen. Probeer een andere foto.",
          });
          return;
        }
        data.set("photo", shrunk, shrunk.name);
      }

      setStatus("Bezig met inleveren…");
      const res = await uploadPhotoAction(data);

      if (res?.ok) {
        setMsg({ type: "ok", text: "Foto ingeleverd! 🎉" });
        formRef.current?.reset();
        router.refresh();
      } else {
        setMsg({ type: "err", text: res?.error ?? "Er ging iets mis." });
      }
    } catch {
      setMsg({
        type: "err",
        text: "Uploaden mislukt. Controleer je internetverbinding en probeer het opnieuw.",
      });
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl bg-ocean/5 px-4 py-3 text-sm text-stone-600">
        📅 Dit wordt opgeslagen als <span className="font-semibold text-ocean">dag {currentDay}</span>.
        De dag wordt automatisch bepaald.
      </div>

      <div>
        <label className="label">Categorie</label>
        <select name="category_id" className="input" required defaultValue="">
          <option value="" disabled>
            Kies een categorie…
          </option>
          {remainingCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Foto</label>
        <input
          name="photo"
          type="file"
          accept="image/*"
          className="input"
          required
        />
      </div>

      <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
        ⚠️ Let op: zodra je inlevert is je keuze <strong>definitief</strong>. Je kunt
        een foto daarna niet meer wijzigen of verwijderen.
      </div>

      {msg && (
        <div
          className={
            msg.type === "ok"
              ? "rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm"
              : "rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
          }
        >
          {msg.text}
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? status || "Bezig…" : "Foto inleveren"}
      </button>
    </form>
  );
}
