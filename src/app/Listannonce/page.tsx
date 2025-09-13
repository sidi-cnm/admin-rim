import { getDb } from "../../lib/mongodb";
import AnnonceListUI from "../component/AnnonceListUI";
import type { Filter } from "mongodb";

// ---- Type qui correspond à la structure en base ----
type DbAnnonce = {
  _id: { toString(): string };
  title: string;
  price: number;
  contact?: string;
  firstImagePath?: string;
  isPublished?: boolean;
  status?: "active" | "deleted";
  isSponsored: boolean;
  createdAt: Date;
};

// ---- Composant page ----
export default async function Home({
  searchParams,
}: {
  searchParams?: { page?: string; published?: string; phone?: string; startDate?: string; endDate?: string };
}) {
  const page = Math.max(parseInt(searchParams?.page || "1", 10), 1);
  const perPage = 6;

  // Récupération des filtres depuis l’URL
  const publishedParam = (searchParams?.published ?? "all").toLowerCase();
  const phoneParam = (searchParams?.phone ?? "").trim();
  const startDateParam = searchParams?.startDate ?? "";
  const endDateParam = searchParams?.endDate ?? "";

  // ---- Construire le filtre MongoDB ----
  const query: Filter<DbAnnonce> = {};
  if (publishedParam === "true") query.isPublished = true;
  if (publishedParam === "false") query.isPublished = false;
  if (phoneParam) query.contact = { $regex: phoneParam, $options: "i" };

  // ---- Filtre par date ----
  if (startDateParam || endDateParam) {
    query.createdAt = {};
    if (startDateParam) query.createdAt.$gte = new Date(startDateParam);
    if (endDateParam) query.createdAt.$lte = new Date(endDateParam);
  }

  // ---- Connexion à MongoDB ----
  const db = await getDb();
  const coll = db.collection<DbAnnonce>("annonces");

  // ---- Pagination ----
  const totalCount = await coll.countDocuments(query);
  const totalPages = Math.max(Math.ceil(totalCount / perPage), 1);

  // ---- Récupération des annonces ----
  const annonces = (await coll
    .find(query)
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
    .toArray()) as DbAnnonce[];

  // ---- Transformation pour le front ----
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

  // ---- Rendu ----
  return (
    <AnnonceListUI
      annonces={annoncesFormatted}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}
