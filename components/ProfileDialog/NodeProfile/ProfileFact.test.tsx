import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import ProfileFact from "./ProfileFact";

describe("ProfileFact", () => {
  it("shows a labelled fact with no accessibility violations", async () => {
    const { container } = render(<ProfileFact title="Born" fact="07/08/1930 - Springfield" />);
    expect(screen.getByText("Born")).toBeInTheDocument();
    expect(screen.getByText("07/08/1930 - Springfield")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
