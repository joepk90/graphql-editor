import { FC } from 'react';
import { GraphiQL } from 'graphiql';
import { GraphQLSchema } from 'graphql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import 'graphiql/graphiql.css';
import { AppConfig, graphQLEndpoint } from 'src/api';

interface GraphiQLEditorProps {
  schema: GraphQLSchema;
}

export const GraphiQLEditor: FC<GraphiQLEditorProps> = ({ schema }) => {
  const fetcher = createGraphiQLFetcher({ url: `${AppConfig.ApiUrl}/${graphQLEndpoint}` });

  return <GraphiQL schema={schema} fetcher={fetcher} />;
};
