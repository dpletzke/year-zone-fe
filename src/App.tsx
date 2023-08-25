import { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { AppBar, Box, Button, Skeleton, Tooltip } from "@mui/material";
import { PlaceType, Timezone } from "./types";
import { getTimeZoneInfoFromLocation } from "./api";
import { CalendarContainer } from "./components/CalendarContainer";
import { findRanges } from "./helpers/findRanges";
import { LocationSelector } from "./components/LocationSelector";

const AppContainer = styled.div`
  background-image: url("https://www.transparenttextures.com/patterns/black-thread-light.png");
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const INITIAL_STATUS = "INITIAL_STATUS";
const LOADING = "LOADING";
// const ERROR = "ERROR";
const DISPLAY = "DISPLAY";

const App = () => {
  const [homeCity, setHomeCity] = useState<PlaceType | null>(null);
  const [workCity, setWorkCity] = useState<PlaceType | null>(null);
  const [homeTimeZone, setHomeTimeZone] = useState<Timezone | null>(null);
  const [workTimeZone, setWorkTimeZone] = useState<Timezone | null>(null);
  const [status, setStatus] = useState(INITIAL_STATUS);

  useEffect(() => {
    if (homeCity && workCity) {
      setStatus(LOADING);
    }
  }, [homeCity, workCity]);

  useEffect(() => {
    if (homeTimeZone && workTimeZone) {
      setStatus(DISPLAY);
    }
  }, [homeTimeZone, workTimeZone]);

  const reverseTimeZones = () => {
    setHomeCity(workCity);
    setWorkCity(homeCity);
    setHomeTimeZone(workTimeZone);
    setWorkTimeZone(homeTimeZone);
  };

  let ranges = useMemo(() => {
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
            alignItems: "center",
            p: 2,
            fontFamily: "courier",
          }}
        >
          {ranges && <span>time difference calculator</span>}
          <Box sx={{ marginLeft: "auto" }}>
            made with ♥️ by <a href="https://github.com/dpletzke">dpletzke</a>
          </Box>
        </Box>
      </AppBar>
      <AppContainer>
        {status === INITIAL_STATUS && (
          <Box sx={{ fontFamily: "courier", fontSize: "2em" }}>
            🌍 time difference calculator 🗓️
          </Box>
        )}
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
            placeholderText="City where you are calling"
            customProps={{ sx: selectorStyle }}
          />
        </Box>
        {status === DISPLAY && homeTimeZone && (
          <CalendarContainer
            ranges={ranges}
            homeTimezone={homeTimeZone?.timeZone}
          />
        )}
        {status === LOADING && (
          <>
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={1272}
              height={430}
            />
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={600}
              height={37}
              sx={{ mt: "20px" }}
            />
          </>
        )}
      </AppContainer>
    </>
  );
};

export default App;
