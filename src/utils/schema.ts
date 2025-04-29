import { Source, buildSchema, GraphQLError } from 'graphql';
import { buildWithFakeDefinitions } from 'src/graphql';

export const initialSchema = buildSchema(`
    type Query {
      _empty: String
    }
  `);

// build the schema with just the user schema, or both the user schema and remote schema
export const buildSchemaWithFakeDefs = (userSDL: string, remoteSDL?: string) => {
  return remoteSDL
    ? buildWithFakeDefinitions(new Source(remoteSDL), new Source(userSDL))
    : buildWithFakeDefinitions(new Source(userSDL));
};

export const getErrorMessage = (
  errorMessage: string | null,
  validationErrors: readonly GraphQLError[],
): string | null => {
  return errorMessage ?? validationErrors[0]?.toString() ?? null;
};

export const checkForUnsavedChanges = (
  schemaEditorValue: string | undefined,
  remoteUserSchemaValue: string | undefined,
) => {
  // if the remote schema or full schema have not yet been requested and set,
  // there cannot be any unsaved changes to consider
  if (remoteUserSchemaValue === undefined) {
    return false;
  }

  // if the remote schema or full schema have not yet been requested and set,
  if (schemaEditorValue === undefined) {
    return false;
  }

  // if the schema editor value does not match the value of the schema saved on
  // the server, this means there are unsaved changes...
  return schemaEditorValue !== remoteUserSchemaValue;
};
