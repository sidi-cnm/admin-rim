"use client";

import React, { useEffect, useState } from "react";
import MyAnnonceImages from "../../../component/MyannonceImages";
import toast, { Toaster } from "react-hot-toast";

type PageProps = {
  lang: string;
  annonceId: string;
};

// Typage des objets retournés par l'API
interface ImageItem {
  imagePath?: string; // pour GET
  url?: string;       // pour POST
  isMain?: boolean;
}

interface FetchImagesResponse {
  images: ImageItem[];
}

interface UploadImagesResponse {
  ok: boolean;
  images?: ImageItem[];
  firstImagePath?: string;
  error?: string;
}

export default function PageAnnonceImages({ lang, annonceId }: PageProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/images/${annonceId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Erreur API");
        const data: FetchImagesResponse = await res.json();

        const urls = Array.isArray(data.images)
          ? data.images.map((img) => img.imagePath || "")
          : [];

        setImages(urls);
      } catch (err) {
        console.error("Erreur récupération images:", err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [lang, annonceId]);

  const handleAddFiles = async (files: File[]) => {
    if (!files?.length) return;

    const toastId = toast.loading("Uploading...");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("mainIndex", "0"); // première image principale

      const res = await fetch(`/api/images/${annonceId}`, {
        method: "POST",
        body: fd,
      });

      const data: UploadImagesResponse = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok !== true) {
        throw new Error(data?.error || "upload failed");
      }

      const newUrls: string[] = Array.isArray(data.images)
        ? data.images.map((x) => x.url || "")
        : [];

      setImages((prev) => [...newUrls, ...prev]);
      toast.success("Uploaded", { id: toastId });
    } catch (e: any) {
      toast.error(e?.message || "Upload échoué", { id: toastId });
    }
  };

  const handleRemove = async (idx: number) => {
    const url = images[idx];
    if (!url) return;

    const loadingId = toast.loading("Suppression...");
    try {
      const res = await fetch(`/api/images/${annonceId}?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur API DELETE");

      setImages((prev) => prev.filter((_, i) => i !== idx));
      toast.success("Image supprimée", { id: loadingId });
    } catch (err: any) {
      toast.error(err?.message || "Suppression échouée", { id: loadingId });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Toaster position="bottom-right" />
        {"Loading..."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <Toaster position="bottom-right" reverseOrder={false} />
      <MyAnnonceImages
        imagesUrl={images}
        title={"Images de l'annonce"}
        onAddFiles={handleAddFiles}
        onRemove={handleRemove}
      />
    </div>
  );
}
