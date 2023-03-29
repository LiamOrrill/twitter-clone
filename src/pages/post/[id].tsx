import { PageLayout } from "@/components/layout";
import { PostView } from "@/components/postview";
import { api } from "@/utils/api";
import { generateSSGHelper } from "@/utils/ssgHelper";
import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";

const SinglePostPage: NextPage<{ postID: string }> = ({ postID }) => {
  const { data } = api.post.getPostById.useQuery({
    postId: postID,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.name}`}</title>
      </Head>
      <PageLayout>
        <PostView post={data.post} author={data.author} />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") {
    throw new Error("Id is not a string");
  }

  await ssg.post.getPostById.prefetch({ postId: id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      postID: id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
