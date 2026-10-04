import { DELETE, GET, POST } from "./route";
import { setupTestDatabase } from "@/test/pglite";

setupTestDatabase({ seed: true });

const CHARLES = "f5c153e7-2916-404e-8233-3f222e7e7864";
const URL_BASE = "http://test/api/documents";

const get = (query = "") => GET(new Request(`${URL_BASE}${query}`));
const del = (query = "") => DELETE(new Request(`${URL_BASE}${query}`, { method: "DELETE" }));
const post = (body: unknown) =>
  POST(new Request(URL_BASE, { method: "POST", body: JSON.stringify(body) }));

const doc = { name: "Birth certificate.pdf", url: "https://example.test/b.pdf", userId: CHARLES };

describe("/api/documents", () => {
  it("rejects requests without an id", async () => {
    expect((await get()).status).toBe(400);
    expect((await del()).status).toBe(400);
  });

  it("rejects a document with missing fields", async () => {
    const res = await post({ name: "No url" });
    expect(res.status).toBe(400);
  });

  it("answers 404 when a person has no documents", async () => {
    expect((await get(`?id=${CHARLES}`)).status).toBe(404);
  });

  it("creates, lists and deletes a person's document", async () => {
    const created = await (await post(doc)).json();
    expect(created).toMatchObject({ name: doc.name, url: doc.url, userid: CHARLES });

    const listed = await (await get(`?id=${CHARLES}`)).json();
    expect(listed).toEqual([created]);

    const deleted = await del(`?id=${created.id}`);
    expect(await deleted.json()).toMatchObject({ message: "Document deleted" });
    expect((await get(`?id=${CHARLES}`)).status).toBe(404);
  });

  it("answers 404 when deleting a document that does not exist", async () => {
    expect((await del("?id=00000000-0000-4000-8000-0000000000ff")).status).toBe(404);
  });
});
