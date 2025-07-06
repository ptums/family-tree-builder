"use client";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import DialogContent from "./DialogContent";
const FamilyNode = ({ node, style }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="absolute flex p-4 items-center justify-center"
        style={style}
        onClick={() => setIsOpen(true)}
      >
        <div className="border bg-white p-2 rounded cursor-pointer hover:shadow-lg">
          <p className="text-sm">{node?.name}</p>
          <p className="text-xs">
            B: {node?.birth} | D: {node?.death}
          </p>
        </div>
      </div>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
            <DialogTitle className="font-bold">{node.name}</DialogTitle>
            <Description>
              <p>
                Born: {node?.birth} - {node?.birthLocation}
              </p>
              <p>
                Death: {node?.death} - {node?.deathLocation}
              </p>
            </Description>
            <DialogContent />
            <div className="flex gap-4">
              <button
                className="bg-purple-500 rounded-full text-white py-1 px-4 cursor-pointer hover:bg-purple-600"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default FamilyNode;
