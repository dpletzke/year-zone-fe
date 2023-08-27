import { describe, expect } from "vitest";
import moment from "moment-timezone";
import { findRanges } from "./findRanges";
import { chicago, auckland, ljubljana, bangkok, bogota } from "../fixtures";
import {
  defineColorClasses,
  getClassOffsetMap,
  ClassRange,
} from "./colorUtils";

const bangStd = bangkok.standardUtcOffset.seconds / 60 / 60;
const bogoStd = bogota.standardUtcOffset.seconds / 60 / 60;

const makeMoment = (timeZone: string) => (date: string) => {
  return moment.tz(date, timeZone).toString();
};

const convertColorsClassesToDateForTesting = (colorClasses: ClassRange) => {
  return Object.entries(colorClasses).reduce((acc, [key, value]) => {
    acc[key] = value.map((classRange) => {
      if (moment.isMoment(classRange)) {
        return classRange.toString();
      } else {
        return {
          start: classRange.start.toString(),
          end: classRange.end.toString(),
        };
      }
    });
    return acc;
  }, {} as { [key: string]: any });
};

describe("with bangkok and bogota", () => {
  const zonify = makeMoment(bangkok.timeZone);
  const standardOffset = bangStd - bogoStd;

  const ranges = [{ offset: standardOffset }];
  const classOffsetMap = getClassOffsetMap(ranges);

  expect(
    convertColorsClassesToDateForTesting(
      defineColorClasses(classOffsetMap, bangkok.timeZone, ranges)
    )
  ).toEqual({
    first: [
      {
        start: zonify("2022-01-01"),
        end: zonify("2022-12-31"),
      },
    ],
  });
});

describe("color classes can take auckland and bogota", () => {
  const zonify = makeMoment(auckland.timeZone);
  const ranges = findRanges(auckland, bogota);
  const classOffsetMap = getClassOffsetMap(ranges);

  expect(
    convertColorsClassesToDateForTesting(
      defineColorClasses(classOffsetMap, auckland.timeZone, ranges)
    )
  ).toEqual({
    first: [
      {
        start: zonify("2022-01-01"),
        end: zonify("2022-04-01"),
      },
      {
        start: zonify("2022-09-26"),
        end: zonify("2022-12-31"),
      },
    ],
    first_second: [zonify("2022-04-02")],
    second: [
      {
        start: zonify("2022-04-03"),
        end: zonify("2022-09-24"),
      },
    ],
    second_first: [zonify("2022-09-25")],
  });
});

// describe("findRanges can take chicago and auckland", () => {
//   const ranges = findRanges(chicago, auckland);

//   const classOffsetMap = getClassOffsetMap(ranges);

//   expect(defineColorClasses(classOffsetMap, ranges)).toEqual({
//     first: [
//       [moment.tz("2022-01-01", "America/Bogota").toString()],
//       [moment.tz("2022-12-31", "America/Bogota").toString()],
//     ],
//   });
// expect(defineColorClasses(classOffsetMap, ranges)).toEqual([
//   { offset: aucklandDstOffset },
//   { start: zonify("2022-03-13T08:00:00Z"), offset: bothDstOffset },
//   { start: zonify("2022-04-01T14:00:00Z"), offset: chicagoDstOffset },
//   { start: zonify("2022-09-24T14:00:00Z"), offset: bothDstOffset },
//   { start: zonify("2022-11-06T07:00:00Z"), offset: aucklandDstOffset },
// ]);
// });

// describe("findRanges can take auckland and chicago", () => {
//   const zonify = makeMoment(chicago.timeZone);
//   const dates = findRanges(auckland, chicago);

//   const chiStd = chicago.standardUtcOffset.seconds / 60 / 60;
//   const auckStd = auckland.standardUtcOffset.seconds / 60 / 60;
//   const chiDst = chicago.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;
//   const auckDst =
//     auckland.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

//   const chicagoDstOffset = auckStd - (chiStd + chiDst);
//   const aucklandDstOffset = auckStd + auckDst - chiStd;
//   const bothDstOffset = auckStd + auckDst - (chiStd + chiDst);

//   expect(convertRangesToDateForTesting(dates)).toEqual([
//     { offset: aucklandDstOffset },
//     { start: zonify("2022-03-13T08:00:00Z"), offset: bothDstOffset },
//     { start: zonify("2022-04-01T14:00:00Z"), offset: chicagoDstOffset },
//     { start: zonify("2022-09-24T14:00:00Z"), offset: bothDstOffset },
//     { start: zonify("2022-11-06T07:00:00Z"), offset: aucklandDstOffset },
//   ]);
// });

// describe("findRanges can take chicago and ljubljana", () => {
//   const zonify = makeMoment(ljubljana.timeZone);
//   const dates = findRanges(chicago, ljubljana);

//   const chiStd = chicago.standardUtcOffset.seconds / 60 / 60;
//   const ljuStd = ljubljana.standardUtcOffset.seconds / 60 / 60;
//   const chiDst = chicago.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;
//   const ljuDst =
//     ljubljana.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

//   const standardOffset = chiStd - ljuStd;
//   const chicagoDstOffset = chiStd + chiDst - ljuStd;
//   const bothDstOffset = chiStd + chiDst - (ljuStd + ljuDst);

//   expect(convertRangesToDateForTesting(dates)).toEqual([
//     { offset: standardOffset },
//     { start: zonify("2022-03-13T08:00:00Z"), offset: chicagoDstOffset },
//     { start: zonify("2022-03-27T01:00:00Z"), offset: bothDstOffset },
//     { start: zonify("2022-10-30T01:00:00Z"), offset: chicagoDstOffset },
//     { start: zonify("2022-11-06T07:00:00Z"), offset: standardOffset },
//   ]);
// });

// describe("findRanges can take bangkok and bogota", () => {
//   const dates = findRanges(bangkok, bogota);

//   const bangStd = bangkok.standardUtcOffset.seconds / 60 / 60;
//   const bogoStd = bogota.standardUtcOffset.seconds / 60 / 60;

//   const standardOffset = bangStd - bogoStd;

//   expect(convertRangesToDateForTesting(dates)).toEqual([
//     { offset: standardOffset },
//   ]);
// });

// describe("findRanges can take chicago and bogota", () => {
//   const zonify = makeMoment(bogota.timeZone);
//   const dates = findRanges(chicago, bogota);

//   const chiStd = chicago.standardUtcOffset.seconds / 60 / 60;
//   const bogoStd = bogota.standardUtcOffset.seconds / 60 / 60;

//   const chiDst = chicago.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

//   const standardOffset = chiStd - bogoStd;
//   const chicagoDstOffset = chiStd + chiDst - bogoStd;

//   expect(convertRangesToDateForTesting(dates)).toEqual([
//     { offset: standardOffset },
//     { start: zonify("2022-03-13T08:00:00Z"), offset: chicagoDstOffset },
//     { start: zonify("2022-11-06T07:00:00Z"), offset: standardOffset },
//   ]);
// });

// describe("findRanges can take auckland and bogota", () => {
//   const zonify = makeMoment(bogota.timeZone);
//   const dates = findRanges(auckland, bogota);

//   const auckStd = auckland.standardUtcOffset.seconds / 60 / 60;
//   const bogoStd = bogota.standardUtcOffset.seconds / 60 / 60;

//   const auckDst =
//     auckland.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

//   const standardOffset = auckStd - bogoStd;
//   const aucklandDstOffset = auckStd + auckDst - bogoStd;

//   expect(convertRangesToDateForTesting(dates)).toEqual([
//     { offset: aucklandDstOffset },
//     { start: zonify("2022-04-01T14:00:00Z"), offset: standardOffset },
//     { start: zonify("2022-09-24T14:00:00Z"), offset: aucklandDstOffset },
//   ]);
// });

// describe("findRanges can take bogota and auckland", () => {
//   const zonify = makeMoment(auckland.timeZone);
//   const dates = findRanges(bogota, auckland);

//   const bogoStd = bogota.standardUtcOffset.seconds / 60 / 60;
//   const auckStd = auckland.standardUtcOffset.seconds / 60 / 60;

//   const auckDst =
//     auckland.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

//   const standardOffset = bogoStd - auckStd;
//   const aucklandDstOffset = bogoStd - (auckStd + auckDst);

//   expect(convertRangesToDateForTesting(dates)).toEqual([
//     { offset: aucklandDstOffset },
//     { start: zonify("2022-04-01T14:00:00Z"), offset: standardOffset },
//     { start: zonify("2022-09-24T14:00:00Z"), offset: aucklandDstOffset },
//   ]);
// });
