import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, metaConnections, phoneNumbers, qualityHistory, templates, messageDispatches } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { canAccessResource } from "./meta";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn };
  if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }

export async function listConnections(userId: number) { const db = await getDb(); if (!db) return []; return db.select({ id: metaConnections.id, label: metaConnections.label, apiVersion: metaConnections.apiVersion, updatedAt: metaConnections.updatedAt }).from(metaConnections).where(eq(metaConnections.userId, userId)).orderBy(desc(metaConnections.updatedAt)); }
export async function getConnection(userId: number, id: number) { const db = await getDb(); if (!db || !canAccessResource(userId, userId)) return undefined; const rows = await db.select().from(metaConnections).where(and(eq(metaConnections.userId, userId), eq(metaConnections.id, id))).limit(1); return rows[0]; }
export async function listPhoneNumbers(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(phoneNumbers).where(eq(phoneNumbers.userId, userId)).orderBy(desc(phoneNumbers.updatedAt)); }
export async function listTemplates(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(templates).where(eq(templates.userId, userId)).orderBy(desc(templates.updatedAt)); }
export async function listDispatches(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(messageDispatches).where(eq(messageDispatches.userId, userId)).orderBy(desc(messageDispatches.sentAt)).limit(50); }
export async function listQualityHistory(userId: number, phoneNumberId: number) { const db = await getDb(); if (!db) return []; return db.select().from(qualityHistory).where(and(eq(qualityHistory.userId, userId), eq(qualityHistory.phoneNumberId, phoneNumberId))).orderBy(desc(qualityHistory.recordedAt)).limit(30); }
export async function getDashboardMetrics(userId: number) {
  const db = await getDb(); if (!db) return { activeNumbers: 0, highQuality: 0, approvedTemplates: 0, dispatchesToday: 0 };
  const [numbers, approved, dispatches] = await Promise.all([
    db.select({ count: sql<number>`count(*)`, high: sql<number>`sum(case when ${phoneNumbers.qualityRating} = 'HIGH' then 1 else 0 end)` }).from(phoneNumbers).where(and(eq(phoneNumbers.userId, userId), eq(phoneNumbers.status, "CONNECTED"))),
    db.select({ count: sql<number>`count(*)` }).from(templates).where(and(eq(templates.userId, userId), eq(templates.status, "APPROVED"))),
    db.select({ count: sql<number>`count(*)` }).from(messageDispatches).where(and(eq(messageDispatches.userId, userId), sql`${messageDispatches.sentAt} >= CURDATE()`)),
  ]);
  return { activeNumbers: Number(numbers[0]?.count || 0), highQuality: Number(numbers[0]?.high || 0), approvedTemplates: Number(approved[0]?.count || 0), dispatchesToday: Number(dispatches[0]?.count || 0) };
}

export { metaConnections, phoneNumbers, qualityHistory, templates, messageDispatches };
