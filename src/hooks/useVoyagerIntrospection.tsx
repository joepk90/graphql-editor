import { useQuery } from '@tanstack/react-query';
import { voyagerIntrospectionQuery } from 'graphql-voyager';
import { api, graphQLEndpoint } from 'src/api';
import { jsonHeader } from 'src/utils';

const fetchVoyagerIntrospection = async () => {
  const response = await api.post({
    path: graphQLEndpoint,
    body: JSON.stringify({ query: voyagerIntrospectionQuery }),
    headers: {
      ...jsonHeader,
      credentials: 'omit',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Voyager introspection data');
  }

  return response.json();
};

export const useVoyagerIntrospection = () => {
  return useQuery({
    queryKey: ['voyager-introspection'],
    queryFn: fetchVoyagerIntrospection,
    staleTime: 1000 * 60 * 5, // optional: cache for 5 minutes
  });
};

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
