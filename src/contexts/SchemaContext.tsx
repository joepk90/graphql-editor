import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSDL } from 'src/api';
import { GraphQLSchema, GraphQLError } from 'graphql';
import { useSaveSchema } from 'src/hooks';
import {
  getErrorMessage,
  checkForUnsavedChanges,
  initialSchema,
  buildSchemaWithFakeDefs,
} from 'src/utils';

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

  const { saveSchema } = useSaveSchema({
    originalSchema,
    remoteUserSchemaValue,
    setRemoteUserSchemaValue,
    setFullSchemaWithFakeDefs,
    setHasUnsavedChanges,
    setSaveUpdateStatus,
    setErrorMessage,
  });

  // this function is triggered by the schema editor and keeps schemaEditorValue state in sync
  const handleEditorValueChange = (newSchemaEditorValue: string) => {
    setSchemaEditorValue(newSchemaEditorValue);

    const hasUnsavedChanges = checkForUnsavedChanges(newSchemaEditorValue, remoteUserSchemaValue);
    setHasUnsavedChanges(hasUnsavedChanges);
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
      if (checkForUnsavedChanges(schemaEditorValue, remoteUserSchemaValue))
        return 'You have unsaved changes. Exit?';
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
        errorMessage: getErrorMessage(errorMessage, validationErrors),
        hasUnsavedChanges,
        saveUpdateStatus,
        handleEditorValueChange,
        saveSchema,
        setValidationErrors,
        setErrorMessage,
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
};
