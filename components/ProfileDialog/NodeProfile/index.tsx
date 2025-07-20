import React, { memo } from "react";
import { SOURCES, useDialog } from "@/contexts/DialogContext";
import { DialogTitle } from "@headlessui/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import classNames from "classnames";
import LoadingIcon from "../../LoadingIcon";
import { SourceKeys } from "@/types/DialogContext";
import CloseDialog from "../CloseDialog";
import { useQuery } from "@tanstack/react-query";
import { Gender } from "relatives-tree/lib/types";

const ProfileList = dynamic(() => import("./ProfileList"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const ProfileFact = dynamic(() => import("./ProfileFact"), {
  loading: () => <LoadingIcon />,
  ssr: false,
});

const NodeProfile = () => {
  const { selectedNode, setSelectedNode, openDialog } = useDialog();
  const hasSiblings =
    selectedNode?.siblings && selectedNode.siblings.length > 0;

  const hasChildren =
    selectedNode?.children && selectedNode?.children.length > 0;

  const hasParents = selectedNode?.parents && selectedNode?.parents.length > 0;

  const hasSpouses = selectedNode?.spouses && selectedNode?.spouses.length > 0;

  // Fetch documents for this user
  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", selectedNode?.id],
    enabled: !!selectedNode?.id,
    queryFn: async () => {
      if (!selectedNode?.id) return [];
      const res = await fetch(`/api/documents?id=${selectedNode.id}`);
      if (res.status === 404) return [];
      if (!res.ok) throw new Error("Failed to fetch documents");
      const doc = await res.json();

      // If the API returns a single object, wrap in array for consistency
      return Array.isArray(doc) ? doc : [doc];
    },
  });

  // Format documents for ProfileList
  const documentList = (documents || []).map((doc) => ({
    id: doc.id,
    name: doc.name,
    url: doc.url,
  }));

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
              fact={`${selectedNode?.birth} - ${
                selectedNode?.birthLocation || ""
              }`}
            />
          )}

          {selectedNode?.death && (
            <ProfileFact
              title="Death"
              fact={`${selectedNode?.death} - ${
                selectedNode?.deathLocation || ""
              }`}
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
      <div className="flex sm:flex-row mx-4 sm:mx-0 my-2">
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
      {documentList?.length > 0 && (
        <div className="flex sm:flex-row mx-4 sm:mx-0 my-2">
          <div className="sm:mr-10">
            <p className="font-bold">Files</p>
            <ul className="list-disc list-inside">
              {documentList.map((item: any) => (
                <li
                  key={item?.id}
                  className="underline cursor-pointer hover:text-blue-600"
                >
                  <a href={item?.url} target="_blank">
                    {item?.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <button
        className={classNames("my-4 block", {
          "text-gray-400 cursor-not-allowed": hasSpouses,
          "cursor-pointer underline": !hasSpouses,
        })}
        onClick={() => {
          if (!hasSpouses) {
            openDialog(
              {
                id: selectedNode?.id,
                gender:
                  selectedNode?.gender === "male"
                    ? ("female" as Gender)
                    : selectedNode?.gender === "female"
                    ? ("male" as Gender)
                    : ("male" as Gender),
                spouses: [
                  {
                    id: selectedNode?.id,
                    type: "married",
                  },
                ],
              },
              {
                key: SourceKeys.ADD_SPOUSE,
                component: SOURCES[SourceKeys.EDIT_NODE],
              }
            );
          }
        }}
        disabled={hasSpouses}
      >
        Add Spouse
      </button>

      <div className="border-t p-4 mt-8 flex sm:flex-row justify-between">
        <CloseDialog />
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
