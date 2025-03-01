import axios, { AxiosResponse } from 'axios';

export const getLocationName = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  const response: AxiosResponse<{ display_name: string }> = await axios.get(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
  );

  return response.data.display_name;
};
