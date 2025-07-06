import { FamilyNode } from "@/types/FamilyNode";
import data from "./family-tree.json";
import { findSiblings } from "@/utils/familyUtils";

export const familyData = data.map((node) => {
  const parents = [node.fatherId, node.motherId]
    .filter((id): id is string => Boolean(id))
    .map((id) => ({ id, type: "blood" as const }));

  // Build children array
  const children = node.children.map((id) => ({ id, type: "blood" as const }));

  // Build spouses array
  const spouses = node.spouses.map((id) => ({ id, type: "married" as const }));

  // Siblings can be derived later; for now, leave empty
  const siblings = findSiblings(node as FamilyNode);

  return {
    id: node.id,
    gender: node.gender,
    parents,
    children,
    spouses,
    siblings,
    name: node.name,
    birth: node?.birth,
    birthLocation: node?.birthLocation,
    death: node?.death,
    deathLocation: node?.deathLocation,
  };
});
