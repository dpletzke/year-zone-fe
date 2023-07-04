// a function that asserts the value is not undefined
export function assert(value: unknown): asserts value {
  if (value === undefined) {
    throw new Error("value must be defined");
  }
}

// function that assert a value to a particular type
export function assertType<T>(value: unknown): asserts value is T {
  if (value === undefined) {
    throw new Error("value must be defined");
  }
}

export const makeDateThisYear = (date: Date | string) => {
  const newDate = new Date(date);
  newDate.setFullYear(new Date().getFullYear());
  return newDate;
};

export const removeTime = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const loadScript = (
  src: string,
  position: HTMLElement | null,
  id: string
) => {
  if (!position) {
    return;
  }

  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("id", id);
  script.src = src;
  position.appendChild(script);
};

export const pluralize = (count: number | undefined, word: string) => {
  if (count === undefined) return "";
  return `${count} ${count === 1 ? word : `${word}s`}`;
};
