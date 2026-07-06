"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="button button-danger"
      disabled={isLoggingOut}
      onClick={handleLogout}
      type="button"
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
