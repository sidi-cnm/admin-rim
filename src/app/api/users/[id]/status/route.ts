// src/app/api/users/[id]/status/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive } = await req.json();

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "Invalid isActive value" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const coll = db.collection("users");

    const result = await coll.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          isActive,
          emailVerified: isActive, // 👈 lier emailVerified à isActive
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isActive,
      emailVerified: isActive,
      message: isActive
        ? "User activated & email verified"
        : "User deactivated & email unverified",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
