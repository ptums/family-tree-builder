-- Synthetic family for tests. NEVER put real family data here: the repo is public.
-- Charles uses the root id hard-coded in components/FamilyTree.tsx (ROOT_NODE_ID)
-- until multi-tree support replaces it.
--
--   Arthur Example ═ Beatrice Example
--          ┌──────────┴──────────┐
--   Charles Example ═ Diana Sample   Eleanor Example
--          │
--   Frank Example

INSERT INTO family_node (id, name, gender, birth, birthLocation, death, deathLocation, fatherId, motherId, occupation, profileImg, facts) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Arthur Example',   'male',   '01/02/1900', 'Springfield, Testshire', '03/04/1970', 'Springfield, Testshire', NULL, NULL, 'Blacksmith', NULL, NULL),
  ('00000000-0000-4000-8000-000000000002', 'Beatrice Example', 'female', '05/06/1902', 'Shelbyville, Testshire', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('f5c153e7-2916-404e-8233-3f222e7e7864', 'Charles Example',  'male',   '07/08/1930', 'Springfield, Testshire', NULL, NULL, '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Teacher', NULL, NULL),
  ('00000000-0000-4000-8000-000000000004', 'Diana Sample',     'female', '1932', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('00000000-0000-4000-8000-000000000005', 'Eleanor Example',  'female', '09/10/1934', NULL, NULL, NULL, '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', NULL, NULL, NULL),
  ('00000000-0000-4000-8000-000000000006', 'Frank Example',    'male',   '1960', NULL, NULL, NULL, 'f5c153e7-2916-404e-8233-3f222e7e7864', '00000000-0000-4000-8000-000000000004', NULL, NULL, NULL);

INSERT INTO spouse (node_id, spouse_id) VALUES
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002'),
  ('f5c153e7-2916-404e-8233-3f222e7e7864', '00000000-0000-4000-8000-000000000004');

INSERT INTO child (parent_id, child_id) VALUES
  ('00000000-0000-4000-8000-000000000001', 'f5c153e7-2916-404e-8233-3f222e7e7864'),
  ('00000000-0000-4000-8000-000000000002', 'f5c153e7-2916-404e-8233-3f222e7e7864'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000005'),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005'),
  ('f5c153e7-2916-404e-8233-3f222e7e7864', '00000000-0000-4000-8000-000000000006'),
  ('00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000006');
