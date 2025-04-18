import { useEffect, useState } from 'react';
import { TabsContainer } from './TabsContainer';
import { Navigation } from './Navigation';
import { getSDL, postSDL } from 'src/api/graphql';
import { GraphQLSchema, Source } from 'graphql';

import { buildWithFakeDefinitions } from 'src/fake_definition';

const FakeEditor = () => {
  const [value, setValue] = useState<string | null>(null);
  const [cachedValue, setCachedValue] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [unsavedSchema, setUnsavedSchema] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);
  const [remoteSDL, setRemoteSDL] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const response = await getSDL();
      const sdls = await response.json();
      updateValue(sdls);
    })();

    window.onbeforeunload = () => {
      if (hasUnsavedChanges) return 'You have unsaved changes. Exit?';
    };
  }, []);

  const updateValue = ({ userSDL, remoteSDL }) => {
    setValue(userSDL);
    setCachedValue(userSDL);
    setRemoteSDL(remoteSDL);
    updateSDL(userSDL, true);
  };

  const buildSchema = (userSDL, options?) => {
    if (remoteSDL) {
      return buildWithFakeDefinitions(new Source(remoteSDL), new Source(userSDL), options);
    } else {
      return buildWithFakeDefinitions(new Source(userSDL), options);
    }
  };

  const updateSDL = (value, noError = false) => {
    try {
      const schema = buildSchema(value);
      setError(null);
      setSchema(schema);

      return true;
    } catch (e) {
      if (noError) return;
      setError(e.message);
      return false;
    }
  };

  const onEdit = (val) => {
    if (error) updateSDL(val);
    let unsavedSchema = null as GraphQLSchema | null;
    try {
      unsavedSchema = buildSchema(val, { skipValidation: true });
    } catch (_) {
      // FIXME
    }

    setValue(val);
    setHasUnsavedChanges(val !== cachedValue);
    setUnsavedSchema(unsavedSchema);
  };

  const setStatusWithClear = (status, delay) => {
    setStatus(status);
    if (!delay) return;
    setTimeout(() => {
      setStatus(null);
    }, delay);
  };

  const saveUserSDL = async () => {
    if (!hasUnsavedChanges) return;

    if (!updateSDL(value)) return;

    const response = await postSDL(value);
    if (response.ok) {
      setStatusWithClear('Saved!', 2000);
      setCachedValue(value);
      setHasUnsavedChanges(false);
      setUnsavedSchema(null);
      setError(null);
      return;
    }
    const errorMsg = await response.text();
    setError(errorMsg);
    return;
  };

  if (value == null || schema == null) {
    return <div className="faker-editor-container">Loading...</div>;
  }

  return (
    <div className="faker-editor-container">
      <Navigation
        hasUnsavedChanges={hasUnsavedChanges}
        activeTab={activeTab}
        switchTab={setActiveTab}
      />
      <TabsContainer
        activeTab={activeTab}
        hasUnsavedChanges={hasUnsavedChanges}
        schema={schema}
        unsavedSchema={unsavedSchema}
        value={value}
        error={error}
        status={status}
        onEdit={onEdit}
        saveUserSDL={saveUserSDL}
      />
    </div>
  );
};

export default FakeEditor;
