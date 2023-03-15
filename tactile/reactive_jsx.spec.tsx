import { render } from "./jsx";
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

  const { container } = render(<Component />);
  expect(container.innerHTML).toBe(`<p><button>Count 1</button></p>`);
});
