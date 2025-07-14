import { FamilyNode } from "@/types/FamilyNode";
import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { get, set } from "idb-keyval";

// Hook to fetch family data from IndexedDB (or API fallback)
function useFamilyData() {
  return useQuery({
    queryKey: ["familyData"],
    queryFn: async () => {
      const cached = await get("familyData");
      if (cached) return cached;
      const res = await fetch("/api/family");
      const data = await res.json();
      await set("familyData", data);
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

const ProfileList = memo(({ title, list, setSelectedNode }: any) => {
  const { data: familyData, isLoading } = useFamilyData();

  const memoizedList = useMemo(() => {
    if (!familyData) return [];
    return list
      .map((node: any) => {
        const currentNode = familyData.find(
          (data: any) => data?.id === node?.id
        );
        return currentNode;
      })
      .filter(Boolean);
  }, [list, familyData]);

  if (isLoading) {
    return (
      <div className="sm:mr-10">
        <p className="font-bold">{title}</p>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="sm:mr-10">
      <p className="font-bold">{title}</p>
      <ul className="list-disc list-inside">
        {memoizedList.map((item: any) => (
          <li
            key={item?.id}
            className="underline cursor-pointer hover:text-blue-600"
            onClick={() => setSelectedNode(item as unknown as FamilyNode)}
          >
            {item?.name}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default ProfileList;
