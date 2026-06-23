import crypto from "crypto";

/**
 * Derives a per-user AES-256 key.
 *
 * The original Flask project derived the key from SHA256(email) alone, which
 * means anyone who learns a user's email could compute their key. Here we
 * mix in a server-side secret (ENCRYPTION_SECRET) via HMAC-SHA256, so the key
 * is still deterministic per-user (no extra column to manage) but cannot be
 * reproduced without the server secret.
 */
function getUserKey(userEmail: string): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET env var is not set");
  }
  return crypto.createHmac("sha256", secret).update(userEmail.toLowerCase()).digest();
}

const ALGO = "aes-256-gcm";

/** Encrypts plaintext, returns "iv:authTag:ciphertext" (all base64). */
export function encryptContent(plaintext: string, userEmail: string): string {
  const key = getUserKey(userEmail);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

/** Decrypts a string produced by encryptContent. Returns "[Unable to decrypt]" on failure. */
export function decryptContent(payload: string, userEmail: string): string {
  try {
    const key = getUserKey(userEmail);
    const [ivB64, tagB64, dataB64] = payload.split(":");
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return "[Unable to decrypt]";
  }
}

const REMINDER_KEYWORDS = [
  "todo", "remind", "reminder", "update", "inform", "notify",
  "check", "follow up", "schedule", "meeting", "appointment",
  "deadline", "submit", "call", "visit", "task",
];

/** Wraps reminder-ish keywords in <mark> for highlighting in the UI. */
export function highlightKeywords(text: string, keywords: string[] = REMINDER_KEYWORDS): string {
  let result = text;
  for (const kw of keywords) {
    const pattern = new RegExp(`\\b(${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "gi");
    result = result.replace(pattern, "<mark>$1</mark>");
  }
  return result;
}
