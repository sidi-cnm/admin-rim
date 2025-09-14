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

  // ---- GET images ----
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/images/${annonceId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Erreur API");

        // Typage explicite
        const data: FetchImagesResponse = await res.json();

        const urls: string[] = data.images.map((img: ImageItem) => img.imagePath || "");
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

  // ---- POST / upload images ----
  const handleAddFiles = async (files: File[]) => {
    if (!files.length) return;

    const toastId = toast.loading("Uploading...");
    try {
      const fd = new FormData();
      files.forEach((file: File) => fd.append("files", file));
      fd.append("mainIndex", "0");

      const res = await fetch(`/api/images/${annonceId}`, {
        method: "POST",
        body: fd,
      });

      const data: UploadImagesResponse = await res.json();

      if (!res.ok || data?.ok !== true) {
        throw new Error(data?.error || "Upload failed");
      }

      const newUrls: string[] = data.images?.map((img: ImageItem) => img.url || "") || [];
      setImages((prev) => [...newUrls, ...prev]);
      toast.success("Uploaded", { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload échoué";
      toast.error(msg, { id: toastId });
    }
  };

  // ---- DELETE image ----
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Suppression échouée";
      toast.error(msg, { id: loadingId });
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
