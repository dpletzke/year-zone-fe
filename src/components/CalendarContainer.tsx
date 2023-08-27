import moment, { Moment } from "moment-timezone";
import { Calendar } from "react-yearly-calendar";
import { TzDate } from "../types";
import "../style.css";
import { defineColorClasses, getClassOffsetMap } from "../helpers/colorUtils";
import { assertType } from "../helpers/util";
import { useCallback } from "react";

const Legend = ({
  classOffsetMap,
}: {
  classOffsetMap: Map<number, string>;
}) => {
  const classNames = Array.from(classOffsetMap.values());
  const classOffsets = Array.from(classOffsetMap.keys());

  return (
    <div
      style={{
        display: "flex",
        marginTop: "20px",
        alignItems: "center",
        gap: "5px",
      }}
    >
      Workplace Time Difference:  
      {classNames.map((className, index) => (
        <div
          key={index}
          className={className}
          style={{
            textAlign: "center",
            padding: "8px",
            cursor: "pointer",
            border: "1px solid rgba(185, 185, 185, 0.13)",
            minWidth: "15px",
          }}
        >
          {classOffsets[index]} hours
        </div>
      ))}
    </div>
  );
};

type CalendarContainerProps = {
  homeTimezone: string;
  ranges?: TzDate[];
};

export const CalendarContainer = (props: CalendarContainerProps) => {
  const { ranges, homeTimezone } = props;
  const classOffsetMap = getClassOffsetMap(ranges);
  const colorClasses = defineColorClasses(classOffsetMap, homeTimezone, ranges);
  
  const customClasses = useCallback(
    (day: Moment) => {
      const [className] =
        Object.entries(colorClasses).find(([, descrip]) => {
          if (moment.isMoment(descrip)) {
            return day.isSame(descrip, "day");
          } else if (Array.isArray(descrip) && moment.isMoment(descrip[0])) {
            assertType<Moment[]>(descrip);

            return descrip.some((d) => day.isSame(d, "day"));
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
          onPickDate={(date: Date) => alert(date)}
          customClasses={customClasses}
          firstDayOfWeek={1}
        />
      </div>
      <Legend classOffsetMap={classOffsetMap} />
    </section>
  );
};
