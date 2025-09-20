export const dynamic = "force-dynamic";

import { getDb } from "../../lib/mongodb";
import AnnonceListUI from "../component/AnnonceListUI";
import type { Filter } from "mongodb";

type DbAnnonce = {
  _id: { toString(): string };
  title: string;
  price: number;
  contact?: string;
  firstImagePath?: string;
  isPublished?: boolean;
  status?: string;
  isSponsored: boolean;
  createdAt: Date;
};

export default async function Home({
  searchParams = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const page = Math.max(parseInt((searchParams.page as string) || "1", 10), 1);
  const perPage = 6;

  const publishedParam = ((searchParams.published as string) ?? "all").toLowerCase();
  const phoneParam = ((searchParams.phone as string) ?? "").trim();
  const startDateParam = (searchParams.startDate as string) ?? "";
  const endDateParam = (searchParams.endDate as string) ?? "";
  const annonceStatusParam = ((searchParams.annonceStatus as string) ?? "all").toLowerCase();

  console.log("📌 annonceStatus reçu:", annonceStatusParam);

  const query: Filter<DbAnnonce> = {};

  // Publié / Non publié
  if (publishedParam === "true") query.isPublished = true;
  if (publishedParam === "false") query.isPublished = false;

  // Téléphone
  if (phoneParam) query.contact = { $regex: phoneParam, $options: "i" };

  // Statut
  if (annonceStatusParam === "deleted") query.status = "deleted";
  if (annonceStatusParam === "active") query.status = "active";

  // Date
  if (startDateParam || endDateParam) {
    query.createdAt = {};
    if (startDateParam) query.createdAt.$gte = new Date(startDateParam);
    if (endDateParam) query.createdAt.$lte = new Date(endDateParam);
  }

  const db = await getDb();
  const coll = db.collection<DbAnnonce>("annonces");

  const totalCount = await coll.countDocuments(query);
  console.log("📌 Query:", query, "=> totalCount:", totalCount);

  const totalPages = Math.max(Math.ceil(totalCount / perPage), 1);

  const annonces = await coll
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .project({
      _id: 1,
      title: 1,
      price: 1,
      contact: 1,
      firstImagePath: 1,
      isPublished: 1,
      status: 1,
      isSponsored: 1,
      createdAt: 1,
    })
    .toArray();

  const annoncesFormatted = annonces.map((a) => ({
    id: a._id.toString(),
    title: a.title,
    price: a.price,
    contact: a.contact,
    firstImagePath: a.firstImagePath,
    isPublished: a.isPublished ?? false,
    status: a.status ?? "active",
    isSponsored: a.isSponsored ?? false,
    createdAt: a.createdAt,
  }));

  return (
    <AnnonceListUI
      annonces={annoncesFormatted}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}
