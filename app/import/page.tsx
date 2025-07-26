import AncestryDataImporter from "@/components/AncestryDataImporter";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function ImportPage() {
  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Family Tree Data Import
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Paste data from Ancestry.com profiles to automatically extract
                family information and import it into your family tree database.
                The AI will parse the text and create structured family nodes
                with relationships.
              </p>
            </div>

            <AncestryDataImporter />

            <div className="mt-8 max-w-4xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  How to Use This Tool
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li>
                    Copy profile information from Ancestry.com (name,
                    birth/death dates, locations, relationships, etc.)
                  </li>
                  <li>Paste the data into the text area above</li>
                  <li>
                    Click "Preview Data" to see how the AI will parse the
                    information
                  </li>
                  <li>
                    Click "Import to Database" to add the data to your family
                    tree
                  </li>
                  <li>
                    The system will automatically create family nodes and
                    relationships
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be signed in to access the family tree data import
              tool.
            </p>
            <a
              href="/sign-in"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
