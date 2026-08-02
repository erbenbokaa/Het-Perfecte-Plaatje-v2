"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  prepareUploadAction,
  finalizePhotoAction,
  uploadPhotoAction,
} from "@/app/actions/photos";
import type { Category } from "@/lib/types";

// Alleen gebruikt voor de reserve-route en voor HEIC-omzetting.
const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 0.9;

/** Formaten die niet elk apparaat kan tonen; die zetten we om naar JPEG. */
function needsConversion(file: File) {
  const t = file.type.toLowerCase();
  return t.includes("heic") || t.includes("heif") || t === "";
}

/**
 * Zet een foto om naar JPEG (en schaalt eventueel terug). Lukt dat niet, dan
 * geven we het originele bestand terug.
 */
async function toJpeg(file: File, maxDimension: number): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
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
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return file;
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

  function succeed() {
    setMsg({ type: "ok", text: "Foto ingeleverd! 🎉" });
    formRef.current?.reset();
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const form = e.currentTarget;

    try {
      const data = new FormData(form);
      const categoryId = String(data.get("category_id") ?? "");
      let file = data.get("photo");

      if (!(file instanceof File) || file.size === 0) {
        setMsg({ type: "err", text: "Kies een foto." });
        return;
      }

      // HEIC e.d. omzetten zodat iedereen de foto kan bekijken.
      if (needsConversion(file)) {
        setStatus("Foto voorbereiden…");
        file = await toJpeg(file, MAX_DIMENSION);
      }

      // Rechtstreeks naar de opslag: originele kwaliteit blijft behouden.
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const prep = await prepareUploadAction(categoryId, ext);
      if (!prep.ok) {
        setMsg({ type: "err", text: prep.error });
        return;
      }

      setStatus("Bezig met uploaden…");
      let directOk = false;
      try {
        const res = await fetch(prep.signedUrl, {
          method: "PUT",
          headers: { "content-type": file.type || "image/jpeg" },
          body: file,
        });
        directOk = res.ok;
      } catch {
        directOk = false;
      }

      if (directOk) {
        setStatus("Inzending vastleggen…");
        const done = await finalizePhotoAction(categoryId, prep.path);
        if (done.ok) succeed();
        else setMsg({ type: "err", text: done.error });
        return;
      }

      // Vangnet: via de server, met een verkleinde versie.
      setStatus("Opnieuw proberen…");
      const smaller = await toJpeg(file, 1800);
      const fallback = new FormData();
      fallback.set("category_id", categoryId);
      fallback.set("photo", smaller, smaller.name);
      const res = await uploadPhotoAction(fallback);
      if (res?.ok) succeed();
      else setMsg({ type: "err", text: res?.error ?? "Uploaden mislukt." });
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
