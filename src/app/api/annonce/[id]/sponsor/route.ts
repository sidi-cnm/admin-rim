// app/api/annonce/[id]/sponsor/route.ts
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { isSponsored } = await req.json();
    const db = await getDb();

    await db.collection("annonces").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { isSponsored: !!isSponsored } }
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
