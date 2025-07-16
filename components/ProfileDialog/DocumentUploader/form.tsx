import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useDialog } from "@/contexts/DialogContext";
import { UploadedDocument } from "@/types/DocumentUploader";
import DocumentList from "./DocumentList";

const DocumentUploaderForm: React.FC = () => {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const { selectedNode } = useDialog();
  const userId = selectedNode?.id;
  console.log({
    uploadedDocs,
  });
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/*": [".jpg", ".jpeg", ".png"],
    },
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }
    if (!docName.trim()) {
      setError("Please provide a name for the document.");
      return;
    }
    setUploading(true);
    try {
      // 1. Request signature from backend
      const sigRes = await fetch("/api/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: docName }),
      });
      const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

      // 2. Upload to Cloudinary with signature
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("public_id", docName);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Cloudinary upload failed");
      }
      const data = await response.json();
      console.log("data @", data);

      setUploadedDocs((prev = []) => [
        ...prev,
        {
          id: data?.public_id,
          name: docName,
          url: data?.secure_url,
        },
      ]);
      setSelectedFile(null);
      setDocName("");
      setUploading(false);

      // Upload document details to the documents table
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: docName,
          url: data?.secure_url,
          userId,
        }),
      });
    } catch (err: any) {
      setError(err.message || "Failed to upload document.");
      setUploading(false);
    }
  };

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

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4">
      {/* Uploaded Documents List */}
      <div>
        <DocumentList
          handleCopyUrl={handleCopyUrl}
          handleDelete={handleDelete}
          uploadedDocs={uploadedDocs ?? []}
          copiedDocId={copiedDocId as string}
        />
      </div>
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <p className="text-green-700">Selected: {selectedFile.name}</p>
        ) : isDragActive ? (
          <p>Drop the document here ...</p>
        ) : (
          <p className="text-gray-500">
            Drag & drop a document here, or click to select a file
          </p>
        )}
      </div>

      {/* Document Name Input */}
      <div>
        <label htmlFor="docName" className="block font-semibold mb-1">
          Document Name
        </label>
        <input
          id="docName"
          type="text"
          className="border rounded px-2 py-1 w-full"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          placeholder="Enter document name"
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-600">{error}</div>}

      {/* Upload Button */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>
    </form>
  );
};

export default DocumentUploaderForm;
