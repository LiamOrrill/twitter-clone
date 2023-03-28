import { api } from "@/utils/api";
import { type NextPage } from "next";
import Head from "next/head";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0)
    return <div className="text-xl text-slate-300">No posts found</div>;

  return (
    <div className="flex flex-col">
      {data.map(({ post, author }) => {
        return <PostView post={post} key={post.id} author={author} />;
      })}
    </div>
  );
};

const Profile: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36  bg-slate-600">
          <Image
            src={data.image || ""}
            alt={data.name || ""}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl">{`@${data.name || ""}`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export default Profile;

import { createProxySSGHelpers } from "@trpc/react-query/ssg";

import { prisma } from "@/server/db";
import superjson from "superjson";
import { type GetStaticProps } from "next";
import { appRouter } from "@/server/api/root";
import { PageLayout } from "@/components/layout";
import Image from "next/image";
import { LoadingPage } from "@/components/loading";
import { PostView } from "@/components/postview";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: {
      prisma,
      session: null,
    },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("Slug is not a string");
  }

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
