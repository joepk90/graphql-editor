import { GraphiQL } from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import 'graphiql/graphiql.css';

import { AppConfig, graphQLEndpoint } from 'src/api';
import { useSchema } from 'src/contexts/SchemaContext';

export const GraphiQLEditor = () => {
  const { fullSchemaWithFakeDefs } = useSchema();
  const fetcher = createGraphiQLFetcher({ url: `${AppConfig.ApiUrl}/${graphQLEndpoint}` });

  return <GraphiQL schema={fullSchemaWithFakeDefs} fetcher={fetcher} />;
};
