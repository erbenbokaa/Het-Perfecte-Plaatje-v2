"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadPhotoAction } from "@/app/actions/photos";
import type { Category } from "@/lib/types";

export default function UploadForm({
  categories,
  numDays,
}: {
  categories: Category[];
  numDays: number;
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
      setMsg({ type: "ok", text: "Foto opgeslagen! 🎉" });
      formRef.current?.reset();
      router.refresh();
    } else {
      setMsg({ type: "err", text: res?.error ?? "Er ging iets mis." });
    }
  }

  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Categorie</label>
        <select name="category_id" className="input" required defaultValue="">
          <option value="" disabled>
            Kies een categorie…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Welke dag?</label>
        <select name="day_number" className="input" defaultValue="1">
          {days.map((d) => (
            <option key={d} value={d}>
              Dag {d}
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

      <div>
        <label className="label">Bijschrift (optioneel)</label>
        <input name="caption" className="input" maxLength={200} placeholder="bijv. zonsondergang op het strand" />
      </div>

      {msg && (
        <div
          className={
            msg.type === "ok"
              ? "rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm"
              : "rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm"
          }
        >
          {msg.text}
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Bezig met uploaden…" : "Foto uploaden"}
      </button>
    </form>
  );
}
