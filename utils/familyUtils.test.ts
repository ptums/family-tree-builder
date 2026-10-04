import {
  cleanAncestryData,
  findSiblings,
  formatDate,
  generateUUID,
  mapChildren,
  mapFamilyTreeNodeKeys,
  mapParents,
  mapSpouses,
} from "./familyUtils";
import type { FamilyNode } from "@/types/FamilyNode";

const DAD = "dad";
const MOM = "mom";

// Rows as they come back from Postgres (lowercase column names).
const rows = [
  { id: "a", gender: "male", fatherid: DAD, motherid: MOM },
  { id: "b", gender: "female", fatherid: DAD, motherid: MOM },
  { id: "c", gender: "male", fatherid: DAD, motherid: "other-mom" },
  { id: "d", gender: "male", fatherid: null, motherid: null },
  { id: "e", gender: "female", fatherid: null, motherid: null },
];

const asNode = (row: (typeof rows)[number]) => row as unknown as FamilyNode;

describe("findSiblings", () => {
  it("returns people with the same father and mother, excluding the person", () => {
    expect(findSiblings(rows, asNode(rows[0]), "fatherid", "motherid")).toEqual([
      { id: "b", type: "mother" },
    ]);
  });

  it("does not treat half-siblings as siblings", () => {
    expect(findSiblings(rows, asNode(rows[2]), "fatherid", "motherid")).toEqual([]);
  });

  it("does not match people whose parents are both unknown", () => {
    expect(findSiblings(rows, asNode(rows[3]), "fatherid", "motherid")).toEqual([]);
  });

  it("labels male siblings 'father' and others 'mother' (the format react-family-tree expects)", () => {
    expect(findSiblings(rows, asNode(rows[1]), "fatherid", "motherid")).toEqual([
      { id: "a", type: "father" },
    ]);
  });
});

describe("relationship mappers", () => {
  it("mapParents keeps only known parents as blood relations", () => {
    expect(mapParents({ fatherid: DAD, motherid: null })).toEqual([{ id: DAD, type: "blood" }]);
    expect(mapParents({ fatherid: null, motherid: null })).toEqual([]);
  });

  it("mapChildren maps ids to blood relations and tolerates a missing list", () => {
    expect(mapChildren({ children: ["x"] })).toEqual([{ id: "x", type: "blood" }]);
    expect(mapChildren({})).toBeUndefined();
  });

  it("mapSpouses maps ids to married relations and defaults to an empty list", () => {
    expect(mapSpouses({ spouses: ["s"] })).toEqual([{ id: "s", type: "married" }]);
    expect(mapSpouses(undefined)).toEqual([]);
  });

  it("mapFamilyTreeNodeKeys converts lowercase DB columns to camelCase", () => {
    const row = {
      id: "a",
      gender: "male",
      name: "Arthur Example",
      birth: "1900",
      birthlocation: "Springfield",
      death: null,
      deathlocation: null,
      occupation: "Smith",
      profileimg: null,
      fatherid: DAD,
      motherid: MOM,
    };
    expect(mapFamilyTreeNodeKeys(row, [], [], [], [])).toEqual({
      id: "a",
      gender: "male",
      parents: [],
      children: [],
      spouses: [],
      siblings: [],
      name: "Arthur Example",
      birth: "1900",
      birthLocation: "Springfield",
      death: null,
      deathLocation: null,
      occupation: "Smith",
      profileImg: null,
      fatherId: DAD,
      motherId: MOM,
    });
  });
});

describe("generateUUID", () => {
  it("produces RFC 4122 version 4 ids", () => {
    const id = generateUUID();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(generateUUID()).not.toBe(id);
  });
});

describe("cleanAncestryData", () => {
  it("collapses all whitespace and line endings to single spaces", () => {
    expect(cleanAncestryData("  John Smith\r\n\r\nBorn: 1850\r  Died: 1920  ")).toBe(
      "John Smith Born: 1850 Died: 1920",
    );
  });
});

describe("formatDate", () => {
  // Pin the timezone: these dates are calendar days and must not shift with the machine's TZ.
  const originalTZ = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = "America/New_York";
  });
  afterAll(() => {
    process.env.TZ = originalTZ;
  });

  it("returns null for empty input", () => {
    expect(formatDate(null)).toBeNull();
    expect(formatDate("")).toBeNull();
  });

  it("formats 'D Mon YYYY' as MM/DD/YYYY", () => {
    expect(formatDate("15 Mar 1850")).toBe("03/15/1850");
  });

  it("keeps MM/DD/YYYY as is", () => {
    expect(formatDate("06/30/1917")).toBe("06/30/1917");
  });

  it("formats ISO dates without shifting the day", () => {
    expect(formatDate("1930-07-08")).toBe("07/08/1930");
  });

  it("keeps a bare year as a year", () => {
    expect(formatDate("1932")).toBe("1932");
  });

  it("returns unparseable text unchanged", () => {
    expect(formatDate("about the spring")).toBe("about the spring");
  });
});
