type Bucket = {
  put: (key: string, value: ArrayBuffer | Uint8Array, options?: { httpMetadata?: { contentType?: string } }) => Promise<unknown>;
  get: (key: string) => Promise<{ body: ReadableStream | null } | null>;
};

async function workerEnv(): Promise<Record<string, unknown> | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    try {
      return getCloudflareContext().env as unknown as Record<string, unknown>;
    } catch {
      const { env } = await getCloudflareContext({ async: true });
      return env as unknown as Record<string, unknown>;
    }
  } catch {
    return undefined;
  }
}

export async function getAvatars(): Promise<Bucket | null> {
  const env = await workerEnv();
  const bucket = env?.AVATARS as Bucket | undefined;
  if (bucket && typeof bucket.put === "function" && typeof bucket.get === "function") return bucket;
  return null;
}
