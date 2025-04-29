import { useQuery } from '@tanstack/react-query';
import { api, sdlEndpoint } from 'src/api';

export type SDLResponse = {
  userSDL: string;
  remoteSDL?: string;
};

export const getSDL = async (): Promise<SDLResponse> => {
  const response = await api.get({ path: sdlEndpoint });
  return response.json();
};

export const useGetSchema = () => {
  return useQuery<SDLResponse>({
    queryKey: ['schema'],
    queryFn: getSDL,
  });
};
