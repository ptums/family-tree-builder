import React, { memo } from "react";
import { SOURCES, useDialog } from "@/contexts/DialogContext";
import { DialogTitle } from "@headlessui/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import classNames from "classnames";
import LoadingIcon from "../../LoadingIcon";
import { SourceKeys } from "@/types/DialogContext";

const ProfileList = dynamic(() => import("./ProfileList"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const ProfileFact = dynamic(() => import("./ProfileFact"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const NodeProfile = () => {
  const { selectedNode, setSelectedNode, closeDialog, openDialog } =
    useDialog();
  const hasSiblings =
    selectedNode?.siblings && selectedNode.siblings.length > 0;

  const hasChildren =
    selectedNode?.children && selectedNode?.children.length > 0;

  const hasParents = selectedNode?.parents && selectedNode?.parents.length > 0;

  const hasSpouses = selectedNode?.spouses && selectedNode?.spouses.length > 0;

  return (
    <>
      <DialogTitle className="font-bold">{selectedNode?.name}</DialogTitle>
      <div className="w-full flex sm:flex-row my-2">
        {selectedNode?.profileImg && (
          <Image
            src={selectedNode?.profileImg as string}
            alt={selectedNode?.name as string}
            width={200}
            height={200}
          />
        )}
        <div
          className={classNames({
            "sm:mx-4": selectedNode?.profileImg,
          })}
        >
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
      </div>
      <div className="w-full flex sm:flex-row my-2">
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
      <div className="flex sm:flex-row sm:mx-4 my-2">
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
      <div className="border-t p-4 mt-8 flex sm:flex-row justify-between">
        <button
          className="bg-red-600 rounded-full text-white py-1 px-4 cursor-pointer hover:bg-red-500"
          onClick={() => closeDialog()}
        >
          Close
        </button>
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
      </div>
    </>
  );
};

export default NodeProfile;
