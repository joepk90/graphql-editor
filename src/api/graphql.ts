import { api } from 'src/api/api';
import { GraphQLArgs } from 'graphql';

const graphQLEndpoint = 'graphql';
const sdlEndpoint = 'user-sdl';

const plainTextHeader = { 'Content-Type': 'text/plain' };
const headers = {
  'Content-Type': 'application/json',
  authorization: 'Bearer XXX',
};

export const graphQLFetcher = async (graphQLParams: GraphQLArgs) => {
  // const body = JSON.stringify(graphQLParams);
  const response = await api.post({
    path: graphQLEndpoint,
    body: graphQLParams,
    headers,
  });
  const data = await response.json();
  console.log('data: ', data);
  return data;
  // return await buildClientSchema(data.data);
  // return await parse(data);
  // return new GraphQLSchema({ query: null });
};

export const getSDL = async () => {
  return await api.get({ path: sdlEndpoint });
};

export const postSDL = async (sdl: string) => {
  return await api.post({
    path: sdlEndpoint,
    body: sdl,
    headers: plainTextHeader,
  });
};
