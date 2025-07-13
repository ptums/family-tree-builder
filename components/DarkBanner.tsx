import classNames from "classnames";
import React from "react";

const DarkBanner = ({
  children,
  bannerPosition,
}: {
  children: React.JSX.Element;
  bannerPosition: string;
}) => {
  return (
    <footer
      className={classNames(
        "fixed left-0 w-full h-[50px] bg-black/80 shadow-t flex items-center justify-center z-50",
        bannerPosition
      )}
    >
      <div className="text-white flex flex-col sm:flex-row">{children}</div>
    </footer>
  );
};

export default DarkBanner;
