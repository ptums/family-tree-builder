import { FamilyNode } from "@/types/FamilyNode";
import { useForm, useFormContext, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
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

const NodeForm = ({ selectedNode }: { selectedNode: FamilyNode | null }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, control, getValues } = useForm<
    Partial<FamilyNode>
  >({
    defaultValues: selectedNode || {},
  });

  React.useEffect(() => {
    reset(selectedNode || {});
  }, [selectedNode, reset]);

  // Fetch all members for parent selection
  const { data: members = [] } = queryClient.getQueryData(["familyData"])
    ? { data: queryClient.getQueryData(["familyData"]) as FamilyNode[] }
    : { data: [] };

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

  const onSubmit = (data: Partial<FamilyNode>) => {
    mutation.mutate(data);
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
          name="fatherId"
          members={members}
          gender="male"
          parentId={getValues("fatherId") ?? null}
        />
        <ParentSelect
          label="Mother"
          name="motherId"
          members={members}
          gender="female"
          parentId={getValues("motherId") ?? null}
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
