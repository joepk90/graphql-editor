import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { useGetSchema } from 'src/hooks';
import { GraphQLSchema, GraphQLError } from 'graphql';
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
  setValidationErrors: (errors: readonly GraphQLError[]) => void;
  setErrorMessage: (msg: string | null) => void;
  setRemoteUserSchemaValue: (value: string) => void;
  setFullSchemaWithFakeDefs: (scehma: GraphQLSchema) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  setSaveUpdateStatus: (value: string | null) => void;
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const { data, error, isLoading } = useGetSchema();

  // this function is triggered by the schema editor and keeps schemaEditorValue state in sync
  const handleEditorValueChange = (newSchemaEditorValue: string) => {
    setSchemaEditorValue(newSchemaEditorValue);

    const hasUnsavedChanges = checkForUnsavedChanges(newSchemaEditorValue, remoteUserSchemaValue);
    setHasUnsavedChanges(hasUnsavedChanges);
  };

  useEffect(() => {
    if (error) {
      console.error('Error fetching schema:', error);
      setErrorMessage('Error fetching schema');
      return;
    }

    if (!data) return;

    const { userSDL, remoteSDL } = data;

    if (!userSDL) return;

    setRemoteUserSchemaValue(userSDL);

    const builtSchemaWithFakeDefs = buildSchemaWithFakeDefs(userSDL, remoteSDL);

    // extended schema may not be active. if it's not in use, fall back to userSDL
    const originalSchema = remoteSDL ? remoteSDL : userSDL;
    setOriginalSchema(originalSchema);

    setFullSchemaWithFakeDefs(builtSchemaWithFakeDefs);
  }, [data, isLoading]);

  useEffect(() => {
    window.onbeforeunload = () => {
      if (checkForUnsavedChanges(schemaEditorValue, remoteUserSchemaValue))
        return 'You have unsaved changes. Exit?';
    };
  }, [schemaEditorValue, remoteUserSchemaValue]);

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
        setValidationErrors,
        setErrorMessage,
        setRemoteUserSchemaValue,
        setFullSchemaWithFakeDefs,
        setHasUnsavedChanges,
        setSaveUpdateStatus,
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
};
