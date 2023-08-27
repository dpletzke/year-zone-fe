import moment, { Moment } from "moment-timezone";
import { TzDate } from "../types";
export type ClassRange = {
  [key: string]: Moment[] | { start: Moment; end: Moment }[];
};

// const stringifyForCalendar = (date: Moment) => {
//   return date.format("YYYY-MM-DD");
// };

export const getClassOffsetMap = (ranges?: TzDate[]): Map<number, string> => {
  const classes = ["first", "second", "third"];
  if (!ranges) return new Map();
  return ranges?.reduce((acc, { offset }) => {
    if (!acc.has(offset)) {
      acc.set(offset, classes.shift());
    }
    return acc;
  }, new Map());
};

export const defineColorClasses = (
  classOffsetMap: Map<number, string>,
  timeZone: string,
  ranges?: TzDate[]
): ClassRange => {
  if (!ranges) return {};
  const colorRanges = ranges.reduce((acc, { offset, start }, i, arr) => {
    const className = classOffsetMap.get(offset)!;
    if (!acc.has(className)) {
      acc.set(className, []);
    }
    const shiftStart = start
      ? start.clone().startOf("day").add(1, "day")
      : moment().subtract(1, "year").endOf("year").add(1, "day");
    const shiftEnd = ranges[i + 1]
      ? moment(ranges[i + 1].start).subtract(1, "day")
      : moment().add(1, "year").startOf("year").subtract(1, "day");
    acc.get(className)!.push({
      start: shiftStart,
      end: shiftEnd,
    });
    return acc;
  }, new Map<string, { start: Moment; end: Moment }[]>());

  const transitionDays = ranges.reduce((acc, { offset, start }, i) => {
    const className = classOffsetMap.get(offset)!;
    const prevClassName = classOffsetMap.get(ranges[i - 1]?.offset);
    if (
      prevClassName &&
      className &&
      acc.has(`${prevClassName}_${className}`)
    ) {
      acc.get(`${prevClassName}_${className}`)!.push(start!);
    } else if (prevClassName && className) {
      acc.set(`${prevClassName}_${className}`, [start!]);
    }
    return acc;
  }, new Map<string, Moment[]>());

  return {
    ...Object.fromEntries(colorRanges.entries()),
    ...Object.fromEntries(transitionDays.entries()),
  };
};
