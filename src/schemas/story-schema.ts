import { z } from "zod";
import { storyDataSchema } from "./story-data-schema";
import { storyNodeSchema } from "./story-node-schema";

const storyShortcutSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
});

export const storySchema = storyShortcutSchema.and(
  z.object({
    description: z.string().optional(),
    startId: z.number(),
    prefix: z.string().optional(),
    data: storyDataSchema.optional(),
    position: z.array(z.number()).optional(),
    nodes: z.array(storyNodeSchema),
  }),
);
