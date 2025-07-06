import { FamilyNode } from "@/types/FamilyNode";
import data from "../data/family-tree.json";

export interface Sibling {
  id: string;
  type: "father" | "mother";
}

/**
 * Finds all siblings of a given node by matching fatherId and motherId
 * @param currentNode - The node to find siblings for
 * @returns Array of siblings in the specified format
 */
export const findSiblings = (currentNode: FamilyNode): Sibling[] => {
  const siblings: Sibling[] = [];

  // Find nodes with the same fatherId and motherId (excluding the current node)
  const siblingNodes = data.filter(
    (node) =>
      node.id !== currentNode.id &&
      node.fatherId === currentNode.fatherId &&
      node.motherId === currentNode.motherId &&
      node.fatherId !== null &&
      node.motherId !== null
  );

  // Convert to the required format
  siblingNodes.forEach((node) => {
    // Determine the type based on the node's gender
    const type: "father" | "mother" =
      node.gender === "male" ? "father" : "mother";

    siblings.push({
      id: node.id,
      type,
    });
  });

  return siblings;
};
