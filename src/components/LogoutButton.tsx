import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="text-stone-500 hover:text-stone-800 hover:underline">
        Uitloggen
      </button>
    </form>
  );
}
