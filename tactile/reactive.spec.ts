import { value, react } from "./reactive";

test("values: basic getting and setting", () => {
  const [getVal, setVal] = value("a");

  expect(getVal()).toBe("a");

  setVal("b");
  expect(getVal()).toBe("b");
});

test("values: using getters in setters", () => {
  const [getVal, setVal] = value(1);
  setVal(getVal() + 1);
  expect(getVal()).toBe(2);
});

test("reactions: reacting one value", () => {
  const [getVal, setVal] = value("a");
  const reaction = jest.fn().mockImplementation(() => getVal());

  expect(reaction).toHaveBeenCalledTimes(0);

  react(reaction);
  expect(reaction).toHaveBeenCalledTimes(1);

  setVal("b");
  expect(reaction).toHaveBeenCalledTimes(2);
});

test("reactions: reacting two values", () => {
  const [firstValue, setFirstValue] = value("a");
  const [secondValue, setSecondValue] = value("a");
  const reaction = jest.fn().mockImplementation(() => firstValue() + secondValue());

  react(reaction);
  expect(reaction).toHaveBeenCalledTimes(1);

  setFirstValue("b");
  expect(reaction).toHaveBeenCalledTimes(2);

  setSecondValue("b");
  expect(reaction).toHaveBeenCalledTimes(3);
});
