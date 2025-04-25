import { GraphQLSchema, GraphQLError } from 'graphql';
import { GraphQLSchemaEditor } from 'src/components/GraphQLSchemaEditor';

type Props = {
  schemaEditorValue: string;
  fullSchema: GraphQLSchema;
  hasUnsavedChanges: boolean;
  updateSchema: (schema: string) => void;
  validationErrors: GraphQLError[];
  setValidationErrors: (errors: GraphQLError[]) => void;
};

export const FakeEditor = ({
  schemaEditorValue,
  fullSchema,
  updateSchema,
  setValidationErrors,
  validationErrors,
  hasUnsavedChanges,
}: Props) => {
  return (
    <div className="fake-editor">
      <GraphQLSchemaEditor
        value={schemaEditorValue}
        schema={fullSchema}
        setValidationErrors={setValidationErrors}
      />

      <div className="action-panel">
        <a
          className={`material-button ${hasUnsavedChanges ? '' : '-disabled'}`}
          onClick={() => updateSchema(schemaEditorValue)}
        >
          <span> Save </span>
        </a>
        <div className="status-bar">
          {/* <span className="status"> {status} </span> */}
          {validationErrors?.length && (
            <span className="error-message">{validationErrors[0].toString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};
