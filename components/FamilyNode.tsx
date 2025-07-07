"use client";
import { SourceKeys, SOURCES, useDialog } from "@/contexts/DialogContext";

const FamilyNode = ({ node, style }: any) => {
  const { openDialog } = useDialog();
  return (
    <div
      className="absolute flex p-4 items-center justify-center"
      style={style}
      onClick={() =>
        openDialog(node, {
          key: SourceKeys.NODE_PROFILE,
          component: SOURCES[SourceKeys.NODE_PROFILE],
        })
      }
    >
      <div className="border bg-white p-2 rounded cursor-pointer hover:shadow-lg">
        <p className="text-sm">{node?.name}</p>
        <p className="text-xs">
          <span>{node?.birth && <>B: {node?.birth}</>}</span>
          <span>{node?.death && <> | D: {node?.death}</>}</span>
        </p>
      </div>
    </div>
  );
};

export default FamilyNode;
