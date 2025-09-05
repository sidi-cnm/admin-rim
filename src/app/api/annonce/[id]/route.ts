// app/api/annonce/[id]/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
