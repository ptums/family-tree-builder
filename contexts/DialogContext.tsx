"use client";

import LoadingIcon from "@/components/LoadingIcon";
import { FamilyNode } from "@/types/FamilyNode";
import dynamic from "next/dynamic";
import React, { createContext, useContext, useState, ReactNode } from "react";

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

export enum SourceKeys {
  NODE_PROFILE = "node-profile",
  EDIT_NODE = "edit-node",
}

interface SourceType {
  key: SourceKeys;
  component: React.ComponentType<any>;
}

interface DialogProviderProps {
  children: ReactNode;
}

interface DialogContextType {
  isOpen: boolean;
  selectedNode: FamilyNode | null;
  openDialog: (node: FamilyNode | null, source: SourceType) => void;
  closeDialog: () => void;
  setSelectedNode: (node: FamilyNode) => void;
  selectedSource: SourceType;
  setSelectedSource: (node: SourceType) => void;
}

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
