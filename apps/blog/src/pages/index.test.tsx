import { render } from "@testing-library/react";
import Home from "./index.page";

describe("Home", () => {
  it("renders a heading", () => {
    const { container } = render(<Home />);

    expect(container.querySelector("h1")).toBeInTheDocument();
  });
});
