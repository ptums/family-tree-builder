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

// Utility function to generate UUIDs for LLM processing
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Function to validate and clean Ancestry.com data
export function cleanAncestryData(text: string): string {
  // Remove extra whitespace and normalize line breaks
  return text
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n\s*\n/g, "\n")
    .replace(/\s+/g, " ");
}

// Function to format dates from various formats to MM/DD/YYYY
export function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;

  // Handle various date formats
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // Try to parse common formats
    const patterns = [
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{4})/,
    ];

    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        if (match.length === 4) {
          // Full date
          const month = match[2] || match[2];
          const day = match[1] || match[3];
          const year = match[3] || match[1];

          const monthNames = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec",
          ];
          const monthIndex = monthNames.indexOf(month.toLowerCase());

          if (monthIndex !== -1) {
            return `${String(monthIndex + 1).padStart(2, "0")}/${String(
              day
            ).padStart(2, "0")}/${year}`;
          }
        } else if (match.length === 2) {
          // Year only
          return match[1];
        }
      }
    }

    return dateString; // Return original if can't parse
  }

  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate()
  ).padStart(2, "0")}/${date.getFullYear()}`;
}
