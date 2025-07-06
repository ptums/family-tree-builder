export type Gender = "male" | "female";

export type FamilyNode = {
  id: string;
  gender: Gender;
  parents: Array<{
    id: string;
    type: "blood" | "married" | "divorced" | "adopted" | "half";
  }>;
  children: Array<{
    id: string;
    type: "blood" | "married" | "divorced" | "adopted" | "half";
  }>;
  siblings: Array<{
    id: string;
    type: "blood" | "married" | "divorced" | "adopted" | "half";
  }>;
  spouses: Array<{
    id: string;
    type: "blood" | "married" | "divorced" | "adopted" | "half";
  }>;
  placeholder?: boolean;
};
