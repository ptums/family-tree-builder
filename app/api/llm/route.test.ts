import { POST } from "./route";
import { getSql } from "@/lib/db";
import { setupTestDatabase } from "@/test/pglite";

// CI must never call OpenAI. Each test sets what the "model" replies.
const create = jest.fn();
jest.mock("openai", () => ({
  __esModule: true,
  default: jest.fn(() => ({ chat: { completions: { create } } })),
}));

setupTestDatabase();

const reply = (content: string) =>
  create.mockResolvedValueOnce({ choices: [{ message: { content } }] });

const post = (body: unknown) =>
  POST(new Request("http://test/api/llm", { method: "POST", body: JSON.stringify(body) }));

const JOHN = "a1b2c3d4-e5f6-4a1b-8c9d-123456789abc";
const MARY = "b2c3d4e5-f6a7-4b2c-9d0e-234567890bcd";
const extracted = {
  nodes: [
    { id: JOHN, name: "John Smith", gender: "male", birth: "03/15/1850" },
    { id: MARY, name: "Mary Johnson", gender: "female" },
  ],
  relations: [{ id: "r1", type: "married", source: JOHN, target: MARY, date: "1875" }],
};

beforeEach(() => create.mockReset());

describe("POST /api/llm", () => {
  it("rejects an empty request without calling the model", async () => {
    const res = await post({ text: "" });
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("puts the pasted text into the prompt", async () => {
    reply(JSON.stringify(extracted));
    await post({ text: "John Smith, born 1850" });
    const prompt = create.mock.calls[0][0].messages[1].content;
    expect(prompt).toContain('"John Smith, born 1850"');
  });

  it("returns the parsed JSON, even when the model wraps it in a code fence", async () => {
    reply("```json\n" + JSON.stringify(extracted) + "\n```");
    const res = await post({ text: "John Smith" });
    expect(await res.json()).toEqual(extracted);
  });

  it("answers 500 with the raw reply when the model returns invalid JSON", async () => {
    reply("Sorry, I can't help with that.");
    const res = await post({ text: "John Smith" });
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ raw: "Sorry, I can't help with that." });
  });

  it("does not write to the database unless asked to", async () => {
    reply(JSON.stringify(extracted));
    await post({ text: "John Smith" });
    const sql = await getSql();
    expect(await sql`SELECT * FROM family_node`).toEqual([]);
  });

  it("inserts people and marriages when insertToDatabase is set", async () => {
    reply(JSON.stringify(extracted));
    const res = await post({ text: "John Smith", insertToDatabase: true });
    expect(res.status).toBe(200);

    const sql = await getSql();
    const people = await sql`SELECT id, name FROM family_node ORDER BY name`;
    expect(people).toEqual([
      { id: JOHN, name: "John Smith" },
      { id: MARY, name: "Mary Johnson" },
    ]);
    expect(await sql`SELECT node_id, spouse_id FROM spouse`).toEqual([
      { node_id: JOHN, spouse_id: MARY },
    ]);
  });

  it("reports a database failure instead of crashing (e.g. the model invents a parent id)", async () => {
    const orphan = { ...extracted.nodes[0], fatherId: "00000000-0000-4000-8000-0000000000ff" };
    reply(JSON.stringify({ nodes: [orphan], relations: [] }));
    const res = await post({ text: "John Smith", insertToDatabase: true });
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: "Failed to insert data into database" });
  });
});
