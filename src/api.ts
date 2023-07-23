import { Timezone } from "./types";

type configArgs = {
  url: string;
  payload?: { [key: string]: any };
  accessToken?: string;
  params?: { [key: string]: any };
};
const hostUrl = process.env.REACT_APP_API_HOST || "http://localhost:3007";

export const sendReq = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  { url = "", payload, accessToken = "", params = {} }: configArgs
): Promise<{ code: number; body: T }> => {
  // eslint-disable-next-line @typescript-eslint/no-redeclare
  const urlInst = new URL(url);

  const config: { [key: string]: any } = {
    method, // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  };

  if (method !== "GET" && payload) {
    config.body = JSON.stringify(payload); // body data type must match "Content-Type" header
  }
  // console.log(url, params, payload);
  if (params) {
    Object.keys(params).forEach((key) => {
      const value = params[key];
      urlInst.searchParams.append(key, JSON.stringify(value));
    });
  }

  if (accessToken.length > 0) {
    config.headers.Authorization = "Bearer " + accessToken; // body data type must match "Content-Type" header
  }
  const response = await fetch(urlInst.toString(), config);
  return response
    .json()
    .then((data) => ({ code: response.status, body: data }));
};

export const getTimeZoneInfo = async (zones: string[]) => {
  return sendReq<Timezone[]>("GET", {
    url: `${hostUrl}/timezones`,
    params: {
      zones,
    },
  });
};

export const getTimeZoneInfoFromLocation = async ({
  lat,
  long,
}: {
  lat: number;
  long: number;
}) => {
  return sendReq<Timezone>("GET", {
    url: `${hostUrl}/timezone-from-location`,
    params: {
      lat,
      long,
    },
  });
};

export const getTimeZones = async () => {
  return sendReq<string[]>("GET", {
    url: `${hostUrl}/timezone-names`,
  });
};
