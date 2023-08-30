import { useCallback, useState } from "react";
import moment, { Moment } from "moment-timezone";
import { Popper } from "@mui/material";
import { Calendar } from "react-yearly-calendar";
import { Timezone, TzDate } from "../types";
import "../style.css";
import { defineColorClasses, getClassOffsetMap } from "../helpers/colorUtils";
import { assertType } from "../helpers/util";
import { Legend } from "./Legend";

type CalendarContainerProps = {
  homeTimezone: Timezone;
  workTimezone: Timezone;
  ranges?: TzDate[];
};

export const CalendarContainer = (props: CalendarContainerProps) => {
  const { ranges, homeTimezone, workTimezone } = props;
  const classOffsetMap = getClassOffsetMap(ranges);
  const colorClasses = defineColorClasses(classOffsetMap, homeTimezone.timeZone, ranges);
  const [pickedDate, setPickedDate] = useState<Moment | null>(null);

  const customClasses = useCallback(
    (day: Moment) => {
      const [className] =
        Object.entries(colorClasses).find(([, descrip]) => {
          if (moment.isMoment(descrip)) {
            return day.isSame(descrip, "day");
          } else if (Array.isArray(descrip)) {
            assertType<{ start: Moment; end: Moment }[]>(descrip);
            return descrip.some((d) =>
              day.isBetween(d.start, d.end, "day", "[]")
            );
          }
          return false;
        }) || [];
      return className || "";
    },
    [colorClasses]
  );

  const onPickDate = useCallback((date: Moment) => {
    const transitionDay = ranges?.find((range) =>
      date.isSame(range.start, "day")
    );
    if (transitionDay) {
      setPickedDate(transitionDay.start!);
    }
  }, []);

  const anchorEl = pickedDate ? document.getElementById("calendar") : null;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
      }}
    >
      <div id="calendar">
        <Calendar
          year={new Date().getFullYear()}
          onPickDate={onPickDate}
          customClasses={customClasses}
          firstDayOfWeek={1}
        />
      </div>
      <Popper id={"calendar"} open={Boolean(pickedDate)} anchorEl={anchorEl}>
        {pickedDate && (
          <div
            style={{
              padding: "10px",
              backgroundColor: "white",
              borderRadius: "5px",
              boxShadow: "0px 0px 5px 0px rgba(0,0,0,0.75)",
            }}
          >
            {moment.tz(pickedDate, workTimezone.timeZone).format("LLLL")}{" -- "}
            {moment(pickedDate).format("LLLL")}{" "}
          </div>
        )}
      </Popper>
      <Legend classOffsetMap={classOffsetMap} />
    </section>
  );
};
