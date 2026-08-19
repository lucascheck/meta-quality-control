import crypto from "node:crypto";
import { ENV } from "./_core/env";

const ALGORITHM = "aes-256-gcm";
const GRAPH_BASE = "https://graph.facebook.com";

function key() {
  return crypto.createHash("sha256").update(ENV.cookieSecret || "meta-quality-control").digest();
}

export function encryptToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptToken(value: string) {
  const [iv, tag, encrypted] = value.split(".");
  if (!iv || !tag || !encrypted) throw new Error("Invalid encrypted token");
  const decipher = crypto.createDecipheriv(ALGORITHM, key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export type MetaConnectionConfig = { accessToken: string; wabaId: string; apiVersion?: string };

export function canAccessResource(ownerId: number, requesterId: number) {
  return ownerId === requesterId;
}

async function graph<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${GRAPH_BASE}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || `Meta API error (${response.status})`);
  return body as T;
}

export async function listPhoneNumbers(config: MetaConnectionConfig) {
  const version = config.apiVersion || "v26.0";
  // O endpoint de phone_numbers não expõe messaging_limit de forma consistente.
  // O tier/limite permanece opcional e é preenchido apenas quando outra fonte compatível o fornecer.
  return graph<{ data: Array<Record<string, unknown>> }>(`${version}/${config.wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,status,quality_rating`, config.accessToken);
}

export async function listTemplates(config: MetaConnectionConfig) {
  const version = config.apiVersion || "v26.0";
  return graph<{ data: Array<Record<string, unknown>> }>(`${version}/${config.wabaId}/message_templates?fields=id,name,status,category,language,components,quality_score`, config.accessToken);
}

export async function sendTemplate(config: MetaConnectionConfig, phoneNumberId: string, to: string, templateName: string, languageCode: string, variables: string[]) {
  const version = config.apiVersion || "v26.0";
  return graph<{ messages?: Array<{ id: string }> }>(`${version}/${phoneNumberId}/messages`, config.accessToken, {
    method: "POST",
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(variables.length ? { components: [{ type: "body", parameters: variables.map(text => ({ type: "text", text })) }] } : {}),
      },
    }),
  });
}

export function normalizePhoneNumber(item: Record<string, unknown>) {
  return {
    metaId: String(item.id || ""),
    displayPhoneNumber: String(item.display_phone_number || ""),
    verifiedName: String(item.verified_name || ""),
    status: String(item.status || ""),
    qualityRating: normalizeQuality(item.quality_rating),
    messagingLimit: normalizeMessagingLimit(item.messaging_limit),
  };
}

export function normalizeQuality(value: unknown): "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN" {
  const normalized = String(value || "").toUpperCase();
  return normalized === "HIGH" || normalized === "MEDIUM" || normalized === "LOW" ? normalized : "UNKNOWN";
}

export function parseDestinations(value: string) {
  return value.split(/[\\n,]+/).map(item => item.trim()).filter(Boolean).slice(0, 100);
}

export function normalizeDeliveryStatus(value: unknown) {
  const normalized = String(value || "UNKNOWN").toUpperCase();
  return ["SENT", "DELIVERED", "READ", "FAILED"].includes(normalized) ? normalized : "UNKNOWN";
}

export function normalizeMessagingLimit(value: unknown) {
  const normalized = Number(value);
  if (normalized === 1000 || normalized === 10000 || normalized === 100000) return normalized;
  return null;
}
