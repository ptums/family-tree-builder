import { FamilyNode } from "@/types/FamilyNode";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useFormContext, Controller } from "react-hook-form";

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
  const { control, getValues, setValue } = useFormContext();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // get the current member for a placeholder
  const currentMember = useMemo(() => {
    return members.find((m) => m.id.includes(parentId as string));
  }, [members, parentId]);
  console.log({
    currentMember,
  });
  // Find the selected member by id to show their name in the input
  useEffect(() => {
    const id = getValues(name);
    if (id) {
      const member = members.find((m) => m.id === id);
      if (member) setSearch(member.name);
    }
  }, [getValues, members, name]);

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          m.gender === gender &&
          m.name.toLowerCase().includes(search.toLowerCase())
      ),
    [members, gender, search]
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col relative">
          <label className="font-semibold mb-1">{label}</label>
          <input
            ref={inputRef}
            type="text"
            placeholder={`${currentMember?.name || "Search for parent..."}`}
            value={search}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
              // If user types, clear the field value
              field.onChange("");
            }}
            className="border rounded px-2 py-1 mb-1"
            autoComplete="off"
          />
          {showDropdown && filtered.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded w-full max-h-40 overflow-y-auto shadow">
              {filtered.map((m) => (
                <li
                  key={m.id}
                  className="px-2 py-1 cursor-pointer hover:bg-blue-100"
                  onClick={() => {
                    setSearch(m.name);
                    field.onChange(m.id);
                    setShowDropdown(false);
                  }}
                >
                  {m.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    />
  );
};

export default ParentSelect;
