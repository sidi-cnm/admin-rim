// components/AnnonceListUI.tsx
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
  status?: "active" | "deleted";
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

  const publishedParam = sp.get("published") ?? "all";
  const phoneParam = sp.get("phone") ?? "";

  const showPublished = publishedParam === "all" || publishedParam === "true";
  const showUnpublished = publishedParam === "all" || publishedParam === "false";

  const setQuery = (next: Record<string, string | null>) => {
    const q = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === "") q.delete(k);
      else q.set(k, v);
    });
    if (next.published !== undefined || next.phone !== undefined) q.set("page", "1");
    router.push(`?${q.toString()}`);
  };

  const handleCheckPublished = (checked: boolean) => {
    if (checked && showUnpublished) setQuery({ published: "all" });
    else if (checked && !showUnpublished) setQuery({ published: "true" });
    else if (!checked && showUnpublished) setQuery({ published: "false" });
    else setQuery({ published: "all" });
  };

  const handleCheckUnpublished = (checked: boolean) => {
    if (checked && showPublished) setQuery({ published: "all" });
    else if (checked && !showPublished) setQuery({ published: "false" });
    else if (!checked && showPublished) setQuery({ published: "true" });
    else setQuery({ published: "all" });
  };

  const filteredAnnonces = useMemo(() => {
    return annonces.filter((a) => {
      if (publishedParam === "true" && !a.isPublished) return false;
      if (publishedParam === "false" && a.isPublished) return false;
      if (phoneParam.trim()) return (a.contact ?? "").includes(phoneParam.trim());
      return true;
    });
  }, [annonces, publishedParam, phoneParam]);

  return (
    <div className="flex flex-col gap-6">
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-4 bg-white border rounded-md p-3 shadow-sm">
        <span className="font-medium text-gray-800">Filtres :</span>

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

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={showUnpublished}
            onChange={(e) => handleCheckUnpublished(e.target.checked)}
          />
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            Non publié
          </span>
        </label>

        <input
          type="text"
          defaultValue={phoneParam}
          onChange={(e) => setQuery({ phone: e.target.value })}
          placeholder="Rechercher par téléphone..."
          className="border text-black rounded-md px-3 py-1 text-sm flex-1 min-w-[200px]"
        />
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnnonces.length > 0 ? (
          filteredAnnonces.map((a) => <AnnonceCard key={a.id} annonce={a} />)
        ) : (
          <div className="col-span-full text-center text-gray-500">Aucune annonce trouvée</div>
        )}
      </div>

      {/* Pagination */}
      <PaginationUI totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
