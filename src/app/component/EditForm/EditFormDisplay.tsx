"use client";
import React from "react";
import { Category, SubCategory } from "../../mytypes/types";

interface TypeAnnonce {
  id: string;
  name: string;
}

interface Lieu {
  id: string;
  name: string;
}

interface EditFormDisplayProps {
  editTitle: string;
  annonceTypeLabel: string;
  categoryLabel: string;
  selectCategoryLabel: string;
  subCategoryLabel: string;
  selectSubCategoryLabel: string;
  descriptionLabel: string;
  priceLabel: string;
  cancelLabel: string;
  updateLabel: string;
  submitting?: boolean;

  typeAnnonces: TypeAnnonce[];
  wilayas: Lieu[];
  moughataas: Lieu[];
  categories: Category[];
  filteredSubCategories: SubCategory[];

  selectedTypeId: string;
  setSelectedTypeId: (id: string) => void;

  selectedWilayaId: string;
  setSelectedWilayaId: (id: string) => void;

  selectedMoughataaId: string;
  setSelectedMoughataaId: (id: string) => void;

  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;

  selectedSubCategoryId: string;
  setSelectedSubCategoryId: (id: string) => void;

  description: string;
  setDescription: (v: string) => void;

  price: string;
  setPrice: (v: string) => void;

  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onEditImages: () => void;

  lang: string;
}

const EditFormDisplay: React.FC<EditFormDisplayProps> = ({
  editTitle,
  annonceTypeLabel,
  categoryLabel,
  selectCategoryLabel,
  subCategoryLabel,
  selectSubCategoryLabel,
  descriptionLabel,
  priceLabel,
  cancelLabel,
  updateLabel,
  typeAnnonces,
  wilayas,
  moughataas,
  categories,
  filteredSubCategories,
  selectedTypeId,
  setSelectedTypeId,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedSubCategoryId,
  setSelectedSubCategoryId,
  selectedWilayaId,
  setSelectedWilayaId,
  selectedMoughataaId,
  setSelectedMoughataaId,
  description,
  setDescription,
  price,
  setPrice,
  handleSubmit,
  onClose,
  onEditImages,
  lang,
}) => {
  // supprimer isRTL si non utilisé
  // const isRTL = lang?.startsWith("ar");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="w-full h-screen max-w-[400px] bg-white rounded-lg border border-gray-200 shadow-lg p-3 sm:p-4 overflow-y-auto hide-scrollbar"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base text-center sm:text-lg md:text-xl font-semibold">
          {editTitle}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          aria-label="Close"
          title="Close"
        >
          &times;
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 px-3 text-sm md:text-base">
        {/* Type annonce */}
        <div>
          <label className="block text-black text-left mb-1 font-medium">{annonceTypeLabel}</label>
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            className="border rounded w-full p-2 text-left text-black"
          >
            <option value="">{annonceTypeLabel}</option>
            {typeAnnonces.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block font-medium text-left mb-1 text-black">{categoryLabel}</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="border rounded w-full text-left p-2 text-black"
            disabled={!selectedTypeId}
          >
            <option value="">{selectCategoryLabel}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sous-catégorie */}
        <div>
          <label className="block text-left mb-1 font-medium text-black">{subCategoryLabel}</label>
          <select
            value={selectedSubCategoryId}
            onChange={(e) => setSelectedSubCategoryId(e.target.value)}
            className="border rounded w-full text-left p-2 text-black"
            disabled={!selectedCategoryId}
          >
            <option value="">{selectSubCategoryLabel}</option>
            {filteredSubCategories.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-left mb-1 font-medium text-black">{descriptionLabel}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded w-full text-left p-2 text-black"
            rows={4}
            required
          />
        </div>

        {/* Wilaya */}
        <div>
          <label className="block text-left mb-1 font-medium text-black">{"Sélection de wilaya"}</label>
          <select
            value={selectedWilayaId}
            onChange={(e) => setSelectedWilayaId(e.target.value)}
            className="border rounded text-left w-full p-2 text-black"
          >
            <option value="">{"Sélection de wilaya"}</option>
            {wilayas.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Moughataa */}
        <div>
          <label className="block mb-1 text-left font-medium text-black">{"Sélection de moughataa"}</label>
          <select
            value={selectedMoughataaId}
            onChange={(e) => setSelectedMoughataaId(e.target.value)}
            className="border rounded text-left w-full p-2 text-black"
            disabled={!selectedWilayaId}
          >
            <option value="">{"Sélection de moughataa"}</option>
            {moughataas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Prix */}
        <div>
          <label className="block mb-1 text-left font-medium text-black">{priceLabel}</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border text-left rounded w-full p-2 text-black"
            min={0}
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {updateLabel}
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={onEditImages}
        className="bg-blue-600 w-full mt-1 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {"Images"}
      </button>
    </div>
  );
};

export default EditFormDisplay;
