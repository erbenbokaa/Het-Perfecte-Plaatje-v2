"use client";

import { useState } from "react";
import { resetParticipantCodeAction } from "@/app/actions/admin";

export default function ResetCodeButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    const code = window.prompt(
      `Nieuwe code voor ${name} (minimaal 4 tekens):`
    );
    if (code == null) return; // geannuleerd
    if (code.length < 4) {
      window.alert("De code moet minimaal 4 tekens zijn.");
      return;
    }
    setBusy(true);
    const res = await resetParticipantCodeAction(id, code);
    setBusy(false);
    if (res?.ok) {
      window.alert(`De code van ${name} is bijgewerkt. Deel de nieuwe code met ${name}.`);
    } else {
      window.alert(res?.error ?? "Er ging iets mis.");
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="text-sm text-ocean hover:underline disabled:opacity-50"
    >
      {busy ? "…" : "code wijzigen"}
    </button>
  );
}
