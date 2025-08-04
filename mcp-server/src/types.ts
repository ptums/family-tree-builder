import { Gender } from "relatives-tree/lib/types";

export interface FamilyNode {
  id: string;
  name: string;
  birth: string;
  birthLocation: string;
  death: string;
  deathLocation: string;
  fatherId: string | null;
  motherId: string | null;
  occupation?: string;
  profileImg?: string;
  gender?: Gender;
  parents?: FamilyNode[];
  siblings?: FamilyNode[];
  spouses?: Array<{ id: string; type: "married" }>;
  children?: Array<{ id: string; type: "blood" }>;
}

export interface CreateFamilyNodeRequest {
  name: string;
  birth?: string;
  birthLocation?: string;
  death?: string;
  deathLocation?: string;
  fatherId?: string | null;
  motherId?: string | null;
  occupation?: string;
  profileImg?: string;
  gender?: Gender;
  spouses?: string[];
  children?: string[];
}

export interface UpdateFamilyNodeRequest {
  id: string;
  name?: string;
  birth?: string;
  birthLocation?: string;
  death?: string;
  deathLocation?: string;
  fatherId?: string | null;
  motherId?: string | null;
  occupation?: string;
  profileImg?: string;
  gender?: Gender;
}

export interface FamilyRelationship {
  id: string;
  name: string;
  relationship: string;
  birth?: string;
  death?: string;
}
