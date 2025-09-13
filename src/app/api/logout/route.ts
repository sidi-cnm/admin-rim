// app/api/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("jwt");
  cookieStore.delete("user");
  return NextResponse.json({ message: "Déconnexion réussie" });
}
