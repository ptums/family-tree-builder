import { SOURCES, useDialog } from "@/contexts/DialogContext";
import { DialogTitle } from "@headlessui/react";
import LoadingIcon from "@/components/LoadingIcon";
import dynamic from "next/dynamic";
import { SourceKeys } from "@/types/DialogContext";
import CloseDialog from "../CloseDialog";

const NodeForm = dynamic(() => import("./form"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const EditNode = () => {
  const { selectedNode, setSelectedSource, selectedSource } = useDialog();

  return (
    <>
      <DialogTitle className="font-bold">
        {selectedNode && !selectedSource?.key.includes("add-spouse") ? (
          <>
            Edit <span className="underline">{selectedNode?.name} </span>Profile
          </>
        ) : (
          <>Create New Member</>
        )}
      </DialogTitle>
      <NodeForm selectedNode={selectedNode} />
      <div className="border-t p-4 mt-8 flex sm:flex-row justify-between">
        <CloseDialog />
        {selectedNode && (
          <button
            className="bg-green-600 rounded-full text-white py-1 px-4 cursor-pointer hover:bg-green-500"
            onClick={() =>
              setSelectedSource({
                key: SourceKeys.NODE_PROFILE,
                component: SOURCES[SourceKeys.NODE_PROFILE],
              })
            }
          >
            View {selectedNode?.name} profile
          </button>
        )}
      </div>
    </>
  );
};

export default EditNode;
