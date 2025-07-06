import ReactFamilyTree from "react-family-tree";
import { familyData } from "@/data/familyTree";
import FamilyNode from "@/components/FamilyNode";

const WIDTH = 220;
const HEIGHT = 200;

export default function App() {
  console.log("familyData", familyData);
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-black text-2xl text-center font-bold mt-4">
        Barnwell Family Tree
      </h1>
      <p className="text-sm text-center">
        Click on persons name for more details
      </p>
      <ReactFamilyTree
        nodes={familyData as any}
        rootId={"c8eb1606-9628-4d8a-ad0d-ceb984519c53"}
        width={WIDTH}
        height={HEIGHT}
        renderNode={(node) => (
          <FamilyNode
            key={node.id}
            node={node}
            style={{
              width: WIDTH,
              height: HEIGHT,
              transform: `translate(${node.left * (WIDTH / 2)}px, ${
                node.top * (HEIGHT / 2)
              }px)`,
            }}
          />
        )}
      />
    </div>
  );
}
