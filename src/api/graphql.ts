import { api } from 'src/api/api';
import { voyagerIntrospectionQuery } from 'graphql-voyager';

export const graphQLEndpoint = 'graphql';
const sdlEndpoint = 'user-sdl';

const plainTextHeader = { 'Content-Type': 'text/plain' };
const jsonHeader = { 'Content-Type': 'application/json' };

// export const graphQLFetcher = async (graphQLParams: GraphQLArgs) => {
//   console.log('graphQLParams: ', graphQLParams);
//   // const body = JSON.stringify(graphQLParams);
//   const response = await api.post({
//     path: graphQLEndpoint,
//     body: graphQLParams,
//     headers,
//   });
//   await response.json();
//   // return data;
//   // return await buildClientSchema(data.data);
//   // return await parse(data);
//   // return new GraphQLSchema({ query: null });
// };

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
      credentials: 'omit',
    },
  });
  return await response.json();
};
