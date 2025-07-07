"use client";
import ReactFamilyTree from "react-family-tree";
import { familyData } from "@/data/familyTree";

import { DialogProvider } from "@/contexts/DialogContext";
import { useMemo } from "react";
import ProfileDialog from "@/components/ProfileDialog";
import { FamilyNode as FamilyTreeNodes } from "@/types/FamilyNode";
import FamilyNode from "@/components/FamilyNode";

const WIDTH = 220;
const HEIGHT = 200;

export default function App() {
  const familyDataMemo = useMemo(() => familyData, []);

  return (
    <DialogProvider>
      <div className="flex flex-col h-full">
        <h1 className="text-black text-2xl text-center font-bold mt-4">
          Barnwell Family Tree
        </h1>
        <p className="text-sm text-center">
          Click on persons name for more details
        </p>
        <PageContent treeData={familyDataMemo} />
      </div>
    </DialogProvider>
  );
}

const PageContent = ({ treeData }: any) => (
  <>
    <ReactFamilyTree
      nodes={treeData as FamilyTreeNodes[]}
      rootId={"c8eb1606-9628-4d8a-ad0d-ceb984519c53"}
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
