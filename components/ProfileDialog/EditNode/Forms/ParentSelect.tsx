import { FamilyNode } from "@/types/FamilyNode";
import React, { useMemo, useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

// ParentSelect component
const ParentSelect = ({
  label,
  name,
  members,
  gender,
  parentId = null,
}: {
  label: string;
  name: "fatherId" | "motherId";
  members: FamilyNode[];
  gender: "male" | "female";
  parentId: string | null;
}) => {
  const { control } = useFormContext();
  // Find the selected member by id
  const selectedMember = useMemo(
    () => members.find((m) => m.id === parentId) || null,
    [members, parentId]
  );
  const [query, setQuery] = useState("");

  // Filter members by gender and query
  const filteredMembers = useMemo(() => {
    return members.filter(
      (m) =>
        m.gender === gender &&
        m.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [members, gender, query]);

  // Keep the input in sync with the selected member
  useEffect(() => {
    if (selectedMember) {
      setQuery(selectedMember.name);
    } else {
      setQuery("");
    }
  }, [selectedMember]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col my-1">
          <label className="font-semibold mb-1">{label}</label>
          <Combobox
            value={field?.value}
            onChange={(person) => {
              field.onChange(person ? person.id : "");
            }}
          >
            <ComboboxInput
              className="border w-full px-2 py-1 rounded"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(person: FamilyNode) => {
                console.log("Person: ", person);
                return person?.name;
              }}
              placeholder={`Search for ${label.toLowerCase()}...`}
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
