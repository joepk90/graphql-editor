import { postSDL } from 'src/api';
import { GraphQLSchema } from 'graphql';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { buildSchemaWithFakeDefs, checkForUnsavedChanges } from 'src/utils';

export const useSaveSchema = ({
  originalSchema,
  remoteUserSchemaValue,
  setRemoteUserSchemaValue,
  setFullSchemaWithFakeDefs,
  setHasUnsavedChanges,
  setSaveUpdateStatus,
  setErrorMessage,
}: {
  originalSchema: string;
  remoteUserSchemaValue: string | undefined;
  setRemoteUserSchemaValue: (s: string) => void;
  setFullSchemaWithFakeDefs: (s: GraphQLSchema) => void;
  setHasUnsavedChanges: (b: boolean) => void;
  setSaveUpdateStatus: (s: string | null) => void;
  setErrorMessage: (m: string | null) => void;
}) => {
  const setUpdateStatusWithClear = (status: string, delay: number) => {
    setSaveUpdateStatus(status);
    if (delay) {
      setTimeout(() => setSaveUpdateStatus(null), delay);
    }
  };

  // newSchemaEditorValue can either be the schemaEditorValue,
  // or it can be the value passed to us via the saveSchema function passed to the editor
  const saveSchema = async (newSchemaEditorValue: string) => {
    //   // don't allow saving until the fullSchemaWithFakeDefs has not yet loaded,
    //   // don't allow saving until there is at least a value from the editor

    if (!newSchemaEditorValue || !originalSchema) return;

    const hasUnsavedChanges = checkForUnsavedChanges(newSchemaEditorValue, remoteUserSchemaValue);
    if (!hasUnsavedChanges) return;

    const newFullSchemaWithFakeDefs = buildSchemaWithFakeDefs(newSchemaEditorValue, originalSchema);
    const mergedTypeDefs = mergeTypeDefs([newSchemaEditorValue, newFullSchemaWithFakeDefs]);

    try {
      makeExecutableSchema({ typeDefs: mergedTypeDefs });
    } catch (err) {
      console.error('Invalid schema:', err);
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

  return { saveSchema };
};
