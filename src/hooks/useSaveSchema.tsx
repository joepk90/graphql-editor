import { useQueryClient } from '@tanstack/react-query';
import { useSchema } from 'src/contexts/SchemaContext';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { buildSchemaWithFakeDefs, checkForUnsavedChanges } from 'src/utils';
import { usePostSchema } from 'src/hooks';

export const useSaveSchema = () => {
  const {
    originalSchema,
    remoteUserSchemaValue,
    setRemoteUserSchemaValue,
    setFullSchemaWithFakeDefs,
    setHasUnsavedChanges,
    setSaveUpdateStatus,
    setErrorMessage,
  } = useSchema();
  const queryClient = useQueryClient();
  const { mutate: postSchema } = usePostSchema();

  const setUpdateStatusWithClear = (status: string, delay: number) => {
    setSaveUpdateStatus(status);
    if (delay) {
      setTimeout(() => setSaveUpdateStatus(null), delay);
    }
  };

  // newSchemaEditorValue can either be the schemaEditorValue,
  // or it can be the value passed to us via the saveSchema function passed to the editor
  return async (newSchemaEditorValue: string) => {
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

    postSchema(newSchemaEditorValue, {
      onSuccess: () => {
        setRemoteUserSchemaValue(newSchemaEditorValue);
        setFullSchemaWithFakeDefs(newFullSchemaWithFakeDefs);
        setHasUnsavedChanges(false);
        setUpdateStatusWithClear('Saved!', 2000);
        queryClient.invalidateQueries({ queryKey: ['schema'] });
      },
      onError: (err: Error) => {
        setErrorMessage(err.message || 'Failed to save schema');
      },
    });
  };
};
