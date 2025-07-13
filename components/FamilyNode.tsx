"use client";
import { SourceKeys } from "@/types/DialogContext";

import { SOURCES, useDialog } from "@/contexts/DialogContext";
import type { FamilyNode as FamilyNodeType } from "@/types/FamilyNode";

const FamilyNode = ({
  node,
  style,
}: {
  node: FamilyNodeType;
  style?: React.CSSProperties;
}) => {
  const { openDialog } = useDialog();
  return (
    <div
      id={node?.id}
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
