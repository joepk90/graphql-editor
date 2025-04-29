import { voyagerIntrospectionQuery } from 'graphql-voyager';
import { api, graphQLEndpoint } from 'src/api';
import { jsonHeader } from 'src/utils';

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
