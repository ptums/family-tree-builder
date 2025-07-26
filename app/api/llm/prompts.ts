// app/llm/prompts.ts
export function buildFamilyExtractorPrompt(userText: string) {
  return `
You are a family-tree data extractor designed to parse Ancestry.com profile information and convert it into structured JSON for database insertion.

Convert the following free-form text (typically copied from Ancestry.com profiles) into JSON matching this exact schema:

{
  "nodes": [
    {
      "id": "GENERATE_UUID_HERE",
      "name": "Full Name",
      "gender": "male|female|unknown",
      "birth": "MM/DD/YYYY or YYYY or YYYY-MM-DD",
      "birthLocation": "City, County, State, Country",
      "death": "MM/DD/YYYY or YYYY or YYYY-MM-DD", 
      "deathLocation": "City, County, State, Country",
      "fatherId": "EXISTING_UUID_OR_NULL",
      "motherId": "EXISTING_UUID_OR_NULL", 
      "occupation": "Occupation description",
      "profileImg": "Image URL or null",
      "facts": "Additional biographical information"
    }
  ],
  "relations": [
    {
      "id": "GENERATE_UUID_HERE",
      "type": "married|divorced|blood|adopted|half",
      "source": "UUID_OF_SOURCE_NODE",
      "target": "UUID_OF_TARGET_NODE",
      "date": "MM/DD/YYYY or YYYY"
    }
  ]
}

IMPORTANT RULES:
1. For each person, generate a new UUID using this format: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" where x is any hex digit and y is 8, 9, A, or B
2. Map Ancestry.com fields as follows:
   - "Name" → "name"
   - "Gender" → "gender" (convert to lowercase)
   - "Birth Date" or "Born" → "birth"
   - "Birth Place" → "birthLocation" 
   - "Death Date" or "Died" → "death"
   - "Death Place" → "deathLocation"
   - "Occupation" or "Profession" → "occupation"
   - "Photo" or "Image" → "profileImg"
   - "Notes" or "Biography" → "facts"
3. For parent relationships, use existing UUIDs if provided, otherwise use null
4. For dates, standardize to MM/DD/YYYY format when possible, or YYYY for year-only
5. For locations, use full format: "City, County, State, Country"
6. Handle missing data gracefully - use null for unknown values
7. Extract spouse relationships and create relation entries
8. If multiple people are mentioned, create separate nodes for each

EXAMPLE INPUT (Ancestry.com format):
"John Smith
Born: 15 Mar 1850 in Boston, Suffolk, Massachusetts, USA
Died: 22 Jan 1920 in New York, New York, USA
Spouse: Mary Johnson (married 1875)
Children: Sarah Smith, Robert Smith
Occupation: Carpenter
Father: William Smith
Mother: Elizabeth Brown"

EXAMPLE OUTPUT:
{
  "nodes": [
    {
      "id": "a1b2c3d4-e5f6-4a1b-8c9d-123456789abc",
      "name": "John Smith",
      "gender": "male",
      "birth": "03/15/1850",
      "birthLocation": "Boston, Suffolk, Massachusetts, USA",
      "death": "01/22/1920", 
      "deathLocation": "New York, New York, USA",
      "fatherId": null,
      "motherId": null,
      "occupation": "Carpenter",
      "profileImg": null,
      "facts": null
    },
    {
      "id": "b2c3d4e5-f6g7-4b2c-9d0e-234567890bcd",
      "name": "Mary Johnson",
      "gender": "female",
      "birth": null,
      "birthLocation": null,
      "death": null,
      "deathLocation": null,
      "fatherId": null,
      "motherId": null,
      "occupation": null,
      "profileImg": null,
      "facts": null
    }
  ],
  "relations": [
    {
      "id": "c3d4e5f6-g7h8-4c3d-0e1f-345678901cde",
      "type": "married",
      "source": "a1b2c3d4-e5f6-4a1b-8c9d-123456789abc",
      "target": "b2c3d4e5-f6g7-4b2c-9d0e-234567890bcd",
      "date": "1875"
    }
  ]
}

Now process this Ancestry.com data:
"${userText}"

Output only the JSON. Do not include any explanations or markdown formatting.
`.trim();
}
