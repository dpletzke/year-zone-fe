import { useState, useEffect, useRef, useMemo } from "react";
import * as React from "react";
import { Loader } from "@googlemaps/js-api-loader";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";
import { loadScript } from "../helpers/util";
import { PlaceType } from "../types";

const RenderOption = (props: { [key: string]: any; option: PlaceType }) => {
  const { option, ...restProps } = props;
  const matches = option.structured_formatting.main_text_matched_substrings;
  const parts = parse(
    option.structured_formatting.main_text,
    matches.map((match: any) => [match.offset, match.offset + match.length])
  );

  return (
    <li {...restProps}>
      <Grid container alignItems="center">
        <Grid item>
          <Box
            component={LocationOnIcon}
            sx={{ color: "text.secondary", mr: 2 }}
          />
        </Grid>
        <Grid item xs>
          {parts.map((part, index) => (
            <span
              key={index}
              style={{
                fontWeight: part.highlight ? 700 : 400,
              }}
            >
              {part.text}
            </span>
          ))}
          <Typography variant="body2" color="text.secondary">
            {option.structured_formatting.secondary_text}
          </Typography>
        </Grid>
      </Grid>
    </li>
  );
};

type LocationSelectorProps = {
  selectCity: (city: PlaceType | null) => void;
  handleLocation: (location: { lat: number; long: number }) => any;
  city: PlaceType | null;
  categories?: string[];
  customProps?: { [key: string]: any };
  placeholderText?: string;
};

export const LocationSelector = (props: LocationSelectorProps) => {
  const {
    selectCity,
    city,
    categories,
    handleLocation,
    placeholderText,
    customProps,
  } = props;
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<readonly PlaceType[]>([]);
  const loaded = useRef(false);
  const autocompleteServiceRef =
    useRef<null | google.maps.places.AutocompleteService>(null);
  const placesServiceRef = useRef<null | google.maps.places.PlacesService>(
    null
  );

  if (typeof window !== "undefined" && !loaded.current) {
    if (!document.querySelector("#google-maps")) {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
      });
      loader.importLibrary("places");
    }
    loaded.current = true;
  }

  const reqPlacePrediction = (
    request: google.maps.places.AutocompletionRequest,
    callback: (
      results: google.maps.places.AutocompletePrediction[] | null,
      status: google.maps.places.PlacesServiceStatus
    ) => any
  ) => autocompleteServiceRef.current?.getPlacePredictions(request, callback);

  const fetchPlacePredictions = useMemo(
    () => throttle(reqPlacePrediction, 200),
    []
  );

  const fetchPlaceDetails = useMemo(
    () =>
      (
        request: google.maps.places.PlaceDetailsRequest,
        callback: (
          result: google.maps.places.PlaceResult | null,
          status: google.maps.places.PlacesServiceStatus
        ) => any
      ) =>
        placesServiceRef.current?.getDetails(request, callback),
    []
  );

  useEffect(() => {
    let active = true;

    if (!autocompleteServiceRef.current && google.maps.places) {
      autocompleteServiceRef.current =
        new google.maps.places.AutocompleteService();
    }
    if (!autocompleteServiceRef.current) {
      return undefined;
    }
    const divElement = document.getElementById(
      "google-places"
    ) as HTMLDivElement;
    if (!placesServiceRef.current && google.maps.places) {
      placesServiceRef.current = new google.maps.places.PlacesService(
        divElement
      );
    }
    if (!placesServiceRef.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions(city ? [city] : []);
      return undefined;
    }

    fetchPlacePredictions(
      {
        input: inputValue,
        types: categories,
      },
      (results: null | google.maps.places.AutocompletePrediction[]) => {
        if (active) {
          let newOptions: readonly PlaceType[] = [];

          if (city) {
            newOptions = [city];
          }

          if (results) {
            newOptions = [...newOptions, ...results];
          }

          setOptions(newOptions);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [city, inputValue, categories, fetchPlacePredictions]);

  const onChange = (event: any, newCity: PlaceType | null) => {
    setOptions(newCity ? [newCity, ...options] : options);
    selectCity(newCity);
    if (newCity) {
      fetchPlaceDetails(
        { placeId: newCity.place_id, fields: ["geometry.location"] },
        (result) => {
          if (!result?.geometry?.location) {
            return;
          }
          handleLocation({
            lat: result.geometry.location.lat(),
            long: result.geometry.location.lng(),
          });
        }
      );
    }
  };

  const onInputChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string
  ) => {
    setInputValue(newValue);
  };

  const renderInput = (params: any) => (
    <TextField {...params} label={placeholderText} fullWidth />
  );

  const getOptionLabel = (option: PlaceType) =>
    typeof option === "string" ? option : option.description;

  return (
    <Autocomplete
      id="google-places"
      sx={{ width: 500 }}
      getOptionLabel={getOptionLabel}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={city}
      onChange={onChange}
      onInputChange={onInputChange}
      renderInput={renderInput}
      renderOption={(props, option) => (
        <RenderOption {...{ ...props, option }} />
      )}
      {...customProps}
    />
  );
};
