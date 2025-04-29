import { useQuery } from '@tanstack/react-query';
import { getSDL, SDLResponse } from 'src/api';

export const useGetSchema = () => {
  return useQuery<SDLResponse>({
    queryKey: ['schema'],
    queryFn: getSDL,
  });
};
