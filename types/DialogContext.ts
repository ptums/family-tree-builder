import { ReactNode } from "react";
import { FamilyNode } from "./FamilyNode";

export enum SourceKeys {
  NODE_PROFILE = "node-profile",
  EDIT_NODE = "edit-node",
}

export interface SourceType {
  key: SourceKeys;
  component: React.ComponentType<any>;
}

export interface DialogProviderProps {
  children: ReactNode;
}

export interface DialogContextType {
  isOpen: boolean;
  selectedNode: FamilyNode | null;
  openDialog: (node: FamilyNode | null, source: SourceType) => void;
  closeDialog: () => void;
  setSelectedNode: (node: FamilyNode) => void;
  selectedSource: SourceType;
  setSelectedSource: (node: SourceType) => void;
}
