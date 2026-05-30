import { prisma } from "../../lib/prisma";

import { ApiError } from "../../utils/ApiError";

import { CreateTaskInput, GetTasksInput, UpdateTaskInput } from "./task.schema";
import { Prisma, Role, TaskStatus } from "@prisma/client";

const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
  TODO: [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED],

  IN_PROGRESS: [TaskStatus.IN_REVIEW, TaskStatus.BLOCKED],

  IN_REVIEW: [TaskStatus.DONE, TaskStatus.BLOCKED],

  BLOCKED: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW],

  DONE: [],
};

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

export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus,
  user: {
    userId: string;
    role: Role;
    organizationId: string;
  },
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId: user.organizationId,
    },
  });

  if (!task) {
    throw new ApiError(404, "TASK_NOT_FOUND", "Task not found");
  }

  // Only MANAGER
  const isManager = user.role === Role.MANAGER;

  // Assignee can update own task
  const isAssignee = task.assigneeId === user.userId;

  if (!isManager && !isAssignee) {
    throw new ApiError(403, "FORBIDDEN", "You cannot update this task");
  }

  const allowed = allowedTransitions[task.status];

  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      "INVALID_STATUS_TRANSITION",
      `Cannot move task from ${task.status} to ${status}`,
    );
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: task.id,
    },

    data: {
      status,
    },

    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedTask;
};

export const updateTask = async (
  taskId: string,
  payload: UpdateTaskInput,
  organizationId: string,
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId,
    },
  });

  if (!task) {
    throw new ApiError(404, "TASK_NOT_FOUND", "Task not found");
  }

  // Validate assignee if changing
  if (payload.assigneeId) {
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
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: task.id,
    },

    data: {
      ...(payload.title && {
        title: payload.title,
      }),

      ...(payload.description !== undefined && {
        description: payload.description,
      }),

      ...(payload.priority && {
        priority: payload.priority,
      }),

      ...(payload.assigneeId && {
        assigneeId: payload.assigneeId,
      }),

      ...(payload.dueDate && {
        dueDate: new Date(payload.dueDate),
      }),
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

  return updatedTask;
};

export const deleteTask = async (taskId: string, organizationId: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId,
    },
  });

  if (!task) {
    throw new ApiError(404, "TASK_NOT_FOUND", "Task not found");
  }

  await prisma.task.delete({
    where: {
      id: task.id,
    },
  });

  return null;
};
