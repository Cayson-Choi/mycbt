import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// .env.local을 우선 로드
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
