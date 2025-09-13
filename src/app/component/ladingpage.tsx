"use client";

import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {/* Animation du titre */}
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-blue-600 mb-6 text-center"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Bienvenue sur notre plateforme 🎉
      </motion.h1>

      {/* Texte de description */}
      <motion.p
        className="text-lg md:text-xl text-gray-700 max-w-2xl text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Ici vous pouvez publier, découvrir et sponsoriser des annonces facilement. 
        Notre mission est de connecter les utilisateurs et de faciliter la mise en avant des annonces importantes.
      </motion.p>

      {/* Bouton animé */}
      <motion.a
        href="/Listannonce"
        className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Voir les annonces 🚀
      </motion.a>
    </div>
  );
}
