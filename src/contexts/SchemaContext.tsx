import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSDL, postSDL } from 'src/api';
import { buildWithFakeDefinitions } from 'src/graphql';
import { GraphQLSchema, Source, buildSchema, GraphQLError } from 'graphql';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

const initialSchema = buildSchema(`
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

interface SchemaContextProps {
  originalSchema: string;
  fullSchemaWithFakeDefs: GraphQLSchema;
  remoteUserSchemaValue?: string;
  schemaEditorValue?: string;
  validationErrors: readonly GraphQLError[];
  errorMessage: string | null;
  hasUnsavedChanges: boolean;
  saveUpdateStatus: string | null;
  handleEditorValueChange: (value: string) => void;
  handleOnSaveButtonClick: () => void;
  saveSchema: (value: string) => Promise<void>;
  setValidationErrors: (errors: readonly GraphQLError[]) => void;
  setErrorMessage: (msg: string | null) => void;
}

const SchemaContext = createContext<SchemaContextProps | undefined>(undefined);

export const useSchema = () => {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  return context;
};

// TODO RENAME userSDL to customSDL
// TODO RENAME remoteSDL to actualSDL

export const SchemaProvider = ({ children }: { children: ReactNode }) => {
  // original schema is used to rebuild the fullSchemaWithFakeDefs on save
  const [originalSchema, setOriginalSchema] = useState('');

  // the full schema will either be a remote schema extended with the users schema, or it could be
  // the  users schema, and is identical to the remote schema, but will be used
  // by the editor for autocompletion/validation
  // helper: console.log('TypeMap();', fullSchemaWithFakeDefs.getTypeMap());
  const [fullSchemaWithFakeDefs, setFullSchemaWithFakeDefs] =
    useState<GraphQLSchema>(initialSchema);

  // value saved on the server (stored here in memory for comparisons)
  const [remoteUserSchemaValue, setRemoteUserSchemaValue] = useState<string>();

  // the value of the text in the schema editor
  const [schemaEditorValue, setSchemaEditorValue] = useState<string>();
  const [validationErrors, setValidationErrors] = useState<readonly GraphQLError[]>([]);
  const [saveUpdateStatus, setSaveUpdateStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const checkForUnsavedChanges = (schemaEditorValue: string | undefined) => {
    // if the remote schema or full schema have not yet been requested and set,
    // there cannot be any unsaved changes to consider
    if (remoteUserSchemaValue === undefined || fullSchemaWithFakeDefs === undefined) {
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

  // this function is triggered by the schema editor and keeps schemaEditorValue state in sync
  const handleEditorValueChange = (value: string) => {
    setSchemaEditorValue(value);

    const hasUnsavedChanges = checkForUnsavedChanges(value);
    setHasUnsavedChanges(hasUnsavedChanges);
  };

  const getErrorMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }

    if (validationErrors && validationErrors.length > 0) {
      return Array.from(validationErrors)[0].toString();
    }

    return null;
  };

  const setUpdateStatusWithClear = (status: string, delay: number) => {
    setSaveUpdateStatus(status);
    if (delay) {
      setTimeout(() => setSaveUpdateStatus(null), delay);
    }
  };

  // newSchemaEditorValue can either be the schemaEditorValue,
  // or it can be the value passed to us via the saveSchema function passed to the editor
  const saveSchema = async (newSchemaEditorValue: string) => {
    // don't allow saving until the fullSchemaWithFakeDefs has not yet loaded,
    // don't allow saving until there is at least a value from the editor
    if (!newSchemaEditorValue || !originalSchema) {
      return;
    }

    // don't allow saving if an error is set
    if (getErrorMessage()) {
      return;
    }

    if (!checkForUnsavedChanges(newSchemaEditorValue)) {
      return;
    }

    const newFullSchemaWithFakeDefs = buildSchemaWithFakeDefs(newSchemaEditorValue, originalSchema);
    const mergedTypeDefs = mergeTypeDefs([newSchemaEditorValue, newFullSchemaWithFakeDefs]);

    try {
      // validation
      makeExecutableSchema({
        typeDefs: mergedTypeDefs,
      });
    } catch (error) {
      console.error('Error building schema:', error);
      setErrorMessage('Error building schema');
      return;
    }

    let response: Response;

    try {
      response = await postSDL(newSchemaEditorValue);
    } catch (error) {
      console.error('Error posting schema:', error);
      return;
    }

    if (response.ok) {
      setUpdateStatusWithClear('Saved!', 2000);
      setRemoteUserSchemaValue(newSchemaEditorValue);
      setHasUnsavedChanges(false);
      setFullSchemaWithFakeDefs(newFullSchemaWithFakeDefs);
    } else {
      const errorMsg = await response.text();
      setErrorMessage(errorMsg);
      return;
    }
  };

  const handleOnSaveButtonClick = () => {
    if (schemaEditorValue) saveSchema(schemaEditorValue);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await getSDL();
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const schemaText = await response.json();

        setRemoteUserSchemaValue(schemaText.userSDL);

        // remote SDL (schema) may be undefined, meaning we only build with the user sdl
        const builtSchemaWithFakeDefs = buildSchemaWithFakeDefs(
          schemaText.userSDL,
          schemaText.remoteSDL,
        );

        setOriginalSchema(schemaText.remoteSDL);
        setFullSchemaWithFakeDefs(builtSchemaWithFakeDefs);
      } catch (error) {
        setErrorMessage('Error fetching schema');
        console.error('Error fetching schema:', error);
      }
    })();

    window.onbeforeunload = () => {
      if (checkForUnsavedChanges(schemaEditorValue)) return 'You have unsaved changes. Exit?';
    };
  }, []);

  return (
    <SchemaContext.Provider
      value={{
        originalSchema,
        fullSchemaWithFakeDefs,
        remoteUserSchemaValue,
        schemaEditorValue,
        validationErrors,
        errorMessage: getErrorMessage(),
        hasUnsavedChanges,
        saveUpdateStatus,
        handleEditorValueChange,
        handleOnSaveButtonClick,
        saveSchema,
        setValidationErrors,
        setErrorMessage,
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
};
