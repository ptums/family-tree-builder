"use client";

import { useState } from "react";
import { cleanAncestryData } from "@/utils/familyUtils";

interface AncestryDataImporterProps {
  onImportComplete?: () => void;
}

export default function AncestryDataImporter({
  onImportComplete,
}: AncestryDataImporterProps) {
  const [ancestryData, setAncestryData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!ancestryData.trim()) {
      setError("Please paste some Ancestry.com data first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const cleanedData = cleanAncestryData(ancestryData);

      const response = await fetch("/api/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanedData,
          insertToDatabase: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process data");
      }

      setResult(data);
      setAncestryData(""); // Clear the input after successful import

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = async () => {
    if (!ancestryData.trim()) {
      setError("Please paste some Ancestry.com data first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const cleanedData = cleanAncestryData(ancestryData);

      const response = await fetch("/api/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanedData,
          insertToDatabase: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process data");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Import Ancestry.com Data
      </h2>

      <div className="mb-4">
        <label
          htmlFor="ancestry-data"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Paste Ancestry.com Profile Data
        </label>
        <textarea
          id="ancestry-data"
          value={ancestryData}
          onChange={(e) => setAncestryData(e.target.value)}
          placeholder="Paste Ancestry.com profile information here...
Example:
John Smith
Born: 15 Mar 1850 in Boston, Suffolk, Massachusetts, USA
Died: 22 Jan 1920 in New York, New York, USA
Spouse: Mary Johnson (married 1875)
Occupation: Carpenter
Father: William Smith
Mother: Elizabeth Brown"
          className="w-full h-48 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isProcessing}
        />
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handlePreview}
          disabled={isProcessing || !ancestryData.trim()}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Preview Data"}
        </button>

        <button
          onClick={handleImport}
          disabled={isProcessing || !ancestryData.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Importing..." : "Import to Database"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            {result.message ? "Import Results" : "Preview Results"}
          </h3>

          {result.message && (
            <div className="mb-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {result.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Extracted People ({result.nodes?.length || 0})
              </h4>
              <div className="max-h-64 overflow-y-auto">
                {result.nodes?.map((node: any, index: number) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded mb-2 text-sm"
                  >
                    <div className="font-medium">{node.name}</div>
                    {node.birth && (
                      <div>
                        Born: {node.birth}{" "}
                        {node.birthLocation && `in ${node.birthLocation}`}
                      </div>
                    )}
                    {node.death && (
                      <div>
                        Died: {node.death}{" "}
                        {node.deathLocation && `in ${node.deathLocation}`}
                      </div>
                    )}
                    {node.occupation && (
                      <div>Occupation: {node.occupation}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Relationships ({result.relations?.length || 0})
              </h4>
              <div className="max-h-64 overflow-y-auto">
                {result.relations?.map((relation: any, index: number) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded mb-2 text-sm"
                  >
                    <div className="font-medium">
                      {relation.type} relationship
                    </div>
                    <div>Date: {relation.date || "Unknown"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
