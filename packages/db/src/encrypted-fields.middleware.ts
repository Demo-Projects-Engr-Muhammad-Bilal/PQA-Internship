import { Prisma } from "@prisma/client";
import { encryptField, decryptField, isEncryptedPayload } from "./encryption";

/**
 * Maps model -> array of field names that must be transparently
 * encrypted on write and decrypted on read.
 */
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  User: ["signatureImage"],
  PilotForm: ["masterSignature", "hmDmSignature", "shipStampImage"],
};

function encryptData(model: string, data: Record<string, any> | undefined) {
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields || !data) return data;

  for (const field of fields) {
    if (typeof data[field] === "string" && data[field].length > 0) {
      data[field] = encryptField(data[field]);
    }
  }
  return data;
}

function decryptResult(model: string, result: any) {
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields || !result) return result;

  const rows = Array.isArray(result) ? result : [result];
  for (const row of rows) {
    if (!row) continue;
    for (const field of fields) {
      if (typeof row[field] === "string" && isEncryptedPayload(row[field])) {
        try {
          row[field] = decryptField(row[field]);
        } catch {
          // Fail closed: never leak ciphertext to callers, surface a marker instead.
          row[field] = null;
        }
      }
    }
  }
  return result;
}

export function withFieldEncryption() {
  return Prisma.defineExtension({
    name: "field-encryption",
    query: {
      user: {
        async create({ args, query }) {
          encryptData("User", args.data as Record<string, any>);
          return decryptResult("User", await query(args));
        },
        async update({ args, query }) {
          encryptData("User", args.data as Record<string, any>);
          return decryptResult("User", await query(args));
        },
        async findUnique({ args, query }) {
          return decryptResult("User", await query(args));
        },
        async findFirst({ args, query }) {
          return decryptResult("User", await query(args));
        },
        async findMany({ args, query }) {
          return decryptResult("User", await query(args));
        },
      },
      pilotForm: {
        async create({ args, query }) {
          encryptData("PilotForm", args.data as Record<string, any>);
          return decryptResult("PilotForm", await query(args));
        },
        async update({ args, query }) {
          encryptData("PilotForm", args.data as Record<string, any>);
          return decryptResult("PilotForm", await query(args));
        },
        async findUnique({ args, query }) {
          return decryptResult("PilotForm", await query(args));
        },
        async findFirst({ args, query }) {
          return decryptResult("PilotForm", await query(args));
        },
        async findMany({ args, query }) {
          return decryptResult("PilotForm", await query(args));
        },
      },
    },
  });
}
