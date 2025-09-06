// src/app/[locale]/users/page.tsx
import { getDb } from "../../../lib/mongodb";
import UserCard from "../component/UserCard";
import type { ObjectId } from "mongodb";

type DbUser = {
  _id: ObjectId;
  email: string;
  roleName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string | Date;
  lastLogin?: string | Date | null;
};

function fmtDate(d?: string | Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "UTC", // fixe pour éviter les divergences SSR/Client
  }).format(new Date(d));
}

export default async function UsersPage() {
  const db = await getDb();
  const coll = db.collection<DbUser>("users");

  const users = await coll
    .find({})
    .limit(10)
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
    // si tu préfères afficher directement un texte prêt :
    createdAtText: fmtDate(u.createdAt),
    lastLoginText: fmtDate(u.lastLogin),
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {usersFormatted.map((user) => (
        <UserCard
          key={user.id}
          user={{
            id: user.id,
            email: user.email,
            roleName: user.roleName,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,   // ou user.createdAtText si tu affiches directement le texte
            lastLogin: user.lastLogin,   // ou user.lastLoginText
          }}
        />
      ))}
    </div>
  );
}
