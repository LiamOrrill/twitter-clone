import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    const users = await ctx.prisma.user.findMany({
      select: {
        id: true,
        image: true,
        name: true,
      },
      where: {
        id: {
          in: posts.map((post) => post.authorId),
        },
      },
      take: 100,
    });

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.name || !author.image) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Could not find author for post`,
        });
      }

      return {
        post,
        author: {
          id: author.id,
          name: author.name,
          image: author.image,
        },
      };
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, "Message it too small to post")
          .max(280, "Message is too long to post"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session.user.id;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are posting too fast",
        });
      }

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
