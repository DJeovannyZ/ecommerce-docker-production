import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: cacheado explicito con `use cache` + `cacheTag` y
  // revalidacion on-demand con `revalidateTag` / `revalidatePath`.
  cacheComponents: true,
  partialPrefetching: true,

  // Salida autonoma para la imagen Docker (node server.js).
  output: "standalone",

  // El detalle de producto genera metadata dinamica por producto. Forzar
  // metadata bloqueante garantiza que <title> y <meta name="description">
  // lleguen en el <head> del HTML inicial (mejor SEO y auditorias).
  htmlLimitedBots: /.*/,

  images: {
    // Las imagenes del seeder llegan con image_url = null y se resuelven con
    // placeholders locales en /public. Estas reglas permiten optimizar imagenes
    // remotas reales si la API empieza a entregar URLs absolutas.
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "**" },
    ],
  },

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
