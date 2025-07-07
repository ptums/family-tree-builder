import { FamilyNode } from "@/types/FamilyNode";

const NodeForm = ({ selectedNode }: { selectedNode: FamilyNode | null }) => {
  if (selectedNode) {
    return <p>Edit Form...</p>;
  }

  return <p>Create Form</p>;
};

export default NodeForm;
