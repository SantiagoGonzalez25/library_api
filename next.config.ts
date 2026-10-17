import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true, // Requisito obligatorio junto a cacheComponents en Next 16
  /* Procesa app/globals.css con Tailwind CSS v4 (utilidades, @theme, etc.). */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
