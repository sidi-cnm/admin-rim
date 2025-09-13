"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname,useRouter } from "next/navigation";


export default function Sidebar() {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

  const route = useRouter();

  const handleconnexion = ()=>{
       route.push('/login');
  }

  const handldeconnexion = ()=>{
    const res = fetch('/api/logout',{
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if(!res){
      alert("Erreur de déconnexion");
      return;
    }
    route.push('/login');
  }

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
      <aside className="hidden md:flex md:flex-col md:w-64 bg-blue-800 text-white fixed inset-y-0 left-0 border-r border-blue-700">
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-blue-700">
          <span className="font-semibold text-lg truncate">RIM EBAY</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">

        <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              pathname?.startsWith("/annonces")
                ? "bg-blue-700 text-blue-200"
                : "hover:bg-blue-600 text-white"
            }`}
          >
            <span className="truncate">Home</span>
          </Link>


          <Link
            href="/Listannonce"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              pathname?.startsWith("/annonces")
                ? "bg-blue-700 text-blue-200"
                : "hover:bg-blue-600 text-white"
            }`}
          >
            <span className="truncate">Annonces</span>
          </Link>

          <Link
            href="/users"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              pathname?.startsWith("/users")
                ? "bg-blue-700 text-blue-200"
                : "hover:bg-blue-600 text-white"
            }`}
          >
            <span className="truncate">Users</span>
          </Link>
        </nav>

        {/* Section Login/Logout */}
        <div className="p-4 border-t border-blue-700 space-y-2">
          <button onClick={handleconnexion} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg">
            Connexion
          </button>
          <button onClick={handldeconnexion} className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg">
            Déconnexion
          </button>
        </div>
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
          <span className="font-semibold text-lg truncate">RIM-EBAY</span>
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
                ? "bg-blue-700 text-blue-200"
                : "hover:bg-blue-600 text-white"
            }`}
          >
            <span className="truncate">LIST</span>
          </Link>
        </nav>

        {/* Section Login/Logout mobile */}
        <div className="p-4 border-t border-blue-700 space-y-2">
          <button className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg">
            Connexion
          </button>
          <button className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg">
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
