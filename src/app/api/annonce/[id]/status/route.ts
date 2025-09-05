import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    

    const body = await req.json().catch(() => null);
    if (!body || typeof body.isPublished !== "boolean") {
      return NextResponse.json({ error: "Field 'isPublished' (boolean) is required" }, { status: 400 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    console.log("Updating annonce", id, "to isPublished =", body.isPublished);

    const db = await getDb();
    const coll = db.collection("annonces"); // nom de la collection en base (pluriel OK)

    const result = await coll.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { isPublished: body.isPublished } },
      { returnDocument: "after" }
    );

    console.log("result : " , result);

    if (!result) {
      return NextResponse.json({ error: "Annonce not found" }, { status: 404 });
    }

    const a = result
    return NextResponse.json({
      id: a._id.toString(),
      title: a.title,
      price: a.price,
      firstImagePath: a.firstImagePath,
      isPublished: !!a.isPublished,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
