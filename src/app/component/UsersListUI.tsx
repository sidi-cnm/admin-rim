// src/app/[locale]/component/UsersListUI.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import UserCard from "./UserCard";

type User = {
  id: string;
  email: string;
  roleName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  contact?: string | null;   // ✅ Ajouté
  lastLogin?: string | null;
};

export default function UsersListUI({
  locale,
  users,
  totalPages,
  currentPage,
  initialEmail,
  initialActive, // "true" | "false" | "all"
}: {
  locale: string;
  users: User[];
  totalPages: number;
  currentPage: number;
  initialEmail: string;
  initialActive: string;
}) {
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // État contrôlé des filtres
  const [email, setEmail] = useState(initialEmail);
  // checkbox "Actifs seulement" => true => active=true, false => active=all
  const [onlyActive, setOnlyActive] = useState(initialActive === "true");

  // Construit l’URL avec filtres + page
  const makeUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));

      if (email.trim()) params.set("email", email.trim());
      else params.delete("email");

      if (onlyActive) params.set("active", "true");
      else params.set("active", "all");

      return `/users?${params.toString()}`;
    },
    [email, onlyActive, locale, searchParams]
  );

  const applyFilters = () => {
    router.push(makeUrl(1)); // revenir page 1
  };

  const goNext = () => {
    if (currentPage < totalPages) router.push(makeUrl(currentPage + 1));
  };
  const goPrev = () => {
    if (currentPage > 1) router.push(makeUrl(currentPage - 1));
  };

  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (email) parts.push(`Email: ${email}`);
    if (onlyActive) parts.push("Actifs seulement");
    return parts.join(" • ");
  }, [email, onlyActive]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Barre d’actions / filtres */}
      <div className="flex flex-wrap items-center gap-3 bg-white border rounded-md p-3 shadow-sm">
        {/* Ajouter */}
        <a
          href={`/users/new`}
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          { "Ajouter un utilisateur"}
        </a>

        {/* Email */}
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={"Rechercher par email..."}
          className="border rounded-md px-3 py-2 text-sm min-w-[220px] flex-1 text-black"
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />

        {/* Actifs seulement */}
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
          />
          <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
            {"Actifs seulement"}
          </span>
        </label>

        <button
          onClick={applyFilters}
          className="px-3 py-2 rounded bg-gray-900 text-white text-sm font-medium hover:bg-black/90"
        >
          {"Filtrer"}
        </button>

        {/* Résumé compact */}
        {subtitle && (
          <span className="ml-auto text-xs text-gray-500">{subtitle}</span>
        )}
      </div>

      {/* Grille des users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.length ? (
          users.map((u) => <UserCard key={u.id} user={u} />)
        ) : (
          <div className="col-span-full text-center text-gray-500">
            {"Aucun utilisateur trouvé"}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <button
          onClick={goPrev}
          disabled={currentPage === 1}
          className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded disabled:opacity-50"
        >
          {"Precedant"}
        </button>
        <button
          onClick={goNext}
          disabled={currentPage === totalPages}
          className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded disabled:opacity-50"
        >
          {"Suivant"}
        </button>
        <div className="flex items-center bg-gray-100 ml-3 p-2 rounded-lg shadow-md">
          <span className="text-gray-700 font-semibold">
            {"Page actuelle"}
            <span className="font-bold text-blue-600">{currentPage}</span>{" "}
            {"de"}
            <span className="font-bold text-blue-600">{totalPages}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
