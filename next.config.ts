import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin', 'mssql', 'jwks-rsa'],
};

export default nextConfig;
