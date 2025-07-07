import React, { memo } from "react";
import { useDialog } from "@/contexts/DialogContext";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import dynamic from "next/dynamic";
import Image from "next/image";

const LoadingIcon = memo(() => (
  <div className="flex items-center justify-center p-4">
    <svg
      className="animate-spin h-6 w-6 text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
));

const ProfileList = dynamic(() => import("./ProfileList"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const ProfileFact = dynamic(() => import("./ProfileFact"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const ProfileDialog = () => {
  const { isOpen, selectedNode, setSelectedNode, closeDialog } = useDialog();
  const hasSiblings =
    selectedNode?.siblings && selectedNode.siblings.length > 0;

  const hasChildren =
    selectedNode?.children && selectedNode?.children.length > 0;

  const hasParents = selectedNode?.parents && selectedNode?.parents.length > 0;

  const hasSpouses = selectedNode?.spouses && selectedNode?.spouses.length > 0;

  return (
    <Dialog
      open={isOpen}
      onClose={() => closeDialog()}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-3xl space-y-4 border bg-white p-12">
          <DialogTitle className="font-bold">{selectedNode?.name}</DialogTitle>
          {selectedNode?.profileImg && (
            <Image
              src={selectedNode?.profileImg as string}
              alt={selectedNode?.name as string}
              width={200}
              height={200}
            />
          )}
          <div>
            {selectedNode?.birth && (
              <ProfileFact
                title="Born"
                fact={`${selectedNode?.birth} - ${selectedNode?.birthLocation}`}
              />
            )}

            {selectedNode?.death && (
              <ProfileFact
                title="Death"
                fact={`${selectedNode?.death} - ${selectedNode?.deathLocation}`}
              />
            )}

            {selectedNode?.occupation && (
              <ProfileFact title="Occupation" fact={selectedNode?.occupation} />
            )}
          </div>
          <div className="w-full flex sm:flex-row">
            {hasParents && (
              <ProfileList
                title="Parents"
                list={selectedNode?.parents}
                setSelectedNode={setSelectedNode}
              />
            )}
            {hasSiblings && (
              <ProfileList
                title="Siblings"
                list={selectedNode?.siblings}
                setSelectedNode={setSelectedNode}
              />
            )}
          </div>
          <div className="flex sm:flex-row">
            {hasSpouses && (
              <ProfileList
                title="Spouses"
                list={selectedNode?.spouses}
                setSelectedNode={setSelectedNode}
              />
            )}
            {hasChildren && (
              <ProfileList
                title="Children"
                list={selectedNode?.children}
                setSelectedNode={setSelectedNode}
              />
            )}
          </div>
          <div className="border-t p-4 mt-8">
            <button
              className="bg-purple-500 rounded-full text-white py-1 px-4 cursor-pointer hover:bg-purple-600"
              onClick={() => closeDialog()}
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ProfileDialog;
