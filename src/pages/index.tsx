import { type NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { api, type RouterOutputs } from "@/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "@/components/loading";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.image || ""}
        alt={`@${author.name}'s profile image`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />

      <div className="flex flex-col">
        <div className="flex gap-1  text-slate-300">
          <span className="">{`@${author.name}`}</span>
          <span className=" font-thin">{` · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span> {post.content}</span>
      </div>
    </div>
  );
};

const CreatePostWizard = () => {
  const { data: sessionData } = useSession();

  if (!sessionData) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={sessionData.user.image || ""}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input placeholder="Type some emojis!" className="grow bg-transparent" />
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong....</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { status } = useSession();
  //start fetching posts asap
  api.post.getAll.useQuery();

  // return empty div if BOTH arent loadedm subce user tends to load faster
  if (status !== "authenticated") return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400  md:max-w-2xl">
          <div className="border-b border-slate-400 p-4">
            <AuthShowcase />
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="">
      {sessionData ? (
        <>
          <CreatePostWizard />
        </>
      ) : (
        <button
          className="flex justify-center  text-white no-underline "
          onClick={() => void signIn()}
        >
          Sign In
        </button>
      )}
    </div>
  );
};
