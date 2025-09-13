// components/AnnonceCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Annonce = {
  id: string;
  title: string;
  price: number;
  firstImagePath?: string;
  isPublished: boolean;
  contact?: string;
  status?: "active" | "deleted";
  isSponsored?: boolean;
};

export default function AnnonceCard({ annonce }: { annonce: Annonce }) {
 
  const router = useRouter();

  const [published, setPublished] = useState(annonce.isPublished);
  const [status, setStatus] = useState<"active" | "deleted">(annonce.status ?? "active");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false); // <-- modal visible ?
  const [sponsored, setSponsored] = useState(annonce.isSponsored ?? false);


  const isDeleted = status === "deleted";

  // --- Publish / Unpublish
  const toggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrMsg(null);
    setLoading(true);

    const next = !published;
    setPublished(next);

    try {
      const res = await fetch(`/api/annonce/${annonce.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: next }),
      });
      if (!res.ok) {
        setPublished(!next);
        const data = await res.json().catch(() => null);
        setErrMsg(data?.error || "Failed to update status");
      }
    } catch {
      setPublished(!next);
      setErrMsg("Network error");
    } finally {
      setLoading(false);
    }
  };


  const toggleSponsor = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrMsg(null);
  
    const next = !sponsored;
    setSponsored(next);
  
    try {
      const res = await fetch(`/api/annonce/${annonce.id}/sponsor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSponsored: next }),
      });
      if (!res.ok) {
        setSponsored(!next); // rollback
        const data = await res.json().catch(() => null);
        setErrMsg(data?.error || "Failed to update sponsor state");
      }
    } catch {
      setSponsored(!next);
      setErrMsg("Network error");
    } finally {
      setLoading(false);
    }
  };
  

  // --- DELETE
  const confirmDelete = async () => {
    setDeleting(true);
    setErrMsg(null);

    try {
      const res = await fetch(`/api/annonce/${annonce.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrMsg(data?.error || "Failed to delete");
        return;
      }
      setStatus("deleted");
      setShowConfirm(false); // fermer le modal
      router.refresh();
    } catch {
      setErrMsg("Network error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Link
        href={`/annonces/${annonce.id}`}
        className="block rounded-lg border bg-white shadow-sm hover:shadow-md transition overflow-hidden"
      >
        {/* Image */}
        <div className="w-full h-40 bg-blue-100">
          {annonce.firstImagePath ? (
            <img src={annonce.firstImagePath} alt={annonce.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              {"No Image"}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4 space-y-3">
          <h3 className="text-base font-semibold text-gray-900 truncate">{annonce.title}</h3>

          {/* Prix */}
          <div className="flex justify-between text-sm text-black">
            <span className="font-medium">Prix :</span>
            <span>{annonce.price} MRU</span>
          </div>

          {/* Publié / Non publié */}
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-black">Status :</span>
            {published ? (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Publier
              </span>
            ) : (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                Non publié
              </span>
            )}
          </div>


          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-black">Sponsorisation :</span>
            {sponsored ? (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Sponsoriser
              </span>
            ) : (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                Non Sponsoriser
              </span>
            )}
          </div>

          {/* État global */}
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-black">État :</span>
            {isDeleted ? (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                { "Supprimée"}
              </span>
            ) : (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {"Active"}
              </span>
            )}
          </div>

          {/* Contact */}
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-black">Contact :</span>
            <span className="text-black">{annonce.contact || "-"}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleStatus}
              disabled={loading}
              className={`mt-2 px-3 py-1 text-xs font-medium rounded transition ${
                published ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
              } disabled:opacity-50`}
            >
              {loading
                ? "En cours..."
                : published
                ? "non publié"
                : "publier"}
            </button>

            <button
              onClick={toggleSponsor}
              disabled={loading}
              className={`mt-2 px-3 py-1 text-xs text-black font-medium rounded hover:bg-gray-500  ${
                sponsored ? "bg-yellow-500 text-black" : "bg-gray-200 text-gray-800"
              }`}
            >
              {sponsored ? "Désponsoriser" : "Sponsoriser"}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                setShowConfirm(true); // ouvrir le popup
              }}
              disabled={deleting || isDeleted}
              className="mt-2 px-3 py-1 text-xs font-medium rounded bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50"
            >
              {isDeleted
                ?  "Supprimée"
                : deleting
                ? "En cours..."
                : "Supprimer"}
            </button>

            {errMsg && <span className="text-xs text-red-600 mt-2">{errMsg}</span>}
          </div>
        </div>
      </Link>

      {/* Modal joli pour confirmer la suppression */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 text-black">{"Confirmer la suppression"}</h2>
            <p className="text-sm text-gray-600 mb-6 text-black">
              {"Êtes-vous sûr de vouloir supprimer cet utilisateur ?" }
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                {"Annuler"}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {deleting ? "En cours ..." :  "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
