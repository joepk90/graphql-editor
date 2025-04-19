import { useEffect, useState } from 'react';
import { TabsContainer, Navigation, FakeEditor, GraphiQLEditor } from 'src/components';
import { getSDL, postSDL, graphQLFetcher } from 'src/api';
import { GraphQLSchema, Source, buildSchema as buildDefaultSchema, printSchema } from 'graphql';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Voyager } from 'graphql-voyager';

// import { buildWithFakeDefinitions } from 'src/fake_definition';

const initialSchema = buildDefaultSchema(`
  type Query {
    _empty: String
  }
`);

export const App = () => {
  console.log('initialSchema', initialSchema);
  // const [value, setValue] = useState<GraphQLSchema | null>(initialSchema);
  // const [cachedValue, setCachedValue] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [fullSchema, setFullSchema] = useState<GraphQLSchema>(initialSchema);
  const [schemaEditorValue, setSchemaEditorValue] = useState<string>('');
  // const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // const [unsavedSchema, setUnsavedSchema] = useState<any>(null);
  // const [error, setError] = useState<string | null>(null);
  // const [status, setStatus] = useState<string | null>(null);
  // const [schema, setSchema] = useState<GraphQLSchema>(initialSchema);
  // const [remoteSDL, setRemoteSDL] = useState<string | null>(null);

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

  // const buildSchema = (userSDL, remoteSDL?, options?) => {
  //   if (remoteSDL) {
  //     return buildWithFakeDefinitions(new Source(remoteSDL), new Source(userSDL), options);
  //   } else {
  //     return buildWithFakeDefinitions(new Source(userSDL));
  //   }
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

  // console.log('value', value);
  // console.log('schema', schema);
  // if (value == null || schema == null) {
  //   return <div className="faker-editor-container">Loading...</div>;
  // }

  useEffect(() => {
    (async () => {
      try {
        const response = await getSDL();
        console.log('response', response);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const schemaText = await response.json();
        const source = new Source(schemaText.userSDL);

        const newGraphQLSchema = buildDefaultSchema(source);
        setSchemaEditorValue(printSchema(newGraphQLSchema));

        // Merge the type definitions
        const mergedTypeDefs = mergeTypeDefs([schemaText.userSDL, schemaText.remoteSDL]);

        // Build an executable schema
        const schema: GraphQLSchema = makeExecutableSchema({
          typeDefs: mergedTypeDefs,
        });

        setFullSchema(schema);
      } catch (error) {
        console.error('Error fetching schema:', error);
      }
    })();
  }, []);

  const updateSchema = async (newSchema: string) => {
    // validate new Schema
    const source = new Source(newSchema);
    const newGraphQLSchema = buildDefaultSchema(source);

    try {
      const sdlString = printSchema(newGraphQLSchema);
      const response = await postSDL(sdlString);
      console.log('response', response);
    } catch (error) {
      console.error('Error building schema:', error);
    }
  };

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
            setSchemaEditorValue={updateSchema}
          />,
          <GraphiQLEditor key={2} schema={fullSchema} />,
          <Voyager
            key={3}
            // @ts-ignore
            introspection={graphQLFetcher}
            // hideSettings={}
            workerURI="/voyager.worker.js"
          />,
        ]}
      />
    </div>
  );
};
