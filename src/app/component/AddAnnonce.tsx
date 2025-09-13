"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Category, SubCategory, TypeAnnonce } from "../mytypes/types";
import { Contact } from "lucide-react";

type Position = "owner" | "broker" | "other";

type Props = {
  relavieUrlOptionsModel: string;
  isSamsar?: boolean;
  onNext: (payload: {
    typeAnnonceId: string;
    // deviennent optionnels s’ils n’existent pas
    categorieId?: string;
    subcategorieId?: string;
    title: string;
    description: string;
    price: number | null;
    contact? : number | null | undefined;

    position: Position;
    directNegotiation?: boolean | null;
    classificationFr: string;
    classificationAr: string;
    isSamsar: boolean;
  }) => void;
  initial?: {
    typeAnnonceId?: string;
    categorieId?: string;
    subcategorieId?: string;
    description?: string;
    price?: number | null | undefined;
    contact? : number | null | undefined;

    position?: Position;
    directNegotiation?: boolean | null;
    isSamsar?: boolean;
  };
};

export default function AddAnnonceStep1({
  relavieUrlOptionsModel,
  isSamsar = false,
  onNext,
  initial,
}: Props) {
  

  // Données
  const [typeAnnonces, setTypeAnnonces] = useState<TypeAnnonce[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);

  // Sélections
  const [selectedTypeId, setSelectedTypeId] = useState<string>(initial?.typeAnnonceId ?? "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initial?.categorieId ?? "");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(initial?.subcategorieId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<string>(initial?.price != null ? String(initial.price) : "");
  const [contact,setContact] = useState<string>(initial?.contact != null ? String(initial.contact) : "");

  // Nouveaux états
  const [position, setPosition] = useState<Position>(initial?.position ?? (isSamsar ? "broker" : "owner"));
  const [directNegotiation, setDirectNegotiation] = useState<boolean | null>(
    initial?.directNegotiation ?? null
  );

  // Erreurs champ par champ
  const [errors, setErrors] = useState<{
    type?: boolean;
    category?: boolean;
    subCategory?: boolean;
    description?: boolean;
    directNegotiation?: boolean;
  }>({});

  // Charger Types d'annonces
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${relavieUrlOptionsModel}`);
        if (!res.ok) throw new Error();
        setTypeAnnonces(await res.json());
      } catch {
        toast.error("eerreur");
      }
    })();
  }, [relavieUrlOptionsModel]);

  // Charger catégories selon type
  useEffect(() => {
    (async () => {
      if (!selectedTypeId) {
        setCategories([]);
        return;
      }
      try {
        const res = await axios.get(
          `${relavieUrlOptionsModel}?parentId=${encodeURIComponent(selectedTypeId)}`
        );
        setCategories(res.data);
      } catch {
        toast.error("Erreur");
      }
    })();
  }, [selectedTypeId, relavieUrlOptionsModel]);

  // Charger sous-catégories selon catégorie
  useEffect(() => {
    (async () => {
      if (!selectedCategoryId) {
        setFilteredSubCategories([]);
        return;
      }
      try {
        const res = await axios.get(
          `${relavieUrlOptionsModel}?parentId=${encodeURIComponent(selectedCategoryId)}`
        );
        setFilteredSubCategories(res.data);
      } catch {
        toast.error("erreur");
      }
    })();
  }, [selectedCategoryId, relavieUrlOptionsModel]);

  // Reset enfants quand le parent change
  useEffect(() => {
    setSelectedCategoryId("");
    setSelectedSubCategoryId("");
  }, [selectedTypeId]);
  useEffect(() => {
    setSelectedSubCategoryId("");
  }, [selectedCategoryId]);

  // Si pas courtier, on nettoie la sous-question
  useEffect(() => {
    if (position !== "broker") setDirectNegotiation(null);
  }, [position]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    const needCategory = categories.length > 0;
    const needSubcat = needCategory && filteredSubCategories.length > 0;

    const nextErrors: typeof errors = {};
    if (!selectedTypeId) nextErrors.type = true;
    if (needCategory && !selectedCategoryId) nextErrors.category = true;
    if (needSubcat && !selectedSubCategoryId) nextErrors.subCategory = true;
    if (!description.trim()) nextErrors.description = true;
    if (position === "broker" && directNegotiation == null) nextErrors.directNegotiation = true;
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    const typeObj = typeAnnonces.find(t => String(t.id) === String(selectedTypeId));
    const catObj  = categories.find(c => String(c.id) === String(selectedCategoryId));
    const subObj  = filteredSubCategories.find(s => String(s.id) === String(selectedSubCategoryId));

    const classificationFr = [typeObj?.name, catObj?.name, subObj?.name].filter(Boolean).join("/");
    const classificationAr = [typeObj?.nameAr, catObj?.nameAr, subObj?.nameAr].filter(Boolean).join("/");

    const title = description.substring(0, 50);

    onNext({
      typeAnnonceId: selectedTypeId,
      ...(selectedCategoryId ? { categorieId: selectedCategoryId } : {}),
      ...(selectedSubCategoryId ? { subcategorieId: selectedSubCategoryId } : {}),
      title,
      description,
      price: price === "" ? null : Number(price),
      position,
      directNegotiation,
      classificationFr,
      classificationAr,
      contact: contact === "" ? null : Number(contact),
      isSamsar,
    });
  };

  console.log("contact render :" , contact)

  return (
    <div className="mx-auto max-w-2xl">
      <Toaster position="bottom-right" />
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {"Ajouter une annonce"}
      </h2>

      <form onSubmit={handleNext} className="bg-white shadow-lg rounded-lg p-6 space-y-5">
        {/* Type (toujours requis) */}
        <div>
          <label className="block text-black text-sm font-medium mb-1">
            {"annonceType"}
          </label>
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(String(e.target.value))}
            className={`w-full rounded text-black border p-2 ${errors.type ? "border-red-500" : ""}`}
          >
            <option value="">{"Selection Type"}</option>
            {typeAnnonces.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-red-500 text-xs mt-1">{"Type required"}</p>
          )}
        </div>

        {/* Catégorie (requis seulement s'il y en a) */}
        <div>
          <label className="block text-black text-sm font-medium mb-1">
            {"category"}
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(String(e.target.value))}
            disabled={!selectedTypeId || categories.length === 0}
            className={`w-full rounded border p-2 text-black disabled:bg-gray-100 disabled:text-gray-400 ${errors.category ? "border-red-500" : ""}`}
          >
            <option value="">
              {categories.length ? "Slection categorie" : "Aaucune categorie disponible"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{"Categorie required"}</p>
          )}
        </div>

        {/* Sous-catégorie (requis seulement s'il y en a) */}
        <div>
          <label className="block text-black text-sm font-medium mb-1">
            {"Sous-catégorie"}
          </label>
          <select
            value={selectedSubCategoryId}
            onChange={(e) => setSelectedSubCategoryId(String(e.target.value))}
            disabled={!selectedCategoryId || filteredSubCategories.length === 0}
            className={`w-full rounded border text-black p-2 disabled:bg-gray-100 disabled:text-gray-400 ${errors.subCategory ? "border-red-500" : ""}`}
          >
            <option value="">
              {filteredSubCategories.length ? "Selection une sous categorie" : "Aaucune sous catégorie disponible"}
            </option>
            {filteredSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          {errors.subCategory && (
            <p className="text-red-500 text-xs mt-1">{"Sous categorie disponible"}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-black font-medium mb-1">
            {"Description"}
          </label>
          <textarea
            rows={4}
            className={`w-full rounded border text-black p-2 ${errors.description ? "border-red-500" : ""}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{"Description Required"}</p>
          )}
        </div>

        {/* Prix (optionnel) */}
        <div>
          <label className="block text-sm text-black font-medium mb-1">
            {"Price"}
          </label>
          <input
            type="number"
            className="w-full text-black rounded border p-2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={0}
          />

          <label className="block text-sm text-black font-medium mb-">Contact</label>
          <input
            type="tel"
            className="w-full text-black rounded border p-2"
            value={contact}
            onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, ""); // supprime tout sauf les chiffres
                setContact(onlyNumbers);
            }}
            placeholder="Entrer votre numéro"
            />



        </div>

        {/* ➜ TA PARTIE RÉINSÉRÉE, avec gestion d'erreur visuelle pour directNegotiation */}
        {isSamsar && (
          <fieldset
            className={`border rounded-md p-3 ${
              errors.directNegotiation ? "border-red-500" : "border-gray-200"
            }`}
          >
            <legend className={`px-1 text-sm ${errors.directNegotiation ? "text-red-600" : "text-gray-700"}`}>
              {"Votre position par rapport au bien"}
            </legend>

            <div className="flex flex-col gap-2 mt-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="position"
                  value="owner"
                  checked={position === "owner"}
                  onChange={() => setPosition("owner")}
                  className="h-4 w-4 text-blue-700"
                />
                <span>{"Propriétaire"}</span>
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="position"
                  value="broker"
                  checked={position === "broker"}
                  onChange={() => setPosition("broker")}
                  className="h-4 w-4 text-blue-700"
                />
                <span>{"Courtier / Intermédiaire"}</span>
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="position"
                  value="other"
                  checked={position === "other"}
                  onChange={() => setPosition("other")}
                  className="h-4 w-4 text-blue-700"
                />
                <span>{"Auter"}</span>
              </label>
            </div>

            {position === "broker" && (
              <div className="mt-4">
                <span className="block text-sm mb-2">
                  {"Direct Q"}
                </span>
                <div className="flex gap-6">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="directNegotiation"
                      value="yes"
                      checked={directNegotiation === true}
                      onChange={() => setDirectNegotiation(true)}
                      className="h-4 w-4 text-blue-700"
                    />
                    <span>{"YES"}</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="directNegotiation"
                      value="no"
                      checked={directNegotiation === false}
                      onChange={() => setDirectNegotiation(false)}
                      className="h-4 w-4 text-blue-700"
                    />
                    <span>{"Non"}</span>
                  </label>
                </div>

                {errors.directNegotiation && (
                  <p className="text-red-500 text-xs mt-2">
                    {"Précisez si la négociation est directe."}
                  </p>
                )}
              </div>
            )}
          </fieldset>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center rounded bg-blue-900 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            {"Suivant"}
          </button>
        </div>
      </form>
    </div>
  );
}
