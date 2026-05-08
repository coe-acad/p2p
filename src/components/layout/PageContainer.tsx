import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  gap?: number;
  className?: string;
}

const gapClassMap: Record<number, string> = {
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
};

export const PageContainer = ({ children, gap = 4, className = "" }: PageContainerProps) => {
  return (
    <div
      className={`mx-auto flex w-full max-w-xl flex-col px-4 sm:px-6 lg:max-w-4xl lg:px-8 ${
        gapClassMap[gap] || gapClassMap[4]
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
