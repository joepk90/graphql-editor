import { useMutation } from '@tanstack/react-query';
import { sdlEndpoint, api } from 'src/api';
import { plainTextHeader } from 'src/utils';

export const postSDL = async (sdl: string) => {
  return await api.post({
    path: sdlEndpoint,
    body: sdl,
    headers: plainTextHeader,
  });
};

export const usePostSchema = () => {
  return useMutation({
    mutationFn: (sdl: string) => postSDL(sdl),
  });
};
