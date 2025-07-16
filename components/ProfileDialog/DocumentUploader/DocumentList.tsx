import { UploadedDocument } from "@/types/DocumentUploader";

const DocumentList = ({
  uploadedDocs,
  handleCopyUrl,
  handleDelete,
  copiedDocId,
}: {
  uploadedDocs: UploadedDocument[] | [];
  handleCopyUrl?: (url: string, id: string) => void;
  handleDelete?: (id: string) => void;
  copiedDocId: string;
}) => (
  <ul className="mt-2">
    {uploadedDocs?.length === 0 && (
      <li className="text-gray-500">No documents uploaded yet.</li>
    )}
    {uploadedDocs?.map((doc) => (
      <li key={doc.id} className="flex items-center justify-between">
        <span
          className="truncate max-w-5xl"
          style={{
            textOverflow: "unset",
          }}
          title={doc.name}
        >
          {doc.name}
          {handleCopyUrl && (
            <>
              {" - "}
              <button
                type="button"
                className="text-blue-600 underline ml-1 mr-2"
                onClick={() => handleCopyUrl(doc.url, doc.id)}
                title="Copy link to clipboard"
              >
                {doc.url}
              </button>
            </>
          )}
          {copiedDocId === doc.id && (
            <span className="text-green-600 text-xs ml-1">Copied!</span>
          )}
        </span>
        {handleDelete && (
          <button
            type="button"
            className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
            onClick={() => handleDelete(doc.id)}
            aria-label={`Delete ${doc.name}`}
          >
            &#x2715;
          </button>
        )}
      </li>
    ))}
  </ul>
);

export default DocumentList;
