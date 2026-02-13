import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import { SLACK_SIGNING_SECRET } from "./utils/constant.js";

export function verifySlackRequest(
  req: Request & { rawBody?: string },
  res: Response,
  next: NextFunction
) {
  const signature = req.headers["x-slack-signature"] as string;
  const timestamp = req.headers["x-slack-request-timestamp"] as string;

  if (!signature || !timestamp) {
    return res.status(400).send("Missing Slack headers");
  }

  // Prevent replay attacks (5 min tolerance)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (Number(timestamp) < fiveMinutesAgo) {
    return res.status(400).send("Request too old");
  }

  const sigBaseString = `v0:${timestamp}:${req.rawBody}`;

  const hmac = crypto
    .createHmac("sha256", SLACK_SIGNING_SECRET)
    .update(sigBaseString)
    .digest("hex");

  const computedSignature = `v0=${hmac}`;

  const isValid = crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(signature)
  );

  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  next();
}
