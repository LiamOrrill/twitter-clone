import { type NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { api, type RouterOutputs } from "@/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "@/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "@/components/layout";

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
          <Link href={`/@${author.name}`}>
            <span className="">{`@${author.name}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className=" font-thin">{` · ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-xl"> {post.content}</span>
      </div>
    </div>
  );
};

const CreatePostWizard = () => {
  const { data: sessionData } = useSession();

  const [input, setInput] = useState<string>("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    },
    onError(e) {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(`Error: ${errorMessage[0]}`);
        return;
      } else {
        toast.error("Something went wrong...");
      }
    },
  });

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
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent"
        type={"text"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input !== "") {
            e.preventDefault();
            mutate({
              content: input,
            });
          }
        }}
        disabled={isPosting}
      />

      {input !== "" && !isPosting && (
        <button
          onClick={() =>
            mutate({
              content: input,
            })
          }
        >
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
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
  // const { status } = useSession();
  //start fetching posts asap
  api.post.getAll.useQuery();

  // return empty div if BOTH arent loadedm subce user tends to load faster

  return (
    <PageLayout>
      <div className="border-b border-slate-400 p-4">
        <AuthShowcase />
      </div>
      <Feed />
    </PageLayout>
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
