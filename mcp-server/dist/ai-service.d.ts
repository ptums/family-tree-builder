import { FamilyNode, CreateFamilyNodeRequest } from "./types";
export declare class AIService {
    private openai;
    constructor();
    suggestFamilyNodeCreation(description: string, existingNodes: FamilyNode[]): Promise<CreateFamilyNodeRequest>;
    suggestRelationships(nodeName: string, existingNodes: FamilyNode[]): Promise<{
        suggestedParents: string[];
        suggestedSpouses: string[];
        suggestedChildren: string[];
    }>;
    validateFamilyNode(node: CreateFamilyNodeRequest): Promise<{
        isValid: boolean;
        suggestions: string[];
    }>;
}
//# sourceMappingURL=ai-service.d.ts.map