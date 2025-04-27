import { useEffect, useState } from 'react';
import { TabsContainer, SideBar, FakeEditor, GraphiQLEditor, GraphQLVoyager } from 'src/components';
import { getSDL, postSDL } from 'src/api';
import { GraphQLSchema, Source, buildSchema, GraphQLError } from 'graphql';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { buildWithFakeDefinitions } from 'src/graphql';

// TODO move out of this file
// build the schema with just the user schema, or both the user schema and remote schema
export const buildSchemaWithFakeDefs = (userSDL: string, remoteSDL?: string) => {
  if (remoteSDL) {
    return buildWithFakeDefinitions(new Source(remoteSDL), new Source(userSDL));
  } else {
    return buildWithFakeDefinitions(new Source(userSDL));
  }
};

// TODO RENAME userSDL to customSDL
// TODO RENAME remoteSDL to actualSDL

const initialSchema = buildSchema(`
  type Query {
    _empty: String
  }
`);

// TODO setup a Provider to handle a lot of this logic...
export const App = () => {
  // console.log('TypeMap();', fullSchema.getTypeMap());
  const [activeTab, setActiveTab] = useState<number>(0);

  // the full schema will either be a remote schema extended with the users schema, or it could be
  // the  users schema, and is identical to the remote schema, but will be used
  // by the editor for autocompletion/validation
  const [fullSchema, setFullSchema] = useState<GraphQLSchema>(initialSchema);

  // value saved on the server (stored here in memory for comparisons)
  const [remoteSchemaValue, setRemoteSchemaValue] = useState<string | undefined>(undefined);

  // the value of the text in the schema editor
  const [schemaEditorValue, setSchemaEditorValue] = useState<string | undefined>(undefined);

  const [validationErrors, setValidationErrors] = useState<readonly GraphQLError[]>([]);
  const [saveUpdateStatus, setSaveUpdateStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const checkForUnsavedChanges = (schemaEditorValue: string | undefined) => {
    // if the remote schema or full schema have not yet been requested and set,
    // there cannot be any unsaved changes to consider
    if (remoteSchemaValue === undefined || fullSchema === undefined) {
      return false;
    }

    // if the remote schema or full schema have not yet been requested and set,
    if (schemaEditorValue === undefined) {
      return false;
    }

    // if the schema editor value does not match the value of the schema saved on
    // the server, this means there are unsaved changes...
    return schemaEditorValue !== remoteSchemaValue;
  };

  // this function is triggered by the schema editor and keeps schemaEditorValue state in sync
  const handleEditorValueChange = (value: string) => {
    setSchemaEditorValue(value);

    const hasUnsavedChanges = checkForUnsavedChanges(value);
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

        setRemoteSchemaValue(schemaText.userSDL);

        // remote SDL (schema) may be undefined, meaning we only build with the user sdl
        const builtSchemaWithFakeDefs = buildSchemaWithFakeDefs(
          schemaText.userSDL,
          schemaText.remoteSDL,
        );

        setFullSchema(builtSchemaWithFakeDefs);
      } catch (error) {
        setErrorMessage('Error fetching schema');
        console.error('Error fetching schema:', error);
      }
    })();

    window.onbeforeunload = () => {
      if (checkForUnsavedChanges(schemaEditorValue)) return 'You have unsaved changes. Exit?';
    };
  }, []);

  const saveSchema = async (newSchemaEditorValue: string) => {
    // don't allow saving until the fullSchema has not yet loaded,
    // don't allow saving until there is at least a value from the editor
    if (!newSchemaEditorValue || !fullSchema) {
      return;
    }

    // don't allow saving if an error is set
    if (getErrorMessage()) {
      return;
    }

    if (!checkForUnsavedChanges(newSchemaEditorValue)) {
      return;
    }

    const mergedTypeDefs = mergeTypeDefs([newSchemaEditorValue, fullSchema]);

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
      setRemoteSchemaValue(schemaEditorValue);
      setHasUnsavedChanges(false);
    } else {
      const errorMsg = await response.text();
      setErrorMessage(errorMsg);
      return;
    }
  };

  const getErrorMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }

    if (validationErrors && validationErrors.length > 0) {
      return Array.from(validationErrors)[0].toString();
    }
  };

  const setUpdateStatusWithClear = (status: string, delay: number) => {
    setSaveUpdateStatus(status);
    if (!delay) return;
    setTimeout(() => {
      setSaveUpdateStatus(null);
    }, delay);
  };

  const handleOnSaveButtonClick = () => {
    if (!schemaEditorValue) {
      return;
    }

    saveSchema(schemaEditorValue);
  };

  return (
    <div className="faker-editor-container">
      <SideBar
        hasUnsavedChanges={hasUnsavedChanges}
        activeTab={activeTab}
        switchTab={setActiveTab}
      />
      <TabsContainer
        activeTab={activeTab}
        children={[
          <FakeEditor
            key={1}
            handleEditorValueChange={handleEditorValueChange}
            fullSchema={fullSchema}
            initialSchemaEditorValue={remoteSchemaValue}
            setValidationErrors={setValidationErrors}
            setErrorMessage={setErrorMessage}
            errorMessage={getErrorMessage()}
            hasUnsavedChanges={hasUnsavedChanges}
            saveUpdateStatus={saveUpdateStatus}
            handleOnSaveButtonClick={handleOnSaveButtonClick}
            handleEditorOnSaveKeyboardShortcut={saveSchema}
          />,
          <GraphiQLEditor key={2} schema={fullSchema} />,
          <GraphQLVoyager key={3} />,
        ]}
      />
    </div>
  );
};
