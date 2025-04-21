import { useEffect, useState } from 'react';
import {
  TabsContainer,
  Navigation,
  FakeEditor,
  GraphiQLEditor,
  GraphQLVoyager,
} from 'src/components';
import { getSDL, postSDL } from 'src/api';
import { GraphQLSchema, Source, buildSchema as buildDefaultSchema } from 'graphql';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { buildWithFakeDefinitions } from 'src/graphql';

// TODO RENAME userSDL to customSDL
// TODO RENAME remoteSDL to actualSDL

const initialSchema = buildDefaultSchema(`
  type Query {
    _empty: String
  }
`);

export const App = () => {
  // const [value, setValue] = useState<GraphQLSchema | null>(initialSchema);
  const [schemaEditorValue, setSchemaEditorValue] = useState<string>('');

  const [activeTab, setActiveTab] = useState<number>(0);
  const [fullSchema, setFullSchema] = useState<GraphQLSchema>(initialSchema);
  // console.log('TypeMap();', fullSchema.getTypeMap());

  // UNUSED CODE - CONSIDER REMOVING OR IMPLEMENTING
  // const [cachedValue, setCachedValue] = useState<string | null>(null);
  // const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // const [unsavedSchema, setUnsavedSchema] = useState<any>(null);
  // const [error, setError] = useState<string | null>(null);
  // const [status, setStatus] = useState<string | null>(null);
  // const [schema, setSchema] = useState<GraphQLSchema>(initialSchema);
  // const [remoteSDL, setRemoteSDL] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getSDL();
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const schemaText = await response.json();

        setSchemaEditorValue(schemaText.userSDL);

        const builtSchemaWithFakeDefs = buildSchemaWithFakeDefs(
          schemaText.userSDL,
          schemaText.remoteSDL,
        );

        setFullSchema(builtSchemaWithFakeDefs);
      } catch (error) {
        console.error('Error fetching schema:', error);
      }
    })();
  }, []);

  const updateSchema = async (newSchema: string) => {
    // console.log('TypeMap();', fullSchema.getTypeMap()); // investigate schema types

    const mergedTypeDefs = mergeTypeDefs([newSchema, fullSchema]);
    makeExecutableSchema({
      typeDefs: mergedTypeDefs,
    });

    try {
      await postSDL(newSchema);
      setSchemaEditorValue(newSchema);
    } catch (error) {
      console.error('Error building schema:', error);
    }
  };

  const buildSchemaWithFakeDefs = (userSDL: string, remoteSDL?: string, options?: any) => {
    if (remoteSDL) {
      return buildWithFakeDefinitions(new Source(remoteSDL), new Source(userSDL), options);
    } else {
      return buildWithFakeDefinitions(new Source(userSDL));
    }
  };

  // UNUSED CODE - CONSIDER REMOVING OR IMPLEMENTING
  // useEffect(() => {
  //   (async () => {
  //     const response = await getSDL();

  //     const sdls = await response.json();
  //     console.log('test', sdls);
  //     updateValue(sdls);
  //   })();

  //   window.onbeforeunload = () => {
  //     if (hasUnsavedChanges) return 'You have unsaved changes. Exit?';
  //   };
  // }, []);

  // const updateValue = async ({ userSDL, remoteSDL: remoteSDL }) => {
  //   setValue(userSDL);
  //   setCachedValue(userSDL);
  //   // setRemoteSDL(remoteSDL);
  //   updateSDL(userSDL, remoteSDL, true);
  // };

  // const updateSDL = (value, remoteSDL = undefined, noError = false) => {
  //   try {
  //     const builtSchema = buildSchema(value, remoteSDL);
  //     setError(null);
  //     setSchema(builtSchema);

  //     return true;
  //   } catch (e) {
  //     if (noError) return;
  //     setError(e.message);
  //     return false;
  //   }
  // };

  // const onEdit = (val) => {
  //   if (error) updateSDL(val);
  //   let unsavedSchema = null as GraphQLSchema | null;
  //   try {
  //     unsavedSchema = buildSchema(val, { skipValidation: true });
  //   } catch (_) {
  //     // FIXME
  //   }

  //   setValue(val);
  //   setHasUnsavedChanges(val !== cachedValue);
  //   setUnsavedSchema(unsavedSchema);
  // };

  // const setStatusWithClear = (status, delay) => {
  //   setStatus(status);
  //   if (!delay) return;
  //   setTimeout(() => {
  //     setStatus(null);
  //   }, delay);
  // };

  // const saveUserSDL = async () => {
  //   if (!hasUnsavedChanges) return;

  //   if (!updateSDL(value)) return;

  //   const response = await postSDL(value);
  //   if (response.ok) {
  //     setStatusWithClear('Saved!', 2000);
  //     setCachedValue(value);
  //     setHasUnsavedChanges(false);
  //     setUnsavedSchema(null);
  //     setError(null);
  //     return;
  //   }
  //   const errorMsg = await response.text();
  //   setError(errorMsg);
  //   return;
  // };

  return (
    <div className="faker-editor-container">
      <Navigation
        // hasUnsavedChanges={hasUnsavedChanges}
        hasUnsavedChanges={false}
        activeTab={activeTab}
        switchTab={setActiveTab}
      />
      <TabsContainer
        activeTab={activeTab}
        children={[
          <FakeEditor
            key={1}
            fullSchema={fullSchema}
            schemaEditorValue={schemaEditorValue}
            setSchemaEditorValue={setSchemaEditorValue}
            updateSchema={updateSchema}
          />,
          <GraphiQLEditor key={2} schema={fullSchema} />,
          <GraphQLVoyager key={3} />,
        ]}
      />
    </div>
  );
};
