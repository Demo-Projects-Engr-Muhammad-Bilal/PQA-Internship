import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up old admins...");

  // 1. Delete all users with the ADMIN role (RefreshToken rows cascade-delete with them)
  await prisma.user.deleteMany({
    where: {
      role: "ADMIN",
    },
  });

  console.log("Seeding master admin account...");

  // 2. Hash the password
  const hashedPassword = await bcrypt.hash("AdminSecurePassword123!", 10);

  // 3. Create the new master admin
  const masterAdmin = await prisma.user.create({
    data: {
      name: "Muhammad Bilal Khalid",
      email: "muhammadbilal41266@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`Master Admin seeded successfully: ${masterAdmin.email}`);
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
