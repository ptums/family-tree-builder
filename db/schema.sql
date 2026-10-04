-- Source of truth for the database schema. Mirrors scripts/seed.js.
-- Unquoted identifiers are folded to lowercase by Postgres, so `birthLocation`
-- comes back from queries as `birthlocation`.

CREATE TABLE IF NOT EXISTS family_node (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT,
  birth TEXT,
  birthLocation TEXT,
  death TEXT,
  deathLocation TEXT,
  fatherId UUID,
  motherId UUID,
  occupation TEXT,
  profileImg TEXT,
  facts TEXT
);

CREATE TABLE IF NOT EXISTS spouse (
  id SERIAL PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES family_node(id),
  spouse_id UUID NOT NULL REFERENCES family_node(id),
  UNIQUE(node_id, spouse_id)
);

CREATE TABLE IF NOT EXISTS child (
  id SERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES family_node(id),
  child_id UUID NOT NULL REFERENCES family_node(id),
  UNIQUE(parent_id, child_id)
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  userId UUID NOT NULL REFERENCES family_node(id)
);
