export type Gender = "male" | "female";

export type RelationshipType =
  | "blood"
  | "married"
  | "divorced"
  | "adopted"
  | "half";

export type FamilyNode = {
  id: string;
  name: string;
  gender: Gender;
  birth: string;
  birthLocation: string;
  death: string;
  deathLocation: string;
  fatherId: string | null;
  motherId: string | null;
  spouses: string[];
  children: string[];
  level: number;
  parents: Array<{
    id: string;
    type: RelationshipType;
  }>;
  siblings: Array<{
    id: string;
    type: RelationshipType;
  }>;
  placeholder?: boolean;
};
