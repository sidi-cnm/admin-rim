import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { getDb } from "../../../lib/mongodb";
import { getUserFromCookies } from "@/utils/getUserFomCookies";

type RegisterBody = {
  email?: string;
  password?: string;
  contact?: string;
  samsar?: boolean;
  roleName?: string;
  roleId?: string;
  isActive?: boolean; // si tu l’envoies depuis le form (optionnel)
};

export async function POST(request: NextRequest) {
  try {
    let body: RegisterBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const requestingUser = await getUserFromCookies();

    if (!requestingUser || requestingUser.name !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 1) Lire/valider le body
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const contact = String(body.contact ?? "").trim();
    const samsar = body.samsar; // doit être boolean
    const roleName = String(body.roleName ?? "client").toLowerCase();
    const roleId = String(body.roleId ?? "2");
    const initialActive = Boolean(body.isActive); // si tu veux permettre "actif dès création"

    if (!email || !password || !contact || typeof samsar !== "boolean") {
      return NextResponse.json(
        { error: "email, password, contact et samsar (boolean) sont requis" },
        { status: 400 }
      );
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "email invalide" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "password trop court" }, { status: 400 });
    }

    const db = await getDb();

    // 2) Unicité email
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // 3) Hash mdp
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) Token de vérification email (si tu l’utilises)
    const verifyToken = crypto.randomUUID();
    const verifyTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

    // 5) Doc user
    const userDoc = {
      email,
      samsar,
      password: hashedPassword,
      roleId,
      roleName,
      createdAt: new Date(),
      lastLogin: null,
      isActive: initialActive,     // actif ou non dès la création
      emailVerified: false,        // à false tant que non vérifié
      verifyToken,
      verifyTokenExpires,
    };

    // 6) Insert user
    const { insertedId } = await db.collection("users").insertOne(userDoc);

    // 7) Insert contact
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

    // 8) Créer la session + token JWT
    if (typeof process.env.JWT_SECRET !== "string") {
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

    // // 9) (optionnel) poser les cookies pour connecter directement
    // const cookieStore = await cookies();
    // cookieStore.set({
    //   name: "jwt",
    //   value: jwtToken,
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 60 * 60 * 24, // 1 jour
    //   path: "/",
    // });
    // cookieStore.set({
    //   name: "user",
    //   value: insertedId.toString(),
    //   httpOnly: false,
    //   sameSite: "lax",
    //   maxAge: 60 * 60 * 24,
    //   path: "/",
    // });

    // 10) (optionnel) envoyer l'email de vérification…
    // try {
    //   const mailResult = await sendVerificationEmail(email, verifyToken);
    //   if (!mailResult?.ok) {
    //     console.error("Email send failed (register):::", mailResult?.error);
    //   }
    // } catch (e) {
    //   console.error("sendVerificationEmail crashed", e);
    // }

    // 11) Réponse
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: insertedId.toString(),
          email,
          roleName,
          emailVerified: false,
          samsar,
        },
        // tu peux renvoyer le token si tu veux l’exploiter côté client :
        token: jwtToken,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    // gestion doublon Mongo
    if (
      typeof error === "object" &&
      error !== null &&
      ("code" in error || "codeName" in error) &&
      // @ts-expect-error
      (error.code === 11000 || error.codeName === "DuplicateKey")
    ) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
