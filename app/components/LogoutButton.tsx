"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/iniciar-sesion");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      className="button-secondary button-submit"
      onClick={handleLogout}
      disabled={isSubmitting}
    >
      {isSubmitting ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}