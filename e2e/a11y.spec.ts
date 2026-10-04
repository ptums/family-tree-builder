import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Violations that existed when e2e was added. This list only shrinks: fix the
// page, never add an id here to make a PR pass. Burn-down is on the project board.
const KNOWN_VIOLATIONS: string[] = [];

async function scan(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();
  return results.violations.map((v) => v.id).filter((id) => !KNOWN_VIOLATIONS.includes(id));
}

test("the tree page has no new axe violations", async ({ page }) => {
  await page.goto("/barnwell-family-tree");
  await expect(page.getByText("Charles Example", { exact: true })).toBeVisible();
  expect(await scan(page)).toEqual([]);
});

test("an open profile has no new axe violations", async ({ page }) => {
  await page.goto("/barnwell-family-tree");
  await page.getByText("Charles Example", { exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await scan(page)).toEqual([]);
});
