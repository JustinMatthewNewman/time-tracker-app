import { z } from "zod";

/**
 * Zod schemas for time entry validation
 */

export const TimeEntryCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  description: z.string().optional().default(""),
  startTime: z.string().datetime("Invalid start time format"),
  endTime: z.string().datetime("Invalid end time format"),
  category: z.string().min(1, "Category is required").max(100, "Category must be 100 characters or less"),
  tags: z.array(z.string()).optional().default([]),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const TimeEntryUpdateSchema = TimeEntryCreateSchema.partial().extend({
  id: z.string().uuid("Invalid entry ID"),
});

export const TimeEntryIdSchema = z.object({
  id: z.string().uuid("Invalid entry ID"),
});

export const TimeRangeFilterSchema = z.object({
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// TypeScript types derived from schemas
export type TimeEntryCreate = z.infer<typeof TimeEntryCreateSchema>;
export type TimeEntryUpdate = z.infer<typeof TimeEntryUpdateSchema>;
export type TimeEntryId = z.infer<typeof TimeEntryIdSchema>;
export type TimeRangeFilter = z.infer<typeof TimeRangeFilterSchema>;

// Full TimeEntry type (includes id and timestamps)
export interface TimeEntry extends TimeEntryCreate {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  duration: number; // in minutes
}
