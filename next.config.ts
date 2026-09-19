import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin', 'mssql', 'jwks-rsa'],
  // Dev-only badge. Default bottom-left sits directly on top of the sidebar's
  // bottom controls (the Teams page's team selector), hiding them in every
  // local session. Bottom-right is clear on desktop; the only thing there is
  // the mobile view switcher, which is md:hidden.
  devIndicators: { position: 'bottom-right' },
};

export default nextConfig;
