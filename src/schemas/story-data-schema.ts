import { z } from "zod";

const valueNameSchema = z.string();
const valueSchema = z.union([z.string(), z.number(), z.boolean()]);

const effectNameSchema = z.string();
const effectStatementSchema = z.string();

export const conditionNameSchema = z.string();
const conditionStatementSchema = z.string();

const effectSchema = z.object({
  name: effectNameSchema,
  args: z.union([valueNameSchema, z.array(valueNameSchema)]).optional(),
  conditions: z
    .union([conditionNameSchema, z.array(conditionNameSchema)])
    .optional(),
  statements: z
    .union([effectStatementSchema, z.array(effectStatementSchema)])
    .optional(),
});

export const storyDataSchema = z.object({
  init: z.record(valueNameSchema, valueSchema),
  effects: z.array(effectSchema).optional(),
  conditions: z
    .record(conditionNameSchema, conditionStatementSchema)
    .optional(),
});

export const effectInvocationSchema = z.object({
  name: effectNameSchema,
  args: z.array(valueSchema).optional(),
});
