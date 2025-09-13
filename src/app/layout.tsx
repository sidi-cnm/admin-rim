// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import Locale from "intl-locale-textinfo-polyfill";
import "./globals.css";
import Sidebar from "./component/Dashbord";
import { Providers } from "./lyout/providers";

export const metadata: Metadata = {
  title: "RIM IJAR",
  description: "trouver des maisons,appartement, voiture, engine a louer",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string }; // ✅ uniquement locale
}) {
  let dir: "ltr" | "rtl" = "ltr";

  try {
    if (params?.locale) {
      const locale = new Locale(params.locale);
      dir = locale.textInfo.direction as "ltr" | "rtl";
    }
  } catch (error) {
    console.error("Invalid locale provided:", params?.locale, error);
  }

  return (
    <html  dir={dir}>
      <body className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6 md:ml-64">{children}</main>
          </div>
        
      </body>
    </html>
  );
}
