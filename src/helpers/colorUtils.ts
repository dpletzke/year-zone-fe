
import moment, { Moment } from "moment-timezone";
import { TzDate } from "../types";
export type ClassRange = {
  [key: string]: { start: Moment; end: Moment }[];
};

export const getClassOffsetMap = (ranges?: TzDate[]): Map<number, string> => {
  const classes = ["first", "second", "third"];
  if (!ranges) return new Map();
  return ranges?.reduce((acc, { offset }) => {
    // Creates a map of offset to class name
    // e.g. { -7: "first", -8: "second", -9: "third" }
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
    const className = classOffsetMap.get(offset);
    const prevClassName = classOffsetMap.get(ranges[i - 1]?.offset);

    if (!className) return acc;

    const shiftStart = start
      ? start.clone().startOf("day").add(1, "day")
      : moment().subtract(1, "year").endOf("year").add(1, "day");
    const shiftEnd = ranges[i + 1]
      ? moment(ranges[i + 1].start).subtract(1, "day")
      : moment().add(1, "year").startOf("year").subtract(1, "day");

    if (!acc.has(className)) {
      acc.set(className, [{ start: shiftStart, end: shiftEnd }]);
    } else {
      acc.get(className)!.push({
        start: shiftStart,
        end: shiftEnd,
      });
    }
    
    const transitionClass =
      prevClassName === className ? className : `${prevClassName}_${className}`;

    if (acc.has(transitionClass)) {
      acc.get(transitionClass)!.push({ start: start!, end: shiftStart });
    } else {
      acc.set(transitionClass, [{ start: start!, end: shiftStart }]);
    }
    return acc;
  }, new Map<string, { start: Moment; end: Moment }[]>());

  return Object.fromEntries(colorRanges.entries());
};
