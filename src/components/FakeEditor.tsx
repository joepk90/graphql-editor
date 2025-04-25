import { GraphQLSchema } from 'graphql';
import { GraphQLSchemaEditor } from 'src/components/GraphQLSchemaEditor';

type Props = {
  schemaEditorValue: string;
  fullSchema: GraphQLSchema;
  hasUnsavedChanges: boolean;
  error?: string;
  updateSchema: (schema: string) => void;
};

export const FakeEditor = ({
  schemaEditorValue,
  fullSchema,
  updateSchema,
  hasUnsavedChanges,
  error,
}: Props) => {
  return (
    <div className="fake-editor">
      <GraphQLSchemaEditor value={schemaEditorValue} schema={fullSchema} />

      <div className="action-panel">
        <a
          className={`material-button ${hasUnsavedChanges ? '' : '-disabled'}`}
          onClick={() => updateSchema(schemaEditorValue)}
        >
          <span> Save </span>
        </a>
        <div className="status-bar">
          {/* <span className="status"> {status} </span> */}
          {error && <span className="error-message">{error}</span>}
        </div>
      </div>
    </div>
  );
};
