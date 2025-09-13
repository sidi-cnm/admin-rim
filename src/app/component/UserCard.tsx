"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/locales/client";

type User = {
  id: string;
  email: string;
  roleName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string | null;
};

type Toast = { type: "success" | "error"; text: string } | null;

export default function UserCard({ user }: { user: User }) {
  

  // 👇 états locaux pour mise à jour en direct
  const [active, setActive] = useState(user.isActive);
  const [verified, setVerified] = useState(user.emailVerified);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const showSuccess = (text: string) => setToast({ type: "success", text });
  const showError = (text: string) => setToast({ type: "error", text });

  const toggleActive = async () => {
    if (loading) return;

    setLoading(true);
    const next = !active;

    // ✅ mise à jour optimiste des 2 états liés
    setActive(next);
    setVerified(next); // on suppose que l'API lie emailVerified à isActive

    try {
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });

      if (!res.ok) {
        // ❌ rollback
        setActive(!next);
        setVerified(!next);
        const data = await res.json().catch(() => ({}));
        showError(data?.error ?? ( "Une erreur est survenue"));
        return;
      }

      // ✅ on synchronise avec la réponse serveur au cas où
      const data = await res.json().catch(() => ({}));
      if (typeof data.isActive === "boolean") setActive(data.isActive);
      if (typeof data.emailVerified === "boolean") setVerified(data.emailVerified);

      showSuccess(
        next
          ? "Utilisateur activé avec succès"
          : "Utilisateur désactivé avec succès"
      );
    } catch {
      // ❌ rollback en cas d’erreur réseau
      setActive(!next);
      setVerified(!next);
      showError("Erreur réseau, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-lg border bg-white shadow-sm p-4 hover:shadow-md transition flex flex-col justify-between">
      {/* Toast */}
      {toast && (
        <div
          aria-live="polite"
          className={`absolute top-2 right-2 z-10 px-3 py-2 text-xs rounded shadow ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Email */}
      <h3 className="text-base font-semibold text-gray-900 mb-3">{user.email}</h3>

      {/* Infos */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">{"Role"} :</span>
          <span className="text-gray-900">{user.roleName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">{"Status"} :</span>
          {active ? (
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
              {"Active"}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">
              {"Desactive"}
            </span>
          )}
        </div>

        {/* 👇 On affiche l'état local `verified` (et plus la prop) */}
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">{"Email vérifié"} :</span>
          {verified ? (
            <span className="text-green-600 font-medium">{"Yes"}</span>
          ) : (
            <span className="text-rose-600 font-medium">{"No"}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2 justify-end">
        <button
          onClick={toggleActive}
          disabled={loading}
          className={`px-3 py-1 text-xs font-medium rounded transition ${
            active ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
          } disabled:opacity-50`}
        >
          {loading
            ? "Chargement..."
            : active
            ? "Désactiver"
            : "Activer"}
        </button>

        <button
          className="px-3 py-1 text-xs font-medium rounded bg-rose-100 text-rose-700 hover:bg-rose-200"
          onClick={() =>
            setToast({
              type: "error",
              text: "Suppression à venir…",
            })
          }
        >
          {"Supprimer"}
        </button>
      </div>
    </div>
  );
}
