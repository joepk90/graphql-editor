import { GraphQLSchema, printSchema } from 'graphql';

interface Props {
  schema: GraphQLSchema;
}

export function Explorer({ schema }: Props) {
  return <pre className="whitespace-pre-wrap">{printSchema(schema) || 'No schema provided.'}</pre>;
}
