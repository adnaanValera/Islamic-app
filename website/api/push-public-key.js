import { getPushPublicKey, isPushConfigured } from "./_lib/web-push.js";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
  response.status(200).json({
    ok: true,
    configured: isPushConfigured(),
    publicKey: getPushPublicKey(),
  });
}
