import axios, { AxiosResponse } from 'axios';

export const getLocationName = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  const response: AxiosResponse<{ display_name: string }> = await axios.get(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
    {
      headers: {
        'User-Agent': 'TogetherSafe/1.0 (iqmalak21@if.unjani.ac.id)',
      },
    },
  );

  return response.data.display_name;
};
