// app/[locale]/api/images/[annonceId]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { getDb } from "../../../../lib/mongodb";
import { getUserFromCookies } from "../../../../utils/getUserFomCookies";



type Params = { locale?: string; annonceId: string };

const MAX_FILES = 8;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function safeName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "");
}

type ImgDoc = { _id: ObjectId; imagePath: string; createdAt?: Date; altText?: string | null };
type LinkDoc = { _id?: ObjectId; annonceId: ObjectId; imageId: ObjectId; createdAt?: Date };
type AnnonceDoc = {
  _id: ObjectId;
  userId: string;
  haveImage?: boolean;
  firstImagePath?: string | null;
};




// ---------- POST ----------
export async function POST(request: NextRequest,ctx: { params: Params }) {
  try {
    const db = await getDb();

    // Auth
    const cookieUser = await getUserFromCookies();
    let userId = String(cookieUser?.id ?? "");
    if (process.env.NODE_ENV !== "production") {
      const hdr = request.headers.get("x-user-id");
      if (hdr) userId = String(hdr);
    }
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Params (ne PAS typer le 2e arg, Next 15 n'aime pas)
    const { annonceId } = ctx.params as { locale?: string; annonceId: string };

    if (!ObjectId.isValid(annonceId)) {
      return NextResponse.json({ error: "annonceId invalide" }, { status: 400 });
    }

    const annonce = await db.collection("annonces").findOne({ _id: new ObjectId(annonceId) });
    if (!annonce) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    if (cookieUser?.name !== "admin") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // FormData
    const form = await request.formData();
    const rawList = [...form.getAll("files"), ...form.getAll("image"), ...form.getAll("images")];
    let mainIndex = Number(form.get("mainIndex") ?? 0);

    const allFiles: File[] = rawList.filter((f): f is File => f instanceof File);
    if (allFiles.length === 0) return NextResponse.json({ error: "Aucun fichier image" }, { status: 400 });
    if (allFiles.length > MAX_FILES) return NextResponse.json({ error: `Max ${MAX_FILES} images` }, { status: 400 });
    if (!Number.isFinite(mainIndex) || mainIndex < 0 || mainIndex >= allFiles.length) mainIndex = 0;

    // Upload vers Vercel Blob
    const uploaded: { url: string; contentType: string; key: string }[] = [];
    for (const file of allFiles) {
      if (!ALLOWED_MIME.includes(file.type)) {
        return NextResponse.json({ error: `Type non autorisé: ${file.type}` }, { status: 415 });
      }
      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json({ error: `Fichier trop volumineux (>10MB)` }, { status: 413 });
      }

      const key = `annonces/${annonceId}/${randomUUID()}-${safeName(file.name || "image")}`;
      const { url } = await put(key, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type,
        addRandomSuffix: false,
      });
      uploaded.push({ url, contentType: file.type, key });
    }

    // Sauvegarde DB
    const now = new Date();
    const imageIds: ObjectId[] = [];
    for (const u of uploaded) {
      try {
        const res = await db.collection("images").insertOne({
          imagePath: u.url,
          createdAt: now,
          altText: null,
        });
        imageIds.push(res.insertedId);
      } catch (e) {
        console.error("Insert image error:", e);
      }
    }

    const links = imageIds.map((imgId) => ({
      annonceId: new ObjectId(annonceId),
      imageId: imgId,
      createdAt: now,
    }));
    if (links.length) {
      try {
        await db.collection("annonce_images").insertMany(links, { ordered: false });
      } catch (e) {
        console.error("Insert links error:", e);
      }
    }

    const mainUrl = uploaded[mainIndex]?.url ?? uploaded[0].url;
    await db.collection("annonces").updateOne(
      { _id: new ObjectId(annonceId) },
      { $set: { haveImage: true, firstImagePath: mainUrl, updatedAt: now } }
    );

    return NextResponse.json({
      ok: true,
      images: uploaded.map((u, i) => ({ url: u.url, isMain: i === mainIndex })),
      firstImagePath: mainUrl,
    });
  } catch (err) {
    console.error("Upload images error:", err);
    return NextResponse.json(
      { error: "Échec de l’upload des images" },
      { status: 500 }
    );
  }
}

// ---------- GET ----------
export async function GET(_request: NextRequest, ctx: { params: Params }) {
  try {
    const db = await getDb();
    const { annonceId } = ctx.params as { locale?: string; annonceId: string };

    if (!ObjectId.isValid(annonceId)) {
      return NextResponse.json({ error: "annonceId invalide" }, { status: 400 });
    }

    const annonce = await db
      .collection("annonces")
      .findOne({ _id: new ObjectId(annonceId) }, { projection: { haveImage: 1, firstImagePath: 1 } });

    if (!annonce) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });

    const links = await db
      .collection("annonce_images")
      .find({ annonceId: new ObjectId(annonceId) }, { projection: { imageId: 1 } })
      .toArray();

    const imageIds = links.map((l) => l.imageId).filter(Boolean);
    let images: { imagePath: string }[] = [];
    if (imageIds.length) {
      const docs = await db
        .collection("images")
        .find({ _id: { $in: imageIds } }, { projection: { imagePath: 1 } })
        .toArray();
      images = docs.map((d) => ({ imagePath: d.imagePath }));
    }

    return NextResponse.json({
      haveImage: Boolean(annonce.haveImage),
      firstImagePath: annonce.firstImagePath ?? null,
      images,
    });
  } catch (err) {
    console.error("GET images error:", err);
    return NextResponse.json({ error: "Erreur lors de la récupération des images" }, { status: 500 });
  }
}






// ---------DELETE--------------

export async function DELETE(req: NextRequest, ctx: { params: Params }) {
  try {
    const db = await getDb();
    const { annonceId } = ctx.params as { locale?: string; annonceId: string };

    // Auth
    const cookieUser = await getUserFromCookies();
    let userId = String(cookieUser?.id ?? "");
    if (process.env.NODE_ENV !== "production") {
      const hdr = req.headers.get("x-user-id");
      if (hdr) userId = String(hdr);
    }
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    console.log("DELETE image for annonce", annonceId, "by user", userId);
    if (!ObjectId.isValid(annonceId)) {
      return NextResponse.json({ error: "annonceId invalide" }, { status: 400 });
    }

    console.log("Params annonceId:", annonceId);

    const annoncesColl = db.collection<AnnonceDoc>("annonces");
    const imagesColl = db.collection<ImgDoc>("images");
    const linksColl  = db.collection<LinkDoc>("annonce_images");

    console.log("Collections ready");

    const annonce = await annoncesColl.findOne(
      { _id: new ObjectId(annonceId) },
      { projection: { _id: 1, userId: 1 } }
    );

    console.log("annonce fetched:", annonce);
    if (!annonce) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    if (cookieUser?.name !== "admin") return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

    // Params
    console.log("Parsing query params...");
    const u = new URL(req.url);
    console.log("Full URL:", req.url);
    const imageIdStr = u.searchParams.get("imageId");
    const imageUrl   = u.searchParams.get("url");

    console.log("Query params:", { imageIdStr, imageUrl });

    let imageId: ObjectId | null = null;
    let imageDoc: ImgDoc | null = null;

    console.log("Finding image to delete...");

    if (imageIdStr && ObjectId.isValid(imageIdStr)) {
      imageId = new ObjectId(imageIdStr);
      imageDoc = await imagesColl.findOne(
        { _id: imageId },
        { projection: { _id: 1, imagePath: 1 } }
      );
      if (!imageDoc) return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
    } else if (imageUrl) {
      imageDoc = await imagesColl.findOne(
        { imagePath: imageUrl },
        { projection: { _id: 1, imagePath: 1 } }
      );
      if (!imageDoc) return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
      imageId = imageDoc._id;
    } else {
      return NextResponse.json({ error: "Spécifiez 'url' ou 'imageId'" }, { status: 400 });
    }


    console.log("Deleting image", imageId?.toString(), "for annonce", annonceId);

    // Supprimer le lien annonce ↔ image
    const delRes = await linksColl.deleteOne({
      annonceId: new ObjectId(annonceId),
      imageId: imageId!,
    });
    if (delRes.deletedCount === 0) {
      return NextResponse.json({ error: "Lien non trouvé pour cette annonce" }, { status: 404 });
    }

    // Si l’image n’est plus liée à aucune annonce, on peut supprimer le doc image
    const stillLinked = await linksColl.findOne({ imageId: imageId! }, { projection: { _id: 1 } });
    if (!stillLinked) {
      await imagesColl.deleteOne({ _id: imageId! });

      // (Optionnel) suppression physique dans Blob Storage:
      // Nous ne supprimons PAS le fichier blob ici (pas d'API delete de vercel/blob publique stable).
      // Si tu as ta propre routine de GC, tu peux l’appeler ici.
    }

    // Recalcule la liste restante pour l’annonce
    const remainingLinks = await linksColl
      .find({ annonceId: new ObjectId(annonceId) }, { projection: { imageId: 1 } })
      .toArray();

    let remainingUrls: string[] = [];
    if (remainingLinks.length) {
      const ids = remainingLinks.map((l) => l.imageId);
      const imgs = await imagesColl
        .find({ _id: { $in: ids } }, { projection: { imagePath: 1 } })
        .toArray();
      remainingUrls = imgs.map((d) => d.imagePath);
    }

    // Met à jour l’annonce
    await annoncesColl.updateOne(
      { _id: new ObjectId(annonceId) },
      {
        $set: {
          haveImage: remainingUrls.length > 0,
          firstImagePath: remainingUrls[0] ?? null,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      removed: imageDoc.imagePath,
      remaining: remainingUrls,
      haveImage: remainingUrls.length > 0,
      firstImagePath: remainingUrls[0] ?? null,
    });
  } catch (err) {
    console.error("DELETE image error:", err);
    return NextResponse.json(
      { error: "Échec de la suppression"},
      { status: 500 }
    );
  }
}