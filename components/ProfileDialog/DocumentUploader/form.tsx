import React, { useState } from "react";
import { useDialog } from "@/contexts/DialogContext";
import { UploadedDocument } from "@/types/DocumentUploader";
import DocumentList from "./DocumentList";
import { UploadDropzone } from "@/utils/uploadthing";

const DocumentUploaderForm: React.FC = () => {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [docName, setDocName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const { selectedNode } = useDialog();
  const userId = selectedNode?.id;

  const handleDelete = (id: string) => {
    setUploadedDocs((docs) => docs?.filter((doc) => doc.id !== id));
  };

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedDocId(id);
      setTimeout(() => setCopiedDocId(null), 1500);
    } catch (err) {
      // Optionally handle error
    }
  };

  // Handler for UploadThing upload completion
  const handleUploadComplete = async (res: any) => {
    setUploading(false);
    setError(null);
    if (!docName.trim()) {
      setError("Please provide a name for the document before uploading.");
      return;
    }
    if (!res || !res[0]) {
      setError("No file uploaded.");
      return;
    }
    const file = res[0];
    const doc: UploadedDocument = {
      id: file.key || file.url, // fallback to url if no key
      name: docName,
      url: file.url,
    };
    setUploadedDocs((prev) => [...(prev || []), doc]);
    setDocName("");
    // Save to DB
    if (userId) {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: doc.name,
          url: doc.url,
          userId,
        }),
      });
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      {/* Uploaded Documents List */}
      <div>
        <DocumentList
          handleCopyUrl={handleCopyUrl}
          handleDelete={handleDelete}
          uploadedDocs={uploadedDocs ?? []}
          copiedDocId={copiedDocId as string}
        />
      </div>
      {/* Document Name Input */}
      <div>
        <label htmlFor="docName" className="block font-semibold mb-1">
          Document Name
        </label>
        <input
          id="docName"
          type="text"
          className="border rounded px-2 py-1 w-full h-10"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          placeholder="Enter document name before uploading"
        />
      </div>
      {/* UploadThing Dropzone */}
      <UploadDropzone
        endpoint="documentUploader"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(err) => {
          setUploading(false);
          setError(err.message || "Failed to upload document.");
        }}
        appearance={{
          container:
            "border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors h-40 flex flex-col justify-center",
          button:
            "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 mt-2",
        }}
        className=""
      />
      {/* Error Message */}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
};

export default DocumentUploaderForm;
