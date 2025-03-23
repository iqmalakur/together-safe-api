export type NominatimFeature = {
  properties: {
    name: string;
    display_name: string;
  };
  geometry: {
    coordinates: number[];
  };
};

export type NominatimResponse = {
  features: NominatimFeature[];
};

export type GeolocationResult = {
  name: string;
  fullName: string;
  coordinates: number[];
};
