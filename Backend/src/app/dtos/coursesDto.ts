import { z } from "zod";
export const CourseSchema = z.object({
  _id: z.string().optional(),
  Title: z.string().nullable(),
  Mentor_id: z.string().nullable(),
  Description: z.string().nullable(),
  CreatedAt: z.date().nullable().optional(),
  Category: z.string().nullable(),
  Price: z.string().nullable(),
  Approved_by_admin: z.string().nullable().default("pending"),
  Students_enrolled: z.array(z.string()).nullable().optional(),
  UpdatedAt: z.date().nullable().optional(),
  image: z.string(), // Required
  lessons: z.array(z.record(z.unknown())), // Array of objects
  Content: z.string().nullable(),
  Offer_id: z.string().nullable().default(null),
  unlist: z.boolean().default(false),
});
export type CourseDTO = z.infer<typeof CourseSchema>;
