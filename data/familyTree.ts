import { FamilyNode } from "@/types/FamilyNode";
import data from "./family-tree.json";
import { findSiblings } from "@/utils/familyUtils";

export const familyData = data.map((node) => {
  const parents = [node.fatherId, node.motherId]
    .filter((id): id is string => Boolean(id))
    .map((id) => ({ id, type: "blood" as const }));

  // Build children array
  const children = node?.children?.map((id) => ({
    id,
    type: "blood" as const,
  }));

  // Build spouses array
  const spouses =
    node?.spouses?.map((id) => ({ id, type: "married" as const })) || [];

  // Siblings can be derived later; for now, leave empty
  const siblings = findSiblings(
    data,
    node as unknown as FamilyNode,
    "fatherId",
    "motherId"
  );

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
    occupation: node?.occupation,
    profileImg: node?.profileImg,
  };
});

export const normalizeDBFamilyData = (data: any) => {
  return data.map((node: any) => {
    const parents = [node.fatherid, node.motherid]
      .filter((id): id is string => Boolean(id))
      .map((id) => ({ id, type: "blood" as const }));

    // Build children array
    const children = node?.children?.map((id: string) => ({
      id,
      type: "blood" as const,
    }));

    // Build spouses array
    const spouses =
      node?.spouses?.map((id: string) => ({ id, type: "married" as const })) ||
      [];

    // Siblings can be derived later; for now, leave empty
    const siblings = findSiblings(
      data,
      node as unknown as FamilyNode,
      "fatherid",
      "motherid"
    );

    return {
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
    };
  });
};
