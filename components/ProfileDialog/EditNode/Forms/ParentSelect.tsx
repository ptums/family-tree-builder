import { FamilyNode } from "@/types/FamilyNode";
import React, { useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
// ParentSelect component
const ParentSelect = ({
  label,
  name,
  members,
  gender,
  defaultParent,
}: {
  label: string;
  name: "fatherId" | "motherId";
  members: any | FamilyNode[];
  gender: string;
  defaultParent: any;
}) => {
  const { control, setValue } = useFormContext();

  // Filter members by gender
  const filteredMembers: FamilyNode[] = useMemo(() => {
    return members.filter((member: any) => member?.gender === gender);
  }, [members, gender]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col my-1">
          <label htmlFor={field?.name} className="font-semibold mb-1">
            {label}
          </label>
          <select
            id={field?.name}
            className="border w-full px-2 py-1 rounded"
            value={field?.value || ""}
            onChange={(event) => {
              console.log("event.target.value", event.target.value);
              field.onChange(event.target.value);
            }}
          >
            <option value="">
              {defaultParent ? defaultParent?.name : "Select a parent"}
            </option>
            {filteredMembers.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <pre>{JSON.stringify(field)}</pre>
        </div>
      )}
    />
  );
};

export default ParentSelect;
