import { FamilyNode } from "@/types/FamilyNode";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Gender } from "relatives-tree/lib/types";
import { SOURCES, useDialog } from "@/contexts/DialogContext";
import { SourceKeys } from "@/types/DialogContext";

const NODE_FIELDS = [
  { name: "name", label: "Name", type: "text" },
  { name: "birth", label: "Birth Date", type: "text" },
  { name: "birthLocation", label: "Birth Location", type: "text" },
  { name: "death", label: "Death Date", type: "text" },
  { name: "deathLocation", label: "Death Location", type: "text" },
  { name: "occupation", label: "Occupation", type: "text" },
  { name: "profileImg", label: "Profile Image URL", type: "text" },
];

const FATHER_ID_LABEL = "fatherId";
const MOTHER_ID_LABEL = "motherId";

// Define a form type for the form state
interface FamilyNodeForm extends Omit<Partial<FamilyNode>, "spouses"> {
  spouses: string; // spouse id as string for the select
}

const NodeForm = ({ selectedNode }: { selectedNode: FamilyNode | null }) => {
  const queryClient = useQueryClient();
  const [enableParentSelection, setEnableParentSelection] = useState(false);
  const [enableSpouseSelection, setEnableSpouseSelection] = useState(false);
  const { openDialog } = useDialog();
  // Fetch all members for parent selection
  const { data: members = [] } = queryClient.getQueryData(["familyData"])
    ? { data: queryClient.getQueryData(["familyData"]) as FamilyNode[] }
    : { data: [] };

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FamilyNodeForm>({
      defaultValues: {
        ...selectedNode,
        gender: selectedNode?.gender
          ? selectedNode?.gender
          : ("male" as Gender),
        spouses:
          selectedNode?.spouses && selectedNode.spouses.length > 0
            ? (selectedNode.spouses[0] as any).id
            : "",
      },
    });

  useEffect(() => {
    reset({
      ...selectedNode,
      spouses:
        selectedNode?.spouses && selectedNode.spouses.length > 0
          ? (selectedNode.spouses[0] as any).id
          : "",
    });
  }, [selectedNode, reset]);

  // Get parent details for selectedNode
  const slimMembers = useMemo(() => {
    return members?.map((member: FamilyNode) => ({
      name: member?.name,
      value: member?.name,
      id: member?.id,
      gender: member?.gender,
    }));
  }, [members]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<FamilyNode>) => {
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: selectedNode?.id }),
      });
      if (!res.ok) throw new Error("Failed to save node");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
    },
  });

  const onSubmit = (data: FamilyNodeForm) => {
    // Prepare payload for mutation
    const payload: Partial<FamilyNode> = {
      ...data,
      spouses: (data.spouses
        ? [{ id: data.spouses, type: "married" }]
        : []) as any,
    };
    console.log({
      payload,
    });
    mutation.mutate(payload, {
      onSuccess: async () => {
        // Update IndexedDB after successful mutation
        // Refetch the latest family data from the API and update IndexedDB
        console.log("great success!");
        const res = await fetch("/api/family");
        if (res.ok) {
          const familyData = await res.json();
          console.log({
            familyData,
          });
          //  await set("familyData", familyData);
        }
      },
      onError: (err) => {
        console.error(err);
      },
    });
  };

  // Helper to get the parent node by parent field (e.g., "fatherId" or "motherId")
  const getParentNode = (parentField: string) => {
    const parentId = selectedNode?.[parentField as keyof FamilyNode];
    if (!parentId) return undefined;
    return slimMembers?.find((member) => member.id === parentId);
  };

  const fatherNode = getParentNode(FATHER_ID_LABEL);
  const motherNode = getParentNode(MOTHER_ID_LABEL);

  // Helper to filter members by gender
  const membersByGender = useCallback(
    (gender: string) => {
      return members.filter((member: FamilyNode) => member?.gender === gender);
    },
    [members]
  );

  const maleMembers = membersByGender("male");
  const femaleMembers = membersByGender("female");

  // Use the gender from the form if available, otherwise fallback to selectedNode.gender, otherwise default to 'male'
  const formGender = watch("gender");
  const effectiveGender = formGender || selectedNode?.gender || "male";
  const oppositeSexNodes = membersByGender(
    effectiveGender === "female" ? "male" : "female"
  );

  const spouseId = watch("spouses");
  const membersSpouseData = useMemo(() => {
    return members.find((member: FamilyNode) => member?.id === spouseId);
  }, [spouseId, members]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col">
        {NODE_FIELDS.map((field) => (
          <div key={field.name} className="my-1">
            <label htmlFor={field.name} className="font-semibold block">
              {field.label}
            </label>
            <input
              id={field.name}
              type={field.type}
              {...register(field.name as keyof FamilyNode)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        ))}
        <div className="flex flex-col">
          <div className=" my-1">
            <label htmlFor="gender" className="font-semibold mb-1">
              Gender
            </label>
            <select
              id="gender"
              className="border w-full px-2 py-1 rounded bg-white text-gray-900"
              {...register("gender" as keyof FamilyNode)}
            >
              {["male", "female"].map((gen) => (
                <option key={gen} value={gen}>
                  {gen}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enableSpouseSelection}
              onChange={(e) => setEnableSpouseSelection(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">
              Only update the spouse if they are already a member of the tree
            </span>
          </label>
        </div>
        <div className="flex flex-col my-1">
          <label htmlFor="spouses" className="font-semibold mb-1">
            Spouse
          </label>
          <select
            id="spouses"
            className={`border w-full px-2 py-1 rounded ${
              enableSpouseSelection
                ? "bg-white text-gray-900"
                : "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
            }`}
            {...register("spouses" as keyof FamilyNode)}
            disabled={!enableSpouseSelection}
          >
            <option value="">
              {membersSpouseData ? membersSpouseData?.name : "Select a spouse"}
            </option>
            {oppositeSexNodes.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enableParentSelection}
              onChange={(e) => setEnableParentSelection(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">
              Only update the parents if you want to change both the mother and
              the father
            </span>
          </label>
        </div>

        <div className="flex flex-col my-1">
          <label htmlFor={FATHER_ID_LABEL} className="font-semibold mb-1">
            Father
          </label>
          <select
            id={FATHER_ID_LABEL}
            className={`border w-full px-2 py-1 rounded ${
              enableParentSelection
                ? "bg-white text-gray-900"
                : "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
            }`}
            {...register(FATHER_ID_LABEL as keyof FamilyNode)}
            disabled={!enableParentSelection}
          >
            <option value="">
              {fatherNode ? fatherNode?.name : "Select a parent"}
            </option>
            {maleMembers.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col my-1">
          <label htmlFor={MOTHER_ID_LABEL} className="font-semibold mb-1">
            Mother
          </label>
          <select
            id={MOTHER_ID_LABEL}
            className={`border w-full px-2 py-1 rounded ${
              enableParentSelection
                ? "bg-white text-gray-900"
                : "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
            }`}
            {...register(MOTHER_ID_LABEL as keyof FamilyNode)}
            disabled={!enableParentSelection}
          >
            <option value="">
              {motherNode ? motherNode?.name : "Select a parent"}
            </option>
            {femaleMembers.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        className="cursor-pointer underline my-4"
        onClick={() =>
          openDialog(selectedNode, {
            key: SourceKeys.DOCUMENT_UPLOADER,
            component: SOURCES[SourceKeys.DOCUMENT_UPLOADER],
          })
        }
      >
        Add additional documents for {selectedNode?.name}
      </button>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
      {mutation.isError && (
        <p className="text-red-600">
          Error: {(mutation.error as Error).message}
        </p>
      )}
      {mutation.isSuccess && <p className="text-green-600">Success!</p>}
    </form>
  );
};

export default NodeForm;
