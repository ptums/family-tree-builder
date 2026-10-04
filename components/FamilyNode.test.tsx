import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FamilyNode from "./FamilyNode";
import { DialogProvider, useDialog } from "@/contexts/DialogContext";
import type { FamilyNode as FamilyNodeType } from "@/types/FamilyNode";

const charles = {
  id: "c1",
  name: "Charles Example",
  birth: "07/08/1930",
  death: "",
} as unknown as FamilyNodeType;

function DialogState() {
  const { isOpen, selectedNode } = useDialog();
  return <output>{isOpen ? `open: ${selectedNode?.name}` : "closed"}</output>;
}

function renderNode(node: FamilyNodeType) {
  return render(
    <DialogProvider>
      <FamilyNode node={node} />
      <DialogState />
    </DialogProvider>,
  );
}

describe("FamilyNode", () => {
  it("shows the name and only the dates that exist", () => {
    renderNode(charles);
    expect(screen.getByText("Charles Example")).toBeInTheDocument();
    expect(screen.getByText(/B: 07\/08\/1930/)).toBeInTheDocument();
    expect(screen.queryByText(/D:/)).not.toBeInTheDocument();
  });

  it("opens that person's profile when clicked", async () => {
    renderNode(charles);
    expect(screen.getByRole("status")).toHaveTextContent("closed");
    await userEvent.click(screen.getByText("Charles Example"));
    expect(screen.getByRole("status")).toHaveTextContent("open: Charles Example");
  });
});
