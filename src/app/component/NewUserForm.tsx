"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/locales/client";

type Option = { label: string; value: string };

const roleOptions: Option[] = [
  { label: "Admin", value: "1" },
  { label: "Client", value: "2" },
];

export default function NewUserForm({ locale }: { locale: string }) {
  const t = useI18n();
  const router = useRouter();
  const sp = useSearchParams();

  // champs du formulaire
  const [email, setEmail] = useState(sp.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [roleId, setRoleId] = useState("2"); // client par défaut
  const [roleName, setRoleName] = useState("client");
  const [isActive, setIsActive] = useState(false);

  // ui state
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // garder roleName sync avec roleId
  useEffect(() => {
    const r = roleOptions.find((r) => r.value === roleId);
    setRoleName((r?.label || "Client").toLowerCase());
  }, [roleId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // validations simples
    if (!email.trim()) {
      setToast({ type: "error", text: t("user.errors.emailRequired") || "Email requis" });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setToast({ type: "error", text: t("user.errors.emailInvalid") || "Email invalide" });
      return;
    }
    if (password.length < 6) {
      setToast({ type: "error", text: t("user.errors.passwordShort") || "Mot de passe trop court (min 6)" });
      return;
    }
    if (password !== password2) {
      setToast({ type: "error", text: t("user.errors.passwordMismatch") || "Les mots de passe ne correspondent pas" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          roleId,
          roleName,
          isActive,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ type: "error", text: data?.error || t("common.error") || "Erreur lors de la création" });
        setSubmitting(false);
        return;
      }

      setToast({ type: "success", text: t("user.created") || "Utilisateur créé avec succès" });

      // petite pause pour laisser voir le toast, puis redirection
      setTimeout(() => {
        router.push(`/${locale}/users`);
        router.refresh();
      }, 600);
    } catch {
      setToast({ type: "error", text: t("common.networkError") || "Erreur réseau, réessayez." });
      setSubmitting(false);
    }
  };

  return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="relative w-full max-w-2xl bg-white border rounded-2xl shadow-md p-8">
            {/* Toast */}
            {toast && (
              <div
                aria-live="polite"
                className={`absolute -top-3 right-3 px-3 py-2 text-xs rounded shadow ${
                  toast.type === "success" ? "bg-green-600 text-white" : "bg-rose-600 text-white"
                }`}
              >
                {toast.text}
              </div>
            )}
      
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
              {t("user.add") || "Ajouter un utilisateur"}
            </h1>
      
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("user.email") || "Email"}
                </label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-4 py-3 text-base text-black"
                  placeholder="ex: jean@domaine.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
      
              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.password") || "Mot de passe"}
                  </label>
                  <input
                    type="password"
                    className="w-full border rounded-lg px-4 py-3 text-base text-black"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.passwordConfirm") || "Confirmer le mot de passe"}
                  </label>
                  <input
                    type="password"
                    className="w-full border rounded-lg px-4 py-3 text-base text-black"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
      
              {/* Rôle & Actif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("user.role") || "Rôle"}
                  </label>
                  <select
                    className="w-full border rounded-lg px-4 py-3 text-base text-black bg-white"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                  >
                    {roleOptions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
      
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span className="text-base">{t("user.active") || "Actif"}</span>
                </label>
              </div>
      
              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-lg bg-gray-100 text-gray-800 text-base font-medium hover:bg-gray-200"
                >
                  {t("common.cancel") || "Annuler"}
                </button>
      
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (t("common.loading")) :  "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
      
  
}
