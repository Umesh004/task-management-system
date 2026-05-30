import { prisma } from "../../lib/prisma";

import { ApiError } from "../../utils/ApiError";

import { CreateTaskInput, GetTasksInput } from "./task.schema";
import { Prisma, Role } from "@prisma/client";

export const createTask = async (
  payload: CreateTaskInput,
  organizationId: string,
) => {
  const assignee = await prisma.user.findFirst({
    where: {
      id: payload.assigneeId,
      organizationId,
    },
  });

  if (!assignee) {
    throw new ApiError(
      404,
      "ASSIGNEE_NOT_FOUND",
      "Assignee not found in organization",
    );
  }

  const task = await prisma.task.create({
    data: {
      title: payload.title,

      description: payload.description,

      priority: payload.priority ?? "MEDIUM",

      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,

      assigneeId: payload.assigneeId,

      organizationId,
    },

    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return task;
};

export const getTasks = async (
  query: GetTasksInput,
  user: {
    userId: string;
    role: Role;
    organizationId: string;
  },
) => {
  // Defensive parsing
  const parsedPage = Number(query.page) || 1;

  const parsedLimit = Number(query.limit) || 10;

  const skip = (parsedPage - 1) * parsedLimit;

  const where: Prisma.TaskWhereInput = {
    organizationId: user.organizationId,
  };

  // Filters
  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.assigneeId) {
    where.assigneeId = query.assigneeId;
  }

  /**
   * MEMBER:
   * Can only view own tasks
   * even if assigneeId is passed
   */
  if (user.role === Role.MEMBER) {
    where.assigneeId = user.userId;
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,

      skip,
      take: parsedLimit,

      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.task.count({
      where,
    }),
  ]);

  return {
    tasks,

    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,

      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};
