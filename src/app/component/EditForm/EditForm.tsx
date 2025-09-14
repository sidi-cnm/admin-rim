"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Category, SubCategory } from "../../mytypes/types";
import EditFormDisplay from "./EditFormDisplay";

// 🔹 Types pour typeAnnonces et lieux
interface TypeAnnonce {
  id: string;
  name: string;
}

interface Lieu {
  id: string;
  name: string;
}

// 🔹 Props du composant
export interface EditFormProps {
  lang: string;
  annonceId: string;
  userid: string;
  initialData: {
    typeAnnonceId: string;
    categorieId: string;
    subcategorieId: string;
    description: string;
    price: number;
    wilayaId: string;
    moughataaId: string;
  };
  onClose: () => void;
  onEditImages: () => void;
  onUpdate: () => void;
  typeAnnoncesEndpoint: string;
  categoriesEndpoint: string;
  subCategoriesEndpoint: string;
  updateAnnonceEndpoint: string;
}

const EditForm: React.FC<EditFormProps> = ({
  lang,
  initialData,
  onUpdate,
  onEditImages,
  onClose,
  typeAnnoncesEndpoint,
  categoriesEndpoint,
  subCategoriesEndpoint,
  updateAnnonceEndpoint,
}) => {

  const [typeAnnonces, setTypeAnnonces] = useState<TypeAnnonce[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>(initialData.typeAnnonceId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialData.categorieId);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(initialData.subcategorieId);
  const [description, setDescription] = useState(initialData.description);
  const [price, setPrice] = useState(initialData.price.toString());

  const [submitting, setSubmitting] = useState(false);
  const [wilayas, setWilayas] = useState<Lieu[]>([]);
  const [moughataas, setMoughataas] = useState<Lieu[]>([]);
  const [selectedWilayaId, setSelectedWilayaId] = useState(initialData.wilayaId);
  const [selectedMoughataaId, setSelectedMoughataaId] = useState(initialData.moughataaId);

  const router = useRouter();

  // 🔹 Fetch typeAnnonces
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<TypeAnnonce[]>(typeAnnoncesEndpoint);
        setTypeAnnonces(res.data);
      } catch {
        toast.error("Erreur lors de récupération des types d'annonce");
      }
    })();
  }, [typeAnnoncesEndpoint]);

  // 🔹 Fetch categories
  useEffect(() => {
    (async () => {
      if (!selectedTypeId) return setCategories([]);
      try {
        const res = await axios.get<Category[]>(`${categoriesEndpoint}?parentId=${selectedTypeId}`);
        setCategories(res.data);
      } catch {
        toast.error("Erreur lors de récupération des catégories");
      }
    })();
  }, [selectedTypeId, categoriesEndpoint]);

  // 🔹 Fetch subcategories
  useEffect(() => {
    (async () => {
      if (!selectedCategoryId) return setFilteredSubCategories([]);
      try {
        const res = await axios.get<SubCategory[]>(`${subCategoriesEndpoint}?parentId=${selectedCategoryId}`);
        setFilteredSubCategories(res.data);
      } catch {
        toast.error("Erreur lors de récupération des sous-catégories");
      }
    })();
  }, [selectedCategoryId, subCategoriesEndpoint]);

  // 🔹 Fetch wilayas
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ data: Lieu[] }>(`/api/lieux?tag=wilaya`);
        setWilayas(res.data?.data || []);
      } catch {
        toast.error("Erreur lors de récupération des wilayas");
      }
    })();
  }, [lang]);

  // 🔹 Fetch moughataas selon wilaya
  useEffect(() => {
    if (!selectedWilayaId) {
      setMoughataas([]);
      setSelectedMoughataaId("");
      return;
    }
    (async () => {
      try {
        const res = await axios.get<{ data: Lieu[] }>(`/api/lieux?parentId=${selectedWilayaId}&tag=moughataa`);
        setMoughataas(res.data?.data || []);
      } catch {
        toast.error("Erreur lors de récupération des moughataas");
      }
    })();
  }, [selectedWilayaId, lang]);

  // 🔹 Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Updating en cours...");

    try {
      const annonceData = {
        typeAnnonceId: selectedTypeId,
        categorieId: selectedCategoryId,
        subcategorieId: selectedSubCategoryId,
        description,
        price: Number(price),
        lieuId: selectedWilayaId,
        moughataaId: selectedMoughataaId,
      };

      const res = await axios.put(updateAnnonceEndpoint, annonceData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.status !== 200) throw new Error("Update failed");

      toast.success("Succès", { id: toastId });
      setSubmitting(false);
      onClose();
      onUpdate();
      router.refresh();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      const apiMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de mise à jour";
      toast.error(apiMsg, { id: toastId });
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <Toaster position="bottom-center" />

      <EditFormDisplay
        typeAnnonces={typeAnnonces}
        categories={categories}
        filteredSubCategories={filteredSubCategories}
        selectedTypeId={selectedTypeId}
        setSelectedTypeId={setSelectedTypeId}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        selectedSubCategoryId={selectedSubCategoryId}
        setSelectedSubCategoryId={setSelectedSubCategoryId}
        description={description}
        setDescription={setDescription}
        price={price}
        setPrice={setPrice}
        handleSubmit={handleSubmit}
        onClose={onClose}
        lang={lang}
        editTitle={"Titre"}
        annonceTypeLabel={"Type d'annonce"}
        categoryLabel={"Catégorie"}
        selectCategoryLabel={"Sélectionner une catégorie"}
        subCategoryLabel={"Sous-catégorie"}
        selectSubCategoryLabel={"Sélectionner une sous-catégorie"}
        descriptionLabel={"Description"}
        priceLabel={"Prix"}
        cancelLabel={"Annuler"}
        updateLabel={submitting ? "Updating" : "Updated"}
        wilayas={wilayas}
        moughataas={moughataas}
        selectedWilayaId={selectedWilayaId}
        setSelectedWilayaId={setSelectedWilayaId}
        selectedMoughataaId={selectedMoughataaId}
        setSelectedMoughataaId={setSelectedMoughataaId}
        onEditImages={onEditImages}
        submitting={submitting}
      />
    </div>
  );
};

export default EditForm;
