import { z } from "zod";

const valueNameSchema = z.string();
const valueSchema = z.union([z.string(), z.number(), z.boolean()]);
const stateReferenceSchema = z.object({
  ref: valueNameSchema
});
const initValueSchema = z.union([valueSchema, stateReferenceSchema]);

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
  init: z.record(valueNameSchema, initValueSchema).optional(),
  effects: z.array(effectSchema).optional(),
  conditions: z
    .record(conditionNameSchema, conditionStatementSchema)
    .optional(),
});

const effectInvocationObjectSchema = z.object({
  name: effectNameSchema,
  args: z.array(valueSchema).optional(),
});

const effectInvocationNoArgNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
const effectInvocationNoArgCallPattern = /^([A-Za-z_][A-Za-z0-9_]*)\(\s*\)$/;
const effectInvocationCallPattern = /^([A-Za-z_][A-Za-z0-9_]*)\((.*)\)$/;

const effectInvocationStringSchema = z.string().transform((rawValue, context) => {
  const value = rawValue.trim();

  if (effectInvocationNoArgNamePattern.test(value)) {
    return { name: value };
  }

  const noArgCallMatch = value.match(effectInvocationNoArgCallPattern);

  if (noArgCallMatch) {
    return { name: noArgCallMatch[1] };
  }

  if (effectInvocationCallPattern.test(value)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        `Effect invocation shorthand "${rawValue}" does not support arguments. ` +
        "Use object form with name and args instead.",
    });

    return z.NEVER;
  }

  context.addIssue({
    code: z.ZodIssueCode.custom,
    message:
      `Invalid effect invocation shorthand "${rawValue}". ` +
      "Use \"effectName\" or \"effectName()\".",
  });

  return z.NEVER;
});

export const effectInvocationSchema = z.union([
  effectInvocationObjectSchema,
  effectInvocationStringSchema,
]);
