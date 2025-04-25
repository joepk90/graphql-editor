import { useEffect, useState, useMemo, useRef } from 'react';
import {
  TabsContainer,
  Navigation,
  FakeEditor,
  GraphiQLEditor,
  GraphQLVoyager,
} from 'src/components';
import { getSDL, postSDL } from 'src/api';
import { GraphQLSchema, Source, buildSchema as buildDefaultSchema, GraphQLError } from 'graphql';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { EditorView } from '@codemirror/view';

import { buildWithFakeDefinitions } from 'src/graphql';

export const buildSchemaWithFakeDefs = (userSDL: string, remoteSDL?: string) => {
  if (remoteSDL) {
    return buildWithFakeDefinitions(new Source(remoteSDL), new Source(userSDL));
  } else {
    return buildWithFakeDefinitions(new Source(userSDL));
  }
};

// TODO RENAME userSDL to customSDL
// TODO RENAME remoteSDL to actualSDL

const initialSchema = buildDefaultSchema(`
  type Query {
    _empty: String
  }
`);

export const App = () => {
  // console.log('TypeMap();', fullSchema.getTypeMap());
  const [activeTab, setActiveTab] = useState<number>(0);

  const [fullSchema, setFullSchema] = useState<GraphQLSchema>(initialSchema);
  const [remoteSchemaValue, setRemoteSchemaValue] = useState<string | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<readonly GraphQLError[]>([]);
  const [saveUpdateStatus, setSaveUpdateStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // editor state
  const editorRef = useRef<EditorView | null>(null);
  const schemaEditorValue = editorRef.current?.state.doc.toString();
  const handleEditorReady = (view: EditorView) => {
    editorRef.current = view;
  };

  // TODO: not fully working - showing as true during first load
  const checkForUnsavedChanges = useMemo(
    () => (schemaEditorValue: string | undefined, remoteShemaValue: string | undefined) => {
      if (remoteSchemaValue === undefined) {
        return false;
      }

      return schemaEditorValue !== remoteShemaValue;
    },
    [schemaEditorValue, remoteSchemaValue],
  );

  useEffect(() => {
    (async () => {
      try {
        const response = await getSDL();
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const schemaText = await response.json();

        setRemoteSchemaValue(schemaText.userSDL);

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
      if (hasUnsavedChanges) return 'You have unsaved changes. Exit?';
    };
  }, []);

  const saveSchema = async () => {
    // don't allow saving the schema until there is at least a value from the editor
    if (!schemaEditorValue) {
      return;
    }

    const mergedTypeDefs = mergeTypeDefs([schemaEditorValue, fullSchema]);

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
      response = await postSDL(schemaEditorValue);
    } catch (error) {
      console.error('Error posting schema:', error);
      return;
    }

    if (response.ok) {
      setUpdateStatusWithClear('Saved!', 2000);
      setRemoteSchemaValue(schemaEditorValue);
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

    if (validationErrors && validationErrors.length) {
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

  const hasUnsavedChanges = checkForUnsavedChanges(schemaEditorValue, remoteSchemaValue);
  return (
    <div className="faker-editor-container">
      <Navigation
        hasUnsavedChanges={hasUnsavedChanges}
        activeTab={activeTab}
        switchTab={setActiveTab}
      />
      <TabsContainer
        activeTab={activeTab}
        children={[
          <FakeEditor
            key={1}
            onReady={handleEditorReady}
            fullSchema={fullSchema}
            initialSchemaEditorValue={remoteSchemaValue}
            saveSchema={saveSchema}
            setValidationErrors={setValidationErrors}
            errorMessage={getErrorMessage()}
            hasUnsavedChanges={hasUnsavedChanges}
            saveUpdateStatus={saveUpdateStatus}
          />,
          <GraphiQLEditor key={2} schema={fullSchema} />,
          <GraphQLVoyager key={3} />,
        ]}
      />
    </div>
  );
};
