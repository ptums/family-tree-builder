"use client";
import ReactFamilyTree from "react-family-tree";
import { familyData } from "@/data/familyTree";

import { DialogProvider } from "@/contexts/DialogContext";
import { useMemo, useEffect } from "react";
import ProfileDialog from "@/components/ProfileDialog";
import { FamilyNode as FamilyTreeNodes } from "@/types/FamilyNode";
import FamilyNode from "@/components/FamilyNode";
import dynamic from "next/dynamic";
import LoadingIcon from "@/components/LoadingIcon";

const WIDTH = 220;
const HEIGHT = 200;

const HelperText = dynamic(() => import("@/components/HelperText"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

export default function App() {
  // TODO: Sort by birthday
  const familyDataMemo = useMemo(() => familyData, []);

  // Scroll to bottom and center horizontally on page load/refresh
  // TODO: Change this so that id: "f5c153e7-2916-404e-8233-3f222e7e7864" is the main focus
  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      left: document.documentElement.scrollWidth / 5,
      behavior: "instant",
    });
  }, []);

  return (
    <DialogProvider>
      <div className="flex flex-col h-full">
        <h1 className="text-black text-2xl text-center font-bold mt-4">
          Barnwell Family Tree
        </h1>
        <HelperText topPosition="top-4" />

        <PageContent
          treeData={familyDataMemo as unknown as FamilyTreeNodes[]}
        />
      </div>
      <HelperText topPosition="bottom-8" />
    </DialogProvider>
  );
}

const PageContent = ({ treeData }: { treeData: FamilyTreeNodes[] }) => (
  <>
    <ReactFamilyTree
      nodes={treeData.reverse()}
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
);
