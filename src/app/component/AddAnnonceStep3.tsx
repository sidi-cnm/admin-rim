"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";;

type Lieu = { id: number; name: string; nameAr: string };

type Props = {
  lang?: string;
  lieuxApiBase: string;             // `/${lang}/p/api/tursor/lieux`
  createAnnonceEndpoint: string;    // `/${lang}/api/annonces`
  onBack: () => void;
  draft: {
    typeAnnonceId?: string;
    categorieId?: string;
    subcategorieId?: string;
    title?: string;
    description?: string;
    price?: number | null;
    contact?:number | null;
    images?: File[];
    mainIndex?: number;
    lieuId?: string;
    moughataaId?: string;
    directNegotiation?: boolean | null;
    classificationFr?: string;
    classificationAr?: string;
    isSamsar?: boolean;
    typeAnnonceName?: string;
    categorieName?: string;
    typeAnnonceNameAr?: string;
    categorieNameAr?: string;
  };
};

export default function AddAnnonceStep3({
  lang = "fr",
  lieuxApiBase,
  createAnnonceEndpoint,
  onBack,
  draft,
}: Props) {
  
  const router = useRouter();
  const isRTL = useMemo(() => lang.startsWith("ar"), [lang]);

  const [wilayas, setWilayas] = useState<Lieu[]>([]);
  const [moughataas, setMoughataas] = useState<Lieu[]>([]);
  const [selectedWilayaId, setSelectedWilayaId] = useState<number | "">(
    draft.lieuId ? Number(draft.lieuId) : ""
  );
  const [selectedMoughataaId, setSelectedMoughataaId] = useState<number | "">(
    draft.moughataaId ? Number(draft.moughataaId) : ""
  );
  const [loadingWilayas, setLoadingWilayas] = useState(false);
  const [loadingMoughataas, setLoadingMoughataas] = useState(false);
  const [saving, setSaving] = useState(false);

  // Charger wilayas
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoadingWilayas(true);
        const res = await fetch(`${lieuxApiBase}?tag=wilaya`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (ignore) return;
        if (!res.ok || data?.ok === false) {
          toast.error("error loading wilayas");
          setWilayas([]);
          return;
        }
        setWilayas(Array.isArray(data?.data) ? data.data : []);
      } catch {
        toast.error("error loading wilayas");
      } finally {
        setLoadingWilayas(false);
      }
    })();
    return () => { ignore = true; };
  }, [lieuxApiBase]);

  // Charger moughataas quand wilaya change
  useEffect(() => {
    if (selectedWilayaId === "" || selectedWilayaId == null) {
      setMoughataas([]);
      setSelectedMoughataaId("");
      return;
    }
    let ignore = false;
    (async () => {
      try {
        setLoadingMoughataas(true);
        const res = await fetch(`${lieuxApiBase}?parentId=${selectedWilayaId}&tag=moughataa`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (ignore) return;
        if (!res.ok || data?.ok === false) {
          toast.error("erreur mogataa");
          setMoughataas([]);
          setSelectedMoughataaId("");
          return;
        }
        setMoughataas(Array.isArray(data?.data) ? data.data : []);
        setSelectedMoughataaId("");
      } catch {
        toast.error("serreur");
        setMoughataas([]);
        setSelectedMoughataaId("");
      } finally {
        setLoadingMoughataas(false);
      }
    })();
    return () => { ignore = true; };
  }, [selectedWilayaId, lieuxApiBase]);

  // POST unique (multipart)
  const handleSave = async () => {
    if (!selectedWilayaId || !selectedMoughataaId) {
      toast.error("Veuillez sélectionner la wilaya et la moughataa.");
      return;
    }
    // Validation assouplie côté client
    if (!draft.typeAnnonceId || !draft.description) {
      toast.error("Données incomplètes, veuillez revenir à l'étape 1.");
      return;
    }

    setSaving(true);
    const loading = toast.loading("Saving...");
    try {
      const fd = new FormData();
      // step1
      fd.append("typeAnnonceId", String(draft.typeAnnonceId));
      if (draft.categorieId)    fd.append("categorieId", String(draft.categorieId));
      if (draft.subcategorieId) fd.append("subcategorieId", String(draft.subcategorieId));

      fd.append("title", String(draft.title ?? (draft.description ?? "").slice(0, 50)));
      fd.append("description", String(draft.description ?? ""));
      fd.append("contact" ,String(draft.contact))

      console.log("contact :" , draft.contact)

      if (typeof draft.directNegotiation === "boolean") {
        fd.append("directNegotiation", draft.directNegotiation ? "true" : "false");
      }
      if (draft.price != null) fd.append("price", String(draft.price));
      if (draft.classificationFr) fd.append("classificationFr", String(draft.classificationFr));
      if (draft.classificationAr) fd.append("classificationAr", String(draft.classificationAr));
      fd.append("issmar", draft.isSamsar ? "true" : "false");

      // step3 (lieu)
      fd.append("lieuId", String(selectedWilayaId));
      fd.append("moughataaId", String(selectedMoughataaId));

      // step2 (images)
      const files = draft.images ?? [];
      files.forEach((file) => fd.append("files", file));
      fd.append("mainIndex", String(Math.max(0, draft.mainIndex ?? 0)));

      // flags
      fd.append("status", "active");
      fd.append("haveImage", String(files.length > 0));

      if(draft.categorieName) fd.append("categorieName", String(draft.categorieName));
      if(draft.typeAnnonceName) fd.append("typeAnnonceName", String(draft.typeAnnonceName));
      if(draft.categorieNameAr) fd.append("categorieNameAr", String(draft.categorieNameAr));
      if(draft.typeAnnonceNameAr) fd.append("typeAnnonceNameAr", String(draft.typeAnnonceNameAr));
      

      const res = await fetch(createAnnonceEndpoint, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      console.log(" res : " , res)

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || "Create failed");

      toast.success("saved", { id: loading });
      router.push(`/`);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message || "save error", { id: loading });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl" dir={isRTL ? "rtl" : "ltr"}>
      <Toaster position="bottom-right" />
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800">
        {"L`EMPLACEMENT"}
      </h2>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4">
        {/* Wilaya */}
        <div className="mb-3">
          <label className="block text-black text-xs sm:text-sm font-medium text-gray-700 mb-1">
            {"wilaya"}
          </label>
          <select
            value={selectedWilayaId}
            onChange={(e) => setSelectedWilayaId(e.target.value ? Number(e.target.value) : "")}
            disabled={loadingWilayas}
            className="w-full rounded-lg text-black border border-gray-300 px-3 py-2 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">{loadingWilayas ? "…" : "wilaya"}</option>
            {wilayas.map((w) => (
              <option key={w.id} value={w.id}>
                {isRTL ? w.nameAr : w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Moughataa */}
        <div className="mb-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            {"Mogataa"}
          </label>
          <select
            value={selectedMoughataaId}
            onChange={(e) => setSelectedMoughataaId(e.target.value ? Number(e.target.value) : "")}
            disabled={loadingMoughataas || selectedWilayaId === ""}
            className="w-full rounded-lg text-black border border-gray-300 px-3 py-2 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">{loadingMoughataas ? "…" : "Mogataa plachloder"}</option>
            {moughataas.map((m) => (
              <option key={m.id} value={m.id}>
                {isRTL ? m.nameAr : m.name}
              </option>
            ))}
          </select>
        </div>

        <p className="text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4">{"step3"}</p>

        <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button type="button" onClick={onBack} className="w-full sm:w-auto rounded border px-4 py-2 text-sm sm:text-base hover:bg-gray-50">
            {isRTL ? "رجوع" : "Retour"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full sm:w-auto rounded bg-blue-900 px-5 py-2 text-sm sm:text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "saving ..." :"save"}
          </button>
        </div>
      </div>
    </div>
  );
}
