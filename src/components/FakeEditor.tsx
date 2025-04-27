import { GraphQLSchema, GraphQLError } from 'graphql';

import { GraphQLSchemaEditor } from 'src/components/GraphQLSchemaEditor';

type Props = {
  initialSchemaEditorValue: string | undefined;
  fullSchemaWithFakeDefs: GraphQLSchema;
  hasUnsavedChanges: boolean;
  saveUpdateStatus: string | null;
  handleEditorOnSaveKeyboardShortcut: (text: string) => void;
  handleOnSaveButtonClick: () => void;
  setErrorMessage: (errorMsg: string | null) => void;
  errorMessage: string | undefined;
  setValidationErrors: (errors: GraphQLError[]) => void;
  handleEditorValueChange: (view: string) => void;
};

export const FakeEditor = ({
  initialSchemaEditorValue,
  fullSchemaWithFakeDefs,
  setValidationErrors,
  setErrorMessage,
  errorMessage,
  hasUnsavedChanges,
  saveUpdateStatus,
  handleEditorValueChange,
  handleOnSaveButtonClick,
  handleEditorOnSaveKeyboardShortcut,
}: Props) => {
  const isButtonDisabled = () => {
    // if there is an error message, the button should not be clickable
    if (errorMessage) {
      return true;
    }

    // if there is a save update status, the button has just been clicked
    // and we don't want to allow multiple save attempts
    if (saveUpdateStatus) {
      return true;
    }

    // if there are no differences, we don't want allow it to be saved, as it's the same
    if (!hasUnsavedChanges) {
      return true;
    }

    // if all the other conditions fail, enable the button
    return false;
  };

  const isDisabledClass = isButtonDisabled() ? '-disabled' : '';

  return (
    <div className="fake-editor">
      <GraphQLSchemaEditor
        value={initialSchemaEditorValue}
        schema={fullSchemaWithFakeDefs}
        setValidationErrors={setValidationErrors}
        setErrorMessage={setErrorMessage}
        handleEditorValueChange={handleEditorValueChange}
        handleEditorOnSaveKeyboardShortcut={handleEditorOnSaveKeyboardShortcut}
      />

      <div className="action-panel">
        <a className={`material-button ${isDisabledClass}`} onClick={handleOnSaveButtonClick}>
          <span> Save </span>
        </a>
        <div className="status-bar">
          <span className="status"> {saveUpdateStatus} </span>
          {errorMessage && <span className="error-message">{errorMessage}</span>}
        </div>
      </div>
    </div>
  );
};
