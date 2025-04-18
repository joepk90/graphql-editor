import { api } from 'src/api/api';

const graphQLEndpoint = '/graphql';
const sdlEndpoint = '/user-sdl';

const plainTextHeader = { 'Content-Type': 'text/plain' };

export const graphQLFetcher = async (graphQLParams) => {
  const body = JSON.stringify(graphQLParams);
  const response = await api.post({ path: graphQLEndpoint, body });
  return await response.json();
};

export const getSDL = async () => {
  return await api.get({ path: sdlEndpoint });
};

export const postSDL = async (sdl: any) => {
  return await api.post({
    path: sdlEndpoint,
    body: sdl,
    headers: plainTextHeader,
  });
};
