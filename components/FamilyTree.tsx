"use client";
import ReactFamilyTree from "react-family-tree";

import { DialogProvider } from "@/contexts/DialogContext";
import { useMemo, useEffect } from "react";
import ProfileDialog from "@/components/ProfileDialog";
import { FamilyNode as FamilyTreeNodes } from "@/types/FamilyNode";
import FamilyNode from "@/components/FamilyNode";
import dynamic from "next/dynamic";
import LoadingIcon from "@/components/LoadingIcon";
import { familyData } from "@/data/familyTree";

const WIDTH = 220;
const HEIGHT = 200;

const HelperText = dynamic(() => import("@/components/HelperText"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const FamilyTree = ({ treeData }: { treeData: FamilyTreeNodes[] }) => {
  // TODO: Sort by birthday
  const treeDataMemo = useMemo(() => treeData, []);
  // Scroll to bottom and center horizontally on page load/refresh
  // TODO: Change this so that id: "f5c153e7-2916-404e-8233-3f222e7e7864" is the main focus
  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      left: document.documentElement.scrollWidth / 5,
      behavior: "instant",
    });
  }, []);

  console.log("treeDataMemo", treeDataMemo);
  return (
    <DialogProvider>
      <div className="flex flex-col h-full">
        <h1 className="text-black text-2xl text-center font-bold mt-4">
          Barnwell Family Tree
        </h1>
        <HelperText topPosition="top-4" />

        {treeDataMemo && treeDataMemo.length > 0 ? (
          <>
            <ReactFamilyTree
              nodes={treeDataMemo}
              rootId={"f5c153e7-2916-404e-8233-3f222e7e7864"}
              width={WIDTH}
              height={HEIGHT}
              renderNode={(node) => (
                <FamilyNode
                  key={node.id}
                  node={node}
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
      </div>
      <HelperText topPosition="bottom-8" />
    </DialogProvider>
  );
};

export default FamilyTree;
