import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="overflow-none flex  justify-center">
      <div className="flex h-full w-full flex-col  overflow-y-scroll border-x border-slate-400 md:max-w-2xl ">
        {props.children}
      </div>
    </main>
  );
};
