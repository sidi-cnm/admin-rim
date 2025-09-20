"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnnonceCard from "./AnnonceCard";
import PaginationUI from "./PaginationUI";

type Annonce = {
  id: string;
  title: string;
  price: number;
  firstImagePath?: string;
  isPublished: boolean;
  contact?: string;
  status?: string;
  createdAt: Date;
};

export default function AnnonceListUI({
  annonces,
  totalPages,
  currentPage,
}: {
  annonces: Annonce[];
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  // ✅ valeurs par défaut : published=false, annonceStatus=active
  const publishedParam = sp.get("published") ?? "false";
  const phoneParam = sp.get("phone") ?? "";
  const startDateParam = sp.get("startDate") ?? "";
  const endDateParam = sp.get("endDate") ?? "";
  const annonceStatusParam = sp.get("annonceStatus") ?? "active";

  const showPublished = publishedParam === "true";
  const showUnpublished = publishedParam === "false";

  const setQuery = (next: Record<string, string | null>) => {
    const q = new URLSearchParams(sp.toString());

    // 🔥 supprimer l'ancien paramètre "status" de l'URL
    q.delete("status");

    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === "") q.delete(k);
      else q.set(k, v);
    });

    if (
      next.published !== undefined ||
      next.phone !== undefined ||
      next.startDate !== undefined ||
      next.endDate !== undefined ||
      next.annonceStatus !== undefined
    ) {
      q.set("page", "1");
    }

    router.push(`?${q.toString()}`);
  };

  const handleCheckPublished = (checked: boolean) => {
    if (checked) {
      setQuery({ published: "true", annonceStatus: "active" });
    } else {
      setQuery({ published: "false", annonceStatus: "active" });
    }
  };

  const handleCheckUnpublished = (checked: boolean) => {
    if (checked) {
      setQuery({ published: "false", annonceStatus: "active" });
    } else {
      setQuery({ published: "true", annonceStatus: "active" });
    }
  };

  // Filtrage côté client
  const filteredAnnonces = useMemo(() => {
    return annonces.filter((a) => {
      if (publishedParam === "true" && !a.isPublished) return false;
      if (publishedParam === "false" && a.isPublished) return false;
      if (annonceStatusParam === "deleted" && a.status !== "deleted") return false;
      if (annonceStatusParam === "active" && a.status !== "active") return false;
      if (phoneParam.trim() && !(a.contact ?? "").includes(phoneParam.trim()))
        return false;
      if (startDateParam && new Date(a.createdAt) < new Date(startDateParam))
        return false;
      if (endDateParam && new Date(a.createdAt) > new Date(endDateParam))
        return false;
      return true;
    });
  }, [
    annonces,
    publishedParam,
    phoneParam,
    startDateParam,
    endDateParam,
    annonceStatusParam,
  ]);

  const handlAddAnnonce = () => {
    router.push("/AddAnnonce");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-4 bg-white border rounded-md p-3 shadow-sm">
        <span className="font-medium text-gray-800">Filtres :</span>

        {/* Filtre Publié */}
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={showPublished}
            onChange={(e) => handleCheckPublished(e.target.checked)}
          />
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            Publié
          </span>
        </label>

        {/* Filtre Non publié */}
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={showUnpublished}
            onChange={(e) => handleCheckUnpublished(e.target.checked)}
          />
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            Non publié
          </span>
        </label>

        {/* Filtre Statut */}
        <select
          value={annonceStatusParam}
          onChange={(e) => setQuery({ annonceStatus: e.target.value })}
          className="border text-black rounded-md px-3 py-1 text-sm"
        >
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="deleted">Supprimés</option>
        </select>

        {/* Recherche par téléphone */}
        <input
          type="text"
          defaultValue={phoneParam}
          onChange={(e) => setQuery({ phone: e.target.value })}
          placeholder="Rechercher par téléphone..."
          className="border text-black rounded-md px-3 py-1 text-sm flex-1 min-w-[200px]"
        />

        {/* Filtre par date */}
        <input
          type="date"
          name="startDate"
          onChange={(e) => setQuery({ startDate: e.target.value })}
          defaultValue={startDateParam}
          className="border text-black rounded-md px-3 py-1 text-sm"
        />
        <input
          type="date"
          name="endDate"
          onChange={(e) => setQuery({ endDate: e.target.value })}
          defaultValue={endDateParam}
          className="border text-black rounded-md px-3 py-1 text-sm"
        />

        <button
          onClick={handlAddAnnonce}
          className="text-white bg-blue-700 rounded-md p-2 hover:bg-blue-600"
        >
          Ajouter une Annonce
        </button>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnnonces.length > 0 ? (
          filteredAnnonces.map((a) => <AnnonceCard key={a.id} annonce={a} />)
        ) : (
          <div className="col-span-full text-center text-gray-500">
            Aucune annonce trouvée
          </div>
        )}
      </div>

      {/* Pagination */}
      <PaginationUI totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
