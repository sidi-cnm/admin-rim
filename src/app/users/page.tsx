// src/app/[locale]/users/page.tsx
import { getDb } from "../../lib/mongodb";
import UsersListUI from "../component/UsersListUI";
import type { ObjectId, Filter } from "mongodb";

type DbUser = {
  _id: ObjectId;
  email: string;
  roleName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string | Date;
  lastLogin?: string | Date | null;
};

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { page?: string; email?: string; active?: string };
}) {
  const page = Math.max(parseInt(searchParams?.page || "1", 10), 1);
  const perPage = 9;

  const emailParam = (searchParams?.email ?? "").trim();
  const activeParam = (searchParams?.active ?? "all").toLowerCase(); // "true" | "false" | "all"

  const db = await getDb();
  const coll = db.collection<DbUser>("users");

  // 🔎 Query typée
  const query: Filter<DbUser> = {};
  if (emailParam) query.email = { $regex: emailParam, $options: "i" };
  if (activeParam === "true") query.isActive = true;
  if (activeParam === "false") query.isActive = false;

  const totalCount = await coll.countDocuments(query);
  const totalPages = Math.max(Math.ceil(totalCount / perPage), 1);

  const users = await coll
    .find(query)
    .skip((page - 1) * perPage)
    .limit(perPage)
    .project({
      _id: 1,
      email: 1,
      roleName: 1,
      isActive: 1,
      emailVerified: 1,
      createdAt: 1,
      lastLogin: 1,
    })
    .toArray();

  const usersFormatted = users.map((u) => ({
    id: u._id.toString(),
    email: u.email,
    roleName: u.roleName,
    isActive: u.isActive,
    emailVerified: u.emailVerified,
    createdAt: typeof u.createdAt === "string" ? u.createdAt : u.createdAt?.toString() ?? "",
    lastLogin: u.lastLogin ? (typeof u.lastLogin === "string" ? u.lastLogin : u.lastLogin.toString()) : null,
  }));

  return (
    <UsersListUI
      locale="fr"
      users={usersFormatted}
      totalPages={totalPages}
      currentPage={page}
      initialEmail={emailParam}
      initialActive={activeParam} // "true" | "false" | "all"
    />
  );
}
