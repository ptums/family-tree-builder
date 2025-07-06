"use client";

import { FamilyNode } from "@/types/FamilyNode";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface DialogContextType {
  isOpen: boolean;
  selectedNode: FamilyNode | null;
  openDialog: (node: FamilyNode) => void;
  closeDialog: () => void;
  setSelectedNode: (node: FamilyNode) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<FamilyNode | null>(null);

  const openDialog = (node: FamilyNode) => {
    setSelectedNode(node);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedNode(null);
  };

  return (
    <DialogContext.Provider
      value={{ isOpen, selectedNode, setSelectedNode, openDialog, closeDialog }}
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
