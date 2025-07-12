import { FamilyNode } from "@/types/FamilyNode";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import ParentSelect from "./ParentSelect";

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

const NodeForm = ({ selectedNode }: { selectedNode: FamilyNode | null }) => {
  const queryClient = useQueryClient();

  // Fetch all members for parent selection
  const { data: members = [] } = queryClient.getQueryData(["familyData"])
    ? { data: queryClient.getQueryData(["familyData"]) as FamilyNode[] }
    : { data: [] };

  const { register, handleSubmit, reset } = useForm<Partial<FamilyNode>>({
    defaultValues: {
      ...selectedNode,
    },
  });

  useEffect(() => {
    reset(selectedNode || {});
  }, [selectedNode, reset]);

  // Get parent details for selectedNode
  const slimMembers = useMemo(() => {
    return members?.map((member) => ({
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

  const onSubmit = (data: any) => {
    console.log({
      data,
    });
    // mutation.mutate(data);
  };

  // Helper to get the parent node by parent field (e.g., "fatherId" or "motherId")
  const getParentNode = (parentField: string) => {
    const parentId = selectedNode?.[parentField as keyof FamilyNode];
    if (!parentId) return undefined;
    return slimMembers?.find((member) => member.id === parentId);
  };

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
        <ParentSelect
          label="Father"
          name={FATHER_ID_LABEL}
          members={members}
          gender="male"
          defaultParent={getParentNode(FATHER_ID_LABEL)}
        />
        <ParentSelect
          label="Mother"
          name={MOTHER_ID_LABEL}
          members={members}
          gender="female"
          defaultParent={getParentNode(MOTHER_ID_LABEL)}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 rounded-full text-white py-1 px-4 cursor-pointer hover:bg-blue-500 mt-4"
        disabled={mutation.isPending}
      >
        {selectedNode ? "Update Profile" : "Create Profile"}
      </button>
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
