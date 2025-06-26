import { PrismaClient, type Thread } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["info", "warn", "error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getThreadsByCategory(category: string) {
  const threads = await prisma.thread.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true } } }
  });
  return threads.map((t: Thread & { _count: { comments: number } }) => ({
    id: t.id,
    title: t.title,
    categorySlug: t.category,
    postsCount: t._count.comments
  }));
}

export async function getThread(threadId: string) {
  return prisma.thread.findUnique({ where: { id: threadId } });
}

export async function getCommentsForThread(threadId: string) {
  return prisma.comment.findMany({
    where: { threadId },
    include: { author: true },
    orderBy: { createdAt: "asc" }
  });
}

export async function createComment(
  threadId: string,
  authorId: string,
  message: string
) {
  return prisma.comment.create({ data: { threadId, authorId, message } });
}
