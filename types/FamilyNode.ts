// export type Gender = "male" | "female";
import { Node, Gender } from "relatives-tree/lib/types";

export type FamilyNode = Node & NodeAdditionalDetails;

export type NodeAdditionalDetails = {
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
};
