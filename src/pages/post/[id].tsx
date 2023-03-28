import { PageLayout } from "@/components/layout";
import { type NextPage } from "next";
import Head from "next/head";

const SinglePostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <PageLayout>
        <div className="h-full w-full border-x border-slate-400  md:max-w-2xl">
          Post View
          {/* <div className="border-b border-slate-400 p-4">
            <AuthShowcase />
          </div> */}
        </div>
      </PageLayout>
    </>
  );
};

export default SinglePostPage;
