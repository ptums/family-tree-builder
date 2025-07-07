import { familyData } from "@/data/familyTree";
import { FamilyNode } from "@/types/FamilyNode";
import { memo, useMemo } from "react";

const ProfileList = memo(({ title, list, setSelectedNode }: any) => {
  const memoizedList = useMemo(() => {
    return list.map((node: any) => {
      const currentNode = familyData.find((data) => data?.id === node?.id);
      return currentNode;
    });
  }, [list]);

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
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default ProfileList;
