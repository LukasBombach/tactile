import { screen, fireEvent } from "@testing-library/dom";
import { render } from "./testing-library";
import { value } from "./reactive";

const InteractiveComponent = () => {
  const [count, setCount] = value(1);

  return (
    <p>
      <button onClick={() => setCount(count() + 1)}>Count {count()}</button>
    </p>
  );
};

test("server rendered jsx", () => {
  const { container } = render(<InteractiveComponent />);
  expect(container.innerHTML).toBe("<p><button>Count 1</button></p>");
});

test("server rendered jsx", () => {
  render(<InteractiveComponent />);
  const button = screen.getByRole("button");
  expect(button).toHaveTextContent("Count 1");
  fireEvent.click(button);
  expect(button).toHaveTextContent("Count 2");
});
