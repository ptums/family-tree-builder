import { SOURCES, useDialog } from "@/contexts/DialogContext";
import { DialogTitle } from "@headlessui/react";
import { SourceKeys } from "@/types/DialogContext";
import CloseDialog from "../CloseDialog";
import LoadingIcon from "@/components/LoadingIcon";
import dynamic from "next/dynamic";

const UploaderForm = dynamic(() => import("./form"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});
const DocumentUploader = () => {
  const { selectedNode, setSelectedSource, openDialog } = useDialog();

  return (
    <>
      <DialogTitle className="font-bold">
        Add documents to{" "}
        <span className="underline">{selectedNode?.name} </span>Profile
      </DialogTitle>

      <UploaderForm />
      <div className="border-t p-4 mt-8 flex sm:flex-row justify-between">
        <CloseDialog />
        {selectedNode && (
          <button
            className="bg-green-600 rounded-full text-white py-1 px-4 cursor-pointer hover:bg-green-500"
            onClick={() =>
              openDialog(selectedNode, {
                key: SourceKeys.EDIT_NODE,
                component: SOURCES[SourceKeys.EDIT_NODE],
              })
            }
          >
            Edit {selectedNode?.name} details
          </button>
        )}
      </div>
    </>
  );
};

export default DocumentUploader;
