import { SourceKeys, SOURCES, useDialog } from "@/contexts/DialogContext";
import { DialogTitle } from "@headlessui/react";
import LoadingIcon from "@/components/LoadingIcon";
import dynamic from "next/dynamic";

const CreateNodeForm = dynamic(() => import("./CreateNodeForm"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const EditSelectedNodeForm = dynamic(() => import("./EditSelectedNodeForm"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const EditNode = () => {
  const { selectedNode, closeDialog, setSelectedSource } = useDialog();

  return (
    <>
      <DialogTitle className="font-bold">
        {selectedNode ? (
          <>
            Edit <span className="underline">{selectedNode?.name} </span>Profile
          </>
        ) : (
          <>Create New Member</>
        )}
      </DialogTitle>

      {selectedNode ? <EditSelectedNodeForm /> : <CreateNodeForm />}
      <div className="border-t p-4 mt-8 flex sm:flex-row justify-between">
        <button
          className="bg-red-600 rounded-full text-white py-1 px-4 cursor-pointer hover:bg-red-500"
          onClick={() => closeDialog()}
        >
          Close
        </button>
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
