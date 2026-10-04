import AncestryDataImporter from "@/components/AncestryDataImporter";

export default function ImportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Tree Data Import</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Paste data from Ancestry.com profiles to automatically extract family information and
            import it into your family tree database. The AI will parse the text and create
            structured family nodes with relationships.
          </p>
        </div>

        <AncestryDataImporter />

        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use This Tool</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>
                Copy profile information from Ancestry.com (name, birth/death dates, locations,
                relationships, etc.)
              </li>
              <li>Paste the data into the text area above</li>
              <li>Click "Preview Data" to see how the AI will parse the information</li>
              <li>Click "Import to Database" to add the data to your family tree</li>
              <li>The system will automatically create family nodes and relationships</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
