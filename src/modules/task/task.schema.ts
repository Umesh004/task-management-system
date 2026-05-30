import { TaskPriority, TaskStatus } from "@prisma/client";

import { z } from "zod";

export const createTaskSchema = z
  .object({
    title: z.string().min(3, "title must be at least 3 characters"),

    description: z.string().optional(),

    priority: z
      .enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH])
      .optional(),

    assigneeId: z.uuid("invalid assignee id"),

    dueDate: z.string().datetime("dueDate must be a valid ISO date").optional(),
  })
  .refine(
    (data) => {
      if (!data.dueDate) {
        return true;
      }

      return new Date(data.dueDate) > new Date();
    },
    {
      message: "due_date must be a future date",
      path: ["dueDate"],
    },
  );

export const getTasksSchema = z.object({
  page: z.coerce.number().min(1).default(1),

  limit: z.coerce.number().min(1).max(100).default(10),

  status: z
    .enum([
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.IN_REVIEW,
      TaskStatus.BLOCKED,
      TaskStatus.DONE,
    ])
    .optional(),

  priority: z
    .enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH])
    .optional(),

  assigneeId: z.uuid().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type GetTasksInput = z.infer<typeof getTasksSchema>;
