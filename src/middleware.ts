// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; 
import { getUserFromCookies } from "./utils/getUserFomCookies";


export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;
  // Exclure favicon.ico
  if (path === "/favicon.ico") {
    return NextResponse.next();
  }  
  const userData = await getUserFromCookies();

  console.log("Middleware - userData:", userData);
 

  // Vérifier si le chemin commence par /my ou /admin
  if (path.startsWith("/users") || path.startsWith("/AddAnnonce") || path.startsWith("/Listannonce")) {
    if (userData?.name !== "admin") {
      // Rediriger vers la page de connexion
      url.pathname = `/login`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};

