// Database table types based on SQL schema

export interface FamilyNodeTable {
  id: string; // UUID
  name: string; // TEXT NOT NULL
  gender: string | null; // TEXT
  birth: string | null; // TEXT
  birthLocation: string | null; // TEXT
  death: string | null; // TEXT
  deathLocation: string | null; // TEXT
  fatherId: string | null; // UUID
  motherId: string | null; // UUID
  occupation: string | null; // TEXT
  profileImg: string | null; // TEXT
  facts: string | null; // TEXT
}

export interface SpouseTable {
  id: number; // SERIAL PRIMARY KEY
  node_id: string; // UUID NOT NULL REFERENCES family_node(id)
  spouse_id: string; // UUID NOT NULL REFERENCES family_node(id)
}

export interface ChildTable {
  id: number; // SERIAL PRIMARY KEY
  parent_id: string; // UUID NOT NULL REFERENCES family_node(id)
  child_id: string; // UUID NOT NULL REFERENCES family_node(id)
}

export interface DocumentsTable {
  id: string; // UUID PRIMARY KEY
  name: string; // TEXT NOT NULL
  url: string; // TEXT NOT NULL
  userId: string; // UUID NOT NULL REFERENCES family_node(id)
}

// Insert types (for creating new records)
export interface InsertFamilyNode {
  id: string;
  name: string;
  gender?: string;
  birth?: string;
  birthLocation?: string;
  death?: string;
  deathLocation?: string;
  fatherId?: string;
  motherId?: string;
  occupation?: string;
  profileImg?: string;
  facts?: string;
}

export interface InsertSpouse {
  node_id: string;
  spouse_id: string;
}

export interface InsertChild {
  parent_id: string;
  child_id: string;
}

export interface InsertDocument {
  id: string;
  name: string;
  url: string;
  userId: string;
}

// Update types (for updating existing records)
export interface UpdateFamilyNode {
  name?: string;
  gender?: string;
  birth?: string;
  birthLocation?: string;
  death?: string;
  deathLocation?: string;
  fatherId?: string;
  motherId?: string;
  occupation?: string;
  profileImg?: string;
  facts?: string;
}
