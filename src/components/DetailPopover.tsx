import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import moment from "moment-timezone";
import { homedir } from "os";
import { ReactNode, useState } from "react";
import { pluralize } from "../helpers/util";
import { Timezone } from "../types";

const TimezoneContainer = (props: Timezone & { refTimezone: string }) => {
  const {
    timeZone,
    dstInterval,
    hasDayLightSaving,
    standardUtcOffset,
    refTimezone,
  } = props;
  const dstDetails = !dstInterval
    ? {}
    : {
        dstOffset: dstInterval.dstOffsetToStandardTime.seconds / 60 / 60,
        start: moment
          .tz(dstInterval.dstStart, refTimezone)
          .format("DD/MM/YYYY @ ha"),
        end: moment
          .tz(dstInterval.dstEnd, refTimezone)
          .format("DD/MM/YYYY @ ha"),
      };

  return (
    <>
      <h4>{timeZone}</h4>
      <div>
        Standard offset to UTC:{" "}
        {pluralize(standardUtcOffset.seconds / 60 / 60, "hour")}
      </div>
      <div>
        <strong>Has daylight savings:</strong>{" "}
        {hasDayLightSaving ? "Yes" : "No"}
      </div>
      <div>
        Dst offset:{" "}
        {!hasDayLightSaving ? "N/A" : pluralize(dstDetails.dstOffset, "hour")}
      </div>
      <div>
        Dst start:{" "}
        {!hasDayLightSaving ? "N/A" : `${dstDetails.start} home time`}
      </div>
      <div>
        Dst end: {!hasDayLightSaving ? "N/A" : `${dstDetails.end} home time`}
      </div>
    </>
  );
};

type PopoverDetails = {
  buttonChildren: ReactNode;
};

export const DetailPopover = (props: {
  home: Timezone;
  work: Timezone;
  details: PopoverDetails;
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <Button
        aria-describedby={id}
        variant="text"
        onClick={handleClick}
        children={props.details.buttonChildren}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Box sx={{ p: 2 }} display="flex" gap="50px">
          <div>
            Home
            <TimezoneContainer
              {...props.home}
              refTimezone={props.home.timeZone}
            />
          </div>
          <div>
            Work
            <TimezoneContainer
              {...props.work}
              refTimezone={props.home.timeZone}
            />
          </div>
        </Box>
      </Popover>
    </>
  );
};
export default DetailPopover;
