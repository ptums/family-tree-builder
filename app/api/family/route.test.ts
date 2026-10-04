import { GET, POST } from "./route";
import { getSql } from "@/lib/db";
import { setupTestDatabase } from "@/test/pglite";

setupTestDatabase({ seed: true });

// Ids from e2e/fixtures/seed.sql (a synthetic family).
const ARTHUR = "00000000-0000-4000-8000-000000000001";
const BEATRICE = "00000000-0000-4000-8000-000000000002";
const CHARLES = "f5c153e7-2916-404e-8233-3f222e7e7864";
const DIANA = "00000000-0000-4000-8000-000000000004";
const ELEANOR = "00000000-0000-4000-8000-000000000005";
const FRANK = "00000000-0000-4000-8000-000000000006";

type TreeNode = {
  id: string;
  name: string;
  parents: { id: string }[];
  children: { id: string }[];
  spouses: { id: string }[];
  siblings: { id: string }[];
  [key: string]: unknown;
};

async function getTree(): Promise<TreeNode[]> {
  const res = await GET();
  expect(res.status).toBe(200);
  return res.json();
}

const ids = (list: { id: string }[]) => list.map((r) => r.id).sort();

function post(body: unknown) {
  return POST(
    new Request("http://test/api/family", { method: "POST", body: JSON.stringify(body) }),
  );
}

describe("GET /api/family", () => {
  it("returns every person with relationships resolved", async () => {
    const tree = await getTree();
    expect(tree).toHaveLength(6);

    const charles = tree.find((n) => n.id === CHARLES)!;
    expect(charles).toMatchObject({
      name: "Charles Example",
      birth: "07/08/1930",
      birthLocation: "Springfield, Testshire",
      occupation: "Teacher",
      fatherId: ARTHUR,
      motherId: BEATRICE,
    });
    expect(ids(charles.parents)).toEqual([ARTHUR, BEATRICE].sort());
    expect(ids(charles.siblings)).toEqual([ELEANOR]);
    expect(ids(charles.children)).toEqual([FRANK]);
  });

  it("makes spouse links two-way even though they are stored once", async () => {
    const tree = await getTree();
    const spousesOf = (id: string) => ids(tree.find((n) => n.id === id)!.spouses);
    expect(spousesOf(CHARLES)).toEqual([DIANA]);
    expect(spousesOf(DIANA)).toEqual([CHARLES]);
  });

  it("gives people with no recorded relations empty lists, not undefined", async () => {
    const diana = (await getTree()).find((n) => n.id === DIANA)!;
    expect(diana.parents).toEqual([]);
    expect(diana.siblings).toEqual([]);
  });
});

describe("POST /api/family", () => {
  it("creates a person and links them to both parents", async () => {
    const res = await post({
      name: "Grace Example",
      gender: "female",
      birth: "1962",
      fatherId: CHARLES,
      motherId: DIANA,
    });
    const { id } = await res.json();
    expect(id).toEqual(expect.any(String));

    const tree = await getTree();
    expect(tree).toHaveLength(7);
    expect(ids(tree.find((n) => n.id === CHARLES)!.children)).toContain(id);
    expect(ids(tree.find((n) => n.id === FRANK)!.siblings)).toEqual([id]);
  });

  it("treats empty-string parent ids as unknown", async () => {
    const res = await post({ name: "Orphan Example", fatherId: "", motherId: "" });
    const { id } = await res.json();

    const sql = await getSql();
    expect(await sql`SELECT * FROM child WHERE child_id = ${id}`).toEqual([]);
    const [row] = await sql`SELECT fatherid, motherid FROM family_node WHERE id = ${id}`;
    expect(row).toEqual({ fatherid: null, motherid: null });
  });

  it("records a spouse when creating a person", async () => {
    const res = await post({ name: "Henry Sample", spouses: [{ id: ELEANOR }] });
    const { id } = await res.json();

    const tree = await getTree();
    expect(ids(tree.find((n) => n.id === ELEANOR)!.spouses)).toEqual([id]);
  });

  it("updates an existing person when an id is given", async () => {
    const res = await post({
      id: DIANA,
      name: "Diana Sample-Example",
      birth: "1932",
      occupation: "Nurse",
    });
    expect(await res.json()).toEqual({ message: "Node updated" });

    const diana = (await getTree()).find((n) => n.id === DIANA)!;
    expect(diana).toMatchObject({ name: "Diana Sample-Example", occupation: "Nurse" });
  });
});
