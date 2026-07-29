import "server-only";

const internalApiKey =
  process.env.CRM_INTERNAL_API_KEY;

if (!internalApiKey) {
  throw new Error(
    "CRM_INTERNAL_API_KEY is not configured.",
  );
}

export const serverConfig = {
  internalApiKey,
  region: process.env.CRM_REGION ?? "Nepal",
};

export function getServerConfigSummary() {
  return {
    region: serverConfig.region,
    internalApiKeyConfigured:
      serverConfig.internalApiKey.length > 0,
  };
}