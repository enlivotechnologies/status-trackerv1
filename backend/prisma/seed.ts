import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Database seed script ready.");
  console.log("⚠️ Note: Hardcoded seed data has been removed for security.");
  console.log("Use SQL queries to manually create users in your database.");
  console.log("See documentation for SQL creation scripts.");
}

main()
  .catch((e) => {
    console.error("Seed script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
