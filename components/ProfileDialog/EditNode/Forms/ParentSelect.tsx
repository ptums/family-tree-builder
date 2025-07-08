import { FamilyNode } from "@/types/FamilyNode";
import React, { useMemo, useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { SlimMember } from "@/types/ParentSelect";

// ParentSelect component
const ParentSelect = ({
  label,
  name,
  members,
  parent,
  selectedMemberName,
}: {
  label: string;
  name: "father" | "mother";
  members: SlimMember[];
  parent: SlimMember;
  selectedMemberName: string;
}) => {
  const { control } = useFormContext();

  const [query, setQuery] = useState("");

  // // Filter members by gender and query
  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [members, query]);

  // // Keep the input in sync with the selected member
  useEffect(() => {
    if (selectedMemberName) {
      setQuery(selectedMemberName);
    }
  }, [selectedMemberName]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col my-1">
          <label htmlFor={field?.name} className="font-semibold mb-1">
            {label}
          </label>
          <Combobox
            value={field?.value}
            onChange={(person) => {
              console.log("Combobox onChange", person);
              field.onChange(person ? person : "");
            }}
          >
            <ComboboxInput
              id={field?.name}
              className="border w-full px-2 py-1 rounded"
              onChange={(event) => {
                console.log("ComboboxInput onChange: ", event.target.value);
                setQuery(event.target.value);
              }}
              displayValue={(person: FamilyNode) => {
                console.log("ComboboxInput displayValue: ", person);

                return person?.name;
              }}
              placeholder={
                parent?.name || `Search for ${label.toLowerCase()}...`
              }
            />
            <ComboboxOptions className="border rounded mt-1 bg-white z-10 max-h-40 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="p-2 text-gray-500">No results found.</div>
              ) : (
                filteredMembers.map((person) => (
                  <ComboboxOption
                    key={person.id}
                    value={person}
                    className={({ active }: { active: boolean }) =>
                      `cursor-pointer px-2 py-1 ${
                        active ? "bg-blue-100" : "bg-white"
                      }`
                    }
                  >
                    {person.name}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Combobox>
        </div>
      )}
    />
  );
};

export default ParentSelect;
