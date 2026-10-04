import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { DialogProvider, SOURCES, useDialog } from "./DialogContext";
import { SourceKeys } from "@/types/DialogContext";
import type { FamilyNode } from "@/types/FamilyNode";

const wrapper = ({ children }: { children: ReactNode }) => (
  <DialogProvider>{children}</DialogProvider>
);
const person = { id: "p1", name: "Arthur Example" } as unknown as FamilyNode;
const editSource = { key: SourceKeys.EDIT_NODE, component: SOURCES[SourceKeys.EDIT_NODE] };

describe("DialogContext", () => {
  it("throws a clear error when used outside the provider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useDialog())).toThrow(
      "useDialog must be used within a DialogProvider",
    );
  });

  it("starts closed on the profile view", () => {
    const { result } = renderHook(() => useDialog(), { wrapper });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedNode).toBeNull();
    expect(result.current.selectedSource.key).toBe(SourceKeys.NODE_PROFILE);
  });

  it("opens on a person and view, then clears the person on close", () => {
    const { result } = renderHook(() => useDialog(), { wrapper });

    act(() => result.current.openDialog(person, editSource));
    expect(result.current).toMatchObject({ isOpen: true, selectedNode: person });
    expect(result.current.selectedSource.key).toBe(SourceKeys.EDIT_NODE);

    act(() => result.current.closeDialog());
    expect(result.current).toMatchObject({ isOpen: false, selectedNode: null });
  });

  it("keeps the current person when opened without one (e.g. 'add new member')", () => {
    const { result } = renderHook(() => useDialog(), { wrapper });
    act(() => result.current.openDialog(person, editSource));
    act(() => result.current.openDialog(null, editSource));
    expect(result.current.selectedNode).toBe(person);
  });
});
