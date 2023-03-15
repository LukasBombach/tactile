import { render, screen } from "./testing-library";
import { value } from "./reactive";

test("reactive jsx", () => {
  const Component = () => {
    const [count, setCount] = value(1);

    return (
      <p>
        <button onClick={() => setCount(count() + 1)}>Count {count()}</button>
      </p>
    );
  };

  render(<Component />);
  expect(screen.innerHTML).toBe(`<p><button>Count 1</button></p>`);
});
