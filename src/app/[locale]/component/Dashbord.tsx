// components/dashboard/Sidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/locales/client";

export type NavItem = {
  key: string;   // clé i18n (ex: "nav.list")
  href: string;  // lien (ex: "/fr/dashboard/list")
  icon?: React.ReactNode;
};

export default function Sidebar() {
  const t = useI18n();
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <>
      {/* Overlay mobile */}
      {openMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* SIDEBAR desktop */}
      <aside
        className="hidden md:flex md:flex-col md:w-64 bg-blue-800 text-white fixed inset-y-0 left-0 border-r border-blue-700"
      >
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-blue-700">
          <span className="font-semibold text-lg truncate">{t("app.name")}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <Link
            href="fr/users"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              pathname?.startsWith("/annonces")
                ? "bg-blue-700"
                : "hover:bg-blue-600"
            }`}
          >
            <span className="truncate">{t("nav.user")}</span>
          </Link>
        </nav>
      </aside>

      {/* BUTTON mobile */}
      <button
        onClick={() => setOpenMobile(true)}
        className="md:hidden fixed top-3 left-3 z-50 bg-white/90 border rounded-lg px-3 py-2 shadow-sm"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* DRAWER mobile */}
      <aside
        className={`fixed z-50 md:hidden bg-blue-800 text-white border-r border-blue-700 w-72 inset-y-0 left-0 transform transition-transform duration-200 ${
          openMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-700">
          <span className="font-semibold text-lg truncate">{t("app.name")}</span>
          <button
            onClick={() => setOpenMobile(false)}
            className="rounded-lg px-3 py-2 text-sm hover:bg-blue-600"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="p-2 space-y-1">
          <Link
            href="/annonces"
            onClick={() => setOpenMobile(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              pathname?.startsWith("/annonces")
                ? "bg-blue-700"
                : "hover:bg-blue-600"
            }`}
          >
            <span className="truncate">{t("nav.list")}</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
