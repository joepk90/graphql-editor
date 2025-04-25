import { GraphQLSchema, GraphQLError } from 'graphql';

import { GraphQLSchemaEditor } from 'src/components/GraphQLSchemaEditor';
import { EditorView } from '@codemirror/view';

type Props = {
  initialSchemaEditorValue: string | undefined;
  fullSchema: GraphQLSchema;
  hasUnsavedChanges: boolean;
  saveUpdateStatus: string | null;
  saveSchema: () => void;
  errorMessage: string | undefined;
  setValidationErrors: (errors: GraphQLError[]) => void;
  onReady: (view: EditorView) => void;
};

export const FakeEditor = ({
  initialSchemaEditorValue,
  fullSchema,
  saveSchema,
  setValidationErrors,
  errorMessage,
  hasUnsavedChanges,
  saveUpdateStatus,
  onReady,
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
        schema={fullSchema}
        setValidationErrors={setValidationErrors}
        onReady={onReady}
      />

      <div className="action-panel">
        <a className={`material-button ${isDisabledClass}`} onClick={saveSchema}>
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
