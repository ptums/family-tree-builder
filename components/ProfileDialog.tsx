import React, { memo, useMemo } from "react";
import { useDialog } from "@/contexts/DialogContext";
import { familyData } from "@/data/familyTree";
import { FamilyNode } from "@/types/FamilyNode";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

const ProfileList = memo(({ title, list, setSelectedNode }: any) => {
  const memoizedList = useMemo(() => {
    return list.map((node: any) => {
      const currentNode = familyData.find((data) => data?.id === node?.id);
      return currentNode;
    });
  }, [list]);

  return (
    <>
      <p className="font-bold">{title}: </p>
      <ul className="list-disc list-inside">
        {memoizedList.map((item: any) => (
          <li
            key={item?.id}
            className="underline cursor-pointer hover:text-blue-600"
            onClick={() => setSelectedNode(item as unknown as FamilyNode)}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </>
  );
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
        <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
          <DialogTitle className="font-bold">{selectedNode?.name}</DialogTitle>
          <div>
            <p className="font-bold">Born: </p>
            <span>
              {selectedNode?.birth} - {selectedNode?.birthLocation}
            </span>
            <p className="font-bold mt-4">Death:</p>
            <span>
              {selectedNode?.death} - {selectedNode?.deathLocation}
            </span>
            <p className="font-bold mt-4">Occupation:</p>
            <span>TBD</span>
          </div>

          <p>Todo: profile image, occupation</p>
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
