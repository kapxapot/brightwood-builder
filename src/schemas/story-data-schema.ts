import { z } from "zod";

const valueNameSchema = z.string();
const valueSchema = z.union([z.string(), z.number(), z.boolean()]);
const stateReferenceSchema = z.object({
  ref: valueNameSchema
});
export const initValueSchema = z.union([valueSchema, stateReferenceSchema]);

const effectNameSchema = z.string();
const effectStatementSchema = z.string();

export const conditionNameSchema = z.string();
const conditionStatementSchema = z.string();

export const effectSchema = z.object({
  name: effectNameSchema,
  args: z.union([valueNameSchema, z.array(valueNameSchema)]).optional(),
  conditions: z
    .union([conditionNameSchema, z.array(conditionNameSchema)])
    .optional(),
  statements: z
    .union([effectStatementSchema, z.array(effectStatementSchema)]),
});

export const redirectTriggerSchema = z.object({
  condition: conditionStatementSchema,
  targetId: z.number(),
});

export const stateInitSchema = z.record(valueNameSchema, initValueSchema);
export const effectDefinitionsSchema = z.array(effectSchema);
export const conditionDefinitionsSchema = z
  .record(conditionNameSchema, conditionStatementSchema);
export const redirectTriggersSchema = z.array(redirectTriggerSchema);

export const storyDataSchema = z.object({
  init: stateInitSchema.optional(),
  effects: effectDefinitionsSchema.optional(),
  conditions: conditionDefinitionsSchema.optional(),
  redirectTriggers: redirectTriggersSchema.optional(),
});

const effectInvocationObjectSchema = z.object({
  name: effectNameSchema,
  args: z.array(valueSchema).optional(),
});

const effectInvocationStringSchema = z.string().transform((rawValue, context) => {
  const value = rawValue.trim();

  if (value.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Effect invocations must not be empty strings.",
    });
    return z.NEVER;
  }

  return value;
});

export const effectInvocationSchema = z.union([
  effectInvocationObjectSchema,
  effectInvocationStringSchema,
]);

export const effectInvocationsSchema = z.array(effectInvocationSchema);
