import { pgTable, index, varchar, text, jsonb, boolean, timestamp, serial, integer, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

const genId = sql`(gen_random_uuid())`;

export const brandAssets = pgTable("brand_assets", {
	id: varchar({ length: 36 }).default(genId).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	category: varchar({ length: 32 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	fileUrl: text("file_url"),
	metadata: jsonb(),
	isPinned: boolean("is_pinned").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("brand_assets_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("brand_assets_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const creditLogs = pgTable("credit_logs", {
	id: varchar({ length: 36 }).default(genId).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	action: varchar({ length: 64 }).notNull(),
	credits: integer().notNull(),
	balanceAfter: integer("balance_after"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("credit_logs_action_idx").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("credit_logs_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("credit_logs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const forbiddenChecks = pgTable("forbidden_checks", {
	id: varchar({ length: 36 }).default(genId).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	generationId: varchar("generation_id", { length: 36 }),
	content: text().notNull(),
	hits: jsonb(),
	hitCount: integer("hit_count").default(0),
	isPremium: boolean("is_premium").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("forbidden_checks_generation_id_idx").using("btree", table.generationId.asc().nullsLast().op("text_ops")),
	index("forbidden_checks_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.generationId],
			foreignColumns: [generations.id],
			name: "forbidden_checks_generation_id_generations_id_fk"
		}),
]);

export const knowledgeItems = pgTable("knowledge_items", {
	id: varchar({ length: 36 }).default(genId).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	category: varchar({ length: 32 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	tags: jsonb(),
	isPinned: boolean("is_pinned").default(false),
	refCount: integer("ref_count").default(0),
	source: varchar({ length: 64 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("knowledge_items_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("knowledge_items_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const generations = pgTable("generations", {
	id: varchar({ length: 36 }).default(genId).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	role: varchar({ length: 32 }).notNull(),
	input: text().notNull(),
	gender: varchar({ length: 16 }),
	industry: varchar({ length: 64 }),
	brandContext: text("brand_context"),
	result: jsonb(),
	imageUrl: text("image_url"),
	imagePrompt: text("image_prompt"),
	ttsUrl: text("tts_url"),
	platform: varchar({ length: 32 }).default('xiaohongshu'),
	status: varchar({ length: 32 }).default('completed'),
	creditsCost: integer("credits_cost").default(1),
	forbiddenCheck: jsonb("forbidden_check"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("generations_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("generations_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
	index("generations_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(genId).primaryKey().notNull(),
	nickname: varchar({ length: 128 }),
	role: varchar({ length: 32 }).default('operator'),
	industry: varchar({ length: 64 }),
	creditsTotal: integer("credits_total").default(10).notNull(),
	creditsUsed: integer("credits_used").default(0).notNull(),
	plan: varchar({ length: 32 }).default('free').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("users_plan_idx").using("btree", table.plan.asc().nullsLast().op("text_ops")),
]);
