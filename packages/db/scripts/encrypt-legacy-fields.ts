import { PrismaClient } from "@prisma/client";
import { encryptField, isEncryptedPayload } from "../src/encryption";

const raw = new PrismaClient(); // bypass extension deliberately — raw read/write

async function migrateUsers() {
  const users = await raw.user.findMany({ where: { signatureImage: { not: null } } });
  for (const u of users) {
    if (u.signatureImage && !isEncryptedPayload(u.signatureImage)) {
      await raw.user.update({
        where: { id: u.id },
        data: { signatureImage: encryptField(u.signatureImage) },
      });
    }
  }
}

async function migratePilotForms() {
  const forms = await raw.pilotForm.findMany();
  for (const f of forms) {
    const data: Record<string, string> = {};
    for (const field of ["masterSignature", "hmDmSignature", "shipStampImage"] as const) {
      const val = f[field as keyof typeof f] as string | null;
      if (val && !isEncryptedPayload(val)) {
        data[field] = encryptField(val);
      }
    }
    if (Object.keys(data).length > 0) {
      await raw.pilotForm.update({ where: { id: f.id }, data });
    }
  }
}

async function main() {
  await migrateUsers();
  await migratePilotForms();
  console.log("Legacy field encryption migration complete.");
}

main().finally(() => raw.$disconnect());
