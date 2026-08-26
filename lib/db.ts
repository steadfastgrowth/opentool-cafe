import { PrismaD1 } from "@prisma/adapter-d1";

const globalForPrisma = globalThis as unknown as { prisma?: unknown };

async function getD1() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    try {
      const { env } = getCloudflareContext();
      if (env && "DB" in env && env.DB) return env.DB;
    } catch {
      const { env } = await getCloudflareContext({ async: true });
      if (env && "DB" in env && env.DB) return env.DB;
    }
  } catch {
    /* local next */
  }
  return undefined;
}

export async function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma as any;

  const db = await getD1();
  if (db) {
    const { PrismaClient } = await import("@prisma/client/wasm.js");
    const client = new PrismaClient({ adapter: new PrismaD1(db as any) } as any);
    globalForPrisma.prisma = client;
    return client;
  }

  if (String(process.env.APP_URL || "").includes("opentool.cafe")) {
    throw new Error("D1 binding DB not visible in worker");
  }

  const { PrismaClient } = await import("@prisma/client");
  const client = new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}
