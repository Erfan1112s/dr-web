import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // پکیج‌های prisma و pg باید بیرون از باندل Turbopack باقی بمانند
  // (الزام Prisma 7 برای استفاده از driver adapter)
  serverExternalPackages: ["@prisma/client", "pg"],
};

export default nextConfig;