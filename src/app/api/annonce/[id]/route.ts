// app/api/annonce/[id]/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserFromCookies } from "../../../../utils/getUserFomCookies";

// GET /[locale]/api/my/annonces/:id
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const { id } = ctx.params;
    const db = await getDb();

    const user = await getUserFromCookies();
    console.log("User from cookies:", user);
    const userIdStr = String(user?.id ?? "");
    if (!userIdStr) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    let annonceId: ObjectId;
    try { annonceId = new ObjectId(id); }
    catch { return NextResponse.json({ error: "ID d'annonce invalide" }, { status: 400 }); }

    let doc;
    
      if(user?.name === "admin"){
         doc = await db.collection("annonces").findOne({ _id: annonceId });
         console.log("Admin access ", doc);
       if (!doc) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });

      }
      
    
    
        const { _id, ...rest } = doc! ;
    return NextResponse.json({ id: _id.toString(), ...rest }, { status: 200 });
  } catch (err) {
    console.error("GET annonce error:", err);
    return NextResponse.json({ error: "Error getting annonce" }, { status: 500 });
  }
}

// PUT /[locale]/api/my/annonces/:id
export async function PUT(req: Request,  ctx: { params: { id: string } }) {
  try {
    const { id } = ctx.params;
    const db = await getDb();

    const user = await getUserFromCookies();
    const userIdStr = String(user?.id ?? "");
    if (!userIdStr) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    let annonceId: ObjectId;
    try { annonceId = new ObjectId(id); }
    catch { return NextResponse.json({ error: "ID d'annonce invalide" }, { status: 400 }); }

    const body = await req.json() as {
      typeAnnonceId?: string;
      categorieId?: string;
      subcategorieId?: string;
      description?: string;
      price?: number | null;
      lieuId?: string;          // wilaya
      moughataaId?: string;
    };

    const norm = (v: unknown) =>
      typeof v === "string" && v.trim() !== "" ? v.trim() : null;

    const update: Record<string, any> = { updatedAt: new Date() };
    if (typeof body.typeAnnonceId === "string") update.typeAnnonceId = body.typeAnnonceId;
    if (typeof body.categorieId === "string") update.categorieId = body.categorieId;
    if (typeof body.subcategorieId === "string") update.subcategorieId = body.subcategorieId;
    if (typeof body.description === "string") update.description = body.description;
    if (typeof body.price === "number" || body.price === null) update.price = body.price ?? null;
    if (typeof body.lieuId === "string") update.lieuId = body.lieuId;   // ✅ on met à jour le lieuId
    if ("lieuId" in body)        update.lieuId = norm(body.lieuId);           // wilaya
    if ("moughataaId" in body)   update.moughataaId = norm(body.moughataaId);

    let value;
    try {
      if(user?.name == "admin"){
        value = await db.collection("annonces").findOneAndUpdate(
          { _id: annonceId },
          { $set: update },
          { returnDocument: "after" }
        );
      }
    } catch (error) {
      console.error("Error in findOneAndUpdate:", error);
    }
     

    if (!value) {
      return NextResponse.json({ error: "Annonce introuvable ou non autorisée" }, { status: 404 });
    }

    const { _id, ...rest } = value! ;
    return NextResponse.json({ id: _id.toString(), ...rest }, { status: 200 });
  } catch (err) {
    console.error("PUT annonce error:", err);
    return NextResponse.json({ error: "Error updating annonce" }, { status: 500 });
  }
}




export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const db = await getDb();
    const coll = db.collection("annonces");

    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "deleted" } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Annonce not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, updatedId: id });
  } catch (e) {
    console.error("DELETE /api/annonce/[id] error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



















