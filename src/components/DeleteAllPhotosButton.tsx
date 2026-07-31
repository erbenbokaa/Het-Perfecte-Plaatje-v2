"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAllPhotosAction } from "@/app/actions/admin";

export default function DeleteAllPhotosButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onClick() {
    if (
      !window.confirm(
        "Weet je het zeker? ALLE geüploade foto's (en bijbehorende stemmen) worden definitief verwijderd."
      )
    ) {
      return;
    }
    if (!window.confirm("Dit kan niet ongedaan worden gemaakt. Doorgaan?")) {
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await deleteAllPhotosAction();
    setBusy(false);
    if (res?.ok) {
      setMsg(`${res.count} foto('s) verwijderd.`);
      router.refresh();
    } else {
      setMsg("Er ging iets mis.");
    }
  }

  return (
    <div>
      <button onClick={onClick} className="btn-danger" disabled={busy}>
        {busy ? "Bezig met verwijderen…" : "Verwijder alle foto's"}
      </button>
      {msg && <p className="mt-2 text-sm text-stone-600">{msg}</p>}
    </div>
  );
}
