import { expect, test } from "@playwright/test";

// @smoke tests are read-only and assume nothing about the data: the deploy
// workflow runs them against real deployments. The rest use e2e/fixtures/seed.sql.

test("@smoke the home page redirects to the tree and renders people", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/barnwell-family-tree$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[id] > div.border").first()).toBeVisible();
});

test("@smoke the family API answers with a list", async ({ request }) => {
  const res = await request.get("/api/family");
  expect(res.ok()).toBe(true);
  expect(Array.isArray(await res.json())).toBe(true);
});

test("shows every person in the fixture family", async ({ page }) => {
  await page.goto("/barnwell-family-tree");
  for (const name of [
    "Arthur Example",
    "Beatrice Example",
    "Charles Example",
    "Diana Sample",
    "Eleanor Example",
    "Frank Example",
  ]) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }
});

test("opens a profile with facts and relatives, then closes it", async ({ page }) => {
  await page.goto("/barnwell-family-tree");
  await page.getByText("Charles Example", { exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Charles Example" })).toBeVisible();
  await expect(dialog.getByText("07/08/1930 - Springfield, Testshire")).toBeVisible();
  await expect(dialog.getByText("Teacher")).toBeVisible();
  await expect(dialog.getByText("Arthur Example")).toBeVisible();
  await expect(dialog.getByText("Eleanor Example")).toBeVisible();
  await expect(dialog.getByText("Diana Sample")).toBeVisible();
  await expect(dialog.getByText("Frank Example")).toBeVisible();

  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});

test("Escape closes the profile", async ({ page }) => {
  await page.goto("/barnwell-family-tree");
  await page.getByText("Diana Sample", { exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
