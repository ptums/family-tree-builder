import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
// @ts-ignore
import { Cloudinary } from "cloudinary-core";

// TODO: Replace with your Cloudinary credentials
const CLOUD_NAME = "YOUR_CLOUD_NAME"; // <-- Set this
const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET"; // <-- Set this

interface UploadedDocument {
  id: string;
  name: string;
  url: string;
}

const mockDocuments: UploadedDocument[] = [
  // Example data, replace with real data fetching logic
  { id: "1", name: "Birth Certificate.pdf", url: "#" },
  { id: "2", name: "Marriage License.pdf", url: "#" },
];

const cl = new Cloudinary({ cloud_name: CLOUD_NAME, secure: true });

const DocumentUploaderForm: React.FC = () => {
  const [uploadedDocs, setUploadedDocs] =
    useState<UploadedDocument[]>(mockDocuments);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

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
      // Use cloudinary-core to generate the upload URL
      const uploadUrl = cl.url("auto/upload", {
        secure: true,
        resource_type: "auto",
      });
      // Note: cloudinary-core does not handle file uploads directly, but helps with URL generation
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("public_id", docName); // Use docName as the public_id

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Cloudinary upload failed");
      }
      const data = await response.json();
      setUploadedDocs((prev) => [
        ...prev,
        {
          id: data.public_id,
          name: docName,
          url: data.secure_url,
        },
      ]);
      setSelectedFile(null);
      setDocName("");
      setUploading(false);
    } catch (err: any) {
      setError(err.message || "Failed to upload document.");
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setUploadedDocs((docs) => docs.filter((doc) => doc.id !== id));
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
        <ul className="mt-2">
          {uploadedDocs.length === 0 && (
            <li className="text-gray-500">No documents uploaded yet.</li>
          )}
          {uploadedDocs.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between">
              <span className="truncate max-w-xs" title={doc.name}>
                {doc.name} -
                <button
                  type="button"
                  className="text-blue-600 underline ml-1 mr-2"
                  onClick={() => handleCopyUrl(doc.url, doc.id)}
                  title="Copy link to clipboard"
                >
                  {doc.url}
                </button>
                {copiedDocId === doc.id && (
                  <span className="text-green-600 text-xs ml-1">Copied!</span>
                )}
              </span>
              <button
                type="button"
                className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                onClick={() => handleDelete(doc.id)}
                aria-label={`Delete ${doc.name}`}
              >
                &#x2715;
              </button>
            </li>
          ))}
        </ul>
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
