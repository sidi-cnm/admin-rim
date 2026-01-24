// lib/registerUser.ts
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../lib/mongodb"; // adapte le chemin si besoin

export type RegisterInput = {
  email?: string;
  password?: string;
  contact?: string;
  samsar?: boolean;
  roleName?: string;
  roleId?: string;
  isActive?: boolean;
};

export type RequestingUser = {
  name?: string;
  id?: string;
  email?: string;
  roleName?: string;
} | null;

export type RegisterResult =
  | {
      ok: true;
      status: 201;
      data: {
        message: string;
        user: {
          id: string;
          email: string;
          roleName: string;
          emailVerified: boolean;
          samsar: boolean;
        };
        token: string;
      };
    }
  | {
      ok: false;
      status: 400 | 401 | 500;
      error: string;
    };

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export async function registerUser(
  body: RegisterInput,
  requestingUser: RequestingUser
): Promise<RegisterResult> {
  try {
    // Auth (tu peux remplacer par un param boolean si tu veux)
    if (!requestingUser || requestingUser.name !== "admin") {
      return { ok: false, status: 401, error: "Unauthorized" };
    }

    // 1) Lire/valider
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const contact = String(body.contact ?? "").trim();
    const samsar = body.samsar; // doit être boolean
    const roleName = String(body.roleName ?? "client").toLowerCase();
    const roleId = String(body.roleId ?? "2");
    const initialActive = Boolean(body.isActive);

    if (!email || !password || !contact || typeof samsar !== "boolean") {
      return {
        ok: false,
        status: 400,
        error: "email, password, contact et samsar (boolean) sont requis",
      };
    }
    if (!isValidEmail(email)) {
      return { ok: false, status: 400, error: "email invalide" };
    }
    if (password.length < 6) {
      return { ok: false, status: 400, error: "password trop court" };
    }

    const db = await getDb();

    // 2) Unicité email
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return { ok: false, status: 400, error: "Email already exists" };
    }

    // 3) Hash mdp
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) Token verify
    const verifyToken = crypto.randomUUID();
    const verifyTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

    // 5) userDoc
    const userDoc = {
      email,
      samsar,
      password: hashedPassword,
      roleId,
      roleName,
      createdAt: new Date(),
      lastLogin: null,
      isActive: initialActive,
      emailVerified: false,
      verifyToken,
      verifyTokenExpires,
    };

    // 6) insert user
    const { insertedId } = await db.collection("users").insertOne(userDoc);

    // 7) insert contact
    const tokenContact = crypto.randomUUID();
    await db.collection("contacts").insertOne({
      userId: insertedId.toString(),
      contact,
      createdAt: new Date(),
      isActive: false,
      isVerified: false,
      verifyCode: tokenContact,
      verifyTokenExpires: null,
    });

    // 8) session + jwt
    if (typeof process.env.JWT_SECRET !== "string") {
      // hors Next, c'est pareil: il faut l'env var
      throw new Error("JWT_SECRET manquant dans l'environnement");
    }

    const sessionToken = uuidv4();
    const now = new Date();

    const jwtToken = jwt.sign(
      {
        id: insertedId.toString(),
        email,
        roleName,
        roleId,
        sessionToken,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await db.collection("userSessions").insertOne({
      userId: insertedId.toString(),
      token: jwtToken,
      isExpired: false,
      lastAccessed: now,
      createdAt: now,
      sessionToken,
    });

    
    // 9) retour
    return {
      ok: true,
      status: 201,
      data: {
        message: "User registered successfully",
        user: {
          id: insertedId.toString(),
          email,
          roleName,
          emailVerified: false,
          samsar,
        },
        token: jwtToken,
      },
    };
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    // doublon Mongo (si index unique)
    if (
      typeof error === "object" &&
      error !== null &&
      ("code" in error || "codeName" in error) &&
      // @ts-expect-error MongoDB error object may have code or codeName
      (error.code === 11000 || error.codeName === "DuplicateKey")
    ) {
      return { ok: false, status: 400, error: "Email already exists" };
    }

    return { ok: false, status: 500, error: "Internal server error" };
  }
}
