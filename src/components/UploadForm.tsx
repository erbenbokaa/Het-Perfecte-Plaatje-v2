"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadPhotoAction } from "@/app/actions/photos";
import type { Category } from "@/lib/types";

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
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const data = new FormData(e.currentTarget);
    const res = await uploadPhotoAction(data);
    setBusy(false);
    if (res?.ok) {
      setMsg({ type: "ok", text: "Foto ingeleverd! 🎉" });
      formRef.current?.reset();
      router.refresh();
    } else {
      setMsg({ type: "err", text: res?.error ?? "Er ging iets mis." });
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
          capture="environment"
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
        {busy ? "Bezig met inleveren…" : "Foto inleveren"}
      </button>
    </form>
  );
}
