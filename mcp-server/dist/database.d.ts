import "dotenv/config";
import { FamilyNode, CreateFamilyNodeRequest, UpdateFamilyNodeRequest } from "./types";
export declare class FamilyTreeDatabase {
    getAllNodes(): Promise<FamilyNode[]>;
    createNode(data: CreateFamilyNodeRequest): Promise<{
        id: string;
        message: string;
    }>;
    updateNode(data: UpdateFamilyNodeRequest): Promise<{
        message: string;
    }>;
    getNodeById(id: string): Promise<FamilyNode | null>;
    searchNodes(query: string): Promise<FamilyNode[]>;
}
//# sourceMappingURL=database.d.ts.map