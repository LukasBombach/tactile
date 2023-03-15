type Value<T> = [getValue: () => T, setValue: (newValue: T) => void];
type Reaction = () => void;

let currentReaction: Reaction | null = null;
const queue = new Set<Reaction>();

export function value<T>(value: T): Value<T> {
  const reactions = new Set<Reaction>();

  const getValue = () => {
    if (currentReaction) reactions.add(currentReaction);
    return value;
  };

  const setValue = (newValue: T) => {
    value = newValue;
    reactions.forEach(r => queue.add(r));

    // queue.values() returns an iterator over the reactions of the set
    const values = queue.values();

    let item = values.next();

    // we iterate over the reactions until none is left and run each one
    // running a reaction can add more reactions to the set, thereby extending the set
    // while we are iterating over it
    // 📌 This ends up working through the reaction tree depth-first
    while (!item.done) {
      queue.delete(item.value);
      item.value();
      item = values.next();
    }
  };

  return [getValue, setValue];
}

export function react(reaction: Reaction): void {
  const previous = currentReaction;
  currentReaction = reaction;
  reaction();
  currentReaction = previous;
}
