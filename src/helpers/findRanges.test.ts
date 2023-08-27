import moment from "moment-timezone";
import { describe, expect } from "vitest";
import { findRanges } from "./findRanges";
import { chicago, auckland, ljubljana, bangkok, bogota } from "../fixtures";
import { TzDate } from "../types";

const zonifyByTimeZone = (timezone: string) => (date: string) => {
  return moment.tz(date, timezone).toString();
};

/* converts all start moment dates to strings for comparison
 * because moment objects are not comparable
 */
const convertRangesToDateForTesting = (ranges: TzDate[]) => {
  return ranges.map((range) => ({
    ...range,
    ...(range.start ? { start: range.start.toString() } : {}),
  }));
};

describe("testing function can zonify", () => {
  const zonify = zonifyByTimeZone("Pacific/Auckland");
  // TODO: could this test be more robust?
  // could there be an issue with dst
  expect(zonify("2022-03-13T08:00:00Z")).toBe(
    "Sun Mar 13 2022 21:00:00 GMT+1300"
  );
});

describe("testing function can convert ranges to date for testing", () => {
  const convertedRanges = convertRangesToDateForTesting([
    {
      offset: 13,
      start: moment.tz("2022-03-13T08:00:00Z", "Pacific/Auckland"),
    },
  ]);

  expect(convertedRanges).toStrictEqual([
    {
      offset: 13,
      start: "Sun Mar 13 2022 21:00:00 GMT+1300",
    },
  ]);
});
describe.only("findRanges can take chicago and bogota", () => {
  const zonify = zonifyByTimeZone(bogota.timeZone);
  const dates = findRanges(chicago, bogota);

  const chiStd = chicago.standardUtcOffset.seconds / 60 / 60;
  const bogoStd = bogota.standardUtcOffset.seconds / 60 / 60;

  const chiDst = chicago.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

  const standardOffset = chiStd - bogoStd;
  const chicagoDstOffset = chiStd + chiDst - bogoStd;

  expect(convertRangesToDateForTesting(dates)).toEqual([
    { offset: standardOffset },
    { start: zonify("2022-03-13T08:00:00Z"), offset: chicagoDstOffset },
    { start: zonify("2022-11-06T07:00:00Z"), offset: standardOffset },
  ]);
});

/*
describe("findRanges can take chicago and auckland", () => {
  const zonify = zonifyByTimeZone(auckland.timeZone);
  const dates = findRanges(chicago, auckland);

  const chiStd = chicago.standardUtcOffset.seconds / 60 / 60;
  const auckStd = auckland.standardUtcOffset.seconds / 60 / 60;
  const chiDst = chicago.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;
  const auckDst =
    auckland.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

  const chicagoDstOffset = chiStd + chiDst - auckStd;
  const aucklandDstOffset = chiStd - (auckStd + auckDst);
  const bothDstOffset = chiStd + chiDst - (auckStd + auckDst);

  expect(convertRangesToDateForTesting(dates)).toEqual([
    { offset: aucklandDstOffset },
    { start: zonify("2022-03-13T08:00:00Z"), offset: bothDstOffset },
    { start: zonify("2022-04-01T14:00:00Z"), offset: chicagoDstOffset },
    { start: zonify("2022-09-24T14:00:00Z"), offset: bothDstOffset },
    { start: zonify("2022-11-06T07:00:00Z"), offset: aucklandDstOffset },
  ]);
});

describe("findRanges can take auckland and chicago", () => {
  const zonify = zonifyByTimeZone(chicago.timeZone);
  const dates = findRanges(auckland, chicago);

  const chiStd = chicago.standardUtcOffset.seconds / 60 / 60;
  const auckStd = auckland.standardUtcOffset.seconds / 60 / 60;
  const chiDst = chicago.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;
  const auckDst =
    auckland.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

  const chicagoDstOffset = auckStd - (chiStd + chiDst);
  const aucklandDstOffset = auckStd + auckDst - chiStd;
  const bothDstOffset = auckStd + auckDst - (chiStd + chiDst);

  expect(convertRangesToDateForTesting(dates)).toEqual([
    { offset: aucklandDstOffset },
    { start: zonify("2022-03-13T08:00:00Z"), offset: bothDstOffset },
    { start: zonify("2022-04-01T14:00:00Z"), offset: chicagoDstOffset },
    { start: zonify("2022-09-24T14:00:00Z"), offset: bothDstOffset },
    { start: zonify("2022-11-06T07:00:00Z"), offset: aucklandDstOffset },
  ]);
});

describe("findRanges can take chicago and ljubljana", () => {
  const zonify = zonifyByTimeZone(ljubljana.timeZone);
  const dates = findRanges(chicago, ljubljana);

  const chiStd = chicago.standardUtcOffset.seconds / 60 / 60;
  const ljuStd = ljubljana.standardUtcOffset.seconds / 60 / 60;
  const chiDst = chicago.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;
  const ljuDst =
    ljubljana.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

  const standardOffset = chiStd - ljuStd;
  const chicagoDstOffset = chiStd + chiDst - ljuStd;
  const bothDstOffset = chiStd + chiDst - (ljuStd + ljuDst);

  expect(convertRangesToDateForTesting(dates)).toEqual([
    { offset: standardOffset },
    { start: zonify("2022-03-13T08:00:00Z"), offset: chicagoDstOffset },
    { start: zonify("2022-03-27T01:00:00Z"), offset: bothDstOffset },
    { start: zonify("2022-10-30T01:00:00Z"), offset: chicagoDstOffset },
    { start: zonify("2022-11-06T07:00:00Z"), offset: standardOffset },
  ]);
});

describe("findRanges can take bangkok and bogota", () => {
  const dates = findRanges(bangkok, bogota);

  const bangStd = bangkok.standardUtcOffset.seconds / 60 / 60;
  const bogoStd = bogota.standardUtcOffset.seconds / 60 / 60;

  const standardOffset = bangStd - bogoStd;

  expect(convertRangesToDateForTesting(dates)).toEqual([
    { offset: standardOffset },
  ]);
});

describe("findRanges can take auckland and bogota", () => {
  const zonify = zonifyByTimeZone(bogota.timeZone);
  const dates = findRanges(auckland, bogota);

  const auckStd = auckland.standardUtcOffset.seconds / 60 / 60;
  const bogoStd = bogota.standardUtcOffset.seconds / 60 / 60;

  const auckDst =
    auckland.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

  const standardOffset = auckStd - bogoStd;
  const aucklandDstOffset = auckStd + auckDst - bogoStd;

  expect(convertRangesToDateForTesting(dates)).toEqual([
    { offset: aucklandDstOffset },
    { start: zonify("2022-04-01T14:00:00Z"), offset: standardOffset },
    { start: zonify("2022-09-24T14:00:00Z"), offset: aucklandDstOffset },
  ]);
});

describe("findRanges can take bogota and auckland", () => {
  const zonify = zonifyByTimeZone(auckland.timeZone);
  const dates = findRanges(bogota, auckland);

  const bogoStd = bogota.standardUtcOffset.seconds / 60 / 60;
  const auckStd = auckland.standardUtcOffset.seconds / 60 / 60;

  const auckDst =
    auckland.dstInterval.dstOffsetToStandardTime.seconds / 60 / 60;

  const standardOffset = bogoStd - auckStd;
  const aucklandDstOffset = bogoStd - (auckStd + auckDst);

  expect(convertRangesToDateForTesting(dates)).toEqual([
    { offset: aucklandDstOffset },
    { start: zonify("2022-04-01T14:00:00Z"), offset: standardOffset },
    { start: zonify("2022-09-24T14:00:00Z"), offset: aucklandDstOffset },
  ]);
});
*/
