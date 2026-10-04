// Lint debt that existed before linting was added (2026-10-03).
// Each legacy file has ONLY the rules it already broke turned off; new files get every rule.
// Rules: this list only shrinks. Never add a file or rule to make a PR pass;
// fix the code. Burn-down is tracked on the project board.
export const baseline = {
  "app/api/family/route.ts": ["@typescript-eslint/no-unused-vars"],
  "app/api/llm/route.ts": ["@typescript-eslint/no-unused-vars"],
  "app/api/uploadthing/core.ts": ["@typescript-eslint/no-unused-vars"],
  "app/import/page.tsx": ["react/no-unescaped-entities"],
  "components/AncestryDataImporter.tsx": [
    "@typescript-eslint/no-explicit-any",
    "jsx-a11y/control-has-associated-label",
  ],
  "components/FamilyNode.tsx": [
    "jsx-a11y/click-events-have-key-events",
    "jsx-a11y/no-static-element-interactions",
  ],
  "components/FamilyTree.tsx": ["react-hooks/exhaustive-deps"],
  "components/LoadingIcon.tsx": ["react/display-name"],
  "components/ProfileDialog/DocumentUploader/form.tsx": [
    "@typescript-eslint/no-explicit-any",
    "@typescript-eslint/no-unused-vars",
    "jsx-a11y/control-has-associated-label",
  ],
  "components/ProfileDialog/DocumentUploader/index.tsx": ["@typescript-eslint/no-unused-vars"],
  "components/ProfileDialog/EditNode/form.tsx": [
    "@typescript-eslint/no-explicit-any",
    "@typescript-eslint/no-unused-vars",
    "jsx-a11y/control-has-associated-label",
    "react-hooks/incompatible-library",
  ],
  "components/ProfileDialog/NodeProfile/ProfileList.tsx": [
    "@typescript-eslint/no-explicit-any",
    "jsx-a11y/click-events-have-key-events",
    "jsx-a11y/no-noninteractive-element-interactions",
    "react/display-name",
  ],
  "components/ProfileDialog/NodeProfile/index.tsx": [
    "@typescript-eslint/no-explicit-any",
    "@typescript-eslint/no-unused-vars",
  ],
  "contexts/DialogContext.tsx": ["@typescript-eslint/no-explicit-any"],
  "types/DialogContext.ts": ["@typescript-eslint/no-explicit-any"],
  "types/ParentSelect.ts": ["@typescript-eslint/no-unused-expressions"],
  "utils/familyUtils.ts": ["@typescript-eslint/no-explicit-any"],
};
