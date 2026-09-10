import { PrismaClient } from "@prisma/client";
import { withFieldEncryption } from "./encrypted-fields.middleware";

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
    const basePrisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL, // Must be port 6543 pooler URL in production
            },
        },
        // Explicit log levels prevent verbose query logging leaking to Vercel logs in prod
        log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    });
    return basePrisma.$extends(withFieldEncryption());
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}

// Prisma types (e.g. Prisma, FormStatus) should be imported directly from
// "@prisma/client" in each consuming file. Re-exporting with export * causes
// a Turbopack warning because @prisma/client is a CommonJS module whose
// exports are only known at runtime.
