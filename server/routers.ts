import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getConnection, getDashboardMetrics, getDb, listConnections, listDispatches, listPhoneNumbers, listQualityHistory, listTemplates, messageDispatches, metaConnections, phoneNumbers, qualityHistory, templates } from "./db";
import { decryptToken, encryptToken, listPhoneNumbers as fetchPhoneNumbers, listTemplates as fetchTemplates, normalizeMessagingLimit, normalizeQuality, sendTemplate } from "./meta";
import { and, eq } from "drizzle-orm";

const connectionInput = z.object({ label: z.string().min(2).max(120), wabaId: z.string().min(3).max(80), accessToken: z.string().min(10), phoneNumberIds: z.array(z.string().min(3)).min(1), apiVersion: z.string().default("v26.0") });
const owner = protectedProcedure;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  dashboard: router({
    metrics: owner.query(({ ctx }) => getDashboardMetrics(ctx.user.id)),
    numbers: owner.query(({ ctx }) => listPhoneNumbers(ctx.user.id)),
    templates: owner.query(({ ctx }) => listTemplates(ctx.user.id)),
    dispatches: owner.query(({ ctx }) => listDispatches(ctx.user.id)),
    qualityHistory: owner.input(z.object({ phoneNumberId: z.number() })).query(({ ctx, input }) => listQualityHistory(ctx.user.id, input.phoneNumberId)),
  }),
  connections: router({
    list: owner.query(({ ctx }) => listConnections(ctx.user.id)),
    create: owner.input(connectionInput).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const [created] = await db.insert(metaConnections).values({ userId: ctx.user.id, label: input.label, wabaIdEncrypted: encryptToken(input.wabaId), accessTokenEncrypted: encryptToken(input.accessToken), phoneNumberIdsEncrypted: encryptToken(JSON.stringify(input.phoneNumberIds)), apiVersion: input.apiVersion }).$returningId(); return { id: created.id }; }),
    sync: owner.input(z.object({ connectionId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); const connection = await getConnection(ctx.user.id, input.connectionId); if (!db || !connection) throw new Error("Connection not found");
      const config = { accessToken: decryptToken(connection.accessTokenEncrypted), wabaId: decryptToken(connection.wabaIdEncrypted), apiVersion: connection.apiVersion };
      const [numberResponse, templateResponse] = await Promise.all([fetchPhoneNumbers(config), fetchTemplates(config)]);
      for (const item of numberResponse.data || []) {
        const metaId = String(item.id); const rating = normalizeQuality(item.quality_rating); const limit = normalizeMessagingLimit(item.messaging_limit);
        const existing = await db.select({ id: phoneNumbers.id, qualityRating: phoneNumbers.qualityRating }).from(phoneNumbers).where(and(eq(phoneNumbers.userId, ctx.user.id), eq(phoneNumbers.metaId, metaId))).limit(1);
        if (existing[0]) { await db.update(phoneNumbers).set({ displayPhoneNumber: String(item.display_phone_number || ""), verifiedName: String(item.verified_name || ""), status: String(item.status || ""), qualityRating: rating, messagingLimit: limit, lastSyncedAt: new Date() }).where(eq(phoneNumbers.id, existing[0].id)); if (existing[0].qualityRating !== rating) await db.insert(qualityHistory).values({ userId: ctx.user.id, phoneNumberId: existing[0].id, qualityRating: rating }); }
        else { const [created] = await db.insert(phoneNumbers).values({ userId: ctx.user.id, connectionId: connection.id, metaId, displayPhoneNumber: String(item.display_phone_number || ""), verifiedName: String(item.verified_name || ""), status: String(item.status || ""), qualityRating: rating, messagingLimit: limit, lastSyncedAt: new Date() }).$returningId(); await db.insert(qualityHistory).values({ userId: ctx.user.id, phoneNumberId: created.id, qualityRating: rating }); }
      }
      await db.delete(templates).where(and(eq(templates.userId, ctx.user.id), eq(templates.connectionId, connection.id)));
      for (const item of templateResponse.data || []) await db.insert(templates).values({ userId: ctx.user.id, connectionId: connection.id, metaId: String(item.id || ""), name: String(item.name || ""), status: String(item.status || ""), category: String(item.category || ""), language: String((item.language as { code?: string })?.code || item.language || ""), componentsJson: JSON.stringify(item.components || []) });
      return { numbers: numberResponse.data?.length || 0, templates: templateResponse.data?.length || 0 };
    }),
  }),
  dispatch: router({
    send: owner.input(z.object({ phoneNumberId: z.number(), destinations: z.array(z.string().min(8)).min(1).max(100), templateName: z.string().min(1), languageCode: z.string().default("pt_BR"), variables: z.array(z.string()).default([]) })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable"); const numbers = await listPhoneNumbers(ctx.user.id); const phone = numbers.find(item => item.id === input.phoneNumberId); if (!phone) throw new Error("Phone number not found"); const connection = await getConnection(ctx.user.id, phone.connectionId); if (!connection) throw new Error("Connection not found"); const config = { accessToken: decryptToken(connection.accessTokenEncrypted), wabaId: decryptToken(connection.wabaIdEncrypted), apiVersion: connection.apiVersion }; const results: Array<{ destination: string; success: boolean; messageId?: string; error?: string }> = [];
      for (const destination of input.destinations) { try { const response = await sendTemplate(config, phone.metaId, destination, input.templateName, input.languageCode, input.variables); await db.insert(messageDispatches).values({ userId: ctx.user.id, phoneNumberId: phone.id, destination, templateName: input.templateName, metaMessageId: response.messages?.[0]?.id || null, status: "SENT", variablesJson: JSON.stringify(input.variables) }); results.push({ destination, success: true, messageId: response.messages?.[0]?.id }); } catch (error) { const message = error instanceof Error ? error.message : "Erro desconhecido"; await db.insert(messageDispatches).values({ userId: ctx.user.id, phoneNumberId: phone.id, destination, templateName: input.templateName, status: "FAILED", variablesJson: JSON.stringify(input.variables) }); results.push({ destination, success: false, error: message }); } }
      return { success: results.some(result => result.success), results };
    }),
  }),
});
export type AppRouter = typeof appRouter;
