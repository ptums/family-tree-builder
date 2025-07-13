"use client";

import LoadingIcon from "@/components/LoadingIcon";
import {
  DialogContextType,
  SourceKeys,
  DialogProviderProps,
  SourceType,
} from "@/types/DialogContext";
import { FamilyNode } from "@/types/FamilyNode";
import dynamic from "next/dynamic";
import React, { createContext, useContext, useState } from "react";

const EditNode = dynamic(() => import("@/components/ProfileDialog/EditNode"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const NodeProfile = dynamic(
  () => import("@/components/ProfileDialog/NodeProfile"),
  {
    loading: () => <LoadingIcon />,
    ssr: false,
  }
);

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const SOURCES = {
  [SourceKeys.NODE_PROFILE]: NodeProfile,
  [SourceKeys.EDIT_NODE]: EditNode,
};

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<FamilyNode | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceType>({
    key: SourceKeys.NODE_PROFILE,
    component: SOURCES[SourceKeys.NODE_PROFILE],
  });

  const openDialog = (node: FamilyNode | null = null, source: SourceType) => {
    if (node) {
      setSelectedNode(node);
    }

    setSelectedSource(source);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedNode(null);
  };
  console.log(selectedNode);

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        selectedNode,
        setSelectedNode,
        openDialog,
        closeDialog,
        selectedSource,
        setSelectedSource,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
