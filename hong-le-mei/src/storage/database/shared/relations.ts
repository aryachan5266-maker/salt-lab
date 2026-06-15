import { relations } from "drizzle-orm/relations";
import { generations, forbiddenChecks } from "./schema";

export const forbiddenChecksRelations = relations(forbiddenChecks, ({one}) => ({
	generation: one(generations, {
		fields: [forbiddenChecks.generationId],
		references: [generations.id]
	}),
}));

export const generationsRelations = relations(generations, ({many}) => ({
	forbiddenChecks: many(forbiddenChecks),
}));