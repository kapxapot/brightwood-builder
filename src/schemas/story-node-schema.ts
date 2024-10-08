import { z } from "zod";
import { conditionNameSchema, effectInvocationSchema } from "./story-data-schema";

const nodeIdSchema = z.number();

const textSchema = z.union([z.string(), z.array(z.string())]);

const actionSchema = z.object({
  id: nodeIdSchema.optional(),
  label: z.string(),
});

const linkSchema = z.object({
  id: nodeIdSchema.optional(),
  weight: z.number(),
  condition: conditionNameSchema.optional(),
});

const baseGraphNodeSchema = z.object({
  id: nodeIdSchema,
  position: z.array(z.number()).optional(),
});

const baseStoryNodeSchema = baseGraphNodeSchema.and(
  z.object({
    label: z.union([z.string(), nodeIdSchema]).optional(),
    text: textSchema,
    effect: effectInvocationSchema.optional(),
  }),
);

const actionStoryNodeSchema = baseStoryNodeSchema.and(
  z.object({
    type: z.literal("action"),
    actions: z.array(actionSchema),
  }),
);

const skipStoryNodeSchema = baseStoryNodeSchema.and(
  z.object({
    type: z.literal("skip"),
    nextId: nodeIdSchema.optional(),
  }),
);

const redirectStoryNodeSchema = baseStoryNodeSchema.and(
  z.object({
    type: z.literal("redirect"),
    links: z.array(linkSchema),
  }),
);

const finishStoryNodeSchema = baseStoryNodeSchema.and(
  z.object({
    type: z.literal("finish"),
  }),
);

export const storyNodeSchema = z.union([
  actionStoryNodeSchema,
  skipStoryNodeSchema,
  redirectStoryNodeSchema,
  finishStoryNodeSchema,
]);
