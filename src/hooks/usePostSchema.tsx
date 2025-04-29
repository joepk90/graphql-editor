import { useMutation } from '@tanstack/react-query';
import { postSDL } from 'src/api';

export const usePostSchema = () => {
  return useMutation({
    mutationFn: (sdl: string) => postSDL(sdl),
  });
};
