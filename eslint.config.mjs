import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";
import { baseline } from "./eslint.baseline.mjs";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    ignores: [
      ".worktrees/**",
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "data/**",
      "next-env.d.ts",
    ],
  },
  // next/core-web-vitals already registers the jsx-a11y and react-hooks plugins.
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Every jsx-a11y rule the recommended set enables is an error, not a warning.
      // (Rules it turns off, like the deprecated label-has-for, stay off.)
      ...Object.fromEntries(
        Object.entries(jsxA11y.flatConfigs.recommended.rules)
          .filter(([, level]) => level !== "off")
          .map(([name]) => [name, "error"]),
      ),
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: ["**/*.js", "**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  ...Object.entries(baseline).map(([file, rules]) => ({
    files: [file],
    rules: Object.fromEntries(rules.map((rule) => [rule, "off"])),
  })),
  prettier,
];

export default config;
