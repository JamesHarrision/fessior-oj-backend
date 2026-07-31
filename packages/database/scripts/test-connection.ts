import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.$connect();

  const result = await prisma.$queryRaw<
    Array<{ databaseName: string | null }>
  >`SELECT DATABASE() AS databaseName`;

  console.log({
    status: "connected",
    database: result[0]?.databaseName ?? "unknown",
    message: "Prisma connected to MySQL successfully",
  });
}

main()
  .catch((error: unknown) => {
    console.error("Database connection test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });