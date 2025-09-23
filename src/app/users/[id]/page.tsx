import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type DbUser = {
  _id: ObjectId;
  email: string;
  roleName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string | Date;
  lastLogin?: string | Date | null;
  contact?: string | null;
};

export default async function UserDetailPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const db = await getDb();
  const coll = db.collection<DbUser>("users");

  const user = await coll
    .aggregate([
      { $match: { _id: new ObjectId(params.id) } },
      { $addFields: { userIdStr: { $toString: "$_id" } } },
      {
        $lookup: {
          from: "contacts",
          localField: "userIdStr",
          foreignField: "userId",
          as: "contacts",
        },
      },
      {
        $addFields: {
          contact: { $arrayElemAt: ["$contacts.contact", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          roleName: 1,
          isActive: 1,
          emailVerified: 1,
          createdAt: 1,
          lastLogin: 1,
          contact: 1,
        },
      },
    ])
    .next();

  if (!user) {
    return <div className="p-6 text-red-600">Utilisateur introuvable</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaUser className="text-blue-600" /> Détails utilisateur
      </h1>

      <div className="grid gap-4 text-gray-700">
        {/* Email */}
        <div className="flex items-center gap-3">
          <FaEnvelope className="text-blue-500" />
          <span className="font-medium">Email :</span>
          <span className="text-gray-900">{user.email}</span>
        </div>

        {/* Rôle */}
        <div className="flex items-center gap-3">
          <FaUser className="text-purple-500" />
          <span className="font-medium">Rôle :</span>
          <span className="capitalize">{user.roleName}</span>
        </div>

        {/* Statut */}
        <div className="flex items-center gap-3">
          {user.isActive ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <FaTimesCircle className="text-red-500" />
          )}
          <span className="font-medium">Statut :</span>
          <span
            className={`font-semibold ${
              user.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {user.isActive ? "Actif" : "Inactif"}
          </span>
        </div>

        {/* Email vérifié */}
        <div className="flex items-center gap-3">
          {user.emailVerified ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <FaTimesCircle className="text-red-500" />
          )}
          <span className="font-medium">Email vérifié :</span>
          <span>{user.emailVerified ? "Oui" : "Non"}</span>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-3">
          <FaPhone className="text-yellow-500" />
          <span className="font-medium">Contact :</span>
          <span>{user.contact ?? "Non défini"}</span>
        </div>

        {/* Créé le */}
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-pink-500" />
          <span className="font-medium">Créé le :</span>
          <span>
            {new Date(user.createdAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Dernière connexion */}
        {user.lastLogin && (
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-gray-500" />
            <span className="font-medium">Dernière connexion :</span>
            <span>
              {new Date(user.lastLogin).toLocaleString("fr-FR")}
            </span>
          </div>
        )}
      </div>

      {/* Bouton retour */}
      <div className="mt-8 flex justify-between">
        <Link
          href="/users"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ← Retour à la liste
        </Link>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
          ✏️ Modifier
        </button>
      </div>
    </div>
  );
}
