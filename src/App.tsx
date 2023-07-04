import { useMemo, useState } from "react";
import moment from "moment";
import styled from "@emotion/styled";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { AppBar, Box, Button, Tooltip } from "@mui/material";
import { PlaceType, Timezone } from "./types";
import { getTimeZoneInfoFromLocation } from "./api";
import { CalendarContainer } from "./components/CalendarContainer";
import { findRanges } from "./helpers/findRanges";
import { LocationSelector } from "./components/LocationSelector";
import { pluralize } from "./helpers/util";

const AppContainer = styled.div`
  background-image: url("https://www.transparenttextures.com/patterns/black-thread-light.png");
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const App = () => {
  const [homeCity, setHomeCity] = useState<PlaceType | null>(null);
  const [workCity, setWorkCity] = useState<PlaceType | null>(null);
  const [homeTimeZone, setHomeTimeZone] = useState<Timezone | null>(null);
  const [workTimeZone, setWorkTimeZone] = useState<Timezone | null>(null);

  const reverseTimeZones = () => {
    setHomeCity(workCity);
    setWorkCity(homeCity);
    setHomeTimeZone(workTimeZone);
    setWorkTimeZone(homeTimeZone);
  };

  const ranges = useMemo(() => {
    if (homeTimeZone && workTimeZone) {
      return findRanges(workTimeZone, homeTimeZone);
    }
    return undefined;
  }, [homeTimeZone, workTimeZone]);

  const selectCity =
    (category: "WORK" | "HOME") => (location: PlaceType | null) => {
      category === "HOME" ? setHomeCity(location) : setWorkCity(location);
    };
  const handleLocation =
    (category: "WORK" | "HOME") =>
    async (coords: { lat: number; long: number }) => {
      const response = await getTimeZoneInfoFromLocation(coords);
      category === "HOME"
        ? setHomeTimeZone(response.body)
        : setWorkTimeZone(response.body);
    };

  const selectorStyle = {
    width: 500,
    backgroundColor: "white",
  };

  return (
    <>
      <AppBar
        position="absolute"
        sx={{ mb: 2, top: 0 }}
        color="transparent"
        elevation={0}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            fontFamily: "courier",
          }}
        >
          timezone calculator
          <Box>
            made with ♥️ by <a href="https://github.com/dpletzke">dpletzke</a>
          </Box>
        </Box>
      </AppBar>
      <AppContainer>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          marginY={3}
          sx={{ marginTop: 10, maxWidth: "90vw" }}
        >
          <LocationSelector
            city={homeCity}
            selectCity={selectCity("HOME")}
            categories={["locality", "administrative_area_level_3"]}
            handleLocation={handleLocation("HOME")}
            placeholderText="City to live in"
            customProps={{ sx: selectorStyle }}
          />
          <Tooltip title="Swap cities">
            <span>
              <Button
                onClick={reverseTimeZones}
                disabled={!homeCity || !workCity}
                color="info"
              >
                <SwapHorizIcon />
              </Button>
            </span>
          </Tooltip>
          <LocationSelector
            city={workCity}
            selectCity={selectCity("WORK")}
            categories={["locality", "administrative_area_level_3"]}
            handleLocation={handleLocation("WORK")}
            placeholderText="City where your work is based"
            customProps={{ sx: selectorStyle }}
          />
        </Box>
        {ranges && (
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
                  homeTimeZone?.timeZone &&
                  moment
                    .tz(range.start, homeTimeZone.timeZone)
                    .format("On MMMM Do \\at ha z")}{" "}
                it changes to {pluralize(range.offset, "hour")}
              </div>
            ))}
          </Box>
        )}
        {ranges && homeTimeZone?.timeZone && (
          <CalendarContainer
            ranges={ranges}
            homeTimezone={homeTimeZone?.timeZone}
          ></CalendarContainer>
        )}
      </AppContainer>
    </>
  );
};

export default App;
