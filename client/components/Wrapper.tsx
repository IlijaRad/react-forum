import { ReactNode } from "react";

const Wrapper = ({ children }: { children: ReactNode }) => {
  return <div className="w-full max-w-3xl mt-8 mx-auto">{children}</div>;
};

export default Wrapper;
