export type NominatimResponse = {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
};

export type RouteResult = {
  geojson: string;
};

export type Geometry = {
  type: string;
  coordinates: number[][];
};
