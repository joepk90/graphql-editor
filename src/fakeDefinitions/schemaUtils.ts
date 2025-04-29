// @ts-nocheck
import {
  buildASTSchema,
  DocumentNode,
  extendSchema,
  GraphQLError,
  GraphQLSchema,
  isInterfaceType,
  isObjectType,
  Kind,
  parse,
  Source,
  validate,
  validateSchema,
  ValuesOfCorrectTypeRule,
  printSchema,
} from 'graphql';
// FIXME
import { validateSDL } from 'graphql/validation/validate';

import { fakeDefinitionAST } from 'src/fakeDefinitions';

/**
 * DO NOT CONSIDER/TREAT THIS FILE AT A SOURCE OF TRUTH - IT HAS BEEN COPIED FROM THE BACKEND SERVICE
 */

function defToName(defNode) {
  const { kind, name } = defNode;
  if (name == null) {
    return '';
  }
  return (kind === Kind.DIRECTIVE_DEFINITION ? '@' : '') + name.value;
}

const fakeDefinitionsSet = new Set(fakeDefinitionAST.definitions.map(defToName));

const schemaWithOnlyFakedDefinitions = buildASTSchema(fakeDefinitionAST);
// FIXME: mark it as valid to be able to run `validate`
schemaWithOnlyFakedDefinitions['__validationErrors'] = [];

// this function might be a duplicate or unneccesary - TODO move to util file
function schemaToDocumentNode(schema: GraphQLSchema): DocumentNode {
  const sdlString = printSchema(schema); // Step 1: Convert schema to SDL string
  const documentNode = parse(sdlString); // Step 2: Parse string into DocumentNode
  return documentNode;
}

export function buildWithFakeDefinitions(
  schemaSDL: Source, // remote SDL
  extensionSDL?: Source, // userSDL
): GraphQLSchema {
  const schemaAST = parseSDL(schemaSDL);

  // Remove Faker's own definitions that were added to have valid SDL for other
  // tools, see: https://github.com/graphql-kit/graphql-faker/issues/75
  const filteredAST = {
    ...schemaAST,
    definitions: schemaAST.definitions.filter((def) => {
      const name = defToName(def);
      return name === '' || !fakeDefinitionsSet.has(name);
    }),
  };

  let schema = extendSchemaWithAST(schemaWithOnlyFakedDefinitions, filteredAST);

  const config = schema.toConfig();
  schema = new GraphQLSchema({
    ...config,
    ...(config.astNode ? {} : getDefaultRootTypes(schema)),
  });

  if (extensionSDL != null) {
    schema = extendSchemaWithAST(schema, parseSDL(extensionSDL));

    for (const type of Object.values(schema.getTypeMap())) {
      if (isObjectType(type) || isInterfaceType(type)) {
        for (const field of Object.values(type.getFields())) {
          const isExtensionField = field.astNode?.loc?.source === extensionSDL;
          if (field.extensions) {
            (field.extensions as any)['isExtensionField'] = isExtensionField;
          } else {
            field.extensions = { isExtensionField };
          }
        }
      }
    }
  }

  const errors = validateSchema(schema);
  if (errors.length !== 0) {
    throw new ValidationErrors(errors);
  }

  return schema;
}

function extendSchemaWithAST(
  schema: GraphQLSchema, // remoteSDL
  extensionAST: DocumentNode, // userSDL
): GraphQLSchema {
  // fix: allowing us to override properties of the remote schema
  // using the validateSDL function and passing both the remote Schema and custom schema means
  // we cannot override types on the main schema:
  // const validatedSDL = validateSDL(extensionAST, schema); // THIS IS THE PROBLEM
  // instead we just validate the schema (remove schema), and then later on merge schemas and validate
  // validating the mains schema may already be being done before it is passed to this function - potentially
  // should be completely removed
  const validatedSDL = validateSDL(schemaToDocumentNode(schema)); // THIS IS THE PROBLEM

  const validatedWithFakeDefsErrors = validate(schemaWithOnlyFakedDefinitions, extensionAST, [
    ValuesOfCorrectTypeRule,
  ]);

  const errors = [...validatedSDL, ...validatedWithFakeDefsErrors];
  if (errors.length !== 0) {
    throw new ValidationErrors(errors);
  }

  return extendSchema(schema, extensionAST, {
    assumeValid: true,
    commentDescriptions: true,
  });
}

// FIXME: move to 'graphql-js'
export class ValidationErrors extends Error {
  subErrors: ReadonlyArray<GraphQLError>;

  constructor(errors) {
    const message = errors.map((error) => error.message).join('\n\n');
    super(message);

    this.subErrors = errors;
    this.name = this.constructor.name;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

function getDefaultRootTypes(schema) {
  return {
    query: schema.getType('Query'),
    mutation: schema.getType('Mutation'),
    subscription: schema.getType('Subscription'),
  };
}

function parseSDL(sdl: Source) {
  return parse(sdl, {
    allowLegacySDLEmptyFields: true,
    allowLegacySDLImplementsInterfaces: true,
  });
}
