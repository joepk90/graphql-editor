import { api } from 'src/api/api';
import { GraphQLArgs } from 'graphql';

export const graphQLEndpoint = 'graphql';
const sdlEndpoint = 'user-sdl';

const authToken = 'XXX';
const plainTextHeader = { 'Content-Type': 'text/plain' };
const jsonHeader = { 'Content-Type': 'application/json' };
const authHeader = {
  Authorization: `Bearer ${authToken}`,
};
const headers = {
  ...jsonHeader,
  ...authHeader,
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

export const voyagerIntrospectionQueryRequest = async () => {
  const response = await api.post({
    path: graphQLEndpoint,
    body: JSON.stringify({ query: voyagerIntrospectionQuery }),
    headers: {
      ...jsonHeader,
      ...authHeader,
      credentials: 'omit',
    },
  });
  return await response.json();
};
