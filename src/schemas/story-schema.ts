import { z } from "zod";
import { storyDataSchema } from "./story-data-schema";
import { storyNodeSchema } from "./story-node-schema";

export const storySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  language: z.string().optional(),
  startId: z.number(),
  prefix: z.string().optional(),
  data: storyDataSchema.optional(),
  position: z.array(z.number()).optional(),
  nodes: z.array(storyNodeSchema),
});
