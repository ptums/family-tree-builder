import { FamilyNode } from "@/types/FamilyNode";

export interface Sibling {
  id: string;
  type: "father" | "mother";
}

/**
 * Finds all siblings of a given node by matching fatherId and motherId
 * @param currentNode - The node to find siblings for
 * @returns Array of siblings in the specified format
 */
export const findSiblings = (
  data: any,
  currentNode: FamilyNode,
  fatherKey: string,
  motherKey: string
): Sibling[] => {
  const siblings: Sibling[] = [];

  // Find nodes with the same fatherId and motherId (excluding the current node)
  const siblingNodes = data.filter(
    (node: FamilyNode) =>
      node.id !== currentNode.id &&
      node[fatherKey as keyof FamilyNode] ===
        currentNode[fatherKey as keyof FamilyNode] &&
      node[motherKey as keyof FamilyNode] ===
        currentNode[motherKey as keyof FamilyNode] &&
      node[fatherKey as keyof FamilyNode] !== null &&
      node[motherKey as keyof FamilyNode] !== null
  );

  // Convert to the required format
  siblingNodes.forEach((node: any) => {
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

export const mapParents = (node: any) =>
  [node.fatherid, node.motherid]
    .filter((id): id is string => Boolean(id))
    .map((id) => ({ id, type: "blood" as const }));

// Build children array
export const mapChildren = (node: any) =>
  node?.children?.map((id: string) => ({
    id,
    type: "blood" as const,
  }));

// Build spouses array
export const mapSpouses = (node: any) =>
  node?.spouses?.map((id: string) => ({ id, type: "married" as const })) || [];

export const mapFamilyTreeNodeKeys = (
  node: any,
  siblings: any,
  spouses: any,
  children: any,
  parents: any
) => ({
  id: node.id,
  gender: node.gender,
  parents,
  children,
  spouses,
  siblings,
  name: node.name,
  birth: node?.birth,
  birthLocation: node?.birthlocation,
  death: node?.death,
  deathLocation: node?.deathlocation,
  occupation: node?.occupation,
  profileImg: node?.profileimg,
  fatherId: node?.fatherid,
  motherId: node?.motherid,
});
