import moment from "moment";
import Box from "@mui/material/Box";
import { pluralize } from "../helpers/util";
import { Timezone, TzDate } from "../types";

type RangesDescriptionProps = {
  ranges: TzDate[] | undefined;
  homeTimeZone: Timezone;
};

export const RangesDescription = ({
  ranges,
  homeTimeZone,
}: RangesDescriptionProps) => {
  if (!ranges) return <></>;
  return (
    <Box
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        fontFamily: "courier",
      }}
    >
      <div key={`first-${ranges[0].offset}`}>
        At the beginning of the year the difference is
        {" " + pluralize(ranges[0].offset, "hour")}
      </div>
      {ranges.length === 1 && (
        <div key={`last-${ranges[0].offset}`}>
          It does not change throughout the year
        </div>
      )}
      {ranges.slice(1).map((range, i) => (
        <div key={`${i}-${range.offset}`}>
          {range?.start &&
            moment
              .tz(range.start, homeTimeZone.timeZone)
              .format("On MMMM Do \\at ha z")}{" "}
          it changes to {pluralize(range.offset, "hour")}
        </div>
      ))}
    </Box>
  );
};
