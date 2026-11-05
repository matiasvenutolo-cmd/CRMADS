import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pdf usa módulos de Node (fuentes, imágenes): se carga tal cual en el servidor.
  serverExternalPackages: ["@react-pdf/renderer"],
  // El logo se lee del disco al generar el Word y el PDF.
  outputFileTracingIncludes: { "/cotizacion/[id]/[formato]": ["./public/logo/**"] },
};

export default nextConfig;
