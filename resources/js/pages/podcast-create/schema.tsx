import * as z from "zod"

export const podcastSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  file: z.any().optional()
})

export type PodcastForm = z.infer<typeof podcastSchema>
