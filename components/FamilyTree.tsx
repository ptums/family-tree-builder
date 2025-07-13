"use client";
import ReactFamilyTree from "react-family-tree";
import { useMemo, useEffect } from "react";
import ProfileDialog from "@/components/ProfileDialog";
import { FamilyNode as FamilyTreeNodes } from "@/types/FamilyNode";
import type { FamilyNode as FamilyNodeType } from "@/types/FamilyNode";
import dynamic from "next/dynamic";
import LoadingIcon from "@/components/LoadingIcon";

const WIDTH = 220;
const HEIGHT = 200;
const ROOT_NODE_ID = "f5c153e7-2916-404e-8233-3f222e7e7864";

const HelperText = dynamic(() => import("@/components/HelperText"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const DarkBanner = dynamic(() => import("@/components/DarkBanner"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const FamilyNode = dynamic(() => import("@/components/FamilyNode"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const FamilyTree = ({ treeData }: { treeData: FamilyTreeNodes[] }) => {
  const treeDataMemo = useMemo(() => treeData, []);

  // Scroll to the specific node and center it on the page
  useEffect(() => {
    const targetElement = document.getElementById(ROOT_NODE_ID);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset +
        rect.top -
        window.innerHeight / 2 +
        rect.height / 2;
      const scrollLeft =
        window.pageXOffset + rect.left - window.innerWidth / 2 + rect.width / 2;

      window.scrollTo({
        top: scrollTop,
        left: scrollLeft,
        behavior: "instant",
      });
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <DarkBanner bannerPosition={"top-0"}>
        <h1 className="text-2xl text-center font-bold">Barnwell Family Tree</h1>
      </DarkBanner>

      {treeDataMemo && treeDataMemo.length > 0 ? (
        <>
          <ReactFamilyTree
            nodes={treeDataMemo}
            rootId={ROOT_NODE_ID}
            width={WIDTH}
            height={HEIGHT}
            renderNode={(node) => (
              <FamilyNode
                key={node.id}
                node={node as unknown as FamilyNodeType} // Type assertion to fix type error
                style={{
                  width: WIDTH,
                  height: HEIGHT,
                  transform: `translate(${node.left * (WIDTH / 2)}px, ${
                    node.top * (HEIGHT / 2)
                  }px)`,
                }}
              />
            )}
          />

          <ProfileDialog />
        </>
      ) : (
        <LoadingIcon />
      )}
      <DarkBanner bannerPosition={"bottom-0"}>
        <HelperText />
      </DarkBanner>
    </div>
  );
};

export default FamilyTree;
