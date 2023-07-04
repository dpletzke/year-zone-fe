import moment, { Moment } from "moment-timezone";
import { Timezone, TzDate } from "../types";
import { assert, makeDateThisYear, removeTime } from "./util";

type normalDstInfo = {
  offset: number;
  start: Moment;
  end: Moment;
  inNorth: boolean;
};

const fixDate = (date: string) => {
  return moment(removeTime(makeDateThisYear(date)));
};

const rangeUtils = (refTimezone: string) => ({
  normalizeDstInfo: (timezone: Timezone): normalDstInfo => {
    assert(timezone.dstInterval);
    const offset =
      timezone.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;
    const start = fixDate(
      moment.tz(timezone.dstInterval.dstStart, refTimezone).toString()
    );
    const end = fixDate(
      moment.tz(timezone.dstInterval.dstEnd, refTimezone).toString()
    );
    const inNorth = start < end;
    return { offset, start, end, inNorth };
  },
  addDatesFromDstInfo: (
    type: "A" | "B",
    dstInfo: normalDstInfo,
    standardOffset: number
  ) => {
    if (dstInfo.inNorth) {
      return [
        {
          offset:
            standardOffset + { A: dstInfo.offset, B: -dstInfo.offset }[type],
          start: moment.tz(dstInfo.start, refTimezone),
        },
        { offset: standardOffset, start: dstInfo.end },
      ];
    }
    return [
      { offset: standardOffset, start: dstInfo.end },
      {
        offset:
          standardOffset + { A: dstInfo.offset, B: -dstInfo.offset }[type],
        start: dstInfo.start,
      },
    ];
  },
});

const BOTH_NORTH_DST = "BOTH_NORTH_DST";
const A_NORTH_DST = "A_NORTH_DST";
const B_NORTH_DST = "B_NORTH_DST";
const NEITHER_NORTH_DST = "NEITHER_NORTH_DST";

const matchOffsetAndDates = (
  dst: { a: normalDstInfo; b: normalDstInfo },
  dstOffsets: { a: number; b: number; both: number },
  standardOffset: number
) => {
  let category:
    | "BOTH_NORTH_DST"
    | "A_NORTH_DST"
    | "B_NORTH_DST"
    | "NEITHER_NORTH_DST" = BOTH_NORTH_DST;
  if (dst.a.inNorth && !dst.b.inNorth) category = A_NORTH_DST;
  if (!dst.a.inNorth && dst.b.inNorth) category = B_NORTH_DST;
  if (!dst.a.inNorth && !dst.b.inNorth) category = NEITHER_NORTH_DST;

  const [aDateFirst, aDateSecond] = dst.a.inNorth
    ? [dst.a.start, dst.a.end]
    : [dst.a.end, dst.a.start];
  const [bDateFirst, bDateSecond] = dst.b.inNorth
    ? [dst.b.start, dst.b.end]
    : [dst.b.end, dst.b.start];

  const [
    afterAFirstDateOffset,
    afterBFirstDateOffset,
    afterBothFirstOffset,
    afterASecondDateOffset,
    afterBSecondDateOffset,
    afterBothSecondOffset,
  ] = {
    BOTH_NORTH_DST: [
      dstOffsets.a,
      dstOffsets.b,
      dstOffsets.both,
      dstOffsets.b,
      dstOffsets.a,
      standardOffset,
    ],
    A_NORTH_DST: [
      dstOffsets.both,
      standardOffset,
      dstOffsets.a,
      standardOffset,
      dstOffsets.both,
      dstOffsets.b,
    ],
    B_NORTH_DST: [
      standardOffset,
      dstOffsets.both,
      dstOffsets.b,
      dstOffsets.both,
      standardOffset,
      dstOffsets.a,
    ],
    NEITHER_NORTH_DST: [
      dstOffsets.b,
      dstOffsets.a,
      standardOffset,
      dstOffsets.a,
      dstOffsets.b,
      dstOffsets.both,
    ],
  }[category];

  const dates = [];

  if (aDateFirst < bDateFirst) {
    dates.push(
      { start: aDateFirst, offset: afterAFirstDateOffset },
      { start: bDateFirst, offset: afterBothFirstOffset }
    );
  } else if (aDateFirst > bDateFirst) {
    dates.push(
      { start: bDateFirst, offset: afterBFirstDateOffset },
      { start: aDateFirst, offset: afterBothFirstOffset }
    );
  } else {
    dates.push({ start: aDateFirst, offset: afterBothFirstOffset });
  }

  if (aDateSecond < bDateSecond) {
    dates.push(
      { start: aDateSecond, offset: afterASecondDateOffset },
      { start: bDateSecond, offset: afterBothSecondOffset }
    );
  } else if (aDateSecond > bDateSecond) {
    dates.push(
      { start: bDateSecond, offset: afterBSecondDateOffset },
      { start: aDateSecond, offset: afterBothSecondOffset }
    );
  } else {
    dates.push({ start: aDateSecond, offset: afterBothSecondOffset });
  }

  return dates;
};

/**
 * @param tzA - the away timezone to compare to tzB
 * @param tzB - the home timezone to compare to tzA
 * @returns - an array of objects with the following properties:
 * @description
 * Returns an array of objects with the following properties:
 * - start: the date at which the offset changes
 * - offset: the offset in hours
 */
export const findRanges = (tzA: Timezone, tzB: Timezone) => {
  const { normalizeDstInfo, addDatesFromDstInfo } = rangeUtils(tzB.timeZone);
  const std = {
    a: tzA.standardUtcOffset.seconds / 60 / 60,
    b: tzB.standardUtcOffset.seconds / 60 / 60,
  };
  const standardOffset = std.a - std.b;

  const dst: { a: normalDstInfo | undefined; b: normalDstInfo | undefined } = {
    a: tzA.dstInterval ? normalizeDstInfo(tzA) : undefined,
    b: tzB.dstInterval ? normalizeDstInfo(tzB) : undefined,
  };

  const januaryOffset =
    standardOffset +
    (dst.a && !dst.a?.inNorth ? dst.a.offset : 0) -
    (dst.b && !dst.b?.inNorth ? dst.b.offset : 0);

  const dates: TzDate[] = [{ offset: januaryOffset }];

  if (!dst.a && !dst.b) {
    return dates;
  }

  if (dst.a && !dst.b) {
    return [...dates, ...addDatesFromDstInfo("A", dst.a, standardOffset)];
  }

  if (!dst.a && dst.b) {
    return [...dates, ...addDatesFromDstInfo("B", dst.b, standardOffset)];
  }

  assert(dst.a);
  assert(dst.b);

  const dstOffsets = {
    a: std.a + dst.a.offset - std.b,
    b: std.a - (std.b + dst.b.offset),
    both: std.a + dst.a.offset - (std.b + dst.b.offset),
  };

  const output = [
    ...dates,
    ...matchOffsetAndDates({ a: dst.a, b: dst.b }, dstOffsets, standardOffset),
  ];

  return output;
};
