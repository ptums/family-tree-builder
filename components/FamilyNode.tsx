"use client";
import { useDialog } from "@/contexts/DialogContext";

const FamilyNode = ({ node, style }: any) => {
  const { openDialog } = useDialog();
  return (
    <div
      className="absolute flex p-4 items-center justify-center"
      style={style}
      onClick={() => openDialog(node)}
    >
      <div className="border bg-white p-2 rounded cursor-pointer hover:shadow-lg">
        <p className="text-sm">{node?.name}</p>
        <p className="text-xs">
          B: {node?.birth} | D: {node?.death}
        </p>
      </div>
    </div>
  );
};

export default FamilyNode;
