import { Moment } from "moment-timezone";

export interface MainTextMatchedSubstrings {
  offset: number;
  length: number;
}
export interface StructuredFormatting {
  main_text: string;
  secondary_text: string;
  main_text_matched_substrings: readonly MainTextMatchedSubstrings[];
}
export interface PlaceType {
  description: string;
  structured_formatting: StructuredFormatting;
  place_id: string;
}

export type Timezone = {
  timeZone: string;
  currentLocalTime: string;
  currentUtcOffset: {
    seconds: number;
    milliseconds: number;
    ticks: number;
    nanoseconds: number;
  };
  dstInterval: null | {
    dstEnd: string;
    dstName: string;
    dstOffsetToStandardTime: {
      seconds: number;
      milliseconds: number;
      ticks: number;
      nanoseconds: number;
    };
    dstOffsetToUtc: {
      seconds: number;
      milliseconds: number;
      ticks: number;
      nanoseconds: number;
    };
    dstStart: string;
  };
  hasDayLightSaving: boolean;
  isDayLightSavingActive: boolean;
  standardUtcOffset: {
    seconds: number;
    milliseconds: number;
    ticks: number;
    nanoseconds: number;
  };
};

export type TzDate = {
  start?: Moment;
  offset: number;
};
