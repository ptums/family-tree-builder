import OpenAI from "openai";
import { FamilyNode, CreateFamilyNodeRequest } from "./types";

export class AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    this.openai = new OpenAI({ apiKey });
  }

  async suggestFamilyNodeCreation(
    description: string,
    existingNodes: FamilyNode[]
  ): Promise<CreateFamilyNodeRequest> {
    const existingNames = existingNodes.map((node) => node.name).join(", ");

    const prompt = `You are helping to create a new family member node in a family tree. 
    
    User description: "${description}"
    
    Existing family members: ${existingNames}
    
    Based on the description, create a structured family node. If the description mentions relationships to existing members, try to identify them by name.
    
    Return a JSON object with the following structure:
    {
      "name": "Full name",
      "birth": "YYYY-MM-DD or null",
      "birthLocation": "Location or null", 
      "death": "YYYY-MM-DD or null",
      "deathLocation": "Location or null",
      "fatherId": "ID of father if mentioned or null",
      "motherId": "ID of mother if mentioned or null", 
      "occupation": "Occupation or null",
      "gender": "male" or "female" or null,
      "spouses": ["array of spouse IDs if mentioned"],
      "children": ["array of child IDs if mentioned"]
    }
    
    Only include fields that can be reasonably inferred from the description. Use null for unknown values.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for managing family tree data. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    try {
      return JSON.parse(content) as CreateFamilyNodeRequest;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }

  async suggestRelationships(
    nodeName: string,
    existingNodes: FamilyNode[]
  ): Promise<{
    suggestedParents: string[];
    suggestedSpouses: string[];
    suggestedChildren: string[];
  }> {
    const existingNames = existingNodes.map((node) => node.name).join(", ");

    const prompt = `Given a family member named "${nodeName}" and the existing family members: ${existingNames}
    
    Suggest potential relationships by returning a JSON object with:
    - suggestedParents: Array of names that could be parents
    - suggestedSpouses: Array of names that could be spouses  
    - suggestedChildren: Array of names that could be children
    
    Base suggestions on common family patterns, ages, and any contextual clues.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for suggesting family relationships. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }

  async validateFamilyNode(
    node: CreateFamilyNodeRequest
  ): Promise<{ isValid: boolean; suggestions: string[] }> {
    const prompt = `Validate this family node data and provide suggestions for improvement:
    
    ${JSON.stringify(node, null, 2)}
    
    Check for:
    - Missing required fields
    - Inconsistent dates (birth after death)
    - Logical relationship issues
    - Data quality issues
    
    Return JSON: {"isValid": boolean, "suggestions": ["array of improvement suggestions"]}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a data validation expert for family tree information. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }
}
