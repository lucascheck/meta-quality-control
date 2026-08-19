import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const metaConnections = mysqlTable("meta_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  wabaIdEncrypted: text("wabaIdEncrypted").notNull(),
  accessTokenEncrypted: text("accessTokenEncrypted").notNull(),
  phoneNumberIdsEncrypted: text("phoneNumberIdsEncrypted").notNull(),
  apiVersion: varchar("apiVersion", { length: 20 }).default("v26.0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const phoneNumbers = mysqlTable("phone_numbers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  connectionId: int("connectionId").notNull(),
  metaId: varchar("metaId", { length: 80 }).notNull(),
  displayPhoneNumber: varchar("displayPhoneNumber", { length: 40 }),
  verifiedName: varchar("verifiedName", { length: 180 }),
  status: varchar("status", { length: 40 }),
  qualityRating: mysqlEnum("qualityRating", ["HIGH", "MEDIUM", "LOW", "UNKNOWN"]).default("UNKNOWN").notNull(),
  qualityRaw: varchar("qualityRaw", { length: 20 }),
  codeVerificationStatus: varchar("codeVerificationStatus", { length: 30 }),
  throughputLevel: varchar("throughputLevel", { length: 40 }),
  messagingLimit: int("messagingLimit"),
  currentUsage: int("currentUsage").default(0).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const qualityHistory = mysqlTable("quality_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phoneNumberId: int("phoneNumberId").notNull(),
  qualityRating: varchar("qualityRating", { length: 20 }).notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  connectionId: int("connectionId").notNull(),
  metaId: varchar("metaId", { length: 80 }),
  name: varchar("name", { length: 180 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  category: varchar("category", { length: 40 }),
  language: varchar("language", { length: 20 }),
  componentsJson: text("componentsJson"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const messageDispatches = mysqlTable("message_dispatches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phoneNumberId: int("phoneNumberId").notNull(),
  templateId: int("templateId"),
  metaMessageId: varchar("metaMessageId", { length: 120 }),
  destination: varchar("destination", { length: 40 }).notNull(),
  templateName: varchar("templateName", { length: 180 }).notNull(),
  status: varchar("status", { length: 40 }).default("SENT").notNull(),
  variablesJson: text("variablesJson"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type MetaConnection = typeof metaConnections.$inferSelect;
export type PhoneNumber = typeof phoneNumbers.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type MessageDispatch = typeof messageDispatches.$inferSelect;
