import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
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
});
