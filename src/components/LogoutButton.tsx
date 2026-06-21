import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        aria-label="Uitloggen"
        className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/70 px-3 py-1.5 text-sm text-stone-500 transition active:scale-95 hover:text-stone-800"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
          <path
            d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M14 5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline">Uitloggen</span>
      </button>
    </form>
  );
}
